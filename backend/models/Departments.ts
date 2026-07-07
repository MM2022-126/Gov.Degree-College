import mongoose from "mongoose";

const departmentsSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
  description: { type: String },
  slug: { type: String, unique: true, sparse: true },
  display_order: { type: Number, default: 0 },
  imageUrl: { type: String },
  hodName: { type: String },
  hodImage: { type: String },
  establishedYear: { type: String },
  totalStudents: { type: Number },
  programs: [
    {
      name: { type: String, required: true },
      duration: { type: String },
      seats: { type: Number },
      description: { type: String }
    }
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

departmentsSchema.index({ display_order: 1 });
departmentsSchema.index({ name: 1 });
departmentsSchema.index({ slug: 1 });

export const Departments = mongoose.model("Departments", departmentsSchema);
