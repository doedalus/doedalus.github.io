import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, getAccessToken, getRefreshToken, setTokens, clearTokens, ApiError } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await api.me()
      setUser(me)
    } catch (e) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (username, password) => {
    const data = await api.login({ username, password })
    setTokens(data)
    await loadUser()
  }

  const register = async (username, email, password) => {
    const data = await api.register({ username, email, password })
    setTokens(data)
    await loadUser()
  }

  const logout = async () => {
    const refresh_token = getRefreshToken()
    try {
      if (refresh_token) await api.logout(refresh_token)
    } catch (e) {
      // even if the server call fails, forget the tokens locally
    }
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}

export { ApiError }
