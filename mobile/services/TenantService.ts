import axiosInstance from './axiosInstance'
import * as UserService from './UserService'
import * as movininTypes from ':movinin-types'

export const getTenantDashboard = async (): Promise<movininTypes.TenantDashboard> => {
  const headers = await UserService.authHeader()
  return axiosInstance.get('/api/tenant-dashboard', { headers }).then((res) => res.data)
}

export const getMyTenancy = async () => {
  const headers = await UserService.authHeader()
  return axiosInstance.get('/api/my-tenancy', { headers }).then((res) => res.data)
}
