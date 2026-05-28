/**
 * @file Dashboard.tsx - 仪表盘
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getDb, getError } from '../lib/cloudbase'
import type { BlogPost } from '../types'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => { loadPosts() }, [])

  const loadPosts = async () => {
    const db = getDb()
    if (!db) {
      setErrorMsg('云端服务未就绪：' + (getError() || '连接中，请稍后点击重试'))
      setIsLoading(false)
      return
    }
    try {
      const result = await db.collection('posts').orderBy('createdAt', 'desc').get()
      setPosts(result.data as unknown as BlogPost[])
      setErrorMsg(null)
    } catch (error: any) {
      setErrorMsg('加载失败: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return
    const db = getDb()
    if (!db) { alert('云端服务未就绪'); return }
    try {
      await db.collection('posts').doc(id).remove()
      loadPosts()
    } catch (error: any) {
      alert('删除失败: ' + error.message)
    }
  }

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>博客管理后台</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px' }}>⚙️ 设置</button>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{user?.nickname || user?.username}</span>
          <button onClick={logout} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>退出</button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {errorMsg && (
          <div style={{ marginBottom: '16px', background: '#fefce8', border: '1px solid #fde68a', color: '#92400e', padding: '12px 16px', borderRadius: '8px', fontSize: '14px' }}>
            ⚠️ {errorMsg}
            <button onClick={loadPosts} style={{ marginLeft: '12px', textDecoration: 'underline', background: 'none', border: 'none', color: '#92400e', cursor: 'pointer' }}>重试</button>
          </div>
        )}

        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>文章列表</h2>
          <button onClick={() => navigate('/editor')} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>新建文章</button>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            {errorMsg ? '无法加载文章' : '暂无文章，点击「新建文章」开始创作'}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {posts.map((post) => (
              <div key={post._id} style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2563eb' }}>{post.title}</h3>
                  {post.summary && <p style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>{post.summary}</p>}
                  <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '13px', color: '#9ca3af' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, background: post.status === 'published' ? '#dcfce7' : '#fef9c3', color: post.status === 'published' ? '#166534' : '#854d0e' }}>
                      {post.status === 'published' ? '已发布' : '草稿'}
                    </span>
                    {post.tags && post.tags.length > 0 && <span>🏷️ {post.tags.join(', ')}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                  <button onClick={() => navigate(`/editor?id=${post._id}`)} style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', color: '#374151', background: 'white', cursor: 'pointer' }}>编辑</button>
                  <button onClick={() => post._id && handleDelete(post._id)} style={{ padding: '6px 12px', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '13px', color: '#dc2626', background: 'white', cursor: 'pointer' }}>删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
