import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export interface AdminPayload {
  email: string
  iat?: number
  exp?: number
}

const COOKIE_NAME = 'admin_token'

export function generateToken(email: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not defined')
  const expiresIn = process.env.JWT_EXPIRY || '8h'
  return jwt.sign({ email }, secret, { expiresIn } as jwt.SignOptions)
}

export function verifyTokenString(token: string): AdminPayload | null {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return null
    return jwt.verify(token, secret) as AdminPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value ?? null
}

export async function requireAuth(req?: NextRequest): Promise<AdminPayload> {
  const token = req ? getTokenFromRequest(req) : await getTokenFromCookies()
  if (!token) throw new AuthError('No token provided', 401)
  const payload = verifyTokenString(token)
  if (!payload) throw new AuthError('Invalid or expired token', 401)
  return payload
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  // Env password is source of truth when set on Vercel/.env (easy credential rotation).
  if (process.env.ADMIN_PASSWORD) {
    return password === process.env.ADMIN_PASSWORD
  }

  const envHash = process.env.ADMIN_PASSWORD_HASH?.trim()
  if (envHash && !envHash.includes('example.hash')) {
    return bcrypt.compare(password, envHash)
  }

  // Fallback: hash from forgot-password reset (used when no env password is configured).
  try {
    const Settings = (await import('@/models/Settings')).default
    await connectDBForAuth()
    const hashSetting = await Settings.findOne({ key: 'admin_password_hash' })
    if (hashSetting?.value) {
      return bcrypt.compare(password, hashSetting.value)
    }
  } catch {
    // ignore
  }

  return false
}

export async function updateAdminPasswordHash(newPassword: string): Promise<void> {
  const Settings = (await import('@/models/Settings')).default
  await connectDBForAuth()
  const hash = await bcrypt.hash(newPassword, 12)
  await Settings.findOneAndUpdate(
    { key: 'admin_password_hash' },
    { key: 'admin_password_hash', value: hash, updated_at: new Date() },
    { upsert: true, new: true }
  )
}

async function connectDBForAuth() {
  const { connectDB } = await import('@/lib/mongodb')
  await connectDB()
}

export function isValidAdminEmail(email: string): boolean {
  const configured = process.env.ADMIN_EMAIL?.trim()
  if (!configured) return false
  return email.trim().toLowerCase() === configured.toLowerCase()
}
