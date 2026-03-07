import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as movininTypes from ':movinin-types'
import Unit from '../models/Unit'
import Property from '../models/Property'
import Tenant from '../models/Tenant'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as logger from '../utils/logger'
import * as btmsConfig from '../config/btms.config'

/**
 * Get public vacant units (no auth).
 */
export const getPublicUnits = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const body = (req.body || {}) as movininTypes.GetPublicUnitsPayload
    const { location, minRent, maxRent, furnishingStatus } = body

    const $match: Record<string, unknown> = {
      status: movininTypes.UnitStatus.Vacant,
    }
    if (minRent != null) $match.rent = { ...(($match.rent as object) || {}), $gte: minRent }
    if (maxRent != null) $match.rent = { ...(($match.rent as object) || {}), $lte: maxRent }
    if (furnishingStatus?.length) $match.furnishingStatus = { $in: furnishingStatus }
    if (location && helper.isValidObjectId(location)) {
      const propertyIds = await Property.find({ location }).select('_id').lean()
      const ids = propertyIds.map((p) => p._id)
      $match.property = { $in: ids }
    }

    const totalRecords = await Unit.countDocuments($match)
    const units = await Unit.find($match)
      .populate({
        path: 'property',
        select: 'name address agency',
        populate: { path: 'agency', select: 'fullName email phone' },
      })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean()

    return res.json({
      pageInfo: { totalRecords },
      resultData: units,
    })
  } catch (err) {
    logger.error(`[unit.getPublicUnits] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
    return undefined
  }
}

/**
 * Get single unit by id for public (vacant units only).
 */
export const getPublicUnit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!helper.isValidObjectId(id)) {
      res.status(400).send(i18n.t('DB_ERROR'))
      return
    }
    const unit = await Unit.findById(id)
      .populate({
        path: 'property',
        select: 'name address agency',
        populate: { path: 'agency', select: 'fullName email phone' },
      })
      .lean()
    if (!unit || (unit as env.Unit).status !== movininTypes.UnitStatus.Vacant) {
      res.status(404).send({ message: 'Unit not found' })
      return
    }
    res.json(unit)
  } catch (err) {
    logger.error(`[unit.getPublicUnit] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get single unit by id (manager: must own property).
 */
export const getUnit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as Request & { userId?: string }).userId
    if (!helper.isValidObjectId(id)) {
      res.status(400).send(i18n.t('DB_ERROR'))
      return
    }
    const unit = await Unit.findById(id).populate('property').lean()
    if (!unit) {
      res.status(404).send({ message: 'Unit not found' })
      return
    }
    const propertyId = typeof unit.property === 'object' && unit.property && '_id' in unit.property ? (unit.property as { _id: mongoose.Types.ObjectId })._id : unit.property
    const property = await Property.findById(propertyId).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }
    res.json(unit)
  } catch (err) {
    logger.error(`[unit.getUnit] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get units by property (manager: must own property).
 */
export const getUnitsByProperty = async (req: Request, res: Response) => {
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
    const units = await Unit.find({ property: propertyId }).sort({ name: 1 }).lean()
    res.json(units)
  } catch (err) {
    logger.error(`[unit.getUnitsByProperty] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Create unit (manager only).
 */
export const createUnit = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const body = req.body as Partial<env.Unit> & { property: string }
    const { property: propertyId, name, rent, securityDeposit, size, furnishingStatus, status, checklist } = body

    if (!propertyId || !name || rent == null || securityDeposit == null || !furnishingStatus) {
      res.status(400).send({ message: 'Missing required fields' })
      return
    }
    const property = await Property.findById(propertyId).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }

    if (btmsConfig.isFurnishingChecklistRequired(furnishingStatus as movininTypes.FurnishingStatus)) {
      if (!checklist || checklist.length === 0) {
        res.status(400).send({ message: 'Furnishing checklist is required for Semi-Furnished or Fully Furnished units' })
        return
      }
      if (!btmsConfig.validateChecklistItems(checklist)) {
        res.status(400).send({ message: 'Invalid checklist item keys' })
        return
      }
    }

    const unit = new Unit({
      property: propertyId,
      name,
      rent,
      securityDeposit,
      size,
      furnishingStatus,
      status: status ?? movininTypes.UnitStatus.Vacant,
      checklist: checklist ?? [],
    })
    await unit.save()
    res.json(unit)
  } catch (err) {
    logger.error(`[unit.createUnit] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update unit (manager only).
 */
export const updateUnit = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    const body = req.body as Partial<env.Unit> & { _id: string }
    const { _id, name, rent, securityDeposit, size, furnishingStatus, status, checklist } = body

    if (!_id || !helper.isValidObjectId(_id)) {
      res.status(400).send({ message: 'Invalid unit id' })
      return
    }
    const unit = await Unit.findById(_id)
    if (!unit) {
      res.status(404).send({ message: 'Unit not found' })
      return
    }
    const property = await Property.findById(unit.property).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }

    const newStatus = furnishingStatus ?? unit.furnishingStatus
    if (btmsConfig.isFurnishingChecklistRequired(newStatus as movininTypes.FurnishingStatus)) {
      const newChecklist = checklist ?? unit.checklist
      if (!newChecklist || newChecklist.length === 0) {
        res.status(400).send({ message: 'Furnishing checklist is required for Semi-Furnished or Fully Furnished units' })
        return
      }
      if (!btmsConfig.validateChecklistItems(newChecklist)) {
        res.status(400).send({ message: 'Invalid checklist item keys' })
        return
      }
    }

    if (name != null) unit.name = name
    if (rent != null) unit.rent = rent
    if (securityDeposit != null) unit.securityDeposit = securityDeposit
    if (size != null) unit.size = size
    if (furnishingStatus != null) unit.furnishingStatus = furnishingStatus as movininTypes.FurnishingStatus
    if (status != null) unit.status = status as movininTypes.UnitStatus
    if (checklist != null) unit.checklist = checklist
    await unit.save()
    res.json(unit)
  } catch (err) {
    logger.error(`[unit.updateUnit] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete unit (manager only; only if no active tenant).
 */
export const deleteUnit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as Request & { userId?: string }).userId
    if (!helper.isValidObjectId(id)) {
      res.status(400).send(i18n.t('DB_ERROR'))
      return
    }
    const unit = await Unit.findById(id)
    if (!unit) {
      res.status(404).send({ message: 'Unit not found' })
      return
    }
    const property = await Property.findById(unit.property).select('agency').lean()
    if (!property || String(property.agency) !== userId) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }
    const activeTenant = await Tenant.findOne({ unit: id, active: true })
    if (activeTenant) {
      res.status(400).send({ message: 'Cannot delete unit with active tenant' })
      return
    }
    await Unit.findByIdAndDelete(id)
    res.json({ message: 'OK' })
  } catch (err) {
    logger.error(`[unit.deleteUnit] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
