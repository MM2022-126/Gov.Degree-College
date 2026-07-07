// Backend Socket.io Server Setup
// Copy this to your backend/lib/socket.ts or backend/socket/index.ts

import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";

// These imports are for backend use - adjust paths based on your structure
// import ChatMessage from "../models/ChatMessage";
// import ChatConversation from "../models/ChatConversation";

interface ChatMessage {
  _id?: string;
  conversation_id: string;
  sender_type: "visitor" | "admin" | "system";
  sender_name: string;
  message: string;
  read_at?: Date | null;
  created_at: Date;
}

interface TypingData {
  conversationId: string;
  isTyping: boolean;
  sender: "visitor" | "admin";
}

export function initializeSocket(httpServer: http.Server): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:8080",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Track active typing indicators per conversation
  const typingUsers = new Map<string, Set<string>>();

  // Handle new socket connections
  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);

    // Join a conversation room
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Handle incoming messages
    socket.on("send_message", async (data: { conversationId: string; message: string; senderType: string; senderName: string }) => {
      try {
        // In production, save to MongoDB here
        // const msg = await ChatMessage.create({
        //   conversation_id: data.conversationId,
        //   sender_type: data.senderType,
        //   sender_name: data.senderName,
        //   message: data.message,
        //   created_at: new Date(),
        // });

        const newMessage: ChatMessage = {
          conversation_id: data.conversationId,
          sender_type: data.senderType as "visitor" | "admin" | "system",
          sender_name: data.senderName,
          message: data.message,
          created_at: new Date(),
        };

        // Broadcast to all clients in the conversation room
        io.to(data.conversationId).emit("new_message", newMessage);

        // Update conversation timestamp
        io.to(data.conversationId).emit("conversation_updated", {
          conversationId: data.conversationId,
          updatedAt: new Date(),
        });

        console.log(`Message sent in conversation ${data.conversationId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", (data: TypingData) => {
      // Initialize typing set for this conversation if it doesn't exist
      if (!typingUsers.has(data.conversationId)) {
        typingUsers.set(data.conversationId, new Set());
      }

      const typingSet = typingUsers.get(data.conversationId);
      if (!typingSet) return;

      if (data.isTyping) {
        typingSet.add(socket.id);
      } else {
        typingSet.delete(socket.id);
      }

      // Broadcast typing status to the conversation room (exclude sender)
      socket.broadcast.to(data.conversationId).emit("user_typing", {
        conversationId: data.conversationId,
        isTyping: typingSet.size > 0,
        sender: data.sender,
      });
    });

    // Mark messages as read
    socket.on("mark_as_read", async (data: { conversationId: string; messageIds: string[] }) => {
      try {
        // In production, update MongoDB here
        // await ChatMessage.updateMany(
        //   { _id: { $in: data.messageIds } },
        //   { read_at: new Date() }
        // );

        io.to(data.conversationId).emit("messages_read", {
          messageIds: data.messageIds,
          readAt: new Date(),
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Clean up typing indicators
      for (const [conversationId, typingSet] of typingUsers.entries()) {
        if (typingSet.has(socket.id)) {
          typingSet.delete(socket.id);
          io.to(conversationId).emit("user_typing", {
            conversationId,
            isTyping: typingSet.size > 0,
          });
        }
      }
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
}

export default initializeSocket;
