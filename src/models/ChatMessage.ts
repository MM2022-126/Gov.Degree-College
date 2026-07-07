// This is a Mongoose model template for backend use
// Copy this to your backend models folder

export interface IChatMessage {
  _id?: string;
  conversation_id: string;
  sender_type: "visitor" | "admin" | "system";
  sender_name: string;
  message: string;
  read_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

// Backend Mongoose Schema (for backend/models/ChatMessage.ts):
/*
import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatConversation",
      required: true,
      index: true,
    },
    sender_type: {
      type: String,
      enum: ["visitor", "admin", "system"],
      required: true,
    },
    sender_name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "chat_messages",
  }
);

ChatMessageSchema.index({ conversation_id: 1, created_at: 1 });
ChatMessageSchema.index({ created_at: -1 });

export default mongoose.model("ChatMessage", ChatMessageSchema);
*/
