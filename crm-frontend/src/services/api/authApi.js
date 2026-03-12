import { apiClient } from './client'
import { API_ENDPOINTS } from './endpoints'
import { mapUser, unwrapData } from './mappers'
import { mockLogin, mockLogout, mockMe } from './mockApi'
import { USE_MOCK_API } from './runtime'

const isNetworkError = (error) => !error?.status

export const loginRequest = async ({ email, password }) => {
  if (USE_MOCK_API) {
    return mockLogin({ email, password })
  }

  try {
    const response = await apiClient.post(
      API_ENDPOINTS.auth.login,
      { email, password },
      { skipAuth: true },
    )

    const payload = unwrapData(response.data) || {}

    return {
      accessToken: payload.accessToken || payload.token,
      refreshToken: payload.refreshToken,
      user: mapUser(payload.user || payload),
    }
  } catch (error) {
    if (isNetworkError(error)) {
      return mockLogin({ email, password })
    }

    throw error
  }
}

export const getMeRequest = async () => {
  if (USE_MOCK_API) {
    return mockMe()
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.auth.me)
    return mapUser(unwrapData(response.data) || {})
  } catch (error) {
    if (isNetworkError(error)) {
      return mockMe()
    }

    throw error
  }
}

export const logoutRequest = async (refreshToken) => {
  if (USE_MOCK_API) {
    await mockLogout()
    return
  }

  if (!refreshToken) {
    return
  }

  try {
    await apiClient.post(API_ENDPOINTS.auth.logout, { refreshToken })
  } catch (error) {
    if (isNetworkError(error)) {
      await mockLogout()
      return
    }

    throw error
  }
}
