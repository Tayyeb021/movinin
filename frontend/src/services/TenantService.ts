import axiosInstance from './axiosInstance'

export const getTenantDashboard = () =>
  axiosInstance.get('/api/tenant-dashboard', { withCredentials: true }).then((res) => res.data)

export const getMyTenancy = () =>
  axiosInstance.get('/api/my-tenancy', { withCredentials: true }).then((res) => res.data)
