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

const baseURL = env.API_HOST
if (typeof baseURL !== 'string' || !baseURL || baseURL === 'undefined') {
  console.error(
    '[Movinin] VITE_MI_API_HOST is not set. Set it at build time (e.g. in Railway: Variables → VITE_MI_API_HOST = your backend URL).'
  )
}

const axiosInstance = axios.create({
  baseURL: typeof baseURL === 'string' && baseURL && baseURL !== 'undefined' ? baseURL : '',
})

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers[X_ACCESS_TOKEN] = token
    config.headers.Authorization = `Bearer ${token}`
  }
  config.withCredentials = true
  return config
})

export default axiosInstance
