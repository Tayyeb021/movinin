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
  let isAdmin = authHelper.isAdmin(req)
  let isFrontend = authHelper.isFrontend(req)

  if (isAdmin) {
    token = req.signedCookies[env.ADMIN_AUTH_COOKIE_NAME] as string
  } else if (isFrontend) {
    token = req.signedCookies[env.FRONTEND_AUTH_COOKIE_NAME] as string
  } else {
    // Fallback: when Origin does not match MI_ADMIN_HOST/MI_FRONTEND_HOST (e.g. misconfigured env),
    // try to infer channel from which cookie is present so admin/frontend still work.
    const adminCookie = req.signedCookies[env.ADMIN_AUTH_COOKIE_NAME] as string | undefined
    const frontendCookie = req.signedCookies[env.FRONTEND_AUTH_COOKIE_NAME] as string | undefined
    if (adminCookie) {
      token = adminCookie
      isAdmin = true
      if (req.headers.origin && !env.ADMIN_HOST) {
        logger.warn(`Auth: Origin "${req.headers.origin}" present but MI_ADMIN_HOST not set. Set MI_ADMIN_HOST to your admin app URL (e.g. ${req.headers.origin}) so the backend recognizes admin requests.`)
      }
    } else if (frontendCookie) {
      token = frontendCookie
      isFrontend = true
      if (req.headers.origin && !env.FRONTEND_HOST) {
        logger.warn(`Auth: Origin "${req.headers.origin}" present but MI_FRONTEND_HOST not set. Set MI_FRONTEND_HOST to your frontend app URL.`)
      }
    } else {
      token = req.headers[env.X_ACCESS_TOKEN] as string // mobile app and unit tests
    }
  }

  if (token) {
    try {
      const sessionData = await authHelper.decryptJWT(token)
      const $match: mongoose.QueryFilter<env.User> = {
        $and: [{ _id: sessionData?.id }],
      }

      if (isAdmin) {
        $match.$and?.push({ type: { $in: [movininTypes.UserType.Admin, movininTypes.UserType.Agency] } })
      } else if (isFrontend) {
        $match.$and?.push({ type: { $in: [movininTypes.UserType.User, movininTypes.UserType.Tenant] } })
      }

      let reason = ''
      if (!sessionData) {
        reason = 'Session data missing or token could not be decrypted'
      } else if (!helper.isValidObjectId(sessionData.id)) {
        reason = 'Session id is not a valid ObjectId'
      } else {
        const user = await User.findOne($match).select('_id').lean()
        if (!user) {
          const exists = await User.exists({ _id: sessionData.id }).lean()
          if (exists) {
            reason = 'User type not allowed for this app. Set MI_ADMIN_HOST (admin app URL) and MI_FRONTEND_HOST (frontend app URL) on the backend to match the browser Origin exactly.'
          } else {
            reason = 'User not found in database'
          }
        }
      }

      if (reason) {
        logger.info(`Token not valid: ${reason}`)
        res.status(401).send({ message: 'Unauthorized!', reason })
      } else {
        ;(req as Request & { userId?: string }).userId = sessionData!.id
        next()
      }
    } catch (err) {
      logger.info('Token not valid', err)
      res.status(401).send({ message: 'Unauthorized!' })
    }
  } else {
    if (req.headers.origin && env.ADMIN_HOST && env.FRONTEND_HOST) {
      const o = helper.trimEnd(String(req.headers.origin), '/')
      const ah = helper.trimEnd(env.ADMIN_HOST, '/')
      const fh = helper.trimEnd(env.FRONTEND_HOST, '/')
      if (o !== ah && o !== fh) {
        logger.warn(`Auth: Origin "${req.headers.origin}" does not match MI_ADMIN_HOST (${env.ADMIN_HOST}) or MI_FRONTEND_HOST (${env.FRONTEND_HOST}). Set the matching host so auth cookies are recognized.`)
      }
    }
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
