import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const tenantSchema = new Schema<env.Tenant>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
      index: true,
    },
    unit: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Unit',
      index: true,
    },
    moveInDate: {
      type: Date,
      required: [true, "can't be blank"],
    },
    contractStart: {
      type: Date,
      required: [true, "can't be blank"],
    },
    contractEnd: {
      type: Date,
      required: [true, "can't be blank"],
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'Tenant',
  },
)

tenantSchema.index({ unit: 1 })
tenantSchema.index({ user: 1, active: 1 })

const Tenant = model<env.Tenant>('Tenant', tenantSchema)

export default Tenant
