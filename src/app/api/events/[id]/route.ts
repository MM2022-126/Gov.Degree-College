import { NextRequest } from 'next/server'
import { runHandler } from '@/lib/handlers/wrap'
import * as events from '@/lib/handlers/events'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return runHandler(async () => events.getEvent(id))
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  return runHandler(async () => events.updateEvent(req, id))
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  return runHandler(async () => events.deleteEvent(req, id))
}
