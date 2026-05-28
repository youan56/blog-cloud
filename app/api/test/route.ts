/**
 * @file route.ts - 最简单的测试 API
 * @description 不依赖任何外部服务，只返回固定 JSON
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API 正常工作',
    timestamp: new Date().toISOString()
  });
}
