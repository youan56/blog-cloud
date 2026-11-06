/**
 * @file kv.ts - 云端键值存储（Vercel KV / Upstash Redis REST）
 * @description 统一封装读写，避免每个 API 各写一遍
 */

export function kvConfig() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return { url, token }
}

export function kvReady() {
  return !!kvConfig()
}

export async function kvGet<T = any>(key: string): Promise<T | null> {
  const cfg = kvConfig()
  if (!cfg) return null
  const res = await fetch(`${cfg.url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = await res.json()
  if (!json?.result) return null
  try {
    return JSON.parse(json.result) as T
  } catch {
    return json.result as T
  }
}

export async function kvSet(key: string, value: unknown): Promise<boolean> {
  const cfg = kvConfig()
  if (!cfg) return false
  const payload = JSON.stringify(value)
  const res = await fetch(`${cfg.url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'text/plain',
    },
    body: payload,
  })
  return res.ok
}

export async function kvDel(key: string): Promise<boolean> {
  const cfg = kvConfig()
  if (!cfg) return false
  const res = await fetch(`${cfg.url}/del/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
  })
  return res.ok
}
