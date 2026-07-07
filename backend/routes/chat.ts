import { Router } from "express";
import { ChatConversation } from "../models/ChatConversation.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// POST create or get conversation
router.post("/chat/conversation", async (req, res) => {
  try {
    const { visitor_name, visitor_session_id } = req.body;

    if (!visitor_name) {
      return res.status(400).json({ error: "Visitor name required" });
    }

    // Check if conversation exists for this session
    let conversation = visitor_session_id
      ? await ChatConversation.findOne({ visitor_session_id, status: "active" })
      : null;

    // Create new conversation if needed
    if (!conversation) {
      conversation = new ChatConversation({
        visitor_name,
        visitor_session_id,
        status: "active",
      });
      await conversation.save();
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to create/get conversation" });
  }
});

// GET conversations (admin only)
router.get("/chat/conversations", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const conversations = await ChatConversation.find(filter).sort({ updated_at: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// GET messages for conversation
router.get("/chat/messages/:conversationId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      conversation_id: req.params.conversationId,
    }).sort({ created_at: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST close conversation (admin only)
router.post("/chat/conversations/:id/close", verifyToken, async (req: AuthRequest, res) => {
  try {
    const conversation = await ChatConversation.findByIdAndUpdate(
      req.params.id,
      { status: "closed", updated_at: new Date() },
      { new: true }
    );
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to close conversation" });
  }
});

// GET unread count
router.get("/chat/unread-count", verifyToken, async (req: AuthRequest, res) => {
  try {
    const count = await ChatMessage.countDocuments({ read_at: null, sender_type: "visitor" });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Failed to get unread count" });
  }
});

// GET chat stats
router.get("/chat/stats", verifyToken, async (req: AuthRequest, res) => {
  try {
    const totalConversations = await ChatConversation.countDocuments();
    const activeConversations = await ChatConversation.countDocuments({ status: "active" });
    const totalMessages = await ChatMessage.countDocuments();
    const unreadMessages = await ChatMessage.countDocuments({ read_at: null });

    res.json({
      totalConversations,
      activeConversations,
      totalMessages,
      unreadMessages,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
