import { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as movininTypes from ':movinin-types'
import Property from '../models/Property'
import Unit from '../models/Unit'
import Tenant from '../models/Tenant'
import RentEntry from '../models/RentEntry'
import MaintenanceTicket from '../models/MaintenanceTicket'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as logger from '../utils/logger'

/**
 * Get manager dashboard (agency = req.userId).
 */
export const getManagerDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId
    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' })
      return
    }

    const propertyIds = await Property.find({ agency: userId }).select('_id').lean()
    const ids = propertyIds.map((p) => p._id)

    const [totalProperties, totalUnits, unitsByStatus, rentAgg, overdueCount, openMaintenance] = await Promise.all([
      Property.countDocuments({ agency: userId }),
      Unit.countDocuments({ property: { $in: ids } }),
      Unit.aggregate([
        { $match: { property: { $in: ids } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      RentEntry.aggregate([
        { $lookup: { from: 'units', localField: 'unit', foreignField: '_id', as: 'u' } },
        { $unwind: '$u' },
        { $match: { 'u.property': { $in: ids } } },
        {
          $group: {
            _id: null,
            totalDue: { $sum: '$amount' },
            totalCollected: { $sum: { $ifNull: ['$paidAmount', 0] } },
          },
        },
      ]),
      (async () => {
        const unitIds = await Unit.find({ property: { $in: ids } }).select('_id').lean()
        return RentEntry.countDocuments({
          unit: { $in: unitIds.map((x) => x._id) },
          status: movininTypes.RentStatus.Overdue,
        })
      })(),
      MaintenanceTicket.countDocuments({
        property: { $in: ids },
        status: { $in: [movininTypes.MaintenanceStatus.Open, movininTypes.MaintenanceStatus.InProgress] },
      }),
    ])

    const occupied =
      unitsByStatus.find((x: { _id: string }) => x._id === movininTypes.UnitStatus.Occupied)?.count ?? 0
    const vacant =
      unitsByStatus.find((x: { _id: string }) => x._id === movininTypes.UnitStatus.Vacant)?.count ?? 0
    const underMaintenance =
      unitsByStatus.find((x: { _id: string }) => x._id === movininTypes.UnitStatus.UnderMaintenance)?.count ?? 0

    const rentRow = rentAgg[0]
    const monthlyRentDue = rentRow?.totalDue ?? 0
    const rentCollected = rentRow?.totalCollected ?? 0

    const payload: movininTypes.ManagerDashboard = {
      totalProperties,
      totalUnits,
      occupiedUnits: occupied,
      vacantUnits: vacant + underMaintenance,
      monthlyRentDue,
      rentCollected,
      overdueCount,
      openMaintenanceCount: openMaintenance,
    }
    res.json(payload)
  } catch (err) {
    logger.error(`[dashboard.getManagerDashboard] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get tenant dashboard (requireTenant).
 */
export const getTenantDashboard = async (req: Request, res: Response) => {
  try {
    const tenant = (req as Request & { tenant?: env.Tenant; unit?: env.Unit }).tenant
    const unit = (req as Request & { unit?: env.Unit }).unit
    if (!tenant || !unit) {
      res.status(403).send({ message: 'No active tenancy' })
      return
    }
    const tenantId = typeof tenant === 'object' && (tenant as env.Tenant)._id ? (tenant as env.Tenant)._id : tenant
    const unitId = typeof unit === 'object' && (unit as env.Unit)._id ? (unit as env.Unit)._id : unit

    const [tenantDoc, unitDoc, propertyDoc, rentHistory, openTickets] = await Promise.all([
      Tenant.findById(tenantId).populate('user', 'fullName email phone').lean(),
      Unit.findById(unitId).lean(),
      unitId
        ? Unit.findById(unitId)
            .select('property')
            .lean()
            .then((u) => (u ? Property.findById((u as { property: mongoose.Types.ObjectId }).property).populate('agency', 'fullName email phone').lean() : null))
        : Promise.resolve(null),
      RentEntry.find({ tenant: tenantId }).sort({ dueDate: -1 }).limit(24).lean(),
      MaintenanceTicket.find({
        unit: unitId,
        status: { $in: [movininTypes.MaintenanceStatus.Open, movininTypes.MaintenanceStatus.InProgress] },
      })
        .sort({ createdAt: -1 })
        .lean(),
    ])

    const now = new Date()
    const currentRentDue = rentHistory.find(
      (r) => r.status !== movininTypes.RentStatus.Paid && new Date(r.dueDate) <= now,
    ) ?? rentHistory.find((r) => r.status === movininTypes.RentStatus.Pending || r.status === movininTypes.RentStatus.Overdue)

    const payload: movininTypes.TenantDashboard = {
      tenant: tenantDoc as unknown as movininTypes.TenantAssignment,
      unit: unitDoc as unknown as movininTypes.Unit,
      property: propertyDoc as unknown as movininTypes.Property,
      currentRentDue: currentRentDue as unknown as movininTypes.RentEntry | undefined,
      rentHistory: rentHistory as unknown as movininTypes.RentEntry[],
      openMaintenanceTickets: openTickets as unknown as movininTypes.MaintenanceTicket[],
    }
    res.json(payload)
  } catch (err) {
    logger.error(`[dashboard.getTenantDashboard] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
