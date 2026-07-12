import { jsonOk } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  return jsonOk({ status: 'ok', timestamp: new Date().toISOString() })
}
