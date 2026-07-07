import mongoose from "mongoose";

const messagesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  replied: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

messagesSchema.index({ email: 1 });
messagesSchema.index({ replied: 1 });
messagesSchema.index({ created_at: -1 });

export const Messages = mongoose.model("Messages", messagesSchema);
