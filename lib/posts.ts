/**
 * @file posts.ts - 文章云端读写（服务端 + 客户端共用同一份格式）
 */

import { kvGet, kvSet } from './kv'

export interface StoredPost {
  id: string
  type?: 'post' | 'chatter' | 'about'
  title: string
  tags?: string[]
  cover?: string
  mood?: string
  description?: string
  content: string
  date?: string
  published?: boolean
  updatedAt?: number
}

const KEY = 'blog:posts'

export async function listPosts(): Promise<StoredPost[]> {
  const raw = await kvGet<StoredPost[]>(KEY)
  if (!raw || !Array.isArray(raw)) return []
  return raw
}

export async function savePost(post: StoredPost): Promise<StoredPost[]> {
  const all = await listPosts()
  const idx = all.findIndex((p) => p.id === post.id)
  const next = { ...post, updatedAt: Date.now() }
  if (idx >= 0) all[idx] = next
  else all.unshift(next)
  await kvSet(KEY, all)
  return all
}

export async function removePost(id: string): Promise<StoredPost[]> {
  const all = await listPosts()
  const next = all.filter((p) => p.id !== id)
  await kvSet(KEY, next)
  return next
}

export async function findPost(id: string): Promise<StoredPost | null> {
  const all = await listPosts()
  return all.find((p) => p.id === id) || null
}

/** 判断正文是 HTML 还是 Markdown（编辑器输出 HTML，老数据是 Markdown） */
export function isHtml(content: string) {
  return /^\s*</.test(content || '')
}
