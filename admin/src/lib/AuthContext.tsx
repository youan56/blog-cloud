import { createContext, useContext, useEffect, useState } from 'react'
import { signInAnonymously, signOut, initError, ADMIN_PASSWORD } from '../lib/cloudbase'
import type { AuthContextType, User } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 本地存储 key
const AUTH_KEY = 'admin_logged_in'
const USER_KEY = 'admin_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cloudBaseReady, setCloudBaseReady] = useState(false)

  useEffect(() => {
    async function init() {
      // 1. 初始化 CloudBase 匿名登录（获取数据库权限）
      const cloudOk = await signInAnonymously()
      setCloudBaseReady(cloudOk)

      // 2. 检查本地登录状态
      const savedAuth = localStorage.getItem(AUTH_KEY)
      if (savedAuth === 'true') {
        const savedUser = localStorage.getItem(USER_KEY)
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser))
            setIsAuthenticated(true)
          } catch (e) {
            localStorage.removeItem(AUTH_KEY)
            localStorage.removeItem(USER_KEY)
          }
        }
      }

      setIsLoading(false)
    }
    init()
  }, [])

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // 检查 CloudBase 是否就绪
    if (!cloudBaseReady && !initError) {
      // 尝试重新初始化
      const ok = await signInAnonymously()
      if (!ok) {
        return { success: false, error: '云端服务连接失败，请刷新页面重试' }
      }
      setCloudBaseReady(true)
    }

    if (initError) {
      return { success: false, error: '云端服务初始化失败: ' + initError }
    }

    // 验证密码
    if (password !== ADMIN_PASSWORD) {
      return { success: false, error: '密码错误' }
    }

    // 登录成功
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
    await signOut()
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
