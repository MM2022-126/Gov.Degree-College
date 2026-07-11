import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

settingsSchema.index({ key: 1 });



export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema)
