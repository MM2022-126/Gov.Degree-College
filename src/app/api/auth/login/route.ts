import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { isValidAdminEmail, verifyAdminPassword } from '@/lib/auth'
import { issueAdminOtp } from '@/lib/otp'
import { jsonOk, jsonError, handleRouteError } from '@/lib/route-utils'
import { sanitizeText } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

/**
 * Step 1 of login: validate email + password, then email a one-time code.
 * JWT is issued only after POST /api/auth/verify-otp.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return jsonError('Too many login attempts. Try again in 15 minutes.', 429)
    }

    const body = await req.json()
    const email = sanitizeText(body.email, 254)
    const password = String(body.password || '')

    if (!email || !password) return jsonError('Email and password are required', 400)
    if (!isValidAdminEmail(email)) return jsonError('Invalid credentials', 401)

    const valid = await verifyAdminPassword(password)
    if (!valid) return jsonError('Invalid credentials', 401)

    await connectDB()
    const otpResult = await issueAdminOtp(email, 'login')

    return jsonOk({
      requiresOtp: true,
      ...otpResult,
    })
  } catch (error) {
    return handleRouteError(error)
  }
}
