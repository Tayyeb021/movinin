import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as movininTypes from ':movinin-types'
import RentEntry from '../models/RentEntry'
import Unit from '../models/Unit'
import Tenant from '../models/Tenant'
import Property from '../models/Property'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as logger from '../utils/logger'

/**
 * Get rent entries (manager). Query: unitId or tenantId, optional period/status.
 */
export const getRentEntries = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const { unitId, tenantId, period, status } = req.query as { unitId?: string; tenantId?: string; period?: string; status?: string }

    const $match: Record<string, unknown> = {}
    if (unitId && helper.isValidObjectId(unitId)) {
      const unit = await Unit.findById(unitId).select('property').lean()
      if (unit) {
        const property = await Property.findById(unit.property).select('agency').lean()
        if (property && String(property.agency) === userId) $match.unit = unitId as unknown as mongoose.Types.ObjectId
      }
    }
    if (tenantId && helper.isValidObjectId(tenantId)) {
      const tenant = await Tenant.findById(tenantId).populate('unit').lean()
      const unitIdFromTenant = tenant?.unit && (tenant.unit as unknown as env.Unit)._id
      if (unitIdFromTenant) {
        const unit = await Unit.findById(unitIdFromTenant).select('property').lean()
        if (unit) {
          const property = await Property.findById(unit.property).select('agency').lean()
          if (property && String(property.agency) === userId) $match.tenant = tenantId as unknown as mongoose.Types.ObjectId
        }
      }
    }
    if (Object.keys($match).length === 0 && !unitId && !tenantId) {
      res.status(400).send({ message: 'unitId or tenantId required' })
      return
    }
    if (Object.keys($match).length === 0) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }
    if (period) $match.period = period
    if (status) $match.status = status

    const entries = await RentEntry.find($match)
      .populate('unit', 'name rent')
      .populate('tenant')
      .sort({ dueDate: -1 })
      .lean()
    res.json(entries)
  } catch (err) {
    logger.error(`[rent.getRentEntries] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get my rent entries (tenant only).
 */
export const getMyRentEntries = async (req: Request, res: Response) => {
  try {
    const tenant = (req as Request & { tenant?: env.Tenant }).tenant
    if (!tenant) {
      res.status(403).send({ message: 'No active tenancy' })
      return
    }
    const tenantId = typeof tenant === 'object' && (tenant as env.Tenant)._id ? (tenant as env.Tenant)._id : tenant
    const entries = await RentEntry.find({ tenant: tenantId }).sort({ dueDate: -1 }).lean()
    res.json(entries)
  } catch (err) {
    logger.error(`[rent.getMyRentEntries] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Create rent entries (manager). Body: unitId or tenantId, period (e.g. "2025-03"), dueDate, amount. Creates one entry per active tenant in unit.
 */
export const createRentEntries = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const body = req.body as { unitId?: string; tenantId?: string; period: string; dueDate: string; amount: number }
    const { unitId, tenantId, period, dueDate, amount } = body

    if (!period || !dueDate || amount == null) {
      res.status(400).send({ message: 'period, dueDate and amount required' })
      return
    }

    let targetTenantIds: mongoose.Types.ObjectId[] = []
    if (tenantId && helper.isValidObjectId(tenantId)) {
      const tenant = await Tenant.findById(tenantId).select('unit').lean()
      if (tenant) {
        const unit = await Unit.findById(tenant.unit).select('property').lean()
        if (unit) {
          const property = await Property.findById(unit.property).select('agency').lean()
          if (property && String(property.agency) === userId) targetTenantIds = [tenantId as unknown as mongoose.Types.ObjectId]
        }
      }
    } else if (unitId && helper.isValidObjectId(unitId)) {
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
      const activeTenants = await Tenant.find({ unit: unitId, active: true }).select('_id').lean()
      targetTenantIds = activeTenants.map((t) => t._id)
    }

    if (targetTenantIds.length === 0) {
      res.status(400).send({ message: 'No valid unit/tenant or no active tenant' })
      return
    }

    const due = new Date(dueDate)
    const created: env.RentEntry[] = []
    for (const tid of targetTenantIds) {
      const t = await Tenant.findById(tid).select('unit').lean()
      if (!t) continue
      const existing = await RentEntry.findOne({ tenant: tid, period })
      if (existing) continue
      const status = due < new Date() ? movininTypes.RentStatus.Overdue : movininTypes.RentStatus.Pending
      const entry = new RentEntry({
        unit: t.unit,
        tenant: tid,
        period,
        dueDate: due,
        amount,
        status,
      })
      await entry.save()
      created.push(entry)
    }
    res.json(created)
  } catch (err) {
    logger.error(`[rent.createRentEntries] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update rent entry (manager). Mark paid/partial, set paidAmount, paidAt.
 */
export const updateRentEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const body = req.body as { _id: string; status: movininTypes.RentStatus; paidAmount?: number; paidAt?: string }
    const { _id, status, paidAmount, paidAt } = body

    if (!_id || !helper.isValidObjectId(_id)) {
      res.status(400).send({ message: 'Invalid rent entry id' })
      return
    }
    const entry = await RentEntry.findById(_id).populate('unit')
    if (!entry) {
      res.status(404).send({ message: 'Rent entry not found' })
      return
    }
    const unit = await Unit.findById(entry.unit).select('property').lean()
    if (!unit) {
      res.status(404).send({ message: 'Unit not found' })
      return
    }
    const property = await Property.findById(unit.property).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }

    if (status != null) entry.status = status
    if (paidAmount != null) entry.paidAmount = paidAmount
    if (paidAt != null) entry.paidAt = new Date(paidAt)
    await entry.save()
    res.json(entry)
  } catch (err) {
    logger.error(`[rent.updateRentEntry] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
