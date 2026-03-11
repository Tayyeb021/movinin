import axios from 'axios'
import env from '@/config/env.config'

const ACCESS_TOKEN_KEY = 'mi-fe-access-token'
const X_ACCESS_TOKEN = 'x-access-token'

export const getAccessToken = (): string | null =>
  sessionStorage.getItem(ACCESS_TOKEN_KEY)

export const setAccessToken = (token: string): void => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const clearAccessToken = (): void => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}

const axiosInstance = axios.create({ baseURL: env.API_HOST })

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers[X_ACCESS_TOKEN] = token
  }
  config.withCredentials = true
  return config
})

export default axiosInstance
