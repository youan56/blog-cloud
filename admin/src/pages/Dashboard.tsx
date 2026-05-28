/**
 * @file Dashboard.tsx - 仪表盘
 * @description 显示文章列表，管理文章，带 CloudBase 错误提示
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { db, cloudBaseReady, cloudBaseError } from '../lib/cloudbase'
import type { BlogPost } from '../types'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    if (!cloudBaseReady || !db) {
      setErrorMsg('云端服务未就绪：' + (cloudBaseError || '连接中，请稍后刷新'))
      setIsLoading(false)
      return
    }
    try {
      const result = await db.collection('posts').orderBy('createdAt', 'desc').get()
      setPosts(result.data as unknown as BlogPost[])
      setErrorMsg(null)
    } catch (error: any) {
      console.error('加载文章失败:', error)
      setErrorMsg('加载文章失败: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return
    if (!db) { alert('云端服务未就绪'); return }
    try {
      await db.collection('posts').doc(id).remove()
      loadPosts()
    } catch (error: any) {
      console.error('删除失败:', error)
      alert('删除失败: ' + error.message)
    }
  }

  const handleNewArticle = () => {
    console.log('📝 点击新建文章，导航到 /editor')
    navigate('/editor')
  }

  const handleSettings = () => {
    console.log('⚙️ 点击设置，导航到 /settings')
    navigate('/settings')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">博客管理后台</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSettings}
              className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
            >
              ⚙️ 设置
            </button>
            <span className="text-sm text-gray-600">
              {user?.nickname || user?.username}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 云端状态提示 */}
        {errorMsg && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
            ⚠️ {errorMsg}
            <button onClick={loadPosts} className="ml-3 underline hover:text-yellow-900 cursor-pointer">
              重试
            </button>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">文章列表</h2>
          <button
            onClick={handleNewArticle}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            新建文章
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无文章，点击「新建文章」开始创作
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {posts.map((post) => (
                <li key={post._id}>
                  <div className="px-4 py-4 sm:px-6 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-blue-600 truncate">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {post.summary}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'published' ? '已发布' : '草稿'}
                        </span>
                        {post.tags && post.tags.length > 0 && (
                          <span>🏷️ {post.tags.join(', ')}</span>
                        )}
                        {post.createdAt && (
                          <span>📅 {new Date(post.createdAt as any).toLocaleDateString('zh-CN')}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/editor?id=${post._id}`)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => post._id && handleDelete(post._id)}
                        className="px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
