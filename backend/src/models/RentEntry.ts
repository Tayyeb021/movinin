import { Schema, model } from 'mongoose'
import * as movininTypes from 'movinin-types'
import * as env from '../config/env.config'

const rentEntrySchema = new Schema<env.RentEntry>(
  {
    unit: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Unit',
      index: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Tenant',
      index: true,
    },
    period: {
      type: String,
      required: [true, "can't be blank"],
    },
    dueDate: {
      type: Date,
      required: [true, "can't be blank"],
    },
    amount: {
      type: Number,
      required: [true, "can't be blank"],
      min: 0,
    },
    status: {
      type: String,
      enum: [
        movininTypes.RentStatus.Pending,
        movininTypes.RentStatus.Paid,
        movininTypes.RentStatus.Partial,
        movininTypes.RentStatus.Overdue,
      ],
      required: [true, "can't be blank"],
    },
    paidAmount: { type: Number, min: 0 },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'RentEntry',
  },
)

rentEntrySchema.index({ unit: 1, period: 1 })
rentEntrySchema.index({ tenant: 1, period: 1 })

const RentEntry = model<env.RentEntry>('RentEntry', rentEntrySchema)

export default RentEntry
