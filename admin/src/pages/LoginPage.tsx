/**
 * @file LoginPage.tsx - 登录页
 * @description 纯客户端密码验证，不依赖任何外部服务
 */

import React, { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

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
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</div>
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '16px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>博客管理后台</h2>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>请输入管理密码</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>管理密码</label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入管理密码"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              width: '100%', padding: '10px 16px', background: '#2563eb', color: 'white',
              border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600,
              cursor: isLoggingIn ? 'not-allowed' : 'pointer', opacity: isLoggingIn ? 0.5 : 1
            }}
          >
            {isLoggingIn ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
