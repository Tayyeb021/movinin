import { Types } from 'mongoose'
import { Request, Response } from 'express'
import * as movininTypes from 'movinin-types'
import Tenant from '../models/Tenant'
import Unit from '../models/Unit'
import Property from '../models/Property'
import Booking from '../models/Booking'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as logger from '../utils/logger'

type TenancyBookingSummary = { _id: string; status: string; from: Date; to: Date; price: number }

async function attachTenancyBookings<T extends { _id: Types.ObjectId }>(
  tenants: T[],
): Promise<Array<T & { tenancyBooking: TenancyBookingSummary | null }>> {
  if (!tenants.length) {
    return tenants.map((t) => ({ ...t, tenancyBooking: null }))
  }
  const bookingRows = await Booking.find({
    tenant: { $in: tenants.map((t) => t._id) },
    kind: 'TENANCY',
  })
    .select('_id tenant status from to price')
    .lean()
  const bookingByTenant = new Map<string, TenancyBookingSummary>()
  for (const b of bookingRows) {
    if (b.tenant) {
      bookingByTenant.set(String(b.tenant), {
        _id: String(b._id),
        status: String(b.status),
        from: b.from as Date,
        to: b.to as Date,
        price: Number(b.price),
      })
    }
  }
  return tenants.map((t) => ({
    ...t,
    tenancyBooking: bookingByTenant.get(String(t._id)) ?? null,
  }))
}

/**
 * Get my tenancy (tenant only, after requireTenant).
 */
export const getMyTenancy = async (req: Request, res: Response) => {
  try {
    const tenant = (req as Request & { tenant?: env.Tenant & { unit: env.Unit }; unit?: env.Unit }).tenant
    const unit = (req as Request & { unit?: env.Unit }).unit
    if (!tenant || !unit) {
      res.status(403).send({ message: 'No active tenancy' })
      return
    }
    const unitId = typeof unit === 'object' && unit._id ? (unit as env.Unit)._id : unit
    const unitDoc = await Unit.findById(unitId).populate('property').lean()
    const propertyId = unitDoc?.property
    const property = propertyId
      ? await Property.findById(propertyId).populate('agency', 'fullName email phone').lean()
      : null
    return res.json({ tenant, unit: unitDoc, property })
  } catch (err) {
    logger.error(`[tenant.getMyTenancy] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
    return undefined
  }
}

/**
 * Get all tenants for current agency (manager only).
 */
export const getTenants = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const propertyIds = await Property.find({ agency: userId }).select('_id').lean()
    const ids = propertyIds.map((p) => p._id)
    const unitIds = await Unit.find({ property: { $in: ids } }).select('_id').lean()
    const uIds = unitIds.map((u) => u._id)
    const tenants = await Tenant.find({ unit: { $in: uIds }, active: true })
      .populate('user', 'fullName email phone')
      .populate('unit', 'name rent status')
      .lean()
    const enriched = await attachTenancyBookings(tenants)
    res.json(enriched)
  } catch (err) {
    logger.error(`[tenant.getTenants] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get tenants by property (manager only).
 */
export const getTenantsByProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params
    const userId = (req as Request & { userId?: string }).userId
    if (!helper.isValidObjectId(propertyId)) {
      res.status(400).send(i18n.t('DB_ERROR'))
      return
    }
    const property = await Property.findById(propertyId).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }
    const unitIds = await Unit.find({ property: propertyId }).select('_id').lean()
    const ids = unitIds.map((u) => u._id)
    const tenants = await Tenant.find({ unit: { $in: ids }, active: true })
      .populate('user', 'fullName email phone')
      .populate('unit', 'name rent status')
      .lean()
    const enriched = await attachTenancyBookings(tenants)
    res.json(enriched)
  } catch (err) {
    logger.error(`[tenant.getTenantsByProperty] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get tenants by unit (manager only).
 */
export const getTenantsByUnit = async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params
    const userId = (req as Request & { userId?: string }).userId
    if (!helper.isValidObjectId(unitId)) {
      res.status(400).send(i18n.t('DB_ERROR'))
      return
    }
    const unit = await Unit.findById(unitId).select('property').lean()
    if (!unit) {
      res.status(404).send({ message: 'Unit not found' })
      return
    }
    const property = await Property.findById(unit.property).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }
    const tenants = await Tenant.find({ unit: unitId }).populate('user', 'fullName email phone').lean()
    res.json(tenants)
  } catch (err) {
    logger.error(`[tenant.getTenantsByUnit] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Create tenant (manager only). Assigns user to unit, sets unit status to Occupied.
 */
export const createTenant = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const body = req.body as { user: string; unit: string; moveInDate: string; contractStart: string; contractEnd: string }
    const { user: userIdParam, unit: unitId, moveInDate, contractStart, contractEnd } = body

    if (!unitId || !userIdParam || !moveInDate || !contractStart || !contractEnd) {
      res.status(400).send({
        message: 'Missing required fields: user, unit, moveInDate, contractStart, contractEnd',
      })
      return
    }
    if (!helper.isValidObjectId(userIdParam)) {
      res.status(400).send({ message: 'Valid user id is required' })
      return
    }
    const userToAssign = userIdParam

    const unit = await Unit.findById(unitId)
    if (!unit) {
      res.status(404).send({ message: 'Unit not found' })
      return
    }
    const property = await Property.findById(unit.property).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }

    const existing = await Tenant.findOne({ unit: unitId, active: true })
    if (existing) {
      res.status(400).send({ message: 'Unit already has an active tenant' })
      return
    }

    const tenant = new Tenant({
      user: userToAssign,
      unit: unitId,
      moveInDate: new Date(moveInDate),
      contractStart: new Date(contractStart),
      contractEnd: new Date(contractEnd),
      active: true,
    })
    await tenant.save()

    unit.status = movininTypes.UnitStatus.Occupied
    await unit.save()

    const propFull = await Property.findById(unit.property).select('agency location').lean()
    if (propFull && propFull.location) {
      try {
        const existingTenancyBooking = await Booking.findOne({ tenant: tenant._id, kind: 'TENANCY' })
        if (!existingTenancyBooking) {
          const tenancyBooking = new Booking({
            agency: propFull.agency,
            location: propFull.location,
            property: unit.property,
            renter: userToAssign,
            from: new Date(contractStart),
            to: new Date(contractEnd),
            status: movininTypes.BookingStatus.Reserved,
            cancellation: false,
            price: Number(unit.rent ?? 0),
            unit: unit._id,
            tenant: tenant._id,
            kind: 'TENANCY',
          })
          await tenancyBooking.save()
        }
      } catch (bookingErr) {
        logger.error('[tenant.createTenant] tenancy booking sync failed', bookingErr)
      }
    }

    const populated = await Tenant.findById(tenant._id)
      .populate('user', 'fullName email phone')
      .populate('unit', 'name rent status')
      .lean()
    res.json(populated)
  } catch (err) {
    logger.error(`[tenant.createTenant] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update tenant (manager only).
 */
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const body = req.body as Partial<env.Tenant> & { _id: string }
    const { _id, moveInDate, contractStart, contractEnd } = body

    if (!_id || !helper.isValidObjectId(_id)) {
      res.status(400).send({ message: 'Invalid tenant id' })
      return
    }
    const tenant = await Tenant.findById(_id).populate('unit')
    if (!tenant) {
      res.status(404).send({ message: 'Tenant not found' })
      return
    }
    const unit = await Unit.findById(tenant.unit).select('property').lean()
    if (!unit) {
      res.status(404).send({ message: 'Unit not found' })
      return
    }
    const property = await Property.findById(unit.property).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }

    if (moveInDate != null) tenant.moveInDate = new Date(moveInDate)
    if (contractStart != null) tenant.contractStart = new Date(contractStart)
    if (contractEnd != null) tenant.contractEnd = new Date(contractEnd)
    await tenant.save()

    const tenancyBooking = await Booking.findOne({ tenant: tenant._id, kind: 'TENANCY' })
    if (tenancyBooking) {
      const unitDoc = await Unit.findById(tenant.unit).select('rent').lean()
      const rent = Number(unitDoc?.rent ?? tenancyBooking.price ?? 0)
      tenancyBooking.from = tenant.contractStart
      tenancyBooking.to = tenant.contractEnd
      tenancyBooking.price = rent
      await tenancyBooking.save()
    }

    res.json(tenant)
  } catch (err) {
    logger.error(`[tenant.updateTenant] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * End tenancy (manager only). Sets active = false and unit status = Vacant.
 */
export const endTenancy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as Request & { userId?: string }).userId
    if (!helper.isValidObjectId(id)) {
      res.status(400).send(i18n.t('DB_ERROR'))
      return
    }
    const tenant = await Tenant.findById(id)
    if (!tenant) {
      res.status(404).send({ message: 'Tenant not found' })
      return
    }
    const unit = await Unit.findById(tenant.unit)
    if (!unit) {
      res.status(404).send({ message: 'Unit not found' })
      return
    }
    const property = await Property.findById(unit.property).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }

    tenant.active = false
    await tenant.save()
    unit.status = movininTypes.UnitStatus.Vacant
    await unit.save()
    await Booking.updateMany(
      { tenant: tenant._id, kind: 'TENANCY' },
      { $set: { status: movininTypes.BookingStatus.Cancelled, cancellation: true } },
    )
    res.json({ message: 'OK' })
  } catch (err) {
    logger.error(`[tenant.endTenancy] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
