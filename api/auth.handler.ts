// This is an example API route handler for Express.js backend
// Usage: import this as a route handler in your Express app

import { Router, Request, Response } from 'express'
import { generateToken, verifyToken, extractTokenFromHeader } from '@/lib/jwt'

const router = Router()

// Login endpoint
export async function handleAdminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(email)
    res.json({ token, email })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Middleware to verify JWT
export async function verifyJWT(req: Request, res: Response, next: () => void) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    ;(req as any).admin = payload
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default router
