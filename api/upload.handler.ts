// Cloudinary upload handler for image uploads

import { Request, Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'college-management',
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Upload failed' })
        }
        res.json({
          secure_url: result?.secure_url,
          public_id: result?.public_id,
        })
      }
    ).end(req.file.buffer)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
}
