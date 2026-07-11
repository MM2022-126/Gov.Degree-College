import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import PasswordResetToken, { generateResetToken, hashResetToken } from '@/models/PasswordResetToken'
import { jsonOk, jsonError, handleRouteError } from '@/lib/route-utils'
import { sanitizeText, isValidEmail } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const email = sanitizeText(body.email, 254)

    if (!email || !isValidEmail(email)) {
      return jsonError('Valid email is required', 400)
    }

    if (email !== process.env.ADMIN_EMAIL) {
      // Don't reveal whether email exists
      return jsonOk({ success: true, message: 'If that email is registered, a reset link has been sent.' })
    }

    const token = generateResetToken()
    const tokenHash = hashResetToken(token)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await PasswordResetToken.deleteMany({ email, used: false })
    await PasswordResetToken.create({ email, tokenHash, expiresAt })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const resetUrl = `${siteUrl}/admin/reset-password?token=${token}`

    // In production, send email via SMTP. For now log in dev and return link in dev only.
    console.log('[Password Reset]', resetUrl)

    // Email sending: configure SMTP_* env vars and add nodemailer dependency to enable
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('[Password Reset] SMTP configured — integrate nodemailer to send:', email)
    }

    const payload: Record<string, unknown> = {
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    }
    if (process.env.NODE_ENV !== 'production') {
      payload.devResetUrl = resetUrl
    }

    return jsonOk(payload)
  } catch (error) {
    return handleRouteError(error)
  }
}
