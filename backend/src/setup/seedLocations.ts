/**
 * Seed demo countries and locations so the frontend location dropdown and
 * home page (destinations, map) show data. Run after setup (users).
 *
 * Usage: npm run build && node dist/src/setup/seedLocations.js
 */
import 'dotenv/config'
import * as env from '../config/env.config'
import * as databaseHelper from '../utils/databaseHelper'
import * as logger from '../utils/logger'
import Country from '../models/Country'
import Location from '../models/Location'
import LocationValue from '../models/LocationValue'

const DEMO_COUNTRIES = [
  { en: 'United States', fr: 'États-Unis' },
  { en: 'France', fr: 'France' },
]

const DEMO_LOCATIONS: { countryEn: string; en: string; fr: string; lat: number; lng: number }[] = [
  { countryEn: 'United States', en: 'New York', fr: 'New York', lat: 40.7128, lng: -74.006 },
  { countryEn: 'United States', en: 'Los Angeles', fr: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { countryEn: 'France', en: 'Paris', fr: 'Paris', lat: 48.8566, lng: 2.3522 },
  { countryEn: 'France', en: 'Lyon', fr: 'Lyon', lat: 45.764, lng: 4.8357 },
]

async function seed() {
  try {
    const connected = await databaseHelper.connect(env.DB_URI, env.DB_SSL, env.DB_DEBUG)
    if (!connected) {
      logger.error('Failed to connect to the database')
      process.exit(1)
    }

    const countryIds: Record<string, string> = {}

    for (const names of DEMO_COUNTRIES) {
      const existing = await Country.aggregate([
        { $lookup: { from: 'LocationValue', localField: 'values', foreignField: '_id', as: 'vals' } },
        { $unwind: '$vals' },
        { $match: { 'vals.language': 'en', 'vals.value': names.en } },
        { $limit: 1 },
        { $project: { _id: 1 } },
      ])
      if (existing.length > 0) {
        countryIds[names.en] = existing[0]._id.toString()
        logger.info(`Country "${names.en}" already exists`)
        continue
      }

      const valueIds: string[] = []
      for (const lang of env.LANGUAGES) {
        const val = new LocationValue({ language: lang, value: names[lang as keyof typeof names] || names.en })
        await val.save()
        valueIds.push(val._id.toString())
      }
      const country = new Country({ values: valueIds })
      await country.save()
      countryIds[names.en] = country._id.toString()
      logger.info(`Created country: ${names.en}`)
    }

    const existingLocations = await Location.countDocuments()
    if (existingLocations > 0) {
      logger.info('Locations already exist. Skipping location seed. Delete locations/countries in DB if you want to re-seed.')
      process.exit(0)
      return
    }

    for (const loc of DEMO_LOCATIONS) {
      const countryId = countryIds[loc.countryEn]
      if (!countryId) continue

      const valueIds: string[] = []
      for (const lang of env.LANGUAGES) {
        const val = new LocationValue({ language: lang, value: lang === 'fr' ? loc.fr : loc.en })
        await val.save()
        valueIds.push(val._id.toString())
      }
      const location = new Location({
        country: countryId,
        values: valueIds,
        latitude: loc.lat,
        longitude: loc.lng,
      })
      await location.save()
      logger.info(`Created location: ${loc.en} (${loc.countryEn})`)
    }

    logger.info('Location seed completed successfully.')
    process.exit(0)
  } catch (err) {
    logger.error('Location seed failed:', err)
    process.exit(1)
  }
}

seed()
