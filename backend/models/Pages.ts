import mongoose from "mongoose";

const pagesSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  metadata: { type: Object },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

pagesSchema.index({ slug: 1 });

export const Pages = mongoose.model("Pages", pagesSchema);
