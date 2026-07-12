import { NextRequest } from 'next/server'
import { runHandler, runHandlerCreated } from '@/lib/handlers/wrap'
import * as news from '@/lib/handlers/news'

export const dynamic = 'force-dynamic'

export async function GET() {
  return runHandler(async () => news.listNews())
}

export async function POST(req: NextRequest) {
  return runHandlerCreated(async () => news.createNews(req))
}
