// Backend Server Template
// Copy this to backend/server.ts and customize as needed
// Note: Install dependencies with: npm install express cors dotenv
// Install types with: npm install -D @types/express @types/node
// This file is a reference template. Copy to backend/server.ts and add proper types.

import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/mongodb";
import { initializeSocket } from "./lib/socket";
import { extractTokenFromHeader, verifyToken } from "./lib/jwt";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${(req as any).method} ${(req as any).path}`);
  next();
});

// Initialize Socket.io
const io = initializeSocket(httpServer);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ============================================================================
// CHAT API ROUTES
// ============================================================================

// Create or get conversation
app.post("/api/chat/conversation", async (req: Request, res: Response) => {
  try {
    const { visitor_name, visitor_session_id } = req.body;

    if (!visitor_name || !visitor_session_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // TODO: Implement MongoDB logic
    // const existing = await ChatConversation.findOne({
    //   visitor_session_id,
    //   status: "active",
    // }).sort({ created_at: -1 });
    //
    // if (existing) return res.json(existing);
    //
    // const conversation = await ChatConversation.create({
    //   visitor_name,
    //   visitor_session_id,
    //   status: "active",
    // });

    const conversation = {
      _id: new Date().getTime().toString(),
      visitor_name,
      visitor_session_id,
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    };

    res.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get chat messages
app.get("/api/chat/messages/:conversationId", async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50 } = req.query;

    // TODO: Implement MongoDB logic
    // const messages = await ChatMessage.find({
    //   conversation_id: conversationId,
    // })
    //   .sort({ created_at: 1 })
    //   .limit(Number(limit));

    res.json([]);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Close conversation (requires auth)
app.post("/api/chat/conversations/:conversationId/close", async (req: Request, res: Response) => {
  try {
    // Verify JWT token
    const token = extractTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId } = req.params;

    // TODO: Implement MongoDB logic
    // const updated = await ChatConversation.findByIdAndUpdate(
    //   conversationId,
    //   { status: "closed" },
    //   { new: true }
    // );

    res.json({ status: "closed" });
  } catch (error) {
    console.error("Error closing conversation:", error);
    res.status(500).json({ error: "Failed to close conversation" });
  }
});

// Get conversations (admin only)
app.get("/api/chat/conversations", async (req: Request, res: Response) => {
  try {
    // Verify JWT token
    const token = extractTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { status, limit = 20 } = req.query;

    // TODO: Implement MongoDB logic
    // const query: any = {};
    // if (status) query.status = status;
    //
    // const conversations = await ChatConversation.find(query)
    //   .sort({ updated_at: -1 })
    //   .limit(Number(limit));

    res.json([]);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get chat statistics (admin only)
app.get("/api/chat/stats", async (req: Request, res: Response) => {
  try {
    // Verify JWT token
    const token = extractTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // TODO: Implement MongoDB logic
    // const totalConversations = await ChatConversation.countDocuments();
    // const activeConversations = await ChatConversation.countDocuments({ status: "active" });
    // const totalMessages = await ChatMessage.countDocuments();

    res.json({
      totalConversations: 0,
      activeConversations: 0,
      totalMessages: 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function start() {
  try {
    // Connect to MongoDB (uncomment when ready)
    // await connectDB();
    // console.log("✓ Connected to MongoDB");

    httpServer.listen(PORT, () => {
      console.log("\n════════════════════════════════════════════════════════");
      console.log("✓ Scholarshine Connect Backend Server Started");
      console.log("════════════════════════════════════════════════════════");
      console.log(`✓ Server: http://localhost:${PORT}`);
      console.log(`✓ API Base: http://localhost:${PORT}/api`);
      console.log(`✓ Socket.io: http://localhost:${PORT} (ws://)`);
      console.log(`✓ CORS Origin: ${FRONTEND_URL}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("════════════════════════════════════════════════════════\n");
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Start the server
start();

export { app, httpServer, io };
