import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PasswordResetToken, { hashResetToken } from '@/models/PasswordResetToken'
import { updateAdminPasswordHash } from '@/lib/auth'
import { jsonOk, jsonError, handleRouteError } from '@/lib/route-utils'
import { sanitizeText } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const token = sanitizeText(body.token, 128)
    const password = String(body.password || '')

    if (!token || password.length < 8) {
      return jsonError('Token and password (min 8 characters) are required', 400)
    }

    const tokenHash = hashResetToken(token)
    const record = await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!record) {
      return jsonError('Invalid or expired reset token', 400)
    }

    await updateAdminPasswordHash(password)
    record.used = true
    await record.save()

    return jsonOk({ success: true, message: 'Password updated successfully. You can now log in.' })
  } catch (error) {
    return handleRouteError(error)
  }
}
