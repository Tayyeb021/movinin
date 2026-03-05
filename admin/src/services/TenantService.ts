import axiosInstance from './axiosInstance'

export const getTenants = () =>
  axiosInstance.get('/api/tenants', { withCredentials: true }).then((res) => res.data)

export const getTenantsByProperty = (propertyId: string) =>
  axiosInstance.get(`/api/tenants-by-property/${encodeURIComponent(propertyId)}`, { withCredentials: true }).then((res) => res.data)

export const getTenantsByUnit = (unitId: string) =>
  axiosInstance.get(`/api/tenants-by-unit/${encodeURIComponent(unitId)}`, { withCredentials: true }).then((res) => res.data)

export const createTenant = (data: { user: string; unit: string; moveInDate: string; contractStart: string; contractEnd: string }) =>
  axiosInstance.post('/api/create-tenant', data, { withCredentials: true }).then((res) => res.data)

export const updateTenant = (data: { _id: string; moveInDate?: string; contractStart?: string; contractEnd?: string }) =>
  axiosInstance.put('/api/update-tenant', data, { withCredentials: true }).then((res) => res.data)

export const endTenancy = (id: string) =>
  axiosInstance.put(`/api/end-tenancy/${encodeURIComponent(id)}`, {}, { withCredentials: true }).then(() => {})
