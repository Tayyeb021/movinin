import 'dotenv/config'
import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'
import * as databaseHelper from '../utils/databaseHelper'
import User from '../models/User'
import * as logger from '../utils/logger'
import * as authHelper from '../utils/authHelper'

const DEFAULT_PASSWORD = 'M00vinin'

const DEMO_USERS: { email: string; fullName: string; type: movininTypes.UserType }[] = [
  { email: env.ADMIN_EMAIL, fullName: 'Admin', type: movininTypes.UserType.Admin },
  { email: 'agency@movinin.io', fullName: 'Demo Agency', type: movininTypes.UserType.Agency },
  { email: 'user@movinin.io', fullName: 'Demo User', type: movininTypes.UserType.User },
  { email: 'tenant@movinin.io', fullName: 'Demo Tenant', type: movininTypes.UserType.Tenant },
]

try {
  const connected = await databaseHelper.connect(env.DB_URI, env.DB_SSL, env.DB_DEBUG)

  if (!connected) {
    logger.error('Failed to connect to the database')
    process.exit(1)
  }

  const passwordHash = await authHelper.hashPassword(DEFAULT_PASSWORD)

  for (const { email, fullName, type } of DEMO_USERS) {
    const existing = await User.findOne({ email })
    if (!existing) {
      const newUser = new User({
        fullName,
        email,
        password: passwordHash,
        language: env.DEFAULT_LANGUAGE,
        type,
        active: true,
        verified: true,
      })
      await newUser.save()
      logger.info(`${type} user created: ${email}`)
    } else {
      existing.password = passwordHash
      existing.fullName = fullName
      existing.active = true
      existing.verified = true
      await existing.save()
      logger.info(`${type} user password reset: ${email}`)
    }
  }

  process.exit(0)
} catch (err) {
  logger.error('Error during setup:', err)
  process.exit(1)
}
