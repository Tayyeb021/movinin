import * as movininTypes from 'movinin-types'
import axiosInstance from './axiosInstance'

export const getTickets = (params?: { propertyId?: string; unitId?: string; status?: string }): Promise<movininTypes.MaintenanceTicket[]> =>
  axiosInstance
    .get('/api/maintenance-tickets', { params: params || {}, withCredentials: true })
    .then((res) => res.data)

export const getTicket = (id: string): Promise<movininTypes.MaintenanceTicket> =>
  axiosInstance
    .get(`/api/maintenance-ticket/${encodeURIComponent(id)}`, { withCredentials: true })
    .then((res) => res.data)

export const createTicket = (data: {
  property?: string
  unit?: string
  category: string
  description: string
  priority: movininTypes.MaintenancePriority
  status?: movininTypes.MaintenanceStatus
  cost?: number
}): Promise<movininTypes.MaintenanceTicket> =>
  axiosInstance
    .post('/api/create-maintenance-ticket', data, { withCredentials: true })
    .then((res) => res.data)

export const updateTicket = (data: {
  _id: string
  status?: movininTypes.MaintenanceStatus
  cost?: number
  closedAt?: string
}): Promise<movininTypes.MaintenanceTicket> =>
  axiosInstance
    .put('/api/update-maintenance-ticket', data, { withCredentials: true })
    .then((res) => res.data)
