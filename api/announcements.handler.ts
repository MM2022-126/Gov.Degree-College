// Example API route handlers for Announcements CRUD operations

import { Request, Response } from 'express'
import { connectDB } from '@/lib/mongodb'
import Announcement from '@/models/Announcements'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'

export async function getAnnouncements(req: Request, res: Response) {
  try {
    await connectDB()
    const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 }).lean()
    res.json(announcements)
  } catch (error) {
    console.error('Get announcements error:', error)
    res.status(500).json({ error: 'Failed to fetch announcements' })
  }
}

export async function createAnnouncement(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { title, content, active } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }

    const announcement = new Announcement({
      title,
      content,
      active: active ?? true,
    })

    await announcement.save()
    res.status(201).json(announcement)
  } catch (error) {
    console.error('Create announcement error:', error)
    res.status(500).json({ error: 'Failed to create announcement' })
  }
}

export async function updateAnnouncement(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params
    const updates = req.body

    const announcement = await Announcement.findByIdAndUpdate(id, updates, { new: true })
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' })
    }

    res.json(announcement)
  } catch (error) {
    console.error('Update announcement error:', error)
    res.status(500).json({ error: 'Failed to update announcement' })
  }
}

export async function deleteAnnouncement(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params

    const announcement = await Announcement.findByIdAndDelete(id)
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' })
    }

    res.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Delete announcement error:', error)
    res.status(500).json({ error: 'Failed to delete announcement' })
  }
}
