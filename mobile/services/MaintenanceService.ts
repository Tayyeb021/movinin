import axiosInstance from './axiosInstance'
import * as UserService from './UserService'
import * as movininTypes from 'movinin-types'

export const getMyTickets = async (): Promise<movininTypes.MaintenanceTicket[]> => {
  const headers = await UserService.authHeader()
  return axiosInstance.get('/api/my-maintenance-tickets', { headers }).then((res) => res.data)
}

export const createTicket = async (data: {
  category: string
  description: string
  priority: movininTypes.MaintenancePriority
}): Promise<movininTypes.MaintenanceTicket> => {
  const headers = await UserService.authHeader()
  return axiosInstance.post('/api/create-maintenance-ticket', data, { headers }).then((res) => res.data)
}
