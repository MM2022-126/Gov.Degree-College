import mongoose from "mongoose";

const eventGallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  eventDate: { type: Date },
  coverImage: { type: String, default: "" },
  slug: { type: String, unique: true, sparse: true },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String },
      caption: { type: String, default: "" }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

eventGallerySchema.index({ eventDate: -1 });
eventGallerySchema.index({ createdAt: -1 });
eventGallerySchema.index({ slug: 1 });

export const EventGallery = mongoose.model("EventGallery", eventGallerySchema);
