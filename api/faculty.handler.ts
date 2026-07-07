// Example API route handlers for Faculty CRUD operations

import { Request, Response } from 'express'
import { connectDB } from '@/lib/mongodb'
import Faculty from '@/models/Faculty'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'

export async function getFaculty(req: Request, res: Response) {
  try {
    await connectDB()
    const faculty = await Faculty.find().lean()
    res.json(faculty)
  } catch (error) {
    console.error('Get faculty error:', error)
    res.status(500).json({ error: 'Failed to fetch faculty' })
  }
}

export async function createFaculty(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { name, designation, department, imageUrl } = req.body

    if (!name || !designation || !department) {
      return res.status(400).json({ error: 'Name, designation, and department are required' })
    }

    const faculty = new Faculty({
      name,
      designation,
      department,
      imageUrl: imageUrl || '',
    })

    await faculty.save()
    res.status(201).json(faculty)
  } catch (error) {
    console.error('Create faculty error:', error)
    res.status(500).json({ error: 'Failed to create faculty' })
  }
}

export async function updateFaculty(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params
    const updates = req.body

    const faculty = await Faculty.findByIdAndUpdate(id, updates, { new: true })
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' })
    }

    res.json(faculty)
  } catch (error) {
    console.error('Update faculty error:', error)
    res.status(500).json({ error: 'Failed to update faculty' })
  }
}

export async function deleteFaculty(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params

    const faculty = await Faculty.findByIdAndDelete(id)
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' })
    }

    res.json({ message: 'Faculty deleted successfully' })
  } catch (error) {
    console.error('Delete faculty error:', error)
    res.status(500).json({ error: 'Failed to delete faculty' })
  }
}
