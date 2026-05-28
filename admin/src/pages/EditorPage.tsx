/**
 * @file EditorPage.tsx - 文章编辑器
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getDb, getError } from '../lib/cloudbase'
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

  useEffect(() => {
    if (!postId) return
    const db = getDb()
    if (!db) { setErrorMsg('云端服务未就绪'); return }
    setIsLoading(true)
    db.collection('posts').doc(postId).get()
      .then((res: any) => {
        const post = res.data
        if (post) {
          setTitle(post.title || '')
          setContent(post.content || '')
          setSummary(post.summary || '')
          setCoverImage(post.coverImage || '')
          setTags(post.tags || [])
          setStatus(post.status || 'draft')
        }
      })
      .catch((err: any) => setErrorMsg('加载失败: ' + err.message))
      .finally(() => setIsLoading(false))
  }, [postId])

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput('') }
  }
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag))

  const handleSave = async (saveStatus: 'draft' | 'published') => {
    if (!title.trim()) { alert('请填写标题'); return }
    const db = getDb()
    if (!db) { setErrorMsg('云端服务未就绪：' + (getError() || '连接中')); return }
    setIsSaving(true)
    setErrorMsg(null)
    try {
      const now = new Date()
      const postData = {
        title: title.trim(), content, summary: summary.trim(), coverImage: coverImage.trim(),
        tags, status: saveStatus, updatedAt: now,
        authorId: user?.id || '', authorName: user?.nickname || '',
      }
      if (isEdit && postId) {
        await db.collection('posts').doc(postId).update(postData)
      } else {
        const result = await db.collection('posts').add({ ...postData, createdAt: now })
        const newId = (result as any).id || (result as any)._id
        if (newId) window.history.replaceState(null, '', `/editor?id=${newId}`)
      }
      setLastSaved(new Date().toLocaleTimeString())
      setStatus(saveStatus)
    } catch (err: any) {
      setErrorMsg('保存失败: ' + err.message)
    } finally { setIsSaving(false) }
  }

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</div>

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
  const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px' }}>← 返回</button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{isEdit ? '编辑文章' : '新建文章'}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastSaved && <span style={{ fontSize: '12px', color: '#9ca3af' }}>💾 {lastSaved}</span>}
          <button onClick={() => handleSave('draft')} disabled={isSaving} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#374151', background: 'white', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.5 : 1 }}>{isSaving ? '保存中...' : '保存草稿'}</button>
          <button onClick={() => handleSave('published')} disabled={isSaving} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.5 : 1 }}>{isSaving ? '发布中...' : '🚀 发布'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {errorMsg && <div style={{ marginBottom: '16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '14px' }}>❌ {errorMsg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="文章标题..." style={{ ...inputStyle, fontSize: '18px', fontWeight: 700 }} />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="开始写作...（支持 Markdown）" style={{ ...inputStyle, minHeight: '400px', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>状态</h3>
              <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, background: status === 'published' ? '#dcfce7' : '#fef9c3', color: status === 'published' ? '#166534' : '#854d0e' }}>{status === 'published' ? '已发布' : '草稿'}</span>
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>封面图</h3>
              <input type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://example.com/image.jpg" style={inputStyle} />
              {coverImage && <div style={{ marginTop: '8px', borderRadius: '6px', overflow: 'hidden' }}><img src={coverImage} alt="封面" style={{ width: '100%', height: '120px', objectFit: 'cover' }} /></div>}
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>摘要</h3>
              <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="一句话描述..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>标签</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {tags.map(tag => (
                  <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af', fontWeight: 700 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="添加标签..." style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addTag} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: 'white', cursor: 'pointer' }}>+</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
