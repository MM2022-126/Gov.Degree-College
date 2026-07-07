import mongoose, { Schema, Document } from 'mongoose'

export interface IGallery extends Document {
  imageUrl: string
  caption?: string
  createdAt: Date
  updatedAt: Date
}

const gallerySchema = new Schema<IGallery>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    caption: String,
  },
  { timestamps: true }
)

export default mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', gallerySchema)
