import * as movininTypes from 'movinin-types'
import axiosInstance from './axiosInstance'

export const getUnit = (id: string): Promise<movininTypes.Unit> =>
  axiosInstance
    .get(`/api/unit/${encodeURIComponent(id)}`, { withCredentials: true })
    .then((res) => res.data)

export const getUnitsByProperty = (propertyId: string): Promise<movininTypes.Unit[]> =>
  axiosInstance
    .get(`/api/units-by-property/${encodeURIComponent(propertyId)}`, { withCredentials: true })
    .then((res) => res.data)

export const createUnit = (data: Partial<movininTypes.Unit> & { property: string }): Promise<movininTypes.Unit> =>
  axiosInstance
    .post('/api/create-unit', data, { withCredentials: true })
    .then((res) => res.data)

export const updateUnit = (data: Partial<movininTypes.Unit> & { _id: string }): Promise<movininTypes.Unit> =>
  axiosInstance
    .put('/api/update-unit', data, { withCredentials: true })
    .then((res) => res.data)

export const deleteUnit = (id: string): Promise<void> =>
  axiosInstance
    .delete(`/api/delete-unit/${encodeURIComponent(id)}`, { withCredentials: true })
    .then(() => {})
