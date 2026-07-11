import type { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { generateSlug, findByIdOrSlug } from '@/lib/slug'
import { sanitizeObject, sanitizeHtml } from '@/lib/sanitize'
import News from '@/models/News'

export async function listNews() {
  await connectDB()
  return News.find({ isPublished: true }).sort({ date: -1, created_at: -1 }).lean()
}

export async function getNews(id: string) {
  await connectDB()
  const doc = await findByIdOrSlug(News, id)
  if (!doc) throw Object.assign(new Error('News not found'), { status: 404 })
  return doc
}

export async function createNews(req: NextRequest) {
  await requireAuth(req)
  await connectDB()
  const body = sanitizeObject(await req.json())
  if (body.title) body.slug = generateSlug(String(body.title))
  if (body.excerpt) body.excerpt = sanitizeHtml(body.excerpt)
  const news = await News.create(body)
  return news
}

export async function updateNews(req: NextRequest, id: string) {
  await requireAuth(req)
  await connectDB()
  const body = sanitizeObject(await req.json())
  if (body.title) body.slug = generateSlug(String(body.title))
  body.updated_at = new Date()
  const news = await News.findByIdAndUpdate(id, body, { new: true })
  if (!news) throw Object.assign(new Error('News not found'), { status: 404 })
  return news
}

export async function deleteNews(req: NextRequest, id: string) {
  await requireAuth(req)
  await connectDB()
  const news = await News.findByIdAndDelete(id)
  if (!news) throw Object.assign(new Error('News not found'), { status: 404 })
  return { message: 'News deleted successfully' }
}
