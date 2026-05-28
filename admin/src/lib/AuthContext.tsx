import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, login as cloudbaseLogin, logout as cloudbaseLogout, checkAuth } from '../lib/cloudbase'
import type { AuthContextType, User } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkLogin() {
      try {
        const isAuth = await checkAuth()
        setIsAuthenticated(isAuth)
        if (isAuth) {
          const currentUser = await getCurrentUser()
          setUser(currentUser as unknown as User)
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkLogin()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const { error } = await cloudbaseLogin(username, password)
      if (error) {
        return { success: false, error: error.message }
      }
      setIsAuthenticated(true)
      const currentUser = await getCurrentUser()
      setUser(currentUser as unknown as User)
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message }
    }
  }

  const logout = async () => {
    try {
      await cloudbaseLogout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('登出失败:', error)
    }
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