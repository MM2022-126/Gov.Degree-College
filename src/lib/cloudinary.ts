import { v2 as cloudinary } from 'cloudinary'

function ensureCloudinaryConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const api_key = process.env.CLOUDINARY_API_KEY?.trim()
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim()

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on Vercel.',
    )
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true })
  return { cloud_name, api_key, api_secret }
}

export default cloudinary

export type UploadResult = { url: string; publicId: string; resourceType: string }

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
          const message =
            (error as { message?: string })?.message ||
            (typeof error === 'string' ? error : 'Cloudinary upload failed')
          reject(new Error(message))
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
    console.error('Cloudinary delete error:', err)
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
