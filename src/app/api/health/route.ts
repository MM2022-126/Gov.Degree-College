import { NextRequest } from 'next/server'
import { jsonOk } from '@/lib/route-utils'

export async function GET() {
  return jsonOk({ status: 'ok', timestamp: new Date().toISOString() })
}
