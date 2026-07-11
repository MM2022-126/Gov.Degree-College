function normalizeApiBaseUrl(value: string): string {
  if (!value) return '/api'

  const trimmed = value.trim()
  if (!trimmed) return '/api'

  if (trimmed.startsWith('/')) return trimmed

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`
}

export function getApiBaseUrl(): string {
  const configured =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) ||
    ''
  return normalizeApiBaseUrl(String(configured))
}

export function getSocketBaseUrl(): string {
  const configured =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_SOCKET_URL?: string } }).env?.VITE_SOCKET_URL) ||
    ''
  if (configured) return configured.replace(/\/+$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}
