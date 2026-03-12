import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from './endpoints'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenService'
import { unwrapData } from './mappers'

const createError = (error) => {
  const status = error?.response?.status || 0
  const responseData = error?.response?.data

  return {
    status,
    message: responseData?.message || responseData?.error || error.message || 'Beklenmeyen bir hata olustu.',
    data: responseData,
    original: error,
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

let refreshPromise = null
let authFailureHandler = () => {}

export const setAuthFailureHandler = (handler) => {
  authFailureHandler = typeof handler === 'function' ? handler : () => {}
}

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('Refresh token bulunamadi.')
  }

  const response = await refreshClient.post(API_ENDPOINTS.auth.refresh, { refreshToken })
  const payload = unwrapData(response.data) || {}
  const nextAccessToken = payload.accessToken || payload.token
  const nextRefreshToken = payload.refreshToken || refreshToken

  if (!nextAccessToken) {
    throw new Error('Refresh token yaniti gecersiz.')
  }

  setTokens({ accessToken: nextAccessToken, refreshToken: nextRefreshToken })
  return nextAccessToken
}

apiClient.interceptors.request.use((config) => {
  const nextConfig = { ...config }

  if (!nextConfig.skipAuth) {
    const accessToken = getAccessToken()
    if (accessToken) {
      nextConfig.headers = nextConfig.headers || {}
      nextConfig.headers.Authorization = `Bearer ${accessToken}`
    }
  }

  return nextConfig
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const status = error?.response?.status
    const isUnauthorized = status === 401
    const isAuthPath = String(originalRequest?.url || '').includes('/auth/')

    if (isUnauthorized && !originalRequest._retry && !originalRequest.skipAuth && !isAuthPath) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }

        const accessToken = await refreshPromise
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return apiClient(originalRequest)
      } catch (refreshError) {
        clearTokens()
        authFailureHandler()
        return Promise.reject(createError(refreshError))
      }
    }

    if (status === 401) {
      clearTokens()
      authFailureHandler()
    }

    return Promise.reject(createError(error))
  },
)
