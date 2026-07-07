import { Router } from "express";
import { Gallery } from "../models/Gallery.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET all gallery
router.get("/gallery", async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ created_at: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// GET gallery by ID
router.get("/gallery/:id", async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Gallery item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gallery item" });
  }
});

// POST create gallery (protected)
router.post("/gallery", verifyToken, async (req: AuthRequest, res) => {
  try {
    const gallery = new Gallery(req.body);
    await gallery.save();
    res.status(201).json(gallery);
  } catch (error) {
    res.status(500).json({ error: "Failed to create gallery item" });
  }
});

// PUT update gallery (protected)
router.put("/gallery/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const gallery = await Gallery.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true });
    if (!gallery) return res.status(404).json({ error: "Gallery item not found" });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: "Failed to update gallery item" });
  }
});

// DELETE gallery (protected)
router.delete("/gallery/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);
    if (!gallery) return res.status(404).json({ error: "Gallery item not found" });
    res.json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete gallery item" });
  }
});

export default router;
