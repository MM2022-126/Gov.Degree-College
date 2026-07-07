import { Router } from "express";
import { Pages } from "../models/Pages.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET all pages
router.get("/pages", async (req, res) => {
  try {
    const pages = await Pages.find();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

// GET page by slug
router.get("/pages/:slug", async (req, res) => {
  try {
    const page = await Pages.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

// POST create page (protected)
router.post("/pages", verifyToken, async (req: AuthRequest, res) => {
  try {
    const page = new Pages(req.body);
    await page.save();
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ error: "Failed to create page" });
  }
});

// PUT update page (protected)
router.put("/pages/:slug", verifyToken, async (req: AuthRequest, res) => {
  try {
    const page = await Pages.findOneAndUpdate({ slug: req.params.slug }, { ...req.body, updated_at: new Date() }, { new: true });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: "Failed to update page" });
  }
});

// DELETE page (protected)
router.delete("/pages/:slug", verifyToken, async (req: AuthRequest, res) => {
  try {
    const page = await Pages.findOneAndDelete({ slug: req.params.slug });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json({ message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete page" });
  }
});

export default router;
