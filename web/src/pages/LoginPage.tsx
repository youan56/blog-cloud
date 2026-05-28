import { useState } from 'react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setError('请登录管理后台：/admin')
    }, 1000)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <div style={{ position: 'relative', maxWidth: '420px', width: '100%', padding: '48px 40px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="gradient-text" style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>佑安 Mi 博客管理</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>请登录以管理博客内容</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', fontSize: '14px' }}>{error}</div>}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>用户名</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="输入用户名" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="输入密码" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none' }} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>{loading ? '登录中...' : '登录'}</button>
        </form>
        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>HanYouAn Blog Admin</div>
      </div>
    </div>
  )
}
