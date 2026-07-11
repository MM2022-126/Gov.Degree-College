import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  dept: { type: String, required: true },
  email: { type: String },
  specialization: { type: String },
  image: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

facultySchema.index({ dept: 1 });
facultySchema.index({ name: 1 });



export default mongoose.models.Faculty || mongoose.model('Faculty', facultySchema)
