import mongoose, { Schema, Document } from 'mongoose'

export interface IFaculty extends Document {
  name: string
  designation: string
  department: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

const facultySchema = new Schema<IFaculty>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    designation: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    imageUrl: String,
  },
  { timestamps: true }
)

export default mongoose.models.Faculty || mongoose.model<IFaculty>('Faculty', facultySchema)
