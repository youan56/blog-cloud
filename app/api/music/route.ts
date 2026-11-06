/**
 * @file route.ts - 音乐代理 API
 * @description 服务端代理第三方音乐接口，规避浏览器跨域限制；
 *              音频走本站转发，避免上游 CDN 的防盗链拦截。
 */

import { NextResponse } from 'next/server';

const UPSTREAM = 'https://api.injahow.cn/meting/';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'song';
  const id = (searchParams.get('id') || '').trim();

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ success: false, error: '歌曲 ID 必须为数字' }, { status: 400 });
  }

  const upstream = `${UPSTREAM}?server=netease&type=${type}&id=${id}`;

  try {
    const res = await fetch(upstream, { cache: 'no-store' });

    if (type === 'url') {
      if (!res.ok || !res.body) {
        return NextResponse.json({ success: false, error: '该歌曲暂无可用音频' }, { status: 404 });
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.startsWith('audio')) {
        return NextResponse.json({ success: false, error: '该歌曲受版权限制，暂无音频' }, { status: 404 });
      }
      return new Response(res.body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    if (type === 'lrc') {
      const text = await res.text();
      return new NextResponse(text, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    const data = await res.json();
    const info = Array.isArray(data) ? data[0] : data;
    if (!info || !info.name) {
      return NextResponse.json({ success: false, error: '未找到该歌曲，请检查 ID' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: {
        id,
        title: info.name,
        artist: info.artist || '未知歌手',
        cover: info.pic || '',
        playable: Boolean(info.url),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: '音乐服务暂时不可用' }, { status: 502 });
  }
}
