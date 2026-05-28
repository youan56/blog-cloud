/**
 * @file route.ts - 站点配置 API
 * @description 使用 Upstash REST API 直接读写 Vercel KV
 */

import { NextResponse } from 'next/server';

// 从环境变量获取 KV 连接信息
function getKvHeaders() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('KV 环境变量未配置');
  return { url, token };
}

// GET - 读取配置
export async function GET() {
  try {
    const { url, token } = getKvHeaders();
    const res = await fetch(url + '/get/siteConfig', {
      headers: { Authorization: 'Bearer ' + token },
      cache: 'no-store',
    });
    const json = await res.json();
    const config = json.result ? JSON.parse(json.result) : null;
    return NextResponse.json({ success: true, data: config || {} });
  } catch (error) {
    console.error('读取配置失败:', error);
    return NextResponse.json({ success: false, error: String(error), data: {} });
  }
}

// POST - 保存配置
export async function POST(request: Request) {
  try {
    const { url, token } = getKvHeaders();
    const body = await request.json();
    const payload = JSON.stringify({ ...body, updatedAt: Date.now() });

    const res = await fetch(url + '/set/siteConfig', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'text/plain',
      },
      body: payload,
    });
    const json = await res.json();

    if (json.result === 'OK') {
      return NextResponse.json({ success: true, message: '配置已保存' });
    } else {
      return NextResponse.json({ success: false, error: 'KV 写入失败: ' + JSON.stringify(json) });
    }
  } catch (error) {
    console.error('保存配置失败:', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
