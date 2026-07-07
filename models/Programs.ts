import mongoose, { Schema, Document } from 'mongoose'

export interface IProgram extends Document {
  name: string
  level: string
  duration: string
  description?: string
  department_id: string
  createdAt: Date
  updatedAt: Date
}

const programSchema = new Schema<IProgram>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    level: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    description: String,
    department_id: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Program || mongoose.model<IProgram>('Program', programSchema)
