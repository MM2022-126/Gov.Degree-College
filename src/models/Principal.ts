import mongoose, { Schema, Document } from "mongoose";

export interface IPrincipal extends Document {
  name: string;
  tenure: string;
  image: string;
  description: string;
  role: "principal" | "vice-principal" | "director";
  createdAt: Date;
  updatedAt: Date;
}

const PrincipalSchema = new Schema<IPrincipal>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    tenure: {
      type: String,
      required: [true, "Tenure period is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["principal", "vice-principal", "director"],
      default: "principal",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Principal || mongoose.model<IPrincipal>('Principal', PrincipalSchema)
