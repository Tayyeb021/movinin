import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import * as movininTypes from 'movinin-types'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as authHelper from '../utils/authHelper'
import * as logger from '../utils/logger'
import User from '../models/User'
import Tenant from '../models/Tenant'

/**
 * Verify authentication token middleware.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  let token: string
  const isAdmin = authHelper.isAdmin(req)
  const isFrontend = authHelper.isFrontend(req)

  if (isAdmin) {
    token = req.signedCookies[env.ADMIN_AUTH_COOKIE_NAME] as string // admin
  } else if (isFrontend) {
    token = req.signedCookies[env.FRONTEND_AUTH_COOKIE_NAME] as string // frontend
  } else {
    token = req.headers[env.X_ACCESS_TOKEN] as string // mobile app and unit tests
  }

  if (token) {
    // Check token
    try {
      const sessionData = await authHelper.decryptJWT(token)
      const $match: mongoose.QueryFilter<env.User> = {
        $and: [
          { _id: sessionData?.id },
          // { blacklisted: false },
        ],
      }

      if (isAdmin) {
        $match.$and?.push({ type: { $in: [movininTypes.UserType.Admin, movininTypes.UserType.Agency] } })
      } else if (isFrontend) {
        $match.$and?.push({ type: { $in: [movininTypes.UserType.User, movininTypes.UserType.Tenant] } })
      }

      if (
        !sessionData
        || !helper.isValidObjectId(sessionData.id)
        || !(await User.exists($match))
      ) {
        // Token not valid!
        logger.info('Token not valid: User not found')
        res.status(401).send({ message: 'Unauthorized!' })
      } else {
        ;(req as Request & { userId?: string }).userId = sessionData.id
        next()
      }
    } catch (err) {
      // Token not valid!
      logger.info('Token not valid', err)
      res.status(401).send({ message: 'Unauthorized!' })
    }
  } else {
    // Token not found!
    res.status(403).send({ message: 'No token provided!' })
  }
}

/**
 * Require active tenant assignment (must run after verifyToken, for frontend only).
 * Attaches req.tenant and req.unit for tenant-scoped routes.
 */
const requireTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    if (!userId || !helper.isValidObjectId(userId)) {
      res.status(403).send({ message: 'No active tenancy found!' })
      return
    }
    const tenant = await Tenant.findOne({ user: userId, active: true })
      .populate('unit')
      .lean()
    if (!tenant) {
      res.status(403).send({ message: 'No active tenancy found!' })
      return
    }
    (req as Request & { userId: string; tenant: env.Tenant & { unit: env.Unit }; unit: env.Unit }).userId = userId
    ;(req as Request & { userId: string; tenant: env.Tenant & { unit: env.Unit }; unit: env.Unit }).tenant = tenant as unknown as env.Tenant & { unit: env.Unit }
    ;(req as Request & { userId: string; tenant: env.Tenant & { unit: env.Unit }; unit: env.Unit }).unit = (tenant as unknown as env.Tenant & { unit: env.Unit }).unit as env.Unit
    next()
  } catch (err) {
    logger.info('requireTenant error', err)
    res.status(401).send({ message: 'Unauthorized!' })
  }
}

/**
 * Optional: require active subscription for manager (Agency). Scaffolding for SaaS.
 */
const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as Request & { userId?: string }).userId
  if (!userId) return next()
  try {
    const u = await User.findById(userId).select('type subscriptionStatus').lean()
    if (!u || u.type !== movininTypes.UserType.Agency) return next()
    if (u.subscriptionStatus && u.subscriptionStatus !== 'active') {
      res.status(403).send({ message: 'Active subscription required' })
      return
    }
    next()
  } catch (err) {
    next()
  }
}

export default { verifyToken, requireTenant, requireActiveSubscription }
