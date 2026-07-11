import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  sender: { 
    type: String, 
    required: true, 
    enum: ["user", "admin"]
  },
  text: { type: String, required: true },
  name: { type: String, default: "Visitor" },
  senderDisplayName: { type: String, default: "" }, // "Admin" for admin messages, visitor name for user messages
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  tempId: { type: String, default: null } // Used for optimistic message deduplication
}, { timestamps: true });

chatMessageSchema.index({ sessionId: 1, timestamp: -1 });
chatMessageSchema.index({ sessionId: 1 });



export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema)
