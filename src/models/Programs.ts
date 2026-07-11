import mongoose from "mongoose";

const programsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Departments" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

programsSchema.index({ department_id: 1 });
programsSchema.index({ name: 1 });



export default mongoose.models.Programs || mongoose.model('Programs', programsSchema)
