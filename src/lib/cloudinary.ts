import { v2 as cloudinary } from 'cloudinary'

export type CloudinaryCredentials = {
  cloud_name: string
  api_key: string
  api_secret: string
  source: 'url' | 'discrete'
}

/** Parse `cloudinary://<api_key>:<api_secret>@<cloud_name>` (optional trailing slash/path). */
export function parseCloudinaryUrl(url: string): Omit<CloudinaryCredentials, 'source'> {
  const trimmed = url.trim()
  const match = trimmed.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/\s]+)/i)
  if (!match) {
    throw new Error(
      'Invalid CLOUDINARY_URL. Expected format: cloudinary://<api_key>:<api_secret>@<cloud_name>',
    )
  }
  return {
    api_key: match[1],
    api_secret: match[2],
    cloud_name: match[3].replace(/\/$/, ''),
  }
}

/** Resolve credentials: prefer CLOUDINARY_URL, else discrete CLOUDINARY_* vars. */
export function resolveCloudinaryCredentials(): CloudinaryCredentials {
  const url = process.env.CLOUDINARY_URL?.trim()
  if (url) {
    return { ...parseCloudinaryUrl(url), source: 'url' }
  }

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const api_key = process.env.CLOUDINARY_API_KEY?.trim()
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim()
  const missing: string[] = []
  if (!cloud_name) missing.push('CLOUDINARY_CLOUD_NAME')
  if (!api_key) missing.push('CLOUDINARY_API_KEY')
  if (!api_secret) missing.push('CLOUDINARY_API_SECRET')

  if (missing.length) {
    throw new Error(
      `Cloudinary is not configured. Missing: ${missing.join(', ')}. ` +
        'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on Vercel ' +
        '(or set CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>).',
    )
  }

  return { cloud_name: cloud_name!, api_key: api_key!, api_secret: api_secret!, source: 'discrete' }
}

export function isCloudinaryConfigured(): boolean {
  try {
    resolveCloudinaryCredentials()
    return true
  } catch {
    return false
  }
}

function ensureCloudinaryConfig(): CloudinaryCredentials {
  const creds = resolveCloudinaryCredentials()
  cloudinary.config({
    cloud_name: creds.cloud_name,
    api_key: creds.api_key,
    api_secret: creds.api_secret,
    secure: true,
  })
  return creds
}

export default cloudinary

export type UploadResult = { url: string; publicId: string; resourceType: string }

function formatCloudinaryError(error: unknown, fallback = 'Cloudinary upload failed'): string {
  if (!error) return fallback
  if (typeof error === 'string') return error
  const e = error as {
    message?: string
    error?: { message?: string } | string
    http_code?: number
    name?: string
  }
  const nested =
    typeof e.error === 'string'
      ? e.error
      : e.error && typeof e.error === 'object'
        ? e.error.message
        : undefined
  const parts = [e.message, nested, e.http_code != null ? `http_code=${e.http_code}` : null].filter(
    Boolean,
  )
  return parts.length ? parts.join(' | ') : fallback
}

/** Upload image or video via Cloudinary (server-side). Prefer signed client upload on Vercel for larger files. */
export async function uploadMediaBuffer(
  buffer: Buffer,
  options: { mimeType?: string; folder?: string } = {},
): Promise<UploadResult> {
  ensureCloudinaryConfig()
  const folder = options.folder || 'ggc-college'
  const resourceType = options.mimeType?.startsWith('video/')
    ? 'video'
    : options.mimeType?.startsWith('image/')
      ? 'image'
      : 'auto'

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) {
          reject(new Error(formatCloudinaryError(error)))
          return
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type || resourceType,
        })
      },
    )
    stream.end(buffer)
  })
}

/** @deprecated Use uploadMediaBuffer */
export async function uploadImageBuffer(buffer: Buffer): Promise<{ url: string; publicId: string }> {
  const result = await uploadMediaBuffer(buffer, { mimeType: 'image/' })
  return { url: result.url, publicId: result.publicId }
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  try {
    ensureCloudinaryConfig()
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' }).catch(() => undefined)
  } catch (err) {
    console.error('Cloudinary delete error:', formatCloudinaryError(err, String(err)))
  }
}

/** Signed params so the browser can upload directly to Cloudinary (avoids Vercel body size limits). */
export function createCloudinaryUploadSignature(folder = 'ggc-college') {
  const { cloud_name, api_key, api_secret } = ensureCloudinaryConfig()
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { folder, timestamp }
  const signature = cloudinary.utils.api_sign_request(paramsToSign, api_secret)

  return {
    cloudName: cloud_name,
    apiKey: api_key,
    timestamp,
    folder,
    signature,
  }
}
