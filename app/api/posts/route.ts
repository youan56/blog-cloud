/**
 * @file route.ts - 文章 API 路由
 * @description 处理文章的增删改查操作，使用 localStorage 存储（后续可迁移到 CloudBase）
 * @author 佑安
 * @created 2026-05-27
 */

import { NextResponse } from 'next/server';

/**
 * 文章数据结构
 */
interface Post {
  id: string;          // 文章唯一 ID
  title: string;       // 文章标题
  content: string;     // 文章内容（Markdown）
  excerpt: string;     // 文章摘要
  createdAt: string;   // 创建时间
  updatedAt: string;   // 更新时间
  published: boolean;  // 是否已发布
}

/**
 * GET /api/posts - 获取文章列表
 */
export async function GET() {
  try {
    // TODO: 从 CloudBase 获取文章列表
    // 目前返回空数组，后续接入数据库
    const posts: Post[] = [];
    
    return NextResponse.json({
      success: true,
      data: posts
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * POST /api/posts - 创建新文章
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. 验证必填字段
    if (!body.title || !body.content) {
      return NextResponse.json({
        success: false,
        error: '标题和内容不能为空'
      }, { status: 400 });
    }

    // 2. 创建文章对象
    const newPost: Post = {
      id: Date.now().toString(),
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || body.content.substring(0, 100),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: body.published ?? false
    };

    // TODO: 保存到 CloudBase
    // 目前只是返回模拟数据
    
    return NextResponse.json({
      success: true,
      message: '文章创建成功',
      data: newPost
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
