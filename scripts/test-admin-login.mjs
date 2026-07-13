import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Load .env manually (no dotenv dep required)
for (const line of readFileSync(resolve('.env'), 'utf8').split(/\r?\n/)) {
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

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const smtpUser = process.env.SMTP_USER

console.log('adminEmailDomain', email?.split('@')[1])
console.log('smtpConfigured', !!(process.env.SMTP_HOST && smtpUser && process.env.SMTP_PASS))
console.log('smtpUserMatchesAdmin', smtpUser === email)

const loginRes = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const loginBody = await loginRes.json().catch(() => ({}))
console.log('LOGIN_STATUS', loginRes.status)
console.log('requiresOtp', !!loginBody.requiresOtp)
console.log('emailSent', loginBody.emailSent)
console.log('hasDevOtp', !!loginBody.devOtp)
console.log('loginMessage', loginBody.message || loginBody.error || '')

if (!loginRes.ok || !loginBody.requiresOtp) {
  console.log('RESULT', 'LOGIN_FAILED_NO')
  process.exit(1)
}

const otp = loginBody.devOtp
if (!otp) {
  // SMTP sent real email — try reading nothing; mark partial success
  console.log('RESULT', 'PASSWORD_OK_OTP_EMAILED_CHECK_INBOX')
  process.exit(0)
}

const verifyRes = await fetch('http://localhost:3000/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, otp }),
})
const verifyBody = await verifyRes.json().catch(() => ({}))
const cookie = verifyRes.headers.get('set-cookie') || ''
console.log('VERIFY_STATUS', verifyRes.status)
console.log('hasAdminCookie', cookie.includes('admin_token'))
console.log('RESULT', verifyBody.success && cookie.includes('admin_token') ? 'ADMIN_LOGIN_YES' : 'ADMIN_LOGIN_NO')
process.exit(verifyBody.success && cookie.includes('admin_token') ? 0 : 1)
