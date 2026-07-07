// Example API route handlers for News CRUD operations
// Usage: Set up with Express router in your backend

import { Request, Response } from 'express'
import { connectDB } from '@/lib/mongodb'
import News from '@/models/News'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'

// GET /api/news - Fetch all news
export async function getNews(req: Request, res: Response) {
  try {
    await connectDB()
    const news = await News.find().sort({ date: -1 }).lean()
    res.json(news)
  } catch (error) {
    console.error('Get news error:', error)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
}

// POST /api/news - Create new news (admin only)
export async function createNews(req: Request, res: Response) {
  try {
    // Verify JWT
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { title, excerpt, category, priority, date, images, video_url } = req.body

    if (!title || !excerpt) {
      return res.status(400).json({ error: 'Title and excerpt are required' })
    }

    const news = new News({
      title,
      excerpt,
      category: category || 'Academic',
      priority: priority || 'normal',
      date: date || new Date().toISOString().split('T')[0],
      images: images || [],
      video_url: video_url || '',
    })

    await news.save()
    res.status(201).json(news)
  } catch (error) {
    console.error('Create news error:', error)
    res.status(500).json({ error: 'Failed to create news' })
  }
}

// PUT /api/news/:id - Update news (admin only)
export async function updateNews(req: Request, res: Response) {
  try {
    // Verify JWT
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params
    const updates = req.body

    const news = await News.findByIdAndUpdate(id, updates, { new: true })
    if (!news) {
      return res.status(404).json({ error: 'News not found' })
    }

    res.json(news)
  } catch (error) {
    console.error('Update news error:', error)
    res.status(500).json({ error: 'Failed to update news' })
  }
}

// DELETE /api/news/:id - Delete news (admin only)
export async function deleteNews(req: Request, res: Response) {
  try {
    // Verify JWT
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params

    const news = await News.findByIdAndDelete(id)
    if (!news) {
      return res.status(404).json({ error: 'News not found' })
    }

    res.json({ message: 'News deleted successfully' })
  } catch (error) {
    console.error('Delete news error:', error)
    res.status(500).json({ error: 'Failed to delete news' })
  }
}
