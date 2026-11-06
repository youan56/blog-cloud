/**
 * @file route.ts - 文章 API（云端存储版）
 * @description 文章统一存入云端 KV，任何设备登录后台都能看到同一份内容
 */

import { NextResponse } from 'next/server'
import { kvReady } from '../../../lib/kv'
import { listPosts, savePost, removePost } from '../../../lib/posts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function notConfigured() {
  return NextResponse.json(
    {
      success: false,
      error: '云端存储未配置（缺少 KV_REST_API_URL / KV_REST_API_TOKEN）',
    },
    { status: 503 }
  )
}

/** GET /api/posts —— 读取全部文章 */
export async function GET(request: Request) {
  if (!kvReady()) return notConfigured()
  try {
    const url = new URL(request.url)
    const all = await listPosts()
    const id = url.searchParams.get('id')
    if (id) {
      const one = all.find((p) => p.id === id)
      if (!one) return NextResponse.json({ success: false, error: '文章不存在' }, { status: 404 })
      return NextResponse.json({ success: true, data: one })
    }
    const sorted = all.sort((a, b) => {
      const da = new Date(a.date || a.updatedAt || 0).getTime()
      const db = new Date(b.date || b.updatedAt || 0).getTime()
      return db - da
    })
    return NextResponse.json({ success: true, data: sorted, count: sorted.length })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

/** POST /api/posts —— 新建或更新（按 id 覆盖） */
export async function POST(request: Request) {
  if (!kvReady()) return notConfigured()
  try {
    const body = await request.json()
    if (!body?.title || typeof body.title !== 'string') {
      return NextResponse.json({ success: false, error: '标题不能为空' }, { status: 400 })
    }
    const post = {
      id: body.id || `post_${Date.now()}`,
      type: body.type || 'post',
      title: body.title,
      tags: body.tags || [],
      cover: body.cover || '',
      mood: body.mood || '',
      description: body.description || '',
      content: body.content || '',
      date: body.date || new Date().toISOString().slice(0, 10),
      published: body.published ?? false,
    }
    const all = await savePost(post)
    return NextResponse.json({ success: true, data: post, total: all.length })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

/** DELETE /api/posts?id=xxx —— 删除 */
export async function DELETE(request: Request) {
  if (!kvReady()) return notConfigured()
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 })
    const all = await removePost(id)
    return NextResponse.json({ success: true, total: all.length })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
