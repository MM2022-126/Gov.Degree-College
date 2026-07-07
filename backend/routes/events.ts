import { Router } from "express";
import { Events } from "../models/Events.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET all events (published only)
router.get("/events", async (req, res) => {
  try {
    const events = await Events.find({ isPublished: true })
      .sort({ eventDate: -1, date: -1 })
      .lean();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET event by ID or slug
router.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let event;
    
    // Try to find by ID first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Events.findById(id).lean();
    }
    
    // If not found by ID, try slug
    if (!event) {
      event = await Events.findOne({ slug: id }).lean();
    }
    
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// POST create event (protected)
router.post("/events", verifyToken, async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    // Generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = generateSlug(body.title);
    }
    const event = new Events(body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event", details: (error as any).message });
  }
});

// PUT update event (protected)
router.put("/events/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    // Update slug if title changed
    if (body.title) {
      body.slug = generateSlug(body.title);
    }
    const event = await Events.findByIdAndUpdate(req.params.id, { ...body, updated_at: new Date() }, { new: true });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to update event" });
  }
});

// DELETE event (protected)
router.delete("/events/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const event = await Events.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
