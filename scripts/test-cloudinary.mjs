/**
 * Verify Cloudinary env from .env without printing secrets.
 * Usage: node scripts/test-cloudinary.mjs
 * Optional tiny upload: node scripts/test-cloudinary.mjs --upload
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { v2 as cloudinary } from 'cloudinary'

function loadEnvFile(name) {
  try {
    const raw = readFileSync(resolve(name), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      const key = t.slice(0, i).trim()
      let val = t.slice(i + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // optional file
  }
}

loadEnvFile('.env')
loadEnvFile('.env.local')

function parseCloudinaryUrl(url) {
  const match = url.trim().match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/\s]+)/i)
  if (!match) {
    throw new Error('Invalid CLOUDINARY_URL format')
  }
  return { api_key: match[1], api_secret: match[2], cloud_name: match[3].replace(/\/$/, '') }
}

function resolveCreds() {
  const url = process.env.CLOUDINARY_URL?.trim()
  if (url) {
    return { ...parseCloudinaryUrl(url), source: 'CLOUDINARY_URL' }
  }
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const api_key = process.env.CLOUDINARY_API_KEY?.trim()
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim()
  const missing = []
  if (!cloud_name) missing.push('CLOUDINARY_CLOUD_NAME')
  if (!api_key) missing.push('CLOUDINARY_API_KEY')
  if (!api_secret) missing.push('CLOUDINARY_API_SECRET')
  if (missing.length) {
    throw new Error(`Missing env: ${missing.join(', ')} (or set CLOUDINARY_URL)`)
  }
  return { cloud_name, api_key, api_secret, source: 'discrete CLOUDINARY_*' }
}

function mask(value) {
  if (!value) return '(empty)'
  if (value.length <= 6) return '***'
  return `${value.slice(0, 2)}…${value.slice(-2)} (len=${value.length})`
}

const doUpload = process.argv.includes('--upload')

let creds
try {
  creds = resolveCreds()
} catch (e) {
  console.error('CONFIG_FAIL', e.message)
  process.exit(1)
}

console.log('configSource', creds.source)
console.log('cloudName', creds.cloud_name)
console.log('apiKey', mask(creds.api_key))
console.log('apiSecret', mask(creds.api_secret))
console.log('hasCloudinaryUrl', !!process.env.CLOUDINARY_URL?.trim())
console.log(
  'hasDiscreteVars',
  !!(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  ),
)

cloudinary.config({
  cloud_name: creds.cloud_name,
  api_key: creds.api_key,
  api_secret: creds.api_secret,
  secure: true,
})

try {
  const ping = await cloudinary.api.ping()
  console.log('PING_OK', ping?.status || 'ok')
} catch (e) {
  console.error('PING_FAIL', e?.message || String(e))
  process.exit(1)
}

if (doUpload) {
  // 1x1 PNG
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  )
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'ggc-college/config-test', resource_type: 'image' },
          (err, res) => (err || !res ? reject(err || new Error('no result')) : resolve(res)),
        )
        .end(png)
    })
    console.log('UPLOAD_OK', !!result.secure_url, 'publicIdSet', !!result.public_id)
    if (result.public_id) {
      await cloudinary.uploader.destroy(result.public_id).catch(() => undefined)
      console.log('CLEANUP_OK')
    }
  } catch (e) {
    console.error('UPLOAD_FAIL', e?.message || String(e))
    process.exit(1)
  }
}

console.log('RESULT', 'CLOUDINARY_OK')
