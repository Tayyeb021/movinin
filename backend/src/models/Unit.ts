import { Schema, model } from 'mongoose'
import * as movininTypes from 'movinin-types'
import * as env from '../config/env.config'

const furnishingItemSchema = new Schema(
  {
    itemKey: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      enum: [
        movininTypes.FurnishingCondition.New,
        movininTypes.FurnishingCondition.Good,
        movininTypes.FurnishingCondition.NeedsRepair,
      ],
      required: true,
    },
    notes: { type: String },
  },
  { _id: false },
)

const unitSchema = new Schema<env.Unit>(
  {
    property: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Property',
      index: true,
    },
    name: {
      type: String,
      required: [true, "can't be blank"],
      trim: true,
    },
    rent: {
      type: Number,
      required: [true, "can't be blank"],
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: [true, "can't be blank"],
      min: 0,
    },
    size: { type: Number, min: 0 },
    furnishingStatus: {
      type: String,
      enum: [
        movininTypes.FurnishingStatus.Unfurnished,
        movininTypes.FurnishingStatus.SemiFurnished,
        movininTypes.FurnishingStatus.FullyFurnished,
      ],
      required: [true, "can't be blank"],
    },
    status: {
      type: String,
      enum: [
        movininTypes.UnitStatus.Vacant,
        movininTypes.UnitStatus.Occupied,
        movininTypes.UnitStatus.UnderMaintenance,
      ],
      default: movininTypes.UnitStatus.Vacant,
      required: true,
    },
    checklist: {
      type: [furnishingItemSchema],
      default: undefined,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'Unit',
  },
)

unitSchema.index({ property: 1 })
unitSchema.index({ status: 1 })

const Unit = model<env.Unit>('Unit', unitSchema)

export default Unit
