import { Router } from "express";
import { News } from "../models/News.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET all news (published only)
router.get("/news", async (req, res) => {
  try {
    const news = await News.find({ isPublished: true })
      .sort({ date: -1, createdAt: -1 })
      .lean();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// GET news by ID or slug
router.get("/news/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let news;
    
    // Try to find by ID first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      news = await News.findById(id).lean();
    }
    
    // If not found by ID, try slug
    if (!news) {
      news = await News.findOne({ slug: id }).lean();
    }
    
    if (!news) return res.status(404).json({ error: "News not found" });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// POST create news (protected)
router.post("/news", verifyToken, async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    // Generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = generateSlug(body.title);
    }
    const news = new News(body);
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to create news" });
  }
});

// PUT update news (protected)
router.put("/news/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    // Update slug if title changed
    if (body.title) {
      body.slug = generateSlug(body.title);
    }
    const news = await News.findByIdAndUpdate(req.params.id, { ...body, updated_at: new Date() }, { new: true });
    if (!news) return res.status(404).json({ error: "News not found" });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to update news" });
  }
});

// DELETE news (protected)
router.delete("/news/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ error: "News not found" });
    res.json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete news" });
  }
});

export default router;
