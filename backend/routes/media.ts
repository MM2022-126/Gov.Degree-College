import { Router, Request, Response } from "express";
import { Media } from "../models/Media.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";
import cloudinary from "cloudinary";

const router = Router();

// GET all media, sorted newest first
// Optional query: ?category=events&limit=50&page=1
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, limit = 50, page = 1 } = req.query;
    
    const filter: any = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [media, total] = await Promise.all([
      Media.find(filter)
           .sort({ uploadedAt: -1 })
           .skip(skip)
           .limit(Number(limit))
           .lean(),
      Media.countDocuments(filter)
    ]);
    
    // CRITICAL: Make sure url field is included and valid
    const validMedia = media.filter(item => item.url && item.url.trim() !== '');
    
    res.json({ media: validMedia, total, page: Number(page) });
  } catch (error) {
    console.error("Media fetch error:", error);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// GET single media by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }
    res.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// POST - upload new media (admin only)
router.post("/", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { url, publicId, altText, caption, category, tags } = req.body;

    if (!url || !publicId || !category) {
      return res.status(400).json({ error: "url, publicId, and category are required" });
    }

    const media = new Media({
      url,
      publicId,
      altText: altText || '',
      caption: caption || '',
      category,
      tags: tags || []
    });

    const saved = await media.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ error: "Failed to upload media" });
  }
});

// PUT - update media metadata (admin only)
router.put("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { altText, caption, category, tags } = req.body;
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      {
        altText: altText || '',
        caption: caption || '',
        category: category || undefined,
        tags: tags || []
      },
      { new: true }
    );

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json(media);
  } catch (error) {
    console.error("Error updating media:", error);
    res.status(500).json({ error: "Failed to update media" });
  }
});

// DELETE - delete from Cloudinary + MongoDB (admin only)
router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    // Delete from Cloudinary
    try {
      await (cloudinary.v2.uploader.destroy as any)(media.publicId);
    } catch (err) {
      console.error("Cloudinary delete error:", err);
      // Continue even if Cloudinary delete fails
    }

    // Delete from MongoDB
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
