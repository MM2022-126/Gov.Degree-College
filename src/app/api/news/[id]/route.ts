import { NextRequest } from 'next/server'
import { runHandler, runHandlerCreated } from '@/lib/handlers/wrap'
import * as news from '@/lib/handlers/news'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return runHandler(async () => news.getNews(id))
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  return runHandler(async () => news.updateNews(req, id))
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  return runHandler(async () => news.deleteNews(req, id))
}
