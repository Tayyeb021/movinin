import * as movininTypes from ':movinin-types'
import axiosInstance from './axiosInstance'

export const getManagerDashboard = (): Promise<movininTypes.ManagerDashboard> =>
  axiosInstance.get('/api/manager-dashboard', { withCredentials: true }).then((res) => res.data)
