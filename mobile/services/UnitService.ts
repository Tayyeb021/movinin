import axiosInstance from './axiosInstance'
import * as movininTypes from 'movinin-types'

export const getPublicUnits = async (
  page: number,
  size: number,
  payload?: movininTypes.GetPublicUnitsPayload
): Promise<{ pageInfo?: { totalRecords: number }; resultData?: movininTypes.Unit[] }> =>
  axiosInstance.post(`/api/public-units/${page}/${size}`, payload || {}).then((res) => res.data)

export const getPublicUnit = async (id: string): Promise<movininTypes.Unit> =>
  axiosInstance.get(`/api/public-unit/${encodeURIComponent(id)}`).then((res) => res.data)
