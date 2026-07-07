// Example API route handlers for Messages CRUD operations

import { Request, Response } from 'express'
import { connectDB } from '@/lib/mongodb'
import Message from '@/models/Messages'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'

export async function getMessages(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const messages = await Message.find().sort({ createdAt: -1 }).lean()
    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
}

export async function createMessage(req: Request, res: Response) {
  try {
    await connectDB()
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' })
    }

    const msg = new Message({
      name,
      email,
      message,
      replied: false,
    })

    await msg.save()
    res.status(201).json(msg)
  } catch (error) {
    console.error('Create message error:', error)
    res.status(500).json({ error: 'Failed to create message' })
  }
}

export async function markMessageAsReplied(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params

    const message = await Message.findByIdAndUpdate(id, { replied: true }, { new: true })
    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    res.json(message)
  } catch (error) {
    console.error('Update message error:', error)
    res.status(500).json({ error: 'Failed to update message' })
  }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params

    const message = await Message.findByIdAndDelete(id)
    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    res.json({ message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ error: 'Failed to delete message' })
  }
}
