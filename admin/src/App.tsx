/**
 * @file App.tsx - 应用路由配置
 * @description 定义所有页面路由和认证保护
 * @author 佑安Mi
 */

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import EditorPage from './pages/EditorPage'
import SettingsPage from './pages/SettingsPage'

/**
 * 受保护路由组件
 * 未登录时自动跳转到登录页
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 登录页（无需认证） */}
          <Route path="/login" element={<LoginPage />} />
          {/* 仪表盘（需要认证） */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {/* 编辑器（需要认证） */}
          <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
          {/* 站点配置（需要认证） */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          {/* 其他路径重定向到首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
