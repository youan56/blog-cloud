import cloudbase from '@cloudbase/js-sdk'

// CloudBase 配置
const envId = 'a-d6gb40txde961926e'
const region = 'ap-shanghai'
const accessKey = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2EtZDZnYjQwdHhkZTk2MTkyNmUuYXAtc2hhbmdoYWkudGNiLWFwaS50ZW5jZW50Y2xvdWRhcGkuY29tIiwic3ViIjoiYW5vbiIsImF1ZCI6ImEtZDZnYjQwdHhkZTk2MTkyNmUiLCJleHAiOjQwODM0MDQ4NDMsImlhdCI6MTc3OTcyMTY0Mywibm9uY2UiOiJnb19VeHBubVFOMlZFMVhnNmJINUZRIiwiYXRfaGFzaCI6ImdvX1V4cG5tUU4yVkUxWGc2Ykg1RlEiLCJuYW1lIjoiQW5vbnltb3VzIiwic2NvcGUiOiJhbm9ueW1vdXMiLCJwcm9qZWN0X2lkIjoiYS1kNmdiNDB0eGRlOTYxOTI2ZSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.qGzwXXheWOxmKN6fmpWcfh1zvlOThhzkX5K-a2XMwcK-yWsR_1_n945u9RWJ3t5G3ZaUHuez5t7CNfim16Ogfohn0U3aB1pIc446ZNacuRW79UsYHWN-aJFZLBek1b1MHrdcYRuDcSBIieEMXZJeq04Z0vRf2pqYyIC2FcwYFL1qny235yxzCmfNiukhATVk4czZCSq_cQ2Eh6rzTSF7ntbJzsUS24vZ8R_ZxN6RMu-FU0ZEiuLKWw8WvlvvSBXGLhA7-P5ULu3D7xmhM1Em-W-OsqQIajMa4zZ6bF1SAtda-gAZ4eYRtABLLo6laOrJk75LBRZ5EM4o5bQ_WNW8xg'

// 管理后台密码（简单客户端验证）
export const ADMIN_PASSWORD = 'Hddllm4197'

// 初始化 CloudBase（带错误处理）
let app: any = null
let auth: any = null
let db: any = null
let initError: string | null = null

try {
  app = cloudbase.init({
    env: envId,
    region: region,
    accessKey: accessKey,
    auth: { detectSessionInUrl: false }
  })
  auth = app.auth({ persistence: 'local' })
  db = app.database()
  console.log('✅ CloudBase 初始化成功')
} catch (e) {
  initError = (e as Error).message
  console.error('❌ CloudBase 初始化失败:', e)
}

export { app, auth, db, initError }

// 匿名登录（获取数据库访问权限）
export async function signInAnonymously(): Promise<boolean> {
  if (!auth) {
    console.error('CloudBase 未初始化')
    return false
  }
  try {
    // 检查是否已有会话
    const { data: sessionData } = await auth.getSession()
    if (sessionData?.session) {
      console.log('✅ 已有 CloudBase 会话')
      return true
    }
    // 匿名登录
    await auth.signInAnonymously()
    console.log('✅ CloudBase 匿名登录成功')
    return true
  } catch (e) {
    console.error('❌ CloudBase 匿名登录失败:', e)
    return false
  }
}

// 登出
export async function signOut() {
  if (!auth) return
  try {
    await auth.signOut()
  } catch (e) {
    console.error('登出失败:', e)
  }
}
