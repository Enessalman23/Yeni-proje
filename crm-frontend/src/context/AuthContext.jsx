import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { getMeRequest, loginRequest, logoutRequest } from '../services/api/authApi'
import { setAuthFailureHandler } from '../services/api/client'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../services/api/tokenService'

const AuthContext = createContext(null)

const STORAGE_KEY = 'crm-auth-user'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY)
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [authLoading, setAuthLoading] = useState(true)

  const forceLogout = useCallback(() => {
    Swal.close()
    clearTokens()
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  useEffect(() => {
    setAuthFailureHandler(forceLogout)
  }, [forceLogout])

  useEffect(() => {
    let active = true

    const bootstrapSession = async () => {
      const accessToken = getAccessToken()

      if (!accessToken) {
        if (active) {
          setAuthLoading(false)
        }
        return
      }

      try {
        const me = await getMeRequest()

        if (!active) {
          return
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(me))
        setUser(me)
      } catch {
        if (active) {
          forceLogout()
        }
      } finally {
        if (active) {
          setAuthLoading(false)
        }
      }
    }

    bootstrapSession()

    return () => {
      active = false
    }
  }, [forceLogout])

  const login = useCallback(async ({ email, password }) => {
    try {
      const result = await loginRequest({ email, password })

      if (!result.accessToken) {
        return { success: false, message: 'Access token alinamadi.' }
      }

      setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))
      setUser(result.user)

      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, message: error.message || 'Giris basarisiz.' }
    }
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()

    try {
      await logoutRequest(refreshToken)
    } catch {
      // Sessiz gec: backend logout hatasi local logout'u bloklamaz.
    } finally {
      forceLogout()
    }
  }, [forceLogout])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authLoading,
      login,
      logout,
    }),
    [authLoading, login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
