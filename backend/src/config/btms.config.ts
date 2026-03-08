import * as movininTypes from 'movinin-types'

/**
 * Default furnishing checklist item keys (configurable list per spec).
 */
export const FURNISHING_ITEM_KEYS: string[] = [
  'Bed',
  'Mattress',
  'Wardrobe',
  'Sofa',
  'DiningTable',
  'Chairs',
  'Refrigerator',
  'WashingMachine',
  'Microwave',
  'AirConditioner',
  'Curtains',
  'WaterHeater',
  'TV',
  'KitchenCabinets',
  'LightFixtures',
]

export function isFurnishingChecklistRequired(status: movininTypes.FurnishingStatus): boolean {
  return (
    status === movininTypes.FurnishingStatus.SemiFurnished ||
    status === movininTypes.FurnishingStatus.FullyFurnished
  )
}

export function validateChecklistItems(
  checklist: movininTypes.FurnishingItem[] | undefined,
  allowedKeys: string[] = FURNISHING_ITEM_KEYS,
): boolean {
  if (!checklist || checklist.length === 0) return true
  return checklist.every((item) => allowedKeys.includes(item.itemKey))
}
