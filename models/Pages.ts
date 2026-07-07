import mongoose, { Schema, Document } from 'mongoose'

export interface IPage extends Document {
  slug: string
  title: string
  content: string
  updatedAt: Date
}

const pageSchema = new Schema<IPage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Page || mongoose.model<IPage>('Page', pageSchema)
