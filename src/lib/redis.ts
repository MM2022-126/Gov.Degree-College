import Redis from 'ioredis'

function createRedis(): Redis | null {
  const url = process.env.REDIS_URL?.trim()
  if (!url) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[chat] REDIS_URL not set — WebSocket chat runs on a single instance only.')
    }
    return null
  }

  return new Redis(url, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => Math.min(times * 200, 5_000),
  })
}

export const redis = createRedis()

export function fieldsToObject(flat: string[]): Record<string, string> {
  const obj: Record<string, string> = {}
  for (let i = 0; i + 1 < flat.length; i += 2) obj[flat[i]] = flat[i + 1]
  return obj
}
