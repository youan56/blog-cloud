/**
 * @file SettingsPage.tsx - 站点配置
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDb, getError } from '../lib/cloudbase'

interface SiteConfig {
  title: string; description: string; author: string; bio: string; avatarUrl: string
  social: { github: string; email: string; qq: string; wechat: string; bilibili: string }
}

const defaultConfig: SiteConfig = {
  title: '', description: '', author: '', bio: '', avatarUrl: '',
  social: { github: '', email: '', qq: '', wechat: '', bilibili: '' },
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<SiteConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState<'profile' | 'site' | 'social'>('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const db = getDb()
    if (!db) { setErrorMsg('云端服务未就绪：' + (getError() || '连接中')); setIsLoading(false); return }
    db.collection('siteConfig').limit(1).get()
      .then((res: any) => {
        if (res.data?.length > 0) {
          const c = res.data[0]
          setFormData({
            title: c.title || '', description: c.description || '', author: c.author || '',
            bio: c.bio || '', avatarUrl: c.avatarUrl || '',
            social: { ...defaultConfig.social, ...(c.social || {}) },
          })
        }
      })
      .catch((err: any) => setErrorMsg('加载失败: ' + err.message))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t) } }, [toast])

  const handleUpdate = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }))
  const handleSocialUpdate = (field: string, value: string) => setFormData(prev => ({ ...prev, social: { ...prev.social, [field]: value } }))

  const handleSave = async () => {
    const db = getDb()
    if (!db) { setToast({ message: '❌ 云端服务未就绪', type: 'error' }); return }
    setIsSaving(true)
    try {
      const existing = await db.collection('siteConfig').limit(1).get()
      if (existing.data?.length > 0) {
        await db.collection('siteConfig').doc(existing.data[0]._id).update({ ...formData, updatedAt: new Date() })
      } else {
        await db.collection('siteConfig').add({ ...formData, createdAt: new Date(), updatedAt: new Date() })
      }
      setToast({ message: '✅ 配置已保存！', type: 'success' })
    } catch (err: any) {
      setToast({ message: '❌ 保存失败: ' + err.message, type: 'error' })
    } finally { setIsSaving(false) }
  }

  const tabs = [
    { id: 'profile' as const, name: '个人资料', icon: '👤' },
    { id: 'site' as const, name: '站点信息', icon: '🌐' },
    { id: 'social' as const, name: '社交链接', icon: '🔗' },
  ]

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
  const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {toast && <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '14px', fontWeight: 600, background: toast.type === 'success' ? '#dcfce7' : '#fef2f2', color: toast.type === 'success' ? '#166534' : '#b91c1c' }}>{toast.message}</div>}

      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px' }}>← 返回</button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>⚙️ 站点配置</h1>
        </div>
        <button onClick={handleSave} disabled={isSaving} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.5 : 1 }}>{isSaving ? '保存中...' : '💾 保存到云端'}</button>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {errorMsg && <div style={{ marginBottom: '16px', background: '#fefce8', border: '1px solid #fde68a', color: '#92400e', padding: '12px 16px', borderRadius: '8px', fontSize: '14px' }}>⚠️ {errorMsg}</div>}

        <div style={{ display: 'flex', gap: '24px' }}>
          <nav style={{ width: '180px', flexShrink: 0 }}>
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === tab.id ? '#2563eb' : 'transparent', color: activeTab === tab.id ? 'white' : '#374151' }}>
                  <span>{tab.icon}</span>{tab.name}
                </button>
              ))}
            </div>
          </nav>

          <div style={{ flex: 1 }}>
            {activeTab === 'profile' && (
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>👤 个人资料</h2>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>博主名称</label><input type="text" value={formData.author} onChange={e => handleUpdate('author', e.target.value)} placeholder="你的名字" style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>个人简介</label><textarea value={formData.bio} onChange={e => handleUpdate('bio', e.target.value)} placeholder="一句话介绍自己" rows={3} style={{ ...inputStyle, resize: 'none' }} /></div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>头像链接</label>
                  <input type="url" value={formData.avatarUrl} onChange={e => handleUpdate('avatarUrl', e.target.value)} placeholder="https://example.com/avatar.jpg" style={inputStyle} />
                  {formData.avatarUrl && <div style={{ marginTop: '8px', width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e5e7eb' }}><img src={formData.avatarUrl} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                </div>
              </div>
            )}
            {activeTab === 'site' && (
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>🌐 站点信息</h2>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>网站标题</label><input type="text" value={formData.title} onChange={e => handleUpdate('title', e.target.value)} placeholder="你的博客标题" style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>网站描述</label><textarea value={formData.description} onChange={e => handleUpdate('description', e.target.value)} placeholder="一句话描述" rows={3} style={{ ...inputStyle, resize: 'none' }} /></div>
              </div>
            )}
            {activeTab === 'social' && (
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>🔗 社交链接</h2>
                {[
                  { key: 'github', label: 'GitHub', ph: 'https://github.com/username' },
                  { key: 'email', label: '邮箱', ph: 'your@email.com' },
                  { key: 'qq', label: 'QQ', ph: 'QQ 号' },
                  { key: 'wechat', label: '微信', ph: '微信号' },
                  { key: 'bilibili', label: 'B站', ph: 'https://space.bilibili.com/xxx' },
                ].map(({ key, label, ph }) => (
                  <div key={key}><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{label}</label><input type="text" value={(formData.social as any)[key]} onChange={e => handleSocialUpdate(key, e.target.value)} placeholder={ph} style={inputStyle} /></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
