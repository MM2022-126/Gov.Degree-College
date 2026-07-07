import mongoose, { Schema, Document } from 'mongoose'

export interface INews extends Document {
  title: string
  excerpt: string
  category: string
  priority: string
  date: string
  images: string[]
  video_url?: string
  createdAt: Date
  updatedAt: Date
}

const newsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'Academic',
    },
    priority: {
      type: String,
      default: 'normal',
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    images: [String],
    video_url: String,
  },
  { timestamps: true }
)

export default mongoose.models.News || mongoose.model<INews>('News', newsSchema)
