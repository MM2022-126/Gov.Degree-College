import type { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { generateSlug, findByIdOrSlug } from '@/lib/slug'
import { sanitizeObject, sanitizeHtml } from '@/lib/sanitize'
import Events from '@/models/Events'

export async function listEvents() {
  await connectDB()
  return Events.find({ isPublished: true }).sort({ eventDate: -1, date: -1 }).lean()
}

export async function getEvent(id: string) {
  await connectDB()
  const doc = await findByIdOrSlug(Events, id)
  if (!doc) throw Object.assign(new Error('Event not found'), { status: 404 })
  return doc
}

export async function createEvent(req: NextRequest) {
  await requireAuth(req)
  await connectDB()
  const body = sanitizeObject(await req.json())
  if (!body.slug && body.title) body.slug = generateSlug(String(body.title))
  if (body.shortDescription) body.shortDescription = sanitizeHtml(body.shortDescription)
  return Events.create(body)
}

export async function updateEvent(req: NextRequest, id: string) {
  await requireAuth(req)
  await connectDB()
  const body = sanitizeObject(await req.json())
  if (body.title) body.slug = generateSlug(String(body.title))
  body.updated_at = new Date()
  const event = await Events.findByIdAndUpdate(id, body, { new: true })
  if (!event) throw Object.assign(new Error('Event not found'), { status: 404 })
  return event
}

export async function deleteEvent(req: NextRequest, id: string) {
  await requireAuth(req)
  await connectDB()
  const event = await Events.findByIdAndDelete(id)
  if (!event) throw Object.assign(new Error('Event not found'), { status: 404 })
  return { message: 'Event deleted successfully' }
}
