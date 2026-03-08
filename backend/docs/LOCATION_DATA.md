# Where location data comes from

Location data (countries and locations) is **stored in MongoDB**. The frontend does not ship with any built-in list; it loads everything from the backend API.

## Data flow

1. **Frontend** (e.g. search form location dropdown, home destinations, map) calls:
   - `GET /api/locations/:page/:size/:language/?s=keyword` – paginated list of locations (filtered by keyword and language)
   - `GET /api/locations-with-position/:language` – locations that have latitude/longitude (for map and “with position” lists)
   - `GET /api/countries-with-locations/:language/...` – countries that have at least N locations (for home “Browse by Destinations”)
   - `GET /api/location/:id/:language` – single location by ID

2. **Backend** reads from MongoDB:
   - **Country** collection: each document has `values` (array of ObjectIds pointing to **LocationValue**).
   - **Location** collection: each document has `country`, `values` (names per language), and optional `latitude`/`longitude`.
   - **LocationValue** collection: `language` (e.g. `en`, `fr`) and `value` (the name in that language).

3. **Language**: The API uses the `:language` parameter (e.g. `en` or `fr`). Only locations/countries that have a **LocationValue** for that language are returned. If you create data with only one language, the other language will show nothing.

## Why “nothing is coming” when I type in the location field?

- The **Location** (and **Country**) collections are **empty** until you add data.
- The app does **not** seed countries or locations by default. It only seeds **users** (via `npm run setup`).

So if you have never created any countries or locations, the location dropdown and the home page destinations/map will be empty.

## How to get location data

### Option 1: Seed demo data (quick)

From the **backend** folder:

```bash
npm run seed:locations
```

This creates:

- 2 countries: United States, France (with EN + FR names).
- 4 locations: New York, Los Angeles, Paris, Lyon (with coordinates so they appear on the map).

After this, the frontend location dropdown and home page should show results. You can add more later via the Admin panel.

### Option 2: Add data via Admin panel

1. Log in to the **Admin** app as Admin or Agency.
2. **Countries**: create one or more countries (with at least one name per language you use).
3. **Locations**: create locations linked to a country; add names for each language and optionally latitude/longitude (needed for map and “locations with position”).

### Option 3: Use the API

- Create countries: `POST /api/create-country` (auth required).
- Create locations: `POST /api/create-location` (auth required).

## Summary

| Source              | Purpose                                      |
|---------------------|----------------------------------------------|
| MongoDB `Country`   | List of countries (names via LocationValue)  |
| MongoDB `Location`  | List of locations (names, country, lat/lng)  |
| MongoDB `LocationValue` | Multilingual names (e.g. en, fr) for countries and locations |
| `npm run seed:locations` | Inserts demo countries and locations so something appears in the UI |

If the dropdown or map is empty, run the seed script or add countries and locations in the Admin panel.
