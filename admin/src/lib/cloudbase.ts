/**
 * @file cloudbase.ts - 云端数据库（完全可选，不阻塞 UI）
 * @description CloudBase 在后台静默初始化，失败不影响任何页面功能
 */

import cloudbase from '@cloudbase/js-sdk'

const envId = 'a-d6gb40txde961926e'
const region = 'ap-shanghai'
const accessKey = 'eyJhbG…W8xg'

// 模块级状态
let _db: any = null
let _ready = false
let _error: string | null = null

// 获取 db（可能为 null）
export function getDb() { return _db }
export function isReady() { return _ready }
export function getError() { return _error }

// 异步初始化（不阻塞模块加载）
;(async () => {
  try {
    const app = cloudbase.init({ env: envId, region: region, accessKey: accessKey })
    const auth = app.auth({ persistence: 'local' })
    
    // 尝试匿名登录，8秒超时
    const loginPromise = (async () => {
      const { data } = await auth.getSession()
      if (!data?.session) {
        await auth.signInAnonymously()
      }
    })()
    
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('CloudBase 连接超时')), 8000)
    )
    
    await Promise.race([loginPromise, timeout])
    
    _db = app.database()
    _ready = true
    console.log('✅ CloudBase 就绪')
  } catch (e) {
    _error = (e as Error).message
    console.warn('⚠️ CloudBase 不可用:', _error)
  }
})()
