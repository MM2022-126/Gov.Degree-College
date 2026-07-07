// Example API route handlers for Gallery CRUD operations

import { Request, Response } from 'express'
import { connectDB } from '@/lib/mongodb'
import Gallery from '@/models/Gallery'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'

export async function getGallery(req: Request, res: Response) {
  try {
    await connectDB()
    const gallery = await Gallery.find().lean()
    res.json(gallery)
  } catch (error) {
    console.error('Get gallery error:', error)
    res.status(500).json({ error: 'Failed to fetch gallery' })
  }
}

export async function createGalleryItem(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { imageUrl, caption } = req.body

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' })
    }

    const item = new Gallery({
      imageUrl,
      caption: caption || '',
    })

    await item.save()
    res.status(201).json(item)
  } catch (error) {
    console.error('Create gallery item error:', error)
    res.status(500).json({ error: 'Failed to create gallery item' })
  }
}

export async function deleteGalleryItem(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params

    const item = await Gallery.findByIdAndDelete(id)
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' })
    }

    res.json({ message: 'Gallery item deleted successfully' })
  } catch (error) {
    console.error('Delete gallery item error:', error)
    res.status(500).json({ error: 'Failed to delete gallery item' })
  }
}
