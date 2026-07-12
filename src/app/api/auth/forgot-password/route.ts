import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { issueAdminOtp } from '@/lib/otp'
import { jsonOk, jsonError, handleRouteError } from '@/lib/route-utils'
import { sanitizeText, isValidEmail } from '@/lib/sanitize'

const resetAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = resetAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    resetAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

/**
 * Request a password-change OTP emailed to the admin account.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return jsonError('Too many requests. Try again in 15 minutes.', 429)
    }

    await connectDB()
    const body = await req.json()
    const email = sanitizeText(body.email, 254)

    if (!email || !isValidEmail(email)) {
      return jsonError('Valid email is required', 400)
    }

    // Always return the same message shape to avoid email enumeration
    const generic = {
      success: true,
      message: 'If that email is registered, a verification code has been sent.',
    }

    if (email !== process.env.ADMIN_EMAIL) {
      return jsonOk(generic)
    }

    const otpResult = await issueAdminOtp(email, 'password_change')

    return jsonOk({
      ...generic,
      requiresOtp: true,
      emailSent: otpResult.emailSent,
      expiresInSeconds: otpResult.expiresInSeconds,
      ...(otpResult.devOtp ? { devOtp: otpResult.devOtp } : {}),
    })
  } catch (error) {
    return handleRouteError(error)
  }
}
