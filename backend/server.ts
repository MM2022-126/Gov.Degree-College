import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Import routes
import authRoutes from "./routes/auth.js";
import newsRoutes from "./routes/news.js";
import eventsRoutes from "./routes/events.js";
import facultyRoutes from "./routes/faculty.js";
import galleryRoutes from "./routes/gallery.js";
import messagesRoutes from "./routes/messages.js";
import announcementsRoutes from "./routes/announcements.js";
import departmentsRoutes from "./routes/departments.js";
import programsRoutes from "./routes/programs.js";
import pagesRoutes from "./routes/pages.js";
import uploadRoutes from "./routes/upload.js";
import chatRoutes from "./routes/chat.js";
import settingsRoutes from "./routes/settings.js";
import contactRoutes from "./routes/contact.js";
import scheduleRoutes from "./routes/schedule.js";
import principalsRoutes from "./routes/principals.js";
import eventGalleryRoutes from "./routes/event-gallery.js";
import mediaRoutes from "./routes/media.js";
import adminRoutes from "./routes/admin.js";

// Import models for Socket.io
import { ChatMessage } from "./models/ChatMessage.js";
import { ChatConversation } from "./models/ChatConversation.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Attach io to app for use in routes
app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

// Routes
app.use("/api", authRoutes);
app.use("/api", newsRoutes);
app.use("/api", eventsRoutes);
app.use("/api", facultyRoutes);
app.use("/api", galleryRoutes);
app.use("/api", messagesRoutes);
app.use("/api", announcementsRoutes);
app.use("/api", departmentsRoutes);
app.use("/api", programsRoutes);
app.use("/api", pagesRoutes);
app.use("/api", uploadRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api", chatRoutes);
app.use("/api", settingsRoutes);
app.use("/api", contactRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/principals", principalsRoutes);
app.use("/api", eventGalleryRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Socket.io connection
const typingUsers = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // User joins their own room
  socket.on("join_room", (sessionId: string) => {
    if (!sessionId) return;
    socket.join(sessionId);
    socket.data.sessionId = sessionId;
    socket.data.role = "user";
    console.log(`[Socket] User joined room: ${sessionId}`);
  });

  // Admin joins admin room
  socket.on("join_admin", () => {
    socket.join("admin_room");
    socket.data.role = "admin";
    console.log(`[Socket] Admin joined admin room: ${socket.id}`);
  });

  // User sends message
  socket.on("user_message", async (data) => {
    try {
      // Validate required fields
      if (!data.text || !data.sessionId) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      const messageDoc = {
        sessionId: data.sessionId,
        sender: "user", // Always 'user' for this event
        text: data.text.trim(),
        name: data.name || "Visitor",
        senderDisplayName: data.name || "Visitor", // Add sender display name
        timestamp: new Date(),
        read: false,
        tempId: data.tempId || null  // Save tempId for optimistic message deduplication
      };

      // Save to MongoDB
      const saved = await ChatMessage.create(messageDoc);

      // Send back to the user's own room (confirms delivery + replaces optimistic message)
      socket.to(data.sessionId).emit("message_received", saved);
      socket.emit("message_received", saved);

      // Send to admin room
      io.to("admin_room").emit("new_message", saved);

    } catch (err) {
      console.error("user_message error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Admin sends reply
  socket.on("admin_reply", async (data) => {
    try {
      if (!data.text || !data.sessionId) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      const messageDoc = {
        sessionId: data.sessionId,
        sender: "admin", // Always 'admin' for this event
        text: data.text.trim(),
        name: "Admin",
        senderDisplayName: "Admin", // Always exactly the string "Admin"
        timestamp: new Date(),
        read: true,
        tempId: data.tempId || null  // Include tempId if provided
      };

      const saved = await ChatMessage.create(messageDoc);

      // Send to the specific user's room
      io.to(data.sessionId).emit("message_received", saved);

      // Confirm to admin
      io.to("admin_room").emit("reply_sent", saved);

    } catch (err) {
      console.error("admin_reply error:", err);
      socket.emit("error", { message: "Failed to send reply" });
    }
  });

  // Typing indicators
  socket.on("admin_typing", (data: { isTyping: boolean; sessionId: string }) => {
    if (data.sessionId) {
      io.to(data.sessionId).emit("admin_typing", { isTyping: data.isTyping });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Socket.io listening on ws://localhost:${PORT}`);
      console.log(`✓ CORS enabled for ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
