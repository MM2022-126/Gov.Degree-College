import { Router } from "express";
import { Announcements } from "../models/Announcements.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET all announcements
router.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcements.find().sort({ created_at: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// GET announcement by ID
router.get("/announcements/:id", async (req, res) => {
  try {
    const announcement = await Announcements.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: "Announcement not found" });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcement" });
  }
});

// POST create announcement (protected)
router.post("/announcements", verifyToken, async (req: AuthRequest, res) => {
  try {
    const announcement = new Announcements(req.body);
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// PUT update announcement (protected)
router.put("/announcements/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const announcement = await Announcements.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true }
    );
    if (!announcement) return res.status(404).json({ error: "Announcement not found" });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

// DELETE announcement (protected)
router.delete("/announcements/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const announcement = await Announcements.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ error: "Announcement not found" });
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;
