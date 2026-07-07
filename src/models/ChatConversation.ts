// This is a Mongoose model template for backend use
// Copy this to your backend models folder

export interface IChatConversation {
  _id?: string;
  visitor_name: string;
  visitor_session_id: string;
  status: "active" | "closed";
  created_at?: Date;
  updated_at?: Date;
}

// Backend Mongoose Schema (for backend/models/ChatConversation.ts):
/*
import mongoose from "mongoose";

const ChatConversationSchema = new mongoose.Schema(
  {
    visitor_name: {
      type: String,
      required: true,
    },
    visitor_session_id: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "chat_conversations",
  }
);

ChatConversationSchema.index({ visitor_session_id: 1, status: 1 });
ChatConversationSchema.index({ updated_at: -1 });

export default mongoose.model("ChatConversation", ChatConversationSchema);
*/
