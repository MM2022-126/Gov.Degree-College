import mongoose, { Schema, Document } from 'mongoose'

export interface IAnnouncement extends Document {
  title: string
  content: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', announcementSchema)
