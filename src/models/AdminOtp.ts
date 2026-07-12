import mongoose from 'mongoose'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export type OtpPurpose = 'login' | 'password_change'

const adminOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  purpose: { type: String, required: true, enum: ['login', 'password_change'] },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
})

adminOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 999999))
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10)
}

export async function compareOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash)
}

export default mongoose.models.AdminOtp || mongoose.model('AdminOtp', adminOtpSchema)
