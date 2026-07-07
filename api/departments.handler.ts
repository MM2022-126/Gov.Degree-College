// API route handlers for Departments and Programs

import { Request, Response } from 'express'
import { connectDB } from '@/lib/mongodb'
import Department from '@/models/Departments'
import Program from '@/models/Programs'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'

// Departments
export async function getDepartments(req: Request, res: Response) {
  try {
    await connectDB()
    const departments = await Department.find().sort({ display_order: 1 }).lean()
    res.json(departments)
  } catch (error) {
    console.error('Get departments error:', error)
    res.status(500).json({ error: 'Failed to fetch departments' })
  }
}

export async function createDepartment(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { name, icon, description, display_order } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const department = new Department({
      name,
      icon: icon || '',
      description: description || '',
      display_order: display_order || 0,
    })

    await department.save()
    res.status(201).json(department)
  } catch (error) {
    console.error('Create department error:', error)
    res.status(500).json({ error: 'Failed to create department' })
  }
}

export async function updateDepartment(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params
    const updates = req.body

    const department = await Department.findByIdAndUpdate(id, updates, { new: true })
    if (!department) {
      return res.status(404).json({ error: 'Department not found' })
    }

    res.json(department)
  } catch (error) {
    console.error('Update department error:', error)
    res.status(500).json({ error: 'Failed to update department' })
  }
}

export async function deleteDepartment(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params

    const department = await Department.findByIdAndDelete(id)
    if (!department) {
      return res.status(404).json({ error: 'Department not found' })
    }

    res.json({ message: 'Department deleted successfully' })
  } catch (error) {
    console.error('Delete department error:', error)
    res.status(500).json({ error: 'Failed to delete department' })
  }
}

// Programs
export async function getPrograms(req: Request, res: Response) {
  try {
    await connectDB()
    const programs = await Program.find().sort({ name: 1 }).lean()
    res.json(programs)
  } catch (error) {
    console.error('Get programs error:', error)
    res.status(500).json({ error: 'Failed to fetch programs' })
  }
}

export async function createProgram(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { name, level, duration, description, department_id } = req.body

    if (!name || !level || !duration || !department_id) {
      return res.status(400).json({ error: 'Name, level, duration, and department_id are required' })
    }

    const program = new Program({
      name,
      level,
      duration,
      description: description || '',
      department_id,
    })

    await program.save()
    res.status(201).json(program)
  } catch (error) {
    console.error('Create program error:', error)
    res.status(500).json({ error: 'Failed to create program' })
  }
}

export async function updateProgram(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params
    const updates = req.body

    const program = await Program.findByIdAndUpdate(id, updates, { new: true })
    if (!program) {
      return res.status(404).json({ error: 'Program not found' })
    }

    res.json(program)
  } catch (error) {
    console.error('Update program error:', error)
    res.status(500).json({ error: 'Failed to update program' })
  }
}

export async function deleteProgram(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectDB()
    const { id } = req.params

    const program = await Program.findByIdAndDelete(id)
    if (!program) {
      return res.status(404).json({ error: 'Program not found' })
    }

    res.json({ message: 'Program deleted successfully' })
  } catch (error) {
    console.error('Delete program error:', error)
    res.status(500).json({ error: 'Failed to delete program' })
  }
}
