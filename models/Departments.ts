import mongoose, { Schema, Document } from 'mongoose'

export interface IDepartment extends Document {
  name: string
  icon: string
  description: string
  display_order: number
  createdAt: Date
  updatedAt: Date
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    icon: String,
    description: String,
    display_order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema)
