import { NextRequest } from 'next/server'
import { dispatchApi } from '@/lib/api-router'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ path?: string[] }> }

async function handle(req: NextRequest, { params }: Params) {
  const { path = [] } = await params
  return dispatchApi(req, path)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
