import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

const DEMO_USER = {
  id: '1',
  email: 'admin@ecole.ma',
  first_name: 'Faiza',
  last_name: 'ERRIHANI',
  role: 'directeur'
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (token && saved) return JSON.parse(saved)
    } catch {}
    return null
  })
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    localStorage.setItem('token', 'demo-token-ScholarVision')
    localStorage.setItem('user', JSON.stringify(DEMO_USER))
    setUser(DEMO_USER)
    return DEMO_USER
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Déconnecté')
  }, [])

  const hasRole = useCallback((...roles) => user && roles.includes(user.role), [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}
