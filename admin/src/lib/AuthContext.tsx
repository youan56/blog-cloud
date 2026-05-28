import { createContext, useContext, useEffect, useState } from 'react'
import type { AuthContextType, User } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_KEY = 'blog_admin_auth'
const USER_KEY = 'blog_admin_user'

// 从环境变量读取密码（Vercel Dashboard 设置，不在 GitHub 里）
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || ''

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY)
      const savedUser = localStorage.getItem(USER_KEY)
      if (savedAuth === 'true' && savedUser) {
        setUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
      }
    } catch {
      localStorage.removeItem(AUTH_KEY)
      localStorage.removeItem(USER_KEY)
    }
    setIsLoading(false)
  }, [])

  const login = async (_username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!ADMIN_PASSWORD) {
      return { success: false, error: '管理密码未配置（请在 Vercel 环境变量中设置 VITE_ADMIN_PASSWORD）' }
    }
    if (password !== ADMIN_PASSWORD) {
      return { success: false, error: '密码错误' }
    }
    const adminUser: User = { id: 'admin', username: 'admin', nickname: '管理员' }
    localStorage.setItem(AUTH_KEY, 'true')
    localStorage.setItem(USER_KEY, JSON.stringify(adminUser))
    setUser(adminUser)
    setIsAuthenticated(true)
    return { success: true }
  }

  const logout = async () => {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
