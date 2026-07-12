import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { generateToken, setAuthCookie, isValidAdminEmail } from '@/lib/auth'
import { verifyAdminOtp } from '@/lib/otp'
import { jsonOk, jsonError, handleRouteError } from '@/lib/route-utils'
import { sanitizeText } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

const otpAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = otpAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    otpAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

/**
 * Step 2 of login: verify email OTP and set the admin session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return jsonError('Too many attempts. Try again later.', 429)
    }

    await connectDB()
    const body = await req.json()
    const email = sanitizeText(body.email, 254)
    const otp = sanitizeText(String(body.otp || ''), 8)

    if (!email || !otp) return jsonError('Email and verification code are required', 400)
    if (!isValidAdminEmail(email)) return jsonError('Invalid credentials', 401)

    const adminEmail = process.env.ADMIN_EMAIL!.trim()
    const result = await verifyAdminOtp(adminEmail, 'login', otp)
    if (!result.ok) return jsonError(result.error, result.status)

    const token = generateToken(adminEmail)
    const response = jsonOk({
      success: true,
      message: 'Login successful',
      admin: { email: adminEmail },
    })
    setAuthCookie(response, token)
    return response
  } catch (error) {
    return handleRouteError(error)
  }
}
