import jwt from 'jsonwebtoken'

export interface JWTPayload {
  email: string
  iat?: number
  exp?: number
}

export function generateToken(email: string): string {
  const secret = process.env.JWT_SECRET!
  if (!secret) throw new Error('JWT_SECRET is not defined')
  
  return jwt.sign({ email }, secret, { expiresIn: '30d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET!
    const decoded = jwt.verify(token, secret) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}
