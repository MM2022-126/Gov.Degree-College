import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String },
  category: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

gallerySchema.index({ category: 1 });
gallerySchema.index({ created_at: -1 });

export const Gallery = mongoose.model("Gallery", gallerySchema);
