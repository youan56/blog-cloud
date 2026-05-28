/**
 * @file SettingsPage.tsx - 站点配置管理
 * @description 管理网站配置信息，数据存储到 CloudBase
 * @author 佑安Mi
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/cloudbase'

// 配置数据结构
interface SiteConfig {
  title: string
  description: string
  author: string
  bio: string
  avatarUrl: string
  social: {
    github: string
    email: string
    qq: string
    wechat: string
    bilibili: string
  }
}

// 默认配置
const defaultConfig: SiteConfig = {
  title: 'XingHuiSama の 宝藏之地',
  description: '在代码、学术与分子动力学模拟间穿梭的普通人',
  author: 'XingHuiSama',
  bio: '在代码、学术与分子动力学模拟间穿梭的普通人。近期正埋头于 GROMACS 模拟研究与神经网络计算。',
  avatarUrl: 'https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg',
  social: {
    github: 'https://github.com/youan56',
    email: '',
    qq: '1124533793',
    wechat: 'XingHuisama',
    bilibili: '',
  },
}

export default function SettingsPage() {
  const navigate = useNavigate()

  // 表单数据
  const [formData, setFormData] = useState<SiteConfig>(defaultConfig)
  // 当前激活的标签页
  const [activeTab, setActiveTab] = useState<'profile' | 'site' | 'social'>('profile')
  // 加载状态
  const [isLoading, setIsLoading] = useState(true)
  // 保存状态
  const [isSaving, setIsSaving] = useState(false)
  // 提示消息
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // 加载配置
  useEffect(() => {
    db.collection('siteConfig')
      .limit(1)
      .get()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const config = res.data[0] as any
          setFormData({
            title: config.title || defaultConfig.title,
            description: config.description || defaultConfig.description,
            author: config.author || defaultConfig.author,
            bio: config.bio || defaultConfig.bio,
            avatarUrl: config.avatarUrl || defaultConfig.avatarUrl,
            social: { ...defaultConfig.social, ...(config.social || {}) },
          })
        }
      })
      .catch((err) => console.error('加载配置失败:', err))
      .finally(() => setIsLoading(false))
  }, [])

  // Toast 自动消失
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // 更新普通字段
  const handleUpdate = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 更新社交链接字段
  const handleSocialUpdate = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social: { ...prev.social, [field]: value },
    }))
  }

  // 保存配置到 CloudBase
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 查询是否已有配置
      const existing = await db.collection('siteConfig').limit(1).get()
      if (existing.data && existing.data.length > 0) {
        // 更新已有配置
        await db.collection('siteConfig').doc((existing.data[0] as any)._id).update({
          ...formData,
          updatedAt: new Date(),
        })
      } else {
        // 创建新配置
        await db.collection('siteConfig').add({
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      setToast({ message: '✅ 配置已保存到云端！', type: 'success' })
    } catch (err) {
      console.error('保存失败:', err)
      setToast({ message: '❌ 保存失败: ' + (err as Error).message, type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  // 标签页定义
  const tabs = [
    { id: 'profile' as const, name: '个人资料', icon: '👤' },
    { id: 'site' as const, name: '站点信息', icon: '🌐' },
    { id: 'social' as const, name: '社交链接', icon: '🔗' },
  ]

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast 提示 */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-md shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {toast.message}
        </div>
      )}

      {/* 顶部导航 */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← 返回
            </button>
            <h1 className="text-xl font-bold text-gray-900">⚙️ 站点配置</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '💾 保存到云端'}
          </button>
        </div>
      </header>

      {/* 内容区 */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左侧标签导航 */}
          <nav className="w-full md:w-48 shrink-0">
            <div className="bg-white rounded-md shadow p-3 flex md:flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all w-full text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </nav>

          {/* 右侧内容 */}
          <div className="flex-1">
            {/* 个人资料 */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-md shadow p-6 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">👤 个人资料</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">博主名称</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleUpdate('author', e.target.value)}
                    placeholder="你的名字"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleUpdate('bio', e.target.value)}
                    placeholder="一句话介绍自己"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ resize: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">头像链接</label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => handleUpdate('avatarUrl', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.avatarUrl && (
                    <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                      <img src={formData.avatarUrl} alt="头像" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 站点信息 */}
            {activeTab === 'site' && (
              <div className="bg-white rounded-md shadow p-6 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">🌐 站点信息</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">网站标题</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleUpdate('title', e.target.value)}
                    placeholder="你的博客标题"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">网站描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleUpdate('description', e.target.value)}
                    placeholder="一句话描述你的博客"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* 社交链接 */}
            {activeTab === 'social' && (
              <div className="bg-white rounded-md shadow p-6 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">🔗 社交链接</h2>
                {[
                  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
                  { key: 'email', label: '邮箱', placeholder: 'your@email.com' },
                  { key: 'qq', label: 'QQ', placeholder: 'QQ 号' },
                  { key: 'wechat', label: '微信', placeholder: '微信号' },
                  { key: 'bilibili', label: 'B站', placeholder: 'https://space.bilibili.com/xxx' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={(formData.social as any)[key]}
                      onChange={(e) => handleSocialUpdate(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
