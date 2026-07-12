import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { updateAdminPasswordHash, isValidAdminEmail } from '@/lib/auth'
import { verifyAdminOtp } from '@/lib/otp'
import { jsonOk, jsonError, handleRouteError } from '@/lib/route-utils'
import { sanitizeText } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

/**
 * Complete password reset after OTP verification.
 * Body: { email, otp, password }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const email = sanitizeText(body.email, 254)
    const otp = sanitizeText(String(body.otp || ''), 8)
    const password = String(body.password || '')

    if (!email || !otp || password.length < 8) {
      return jsonError('Email, verification code, and password (min 8 characters) are required', 400)
    }

    if (!isValidAdminEmail(email)) {
      return jsonError('Invalid or expired verification code', 400)
    }

    const result = await verifyAdminOtp(email, 'password_change', otp)
    if (!result.ok) return jsonError(result.error, result.status)

    await updateAdminPasswordHash(password)

    return jsonOk({
      success: true,
      message: 'Password updated successfully. You can now log in.',
    })
  } catch (error) {
    return handleRouteError(error)
  }
}
