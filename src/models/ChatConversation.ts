import mongoose from "mongoose";

const chatConversationSchema = new mongoose.Schema({
  visitor_name: { type: String, required: true },
  visitor_session_id: { type: String },
  status: { type: String, enum: ["active", "closed"], default: "active" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

chatConversationSchema.index({ status: 1 });
chatConversationSchema.index({ created_at: -1 });
chatConversationSchema.index({ updated_at: -1 });



export default mongoose.models.ChatConversation || mongoose.model('ChatConversation', chatConversationSchema)
