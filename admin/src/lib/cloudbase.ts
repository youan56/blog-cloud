import cloudbase from '@cloudbase/js-sdk'

// CloudBase 配置
const envId = 'a-d6gb40txde961926e'
const region = 'ap-shanghai'
const accessKey = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2EtZDZnYjQwdHhkZTk2MTkyNmUuYXAtc2hhbmdoYWkudGNiLWFwaS50ZW5jZW50Y2xvdWRhcGkuY29tIiwic3ViIjoiYW5vbiIsImF1ZCI6ImEtZDZnYjQwdHhkZTk2MTkyNmUiLCJleHAiOjQwODM0MDQ4NDMsImlhdCI6MTc3OTcyMTY0Mywibm9uY2UiOiJnb19VeHBubVFOMlZFMVhnNmJINUZRIiwiYXRfaGFzaCI6ImdvX1V4cG5tUU4yVkUxWGc2Ykg1RlEiLCJuYW1lIjoiQW5vbnltb3VzIiwic2NvcGUiOiJhbm9ueW1vdXMiLCJwcm9qZWN0X2lkIjoiYS1kNmdiNDB0eGRlOTYxOTI2ZSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.qGzwXXheWOxmKN6fmpWcfh1zvlOThhzkX5K-a2XMwcK-yWsR_1_n945u9RWJ3t5G3ZaUHuez5t7CNfim16Ogfohn0U3aB1pIc446ZNacuRW79UsYHWN-aJFZLBek1b1MHrdcYRuDcSBIieEMXZJeq04Z0vRf2pqYyIC2FcwYFL1qny235yxzCmfNiukhATVk4czZCSq_cQ2Eh6rzTSF7ntbJzsUS24vZ8R_ZxN6RMu-FU0ZEiuLKWw8WvlvvSBXGLhA7-P5ULu3D7xmhM1Em-W-OsqQIajMa4zZ6bF1SAtda-gAZ4eYRtABLLo6laOrJk75LBRZ5EM4o5bQ_WNW8xg'

// 初始化 CloudBase
export const app = cloudbase.init({
  env: envId,
  region: region,
  accessKey: accessKey,
  auth: { detectSessionInUrl: true }
})

// 认证实例
export const auth = app.auth({ persistence: 'local' })

// 数据库实例
export const db = app.database()

// 检查登录状态
export async function checkAuth(): Promise<boolean> {
  const { data } = await auth.getSession()
  return !!data?.session
}

// 获取当前用户
export async function getCurrentUser() {
  const { data } = await auth.getUser()
  return data?.user
}

// 登录
export async function login(username: string, password: string) {
  return auth.signInWithPassword({ username, password })
}

// 注册
export async function register(username: string, password: string) {
  return auth.signUp({ username, password })
}

// 登出
export async function logout() {
  return auth.signOut()
}