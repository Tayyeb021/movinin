import * as movininTypes from 'movinin-types'
import axiosInstance from './axiosInstance'

export const getRentEntries = (params: { unitId?: string; tenantId?: string; period?: string; status?: string }): Promise<movininTypes.RentEntry[]> =>
  axiosInstance
    .get('/api/rent-entries', { params, withCredentials: true })
    .then((res) => res.data)

export const createRentEntries = (data: {
  unitId?: string
  tenantId?: string
  period: string
  dueDate: string
  amount: number
}): Promise<movininTypes.RentEntry[]> =>
  axiosInstance
    .post('/api/create-rent-entries', data, { withCredentials: true })
    .then((res) => res.data)

export const updateRentEntry = (data: {
  _id: string
  status?: movininTypes.RentStatus
  paidAmount?: number
  paidAt?: string
}): Promise<movininTypes.RentEntry> =>
  axiosInstance
    .put('/api/update-rent-entry', data, { withCredentials: true })
    .then((res) => res.data)
