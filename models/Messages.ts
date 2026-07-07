import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  name: string
  email: string
  message: string
  replied: boolean
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    replied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema)
