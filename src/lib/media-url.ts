/** Detect Cloudinary (or other) video URLs for correct <video> vs <img> rendering. */
export function isVideoMediaUrl(url?: string | null, resourceType?: string | null): boolean {
  if (resourceType === 'video') return true
  if (!url) return false
  if (/\/video\/upload\//i.test(url)) return true
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url)
}

/** Normalize GET /api/media payloads: `{ media: [...] }` or a bare array. */
export function normalizeMediaListResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray((data as { media?: unknown }).media)) {
    return (data as { media: unknown[] }).media
  }
  return []
}
