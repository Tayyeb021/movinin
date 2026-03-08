import * as movininTypes from 'movinin-types'
import axiosInstance from './axiosInstance'

export const getPublicUnits = (
  page: number,
  size: number,
  payload?: movininTypes.GetPublicUnitsPayload
): Promise<movininTypes.ResultData<movininTypes.Unit> & { resultData: unknown[] }> =>
  axiosInstance
    .post(`/api/public-units/${page}/${size}`, payload || {})
    .then((res) => res.data)

export const getPublicUnit = (id: string): Promise<movininTypes.Unit & { property?: movininTypes.Property & { agency?: movininTypes.User } }> =>
  axiosInstance.get(`/api/public-unit/${encodeURIComponent(id)}`).then((res) => res.data)
