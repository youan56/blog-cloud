/**
 * @file cloudbase.ts - CloudBase 云端数据库
 * @description 提供云端数据存储，带超时保护，失败不影响登录
 */

import cloudbase from '@cloudbase/js-sdk'

// CloudBase 配置
const envId = 'a-d6gb40txde961926e'
const region = 'ap-shanghai'
const accessKey = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2EtZDZnYjQwdHhkZTk2MTkyNmUuYXAtc2hhbmdoYWkudGNiLWFwaS50ZW5jZW50Y2xvdWRhcGkuY29tIiwic3ViIjoiYW5vbiIsImF1ZCI6ImEtZDZnYjQwdHhkZTk2MTkyNmUiLCJleHAiOjQwODM0MDQ4NDMsImlhdCI6MTc3OTcyMTY0Mywibm9uY2UiOiJnb19VeHBubVFOMlZFMVhnNmJINUZRIiwiYXRfaGFzaCI6ImdvX1V4cG5tUU4yVkUxWGc2Ykg1RlEiLCJuYW1lIjoiQW5vbnltb3VzIiwic2NvcGUiOiJhbm9ueW1vdXMiLCJwcm9qZWN0X2lkIjoiYS1kNmdiNDB0eGRlOTYxOTI2ZSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.qGzwXXheWOxmKN6fmpWcfh1zvlOThhzkX5K-a2XMwcK-yWsR_1_n945u9RWJ3t5G3ZaUHuez5t7CNfim16Ogfohn0U3aB1pIc446ZNacuRW79UsYHWN-aJFZLBek1b1MHrdcYRuDcSBIieEMXZJeq04Z0vRf2pqYyIC2FcwYFL1qny235yxzCmfNiukhATVk4czZCSq_cQ2Eh6rzTSF7ntbJzsUS24vZ8R_ZxN6RMu-FU0ZEiuLKWw8WvlvvSBXGLhA7-P5ULu3D7xmhM1Em-W-OsqQIajMa4zZ6bF1SAtda-gAZ4eYRtABLLo6laOrJk75LBRZ5EM4o5bQ_WNW8xg'

// 管理后台密码
export const ADMIN_PASSWORD = 'Hddllm4197'

// CloudBase 状态
export let db: any = null
export let cloudBaseReady = false
export let cloudBaseError: string | null = null

// 超时辅助函数
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} 超时 (${ms}ms)`)), ms)
    promise.then(
      (val) => { clearTimeout(timer); resolve(val) },
      (err) => { clearTimeout(timer); reject(err) }
    )
  })
}

// 初始化 CloudBase（不阻塞 app 启动）
export async function initCloudBase(): Promise<void> {
  try {
    console.log('🔄 正在连接 CloudBase...')
    const app = cloudbase.init({
      env: envId,
      region: region,
      accessKey: accessKey,
      auth: { detectSessionInUrl: false }
    })
    const auth = app.auth({ persistence: 'local' })

    // 匿名登录（带 8 秒超时）
    try {
      const { data: sessionData } = await withTimeout(auth.getSession(), 8000, 'getSession')
      if (!sessionData?.session) {
        await withTimeout(auth.signInAnonymously(), 8000, 'signInAnonymously')
      }
    } catch (authErr) {
      console.warn('⚠️ CloudBase 匿名登录失败，尝试直接使用数据库:', authErr)
    }

    db = app.database()
    cloudBaseReady = true
    console.log('✅ CloudBase 就绪')
  } catch (e) {
    cloudBaseError = (e as Error).message
    console.error('❌ CloudBase 初始化失败:', e)
  }
}

// 在后台初始化（不阻塞模块加载）
initCloudBase()

// 导出一个安全的数据库操作包装器
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  label: string
): Promise<{ data: T; error: string | null }> {
  if (!cloudBaseReady || !db) {
    return { data: fallback, error: 'CloudBase 未就绪: ' + (cloudBaseError || '初始化中') }
  }
  try {
    const result = await withTimeout(operation(), 10000, label)
    return { data: result, error: null }
  } catch (e) {
    const msg = (e as Error).message
    console.error(`❌ ${label} 失败:`, msg)
    return { data: fallback, error: msg }
  }
}
