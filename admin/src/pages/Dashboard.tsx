/**
 * @file Dashboard.tsx - 仪表盘
 * @description 显示文章列表，管理文章（新建/编辑/删除）
 * @author 佑安Mi
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { db } from '../lib/cloudbase'
import type { BlogPost } from '../types'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 页面加载时获取文章列表
  useEffect(() => {
    loadPosts()
  }, [])

  // 从 CloudBase 加载文章
  const loadPosts = async () => {
    try {
      const result = await db.collection('posts').orderBy('createdAt', 'desc').get()
      setPosts(result.data as unknown as BlogPost[])
    } catch (error) {
      console.error('加载文章失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 删除文章
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return
    try {
      await db.collection('posts').doc(id).remove()
      loadPosts()
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  // 登出
  const handleLogout = async () => {
    await logout()
  }

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
      {/* 顶部导航 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">星绘 sama 博客管理</h1>
          <div className="flex items-center gap-4">
            {/* 设置按钮 */}
            <button
              onClick={() => navigate('/settings')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ⚙️ 设置
            </button>
            {/* 用户名 */}
            <span className="text-sm text-gray-600">
              {user?.nickname || user?.username}
            </span>
            {/* 登出按钮 */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 标题栏 + 新建按钮 */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">文章列表</h2>
          <button
            onClick={() => navigate('/editor')}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            新建文章
          </button>
        </div>

        {/* 文章列表 */}
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无文章，点击"新建文章"开始创作
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
                        <span>
                          状态: {post.status === 'published' ? '已发布' : '草稿'}
                        </span>
                        {post.tags.length > 0 && (
                          <span>标签: {post.tags.join(', ')}</span>
                        )}
                        {post.createdAt && (
                          <span>
                            创建: {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {/* 编辑按钮 → 跳转到编辑器 */}
                      <button
                        onClick={() => navigate(`/editor?id=${post._id}`)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        编辑
                      </button>
                      {/* 删除按钮 */}
                      <button
                        onClick={() => post._id && handleDelete(post._id)}
                        className="px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
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
