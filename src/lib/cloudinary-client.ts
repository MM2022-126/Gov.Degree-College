/**
 * Upload image/video via signed direct upload to Cloudinary (browser → Cloudinary).
 * Avoids Vercel serverless body-size limits that break /api/upload for larger files.
 */
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
    throw new Error(signBody?.error || 'Failed to get Cloudinary upload signature')
  }

  const { cloudName, apiKey, timestamp, folder, signature } = signBody as {
    cloudName: string
    apiKey: string
    timestamp: number
    folder: string
    signature: string
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
    throw new Error(cloudBody?.error?.message || cloudBody?.error || 'Cloudinary upload failed')
  }

  return {
    url: cloudBody.secure_url as string,
    publicId: cloudBody.public_id as string,
    resourceType: cloudBody.resource_type as string,
  }
}
