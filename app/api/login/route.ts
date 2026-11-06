/**
 * @file route.ts - 登录 API（Edge Runtime）
 * @description 使用 Edge Runtime 避免 Serverless 冷启动问题
 * @author 佑安Mi
 * @created 2026-05-28
 */

// 使用 Edge Runtime（更快更稳定）
export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // 管理员凭证只从环境变量读取，源码里不保存任何密码
    const ADMIN_USER = process.env.ADMIN_USERNAME;
    const ADMIN_PASS = process.env.ADMIN_PASSWORD;

    if (!ADMIN_USER || !ADMIN_PASS) {
      return NextResponse.json(
        { success: false, message: '服务器未配置管理员账号' },
        { status: 500 }
      );
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const response = NextResponse.json({
        success: true,
        message: '登录成功'
      });
      
      // 设置 Cookie（1 天有效期）
      response.cookies.set('admin_token', 'yes', {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, message: '用户名或密码错误' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
