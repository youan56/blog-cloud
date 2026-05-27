/**
 * 配置存储层
 * - 优先使用 Vercel KV（生产环境）
 * - 回退到内存存储（本地开发）
 */

// 尝试导入 Vercel KV
let kv: any = null;
let kvAvailable = false;

async function getKv() {
  if (kv !== null) return kvAvailable ? kv : null;
  
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
    // 测试连接
    await kv.get('__test__');
    kvAvailable = true;
    return kv;
  } catch (e) {
    console.warn('Vercel KV 不可用，使用内存存储:', (e as Error).message);
    kv = null;
    kvAvailable = false;
    return null;
  }
}

// 内存存储（本地开发回退）
let memoryStore: Record<string, any> = {};

const KV_KEY = 'siteConfig';

/** 默认配置 */
export const defaultConfig = {
  title: "佑安 Mi 的云端博客",
  description: "在代码、学术与分子动力学模拟间穿梭的普通人",
  author: "佑安 Mi",
  bio: "在代码、学术与分子动力学模拟间穿梭的普通人。近期正埋头于 GROMACS 模拟研究与神经网络计算。",
  avatarUrl: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
  social: {
    github: "https://github.com/youan56",
    email: "1124533793@qq.com",
  },
};

/** 读取配置 */
export async function getConfig() {
  try {
    const store = await getKv();
    if (store) {
      const config = await store.get(KV_KEY);
      return { ...defaultConfig, ...(config || {}) };
    }
  } catch (e) {
    console.error('KV 读取失败:', (e as Error).message);
  }
  
  // 回退到内存存储
  return { ...defaultConfig, ...(memoryStore[KV_KEY] || {}) };
}

/** 保存配置 */
export async function saveConfig(data: Record<string, any>) {
  const payload = {
    ...data,
    updatedAt: Date.now(),
  };

  try {
    const store = await getKv();
    if (store) {
      await store.set(KV_KEY, payload);
      return { success: true, storage: 'vercel-kv' };
    }
  } catch (e) {
    console.error('KV 保存失败:', (e as Error).message);
  }
  
  // 回退到内存存储
  memoryStore[KV_KEY] = payload;
  return { success: true, storage: 'memory' };
}
