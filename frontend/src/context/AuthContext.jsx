import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Vérifier le token au montage
  useEffect(() => {
    const token = localStorage.getItem('mw_token')
    if (!token) { setLoading(false); return }

    authApi.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('mw_token'))
      .finally(() => setLoading(false))
  }, [])

  // Écouter l'expiration détectée dans client.js
  useEffect(() => {
    const handler = () => { setUser(null) }
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await authApi.login({ username, password })
    localStorage.setItem('mw_token', data.token)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    localStorage.removeItem('mw_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}