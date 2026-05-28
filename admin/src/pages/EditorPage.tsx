/**
 * @file EditorPage.tsx - 文章编辑器
 * @description 创建和编辑博客文章，数据存储到 CloudBase
 * @author 佑安Mi
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db } from '../lib/cloudbase'
import { useAuth } from '../lib/AuthContext'

export default function EditorPage() {
  const navigate = useNavigate()
  // 获取 URL 参数，判断是新建还是编辑
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  // 文章 ID（有则为编辑模式）
  const postId = searchParams.get('id')
  const isEdit = !!postId

  // 表单状态
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // 编辑模式：加载文章数据
  useEffect(() => {
    if (!postId) return
    setIsLoading(true)
    db.collection('posts')
      .doc(postId)
      .get()
      .then((res: any) => {
        const post = res.data as any
        if (post) {
          setTitle(post.title || '')
          setContent(post.content || '')
          setSummary(post.summary || '')
          setCoverImage(post.coverImage || '')
          setTags(post.tags || [])
          setStatus(post.status || 'draft')
        }
      })
      .catch((err: any) => {
        console.error('加载文章失败:', err)
        alert('加载文章失败')
      })
      .finally(() => setIsLoading(false))
  }, [postId])

  // 添加标签
  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  // 删除标签
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  // 保存文章
  const handleSave = async (saveStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('请填写标题')
      return
    }
    setIsSaving(true)
    try {
      const now = new Date()
      const postData = {
        title: title.trim(),
        content,
        summary: summary.trim(),
        coverImage: coverImage.trim(),
        tags,
        status: saveStatus,
        updatedAt: now,
        authorId: user?.id || '',
        authorName: user?.nickname || user?.username || '',
      }

      if (isEdit && postId) {
        // 编辑模式：更新文章
        await db.collection('posts').doc(postId).update(postData)
      } else {
        // 新建模式：创建文章
        const result = await db.collection('posts').add({ ...postData, createdAt: now })
        const newId = (result as any).id || (result as any)._id
        if (newId) {
          // 更新 URL 为编辑模式，避免重复创建
          window.history.replaceState(null, '', `/editor?id=${newId}`)
        }
      }
      setLastSaved(new Date().toLocaleTimeString())
      setStatus(saveStatus)
    } catch (err: any) {
      console.error('保存失败:', err)
      alert('保存失败: ' + (err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  // 加载中状态
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← 返回
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? '编辑文章' : '新建文章'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-gray-400">
                💾 {lastSaved}
              </span>
            )}
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存草稿'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? '发布中...' : '🚀 发布'}
            </button>
          </div>
        </div>
      </header>

      {/* 编辑器主体 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* 左侧：标题 + 内容 */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写作...（支持 Markdown）"
              className="w-full px-4 py-3 border border-gray-300 rounded-md font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: '400px', resize: 'vertical' }}
            />
          </div>

          {/* 右侧：元信息 */}
          <div className="flex flex-col gap-4">
            {/* 状态 */}
            <div className="bg-white rounded-md shadow p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">状态</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status === 'published' ? '已发布' : '草稿'}
              </span>
            </div>

            {/* 封面图 */}
            <div className="bg-white rounded-md shadow p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">封面图</h3>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {coverImage && (
                <div className="mt-2 rounded-md overflow-hidden">
                  <img src={coverImage} alt="封面" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>

            {/* 摘要 */}
            <div className="bg-white rounded-md shadow p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">摘要</h3>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="一句话描述..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ resize: 'none' }}
              />
            </div>

            {/* 标签 */}
            <div className="bg-white rounded-md shadow p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">标签</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="添加标签..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
