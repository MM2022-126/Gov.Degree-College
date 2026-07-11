import mongoose from 'mongoose'
import crypto from 'crypto'

const passwordResetSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
})

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export default mongoose.models.PasswordResetToken ||
  mongoose.model('PasswordResetToken', passwordResetSchema)
