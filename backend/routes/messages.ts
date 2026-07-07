import { Router } from "express";
import { Messages } from "../models/Messages.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// ==================== CONTACT MESSAGES (form submissions) ====================

// GET all contact messages
router.get("/messages", verifyToken, async (req: AuthRequest, res) => {
  try {
    const messages = await Messages.find().sort({ created_at: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// GET contact message by ID
router.get("/messages/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const message = await Messages.findById(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch message" });
  }
});

// POST create contact message (public)
router.post("/messages", async (req, res) => {
  try {
    const message = new Messages(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to create message" });
  }
});

// PUT mark as replied (protected)
router.put("/messages/:id/reply", verifyToken, async (req: AuthRequest, res) => {
  try {
    const message = await Messages.findByIdAndUpdate(req.params.id, { replied: true, updated_at: new Date() }, { new: true });
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to update message" });
  }
});

// DELETE contact message (protected)
router.delete("/messages/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const message = await Messages.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// ==================== CHAT MESSAGES (Socket.io backed) ====================

// GET messages for a specific session (user side)
router.get("/chat-messages", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    
    const messages = await ChatMessage.find({ sessionId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});

// GET all messages grouped by session (admin side) - protected
router.get("/chat-messages/all", verifyToken, async (req: AuthRequest, res) => {
  try {
    const grouped = await ChatMessage.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: "$sessionId",
          lastMessage: { $first: "$$ROOT" },
          messages: { $push: "$$ROOT" },
          unreadCount: { $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] } }
        }
      }
    ]);
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});

export default router;
