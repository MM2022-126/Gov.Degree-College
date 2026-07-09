import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, default: "normal" },
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  slug: { type: String, sparse: true },
  imageUrl: { type: String, default: "" },
  imageAlt: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  video_url: { type: String, default: "" },
  isPublished: { type: Boolean, default: true },
  images: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

newsSchema.index({ date: -1 });
newsSchema.index({ category: 1 });

export const News = mongoose.model("News", newsSchema);
