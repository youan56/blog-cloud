/**
 * @file LoginPage.tsx - 登录页
 * @description 纯客户端密码验证，CloudBase 状态仅做提示
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { cloudBaseReady, cloudBaseError } from '../lib/cloudbase'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [cloudStatus, setCloudStatus] = useState<'connecting' | 'ready' | 'error'>('connecting')

  // 监听 CloudBase 状态（仅用于显示，不阻塞登录）
  useEffect(() => {
    const check = () => {
      if (cloudBaseReady) setCloudStatus('ready')
      else if (cloudBaseError) setCloudStatus('error')
    }
    check()
    const timer = setInterval(check, 1000)
    // 10 秒后停止检查
    setTimeout(() => { clearInterval(timer); if (!cloudBaseReady) setCloudStatus('error') }, 10000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('请输入密码')
      return
    }

    setIsLoggingIn(true)
    const result = await login('', password)
    setIsLoggingIn(false)

    if (!result.success) {
      setError(result.error || '登录失败')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            博客管理后台
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请输入管理密码
          </p>
          {/* CloudBase 连接状态（仅提示） */}
          <div className="mt-3 text-center text-xs">
            {cloudStatus === 'connecting' && (
              <span className="text-yellow-600">⏳ 云端服务连接中...</span>
            )}
            {cloudStatus === 'ready' && (
              <span className="text-green-600">✅ 云端服务已连接</span>
            )}
            {cloudStatus === 'error' && (
              <span className="text-orange-600">⚠️ 云端服务未连接（登录后可重试）</span>
            )}
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              管理密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="输入管理密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
