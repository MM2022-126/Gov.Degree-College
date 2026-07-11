import mongoose from "mongoose";

const announcementsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  active: { type: Boolean, default: true },
  type: { type: String, enum: ["General", "Event", "Emergency", "News"], default: "General" },
  display_as: { type: String, enum: ["Banner", "Popup", "Ticker"], default: "Banner" },
  images: [{ type: String }],
  video_url: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

announcementsSchema.index({ active: 1 });
announcementsSchema.index({ created_at: -1 });



export default mongoose.models.Announcements || mongoose.model('Announcements', announcementsSchema)
