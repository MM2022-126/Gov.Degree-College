// Example API route handlers for Events CRUD operations

import { Request, Response } from 'express'
import { connectDB } from '@/lib/mongodb'
import Event from '@/models/Events'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'

export async function getEvents(req: Request, res: Response) {
  try {
    await connectDB()
    const events = await Event.find().sort({ date: -1 }).lean()
    res.json(events)
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
}

export async function createEvent(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { title, description, date, imageUrl, slug } = req.body

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    const event = new Event({
      title,
      description,
      date: date || new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || '',
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
    })

    await event.save()
    res.status(201).json(event)
  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ error: 'Failed to create event' })
  }
}

export async function updateEvent(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params
    const updates = req.body

    const event = await Event.findByIdAndUpdate(id, updates, { new: true })
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json(event)
  } catch (error) {
    console.error('Update event error:', error)
    res.status(500).json({ error: 'Failed to update event' })
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params

    const event = await Event.findByIdAndDelete(id)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Delete event error:', error)
    res.status(500).json({ error: 'Failed to delete event' })
  }
}
