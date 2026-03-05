import * as movininTypes from ':movinin-types'
import axiosInstance from './axiosInstance'

export const getMyTickets = () =>
  axiosInstance.get('/api/my-maintenance-tickets', { withCredentials: true }).then((res) => res.data)

export const createTicket = (data: {
  category: string
  description: string
  priority: movininTypes.MaintenancePriority
}) =>
  axiosInstance.post('/api/create-maintenance-ticket', data, { withCredentials: true }).then((res) => res.data)
