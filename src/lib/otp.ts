import AdminOtp, {
  type OtpPurpose,
  generateOtpCode,
  hashOtp,
  compareOtp,
} from '@/models/AdminOtp'
import { sendAdminOtpEmail } from '@/lib/mail'

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

export async function issueAdminOtp(email: string, purpose: OtpPurpose) {
  const code = generateOtpCode()
  const otpHash = await hashOtp(code)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await AdminOtp.deleteMany({ email, purpose, used: false })
  await AdminOtp.create({ email, purpose, otpHash, expiresAt })

  const mail = await sendAdminOtpEmail(email, code, purpose)

  const payload: {
    success: true
    message: string
    expiresInSeconds: number
    emailSent: boolean
    /** Only returned outside production when SMTP is missing — for local testing */
    devOtp?: string
  } = {
    success: true,
    message: mail.sent
      ? 'A verification code has been sent to your email.'
      : 'Verification code created. Configure SMTP to receive it by email.',
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    emailSent: mail.sent,
  }

  if (process.env.NODE_ENV !== 'production' && !mail.sent) {
    payload.devOtp = code
    console.log(`[otp] ${purpose} code for ${email}:`, code)
  }

  return payload
}

export async function verifyAdminOtp(
  email: string,
  purpose: OtpPurpose,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const record = await AdminOtp.findOne({
    email,
    purpose,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ created_at: -1 })

  if (!record) {
    return { ok: false, error: 'Invalid or expired verification code', status: 400 }
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.used = true
    await record.save()
    return { ok: false, error: 'Too many invalid attempts. Request a new code.', status: 429 }
  }

  const match = await compareOtp(String(code || '').trim(), record.otpHash)
  if (!match) {
    record.attempts += 1
    await record.save()
    return { ok: false, error: 'Invalid verification code', status: 400 }
  }

  record.used = true
  await record.save()
  return { ok: true }
}
