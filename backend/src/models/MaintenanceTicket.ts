import { Schema, model } from 'mongoose'
import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'

const maintenanceTicketSchema = new Schema<env.MaintenanceTicket>(
  {
    property: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Property',
      index: true,
    },
    unit: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Unit',
      index: true,
    },
    category: {
      type: String,
      required: [true, "can't be blank"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "can't be blank"],
      trim: true,
    },
    priority: {
      type: String,
      enum: [
        movininTypes.MaintenancePriority.Low,
        movininTypes.MaintenancePriority.Medium,
        movininTypes.MaintenancePriority.High,
      ],
      required: [true, "can't be blank"],
    },
    status: {
      type: String,
      enum: [
        movininTypes.MaintenanceStatus.Open,
        movininTypes.MaintenanceStatus.InProgress,
        movininTypes.MaintenanceStatus.Completed,
      ],
      default: movininTypes.MaintenanceStatus.Open,
      required: true,
    },
    cost: { type: Number, min: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'MaintenanceTicket',
  },
)

maintenanceTicketSchema.index({ property: 1, status: 1 })
maintenanceTicketSchema.index({ unit: 1, status: 1 })

const MaintenanceTicket = model<env.MaintenanceTicket>('MaintenanceTicket', maintenanceTicketSchema)

export default MaintenanceTicket
