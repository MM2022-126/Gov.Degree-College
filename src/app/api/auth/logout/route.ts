import { jsonOk } from '@/lib/route-utils'
import { clearAuthCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const response = jsonOk({ success: true, message: 'Logged out successfully' })
  clearAuthCookie(response)
  return response
}
