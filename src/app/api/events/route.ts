import { NextRequest } from 'next/server'
import { runHandler, runHandlerCreated } from '@/lib/handlers/wrap'
import * as events from '@/lib/handlers/events'

export const dynamic = 'force-dynamic'

export async function GET() {
  return runHandler(async () => events.listEvents())
}

export async function POST(req: NextRequest) {
  return runHandlerCreated(async () => events.createEvent(req))
}
