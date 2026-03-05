import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const planSchema = new Schema<env.Plan>(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, trim: true },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'Plan',
  },
)

const Plan = model<env.Plan>('Plan', planSchema)

export default Plan
