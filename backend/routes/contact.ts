import { Router } from "express";
import { Messages } from "../models/Messages.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// POST create contact form message
router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    // Create new message document
    const newMessage = new Messages({
      name,
      email,
      subject: subject || "No Subject",
      message,
      replied: false,
    });

    await newMessage.save();

    // Emit Socket.io event to admin room
    const io = (req as any).io;
    if (io) {
      io.to("admin").emit("new_contact_message", {
        _id: newMessage._id,
        name: newMessage.name,
        email: newMessage.email,
        subject: newMessage.subject,
        message: newMessage.message,
        created_at: newMessage.created_at,
      });
    }

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
});

// GET all contact submissions (admin only)
router.get("/contact", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, replied } = req.query;

    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (replied === "true") {
      filter.replied = true;
    } else if (replied === "false") {
      filter.replied = false;
    }

    // Get total count for pagination
    const total = await Messages.countDocuments(filter);

    // Get messages with pagination
    const messages = await Messages.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// GET contact message by ID (admin only)
router.get("/contact/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const message = await Messages.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch message" });
  }
});

// PUT mark as replied (admin only)
router.put("/contact/:id/reply", verifyToken, async (req: AuthRequest, res) => {
  try {
    const message = await Messages.findByIdAndUpdate(
      req.params.id,
      { replied: true, updated_at: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to update message" });
  }
});

// DELETE contact message (admin only)
router.delete("/contact/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const message = await Messages.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;
