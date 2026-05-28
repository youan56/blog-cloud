/**
 * @file AuthContext.tsx - 认证上下文
 * @description 登录验证与 CloudBase 完全解耦，密码验证是纯客户端行为
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { ADMIN_PASSWORD } from '../lib/cloudbase'
import type { AuthContextType, User } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_KEY = 'blog_admin_auth'
const USER_KEY = 'blog_admin_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 启动时检查本地登录状态（不依赖 CloudBase）
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY)
      const savedUser = localStorage.getItem(USER_KEY)
      if (savedAuth === 'true' && savedUser) {
        setUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
      }
    } catch (e) {
      console.error('恢复登录状态失败:', e)
      localStorage.removeItem(AUTH_KEY)
      localStorage.removeItem(USER_KEY)
    }
    // 无论成功失败，立即结束加载状态（不等 CloudBase）
    setIsLoading(false)
  }, [])

  // 登录（纯客户端密码验证，不依赖 CloudBase）
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (password !== ADMIN_PASSWORD) {
      return { success: false, error: '密码错误' }
    }

    const adminUser: User = {
      id: 'admin',
      username: username || 'admin',
      nickname: username || '管理员',
    }

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
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
