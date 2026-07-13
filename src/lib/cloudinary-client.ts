/**
 * Upload image/video via signed direct upload to Cloudinary (browser → Cloudinary).
 * Avoids Vercel serverless body-size limits that break /api/upload for larger files.
 */

function extractErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const b = body as {
    error?: string | { message?: string; http_code?: number }
    message?: string
  }
  if (typeof b.error === 'string' && b.error.trim()) return b.error
  if (b.error && typeof b.error === 'object') {
    const parts = [b.error.message, b.error.http_code != null ? `http_code=${b.error.http_code}` : null]
      .filter(Boolean)
    if (parts.length) return parts.join(' | ')
  }
  if (typeof b.message === 'string' && b.message.trim()) return b.message
  return fallback
}

export async function uploadToCloudinary(
  file: File,
): Promise<{ url: string; publicId: string; resourceType?: string }> {
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    throw new Error('Only image or video files are allowed')
  }
  if (file.size > 100 * 1024 * 1024) {
    throw new Error('File too large (max 100MB)')
  }

  const signRes = await fetch('/api/upload/sign', {
    method: 'POST',
    credentials: 'include',
  })
  const signBody = await signRes.json().catch(() => ({}))
  if (!signRes.ok) {
    throw new Error(
      extractErrorMessage(
        signBody,
        `Failed to get Cloudinary upload signature (HTTP ${signRes.status})`,
      ),
    )
  }

  const { cloudName, apiKey, timestamp, folder, signature } = signBody as {
    cloudName: string
    apiKey: string
    timestamp: number
    folder: string
    signature: string
  }

  if (!cloudName || !apiKey || !timestamp || !signature || !folder) {
    throw new Error(
      'Cloudinary sign response missing fields (cloudName/apiKey/timestamp/folder/signature). Check server Cloudinary env.',
    )
  }

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)

  const resource = file.type.startsWith('video/') ? 'video' : 'image'
  const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resource}/upload`, {
    method: 'POST',
    body: form,
  })
  const cloudBody = await cloudRes.json().catch(() => ({}))
  if (!cloudRes.ok) {
    throw new Error(
      extractErrorMessage(
        cloudBody,
        `Cloudinary direct upload failed (HTTP ${cloudRes.status}, cloud=${cloudName}, resource=${resource})`,
      ),
    )
  }

  if (!cloudBody?.secure_url || !cloudBody?.public_id) {
    throw new Error(
      `Cloudinary upload returned an incomplete response (missing secure_url/public_id). cloud=${cloudName}`,
    )
  }

  return {
    url: cloudBody.secure_url as string,
    publicId: cloudBody.public_id as string,
    resourceType: cloudBody.resource_type as string,
  }
}
