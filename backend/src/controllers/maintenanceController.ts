import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as movininTypes from 'movinin-types'
import MaintenanceTicket from '../models/MaintenanceTicket'
import Unit from '../models/Unit'
import Property from '../models/Property'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as logger from '../utils/logger'

/**
 * Get maintenance tickets (manager). Query: propertyId, unitId, status.
 */
export const getTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const { propertyId, unitId, status } = req.query as { propertyId?: string; unitId?: string; status?: string }

    const $match: Record<string, unknown> = {}
    if (propertyId && helper.isValidObjectId(propertyId)) {
      const property = await Property.findById(propertyId).select('agency').lean()
      if (property && String(property.agency) === userId) $match.property = propertyId as unknown as mongoose.Types.ObjectId
    }
    if (unitId && helper.isValidObjectId(unitId)) {
      const unit = await Unit.findById(unitId).select('property').lean()
      if (unit) {
        const property = await Property.findById(unit.property).select('agency').lean()
        if (property && String(property.agency) === userId) $match.unit = unitId as unknown as mongoose.Types.ObjectId
      }
    }
    if (Object.keys($match).length === 0) {
      const agencyPropertyIds = await Property.find({ agency: userId }).select('_id').lean()
      const ids = agencyPropertyIds.map((p) => p._id)
      $match.property = { $in: ids }
    }
    if (status) $match.status = status

    const tickets = await MaintenanceTicket.find($match)
      .populate('property', 'name address')
      .populate('unit', 'name')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .lean()
    res.json(tickets)
  } catch (err) {
    logger.error(`[maintenance.getTickets] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get my maintenance tickets (tenant only).
 */
export const getMyTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = (req as Request & { tenant?: env.Tenant }).tenant
    const unit = (req as Request & { unit?: env.Unit }).unit
    if (!tenant || !unit) {
      res.status(403).send({ message: 'No active tenancy' })
      return
    }
    const unitId = typeof unit === 'object' && (unit as env.Unit)._id ? (unit as env.Unit)._id : unit
    const tickets = await MaintenanceTicket.find({ unit: unitId })
      .populate('property', 'name address')
      .populate('unit', 'name')
      .sort({ createdAt: -1 })
      .lean()
    res.json(tickets)
    return
  } catch (err) {
    logger.error(`[maintenance.getMyTickets] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
    return
  }
}

/**
 * Get single ticket (manager or tenant if own unit).
 */
export const getTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as Request & { userId?: string }).userId
    let tenant = (req as Request & { tenant?: env.Tenant; unit?: env.Unit }).tenant
    let unit = (req as Request & { unit?: env.Unit }).unit
    if (!tenant && userId) {
      const Tenant = (await import('../models/Tenant')).default
      const t = await Tenant.findOne({ user: userId, active: true }).populate('unit').lean()
      if (t) {
        tenant = t as unknown as env.Tenant & { unit: env.Unit }
        unit = (t as { unit: unknown }).unit as env.Unit
      }
    }

    if (!helper.isValidObjectId(id)) {
      res.status(400).send({ message: 'Invalid id' })
      return
    }
    const ticket = await MaintenanceTicket.findById(id)
      .populate('property', 'name address agency')
      .populate('unit', 'name')
      .populate('createdBy', 'fullName email')
      .lean()
    if (!ticket) {
      res.status(404).send({ message: 'Ticket not found' })
      return
    }
    const property = await Property.findById(ticket.property).select('agency').lean()
    if (property && String(property.agency) === userId) return res.json(ticket)
    if (tenant && unit) {
      const unitId = typeof unit === 'object' && (unit as env.Unit)._id ? (unit as env.Unit)._id : unit
      if (String(ticket.unit) === String(unitId)) return res.json(ticket)
    }
    res.status(403).send({ message: 'Forbidden' })
    return
  } catch (err) {
    logger.error(`[maintenance.getTicket] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
    return
  }
}

/**
 * Create maintenance ticket (manager or tenant).
 */
export const createTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    let tenant = (req as Request & { tenant?: env.Tenant; unit?: env.Unit }).tenant
    let unit = (req as Request & { unit?: env.Unit }).unit
    if (!tenant && userId) {
      const TenantModel = (await import('../models/Tenant')).default
      const t = await TenantModel.findOne({ user: userId, active: true }).populate('unit').lean()
      if (t) {
        tenant = t as unknown as env.Tenant & { unit: env.Unit }
        unit = (t as { unit: unknown }).unit as env.Unit
      }
    }
    const body = req.body as {
      property?: string
      unit?: string
      category: string
      description: string
      priority: movininTypes.MaintenancePriority
      status?: movininTypes.MaintenanceStatus
      cost?: number
    }
    const { property: propertyId, unit: unitIdParam, category, description, priority, status, cost } = body

    let finalPropertyId: mongoose.Types.ObjectId
    let finalUnitId: mongoose.Types.ObjectId

    if (tenant && unit) {
      const u = typeof unit === 'object' ? (unit as env.Unit) : await Unit.findById(unit).lean()
      if (!u) {
        res.status(403).send({ message: 'Invalid unit' })
        return
      }
      finalUnitId = (u as env.Unit)._id as mongoose.Types.ObjectId
      const unitDoc = await Unit.findById(finalUnitId).select('property').lean()
      if (!unitDoc) {
        res.status(404).send({ message: 'Unit not found' })
        return
      }
      finalPropertyId = unitDoc.property as mongoose.Types.ObjectId
    } else {
      if (!propertyId || !unitIdParam) {
        res.status(400).send({ message: 'property and unit required' })
        return
      }
      const property = await Property.findById(propertyId).select('agency').lean()
      if (!property || String(property.agency) !== userId) {
        res.status(403).send({ message: 'Forbidden' })
        return
      }
      const unitDoc = await Unit.findById(unitIdParam)
      if (!unitDoc || String(unitDoc.property) !== propertyId) {
        res.status(400).send({ message: 'Unit not in property' })
        return
      }
      finalPropertyId = propertyId as unknown as mongoose.Types.ObjectId
      finalUnitId = unitIdParam as unknown as mongoose.Types.ObjectId
    }

    if (!category || !description || !priority) {
      res.status(400).send({ message: 'category, description and priority required' })
      return
    }

    const ticket = new MaintenanceTicket({
      property: finalPropertyId,
      unit: finalUnitId,
      category,
      description,
      priority,
      status: status ?? movininTypes.MaintenanceStatus.Open,
      cost,
      createdBy: userId,
      createdAt: new Date(),
    })
    await ticket.save()
    const populated = await MaintenanceTicket.findById(ticket._id)
      .populate('property', 'name address')
      .populate('unit', 'name')
      .populate('createdBy', 'fullName email')
      .lean()
    res.json(populated)
  } catch (err) {
    logger.error(`[maintenance.createTicket] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update maintenance ticket (manager only for full update; tenant cannot update).
 */
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const body = req.body as Partial<env.MaintenanceTicket> & { _id: string }
    const { _id, status, cost, closedAt } = body

    if (!_id || !helper.isValidObjectId(_id)) {
      res.status(400).send({ message: 'Invalid ticket id' })
      return
    }
    const ticket = await MaintenanceTicket.findById(_id)
    if (!ticket) {
      res.status(404).send({ message: 'Ticket not found' })
      return
    }
    const property = await Property.findById(ticket.property).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }

    if (status != null) ticket.status = status as movininTypes.MaintenanceStatus
    if (cost != null) ticket.cost = cost
    if (closedAt != null) ticket.closedAt = new Date(closedAt)
    if (status === movininTypes.MaintenanceStatus.Completed && !ticket.closedAt) {
      ticket.closedAt = new Date()
    }
    await ticket.save()
    res.json(ticket)
  } catch (err) {
    logger.error(`[maintenance.updateTicket] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
