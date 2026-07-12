import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { jsonOk, handleRouteError } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAuth(req)
    return jsonOk({ valid: true, admin: { email: admin.email } })
  } catch (error) {
    return handleRouteError(error)
  }
}
