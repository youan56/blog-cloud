/**
 * @file EditorPage.tsx - 文章编辑器
 * @description 创建和编辑博客文章，带 CloudBase 错误提示
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db, cloudBaseReady, cloudBaseError } from '../lib/cloudbase'
import { useAuth } from '../lib/AuthContext'

export default function EditorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const postId = searchParams.get('id')
  const isEdit = !!postId

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 编辑模式：加载文章数据
  useEffect(() => {
    if (!postId) return
    if (!cloudBaseReady || !db) {
      setErrorMsg('云端服务未就绪，无法加载文章')
      return
    }
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
        setErrorMsg('加载文章失败: ' + err.message)
      })
      .finally(() => setIsLoading(false))
  }, [postId, cloudBaseReady])

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
    if (!cloudBaseReady || !db) {
      setErrorMsg('云端服务未就绪，无法保存：' + (cloudBaseError || '连接中'))
      return
    }
    setIsSaving(true)
    setErrorMsg(null)
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
        await db.collection('posts').doc(postId).update(postData)
      } else {
        const result = await db.collection('posts').add({ ...postData, createdAt: now })
        const newId = (result as any).id || (result as any)._id
        if (newId) {
          window.history.replaceState(null, '', `/editor?id=${newId}`)
        }
      }
      setLastSaved(new Date().toLocaleTimeString())
      setStatus(saveStatus)
    } catch (err: any) {
      console.error('保存失败:', err)
      setErrorMsg('保存失败: ' + err.message)
    } finally {
      setIsSaving(false)
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
            >
              ← 返回
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? '编辑文章' : '新建文章'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-gray-400">💾 {lastSaved}</span>
            )}
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? '保存中...' : '保存草稿'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? '发布中...' : '🚀 发布'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 错误提示 */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            ❌ {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
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

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-md shadow p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">状态</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status === 'published' ? '已发布' : '草稿'}
              </span>
            </div>

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

            <div className="bg-white rounded-md shadow p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">标签</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-600 cursor-pointer">×</button>
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
                <button onClick={addTag} className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">+</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
