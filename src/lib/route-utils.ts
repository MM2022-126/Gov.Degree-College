import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function withDb<T>(handler: () => Promise<T>): Promise<T> {
  await connectDB()
  return handler()
}

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function handleRouteError(error: unknown) {
  if (error instanceof AuthError) {
    return jsonError(error.message, error.status)
  }
  console.error('Route error:', error)
  return jsonError('Internal server error', 500)
}

export const DEFAULT_SETTINGS = {
  college_name: 'Government Graduate College Ravi Road Shahdara',
  address: 'Ravi Road, Shahdara, Lahore, Punjab 54000',
  phone: '+92-42-XXXXXXX',
  email: 'info@ggc.edu.pk',
  chat_enabled: 'true',
  contact_form_enabled: 'true',
} as const
