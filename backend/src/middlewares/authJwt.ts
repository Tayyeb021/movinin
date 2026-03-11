import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import * as movininTypes from 'movinin-types'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as authHelper from '../utils/authHelper'
import * as logger from '../utils/logger'
import User from '../models/User'

// Extend Express Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: { _id: string, type: movininTypes.UserType }
  }
}

/**
 * Get token from request: x-access-token header, or Authorization: Bearer, or cookies.
 * Express lowercases header names, so use lowercase.
 */
function getTokenFromRequest(req: Request): string | undefined {
  const customHeader = req.headers[env.X_ACCESS_TOKEN.toLowerCase()] as string | undefined
  if (customHeader && typeof customHeader === 'string') return customHeader.trim()
  const auth = req.headers.authorization
  if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7).trim()
  return undefined
}

/**
 * Verify authentication token (header or cookie); attach user to request.
 */
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const headerToken = getTokenFromRequest(req)
  const isAdmin = authHelper.isAdmin(req)
  const isFrontend = authHelper.isFrontend(req)

  let token: string
  if (headerToken) {
    token = headerToken
  } else if (isAdmin) {
    token = req.signedCookies[env.ADMIN_AUTH_COOKIE_NAME] as string
  } else if (isFrontend) {
    token = req.signedCookies[env.FRONTEND_AUTH_COOKIE_NAME] as string
  } else {
    token = getTokenFromRequest(req) as string
  }

  if (!token) {
    res.status(403).send({ message: 'No token provided!' })
    return
  }

  try {
    // 2. Decrypt and verify the token
    const sessionData = await authHelper.decryptJWT(token)

    if (!sessionData || !helper.isValidObjectId(sessionData.id)) {
      res.status(401).send({ message: 'Unauthorized!' })
      return
    }

    // 3. Fetch the user and attach to the request object
    const user = await User.findById(sessionData.id)

    if (!user || user.blacklisted) {
      res.status(401).send({ message: 'Unauthorized!' })
      return
    }

    // 4. Attach user to request for use in the next middleware/controller
    req.user = { _id: user._id.toString(), type: user.type as movininTypes.UserType }
    next()
  } catch (err) {
    logger.info('Token verification failed', err)
    res.status(401).send({ message: 'Unauthorized!' })
  }
}

/**
 * Auth for Admin only.
 *
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
const authAdmin = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req
  if (user && user.type === movininTypes.UserType.Admin) {
    next()
  } else {
    res.status(403).send({ message: 'Require Admin Role!' })
  }
}

/**
 * Auth for Admin and Agency.
 *
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
const authAgency = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req
  if (user && (user.type === movininTypes.UserType.Admin || user.type === movininTypes.UserType.Agency)) {
    next()
  } else {
    res.status(403).send({ message: 'Require Agency or Admin Role!' })
  }
}

export default { verifyToken, authAdmin, authAgency }
