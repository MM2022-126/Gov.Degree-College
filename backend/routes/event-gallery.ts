import { Router } from "express";
import { EventGallery } from "../models/EventGallery.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET all event galleries (public)
router.get("/event-gallery", async (req, res) => {
  try {
    const galleries = await EventGallery.find().sort({ eventDate: -1 });
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch galleries" });
  }
});

// GET single event gallery by ID or slug (public)
router.get("/event-gallery/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let gallery;

    // Try to find by ID first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      gallery = await EventGallery.findById(id);
    }

    // If not found, try slug
    if (!gallery) {
      gallery = await EventGallery.findOne({ slug: id });
    }

    if (!gallery) return res.status(404).json({ error: "Gallery not found" });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// POST create event gallery (admin only)
router.post("/event-gallery", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, eventDate, coverImage, images } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const gallery = new EventGallery({
      title,
      description,
      eventDate,
      coverImage,
      images: images || [],
      slug: generateSlug(title),
    });

    await gallery.save();
    res.status(201).json(gallery);
  } catch (error) {
    res.status(500).json({ error: "Failed to create gallery" });
  }
});

// PUT update event gallery (admin only)
router.put("/event-gallery/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, eventDate, coverImage, images } = req.body;

    const updateData: any = {
      description,
      eventDate,
      coverImage,
      images,
      updatedAt: new Date(),
    };

    if (title) {
      updateData.title = title;
      updateData.slug = generateSlug(title);
    }

    const gallery = await EventGallery.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!gallery) return res.status(404).json({ error: "Gallery not found" });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: "Failed to update gallery" });
  }
});

// POST add images to gallery (admin only)
router.post("/event-gallery/:id/images", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: "Images array required" });
    }

    const gallery = await EventGallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ error: "Gallery not found" });

    gallery.images = [...gallery.images, ...images];
    await gallery.save();
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: "Failed to add images" });
  }
});

// DELETE remove specific image from gallery (admin only)
router.delete("/event-gallery/:id/images/:imageIndex", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { id, imageIndex } = req.params;
    const index = parseInt(imageIndex, 10);

    const gallery = await EventGallery.findById(id);
    if (!gallery) return res.status(404).json({ error: "Gallery not found" });

    if (index < 0 || index >= gallery.images.length) {
      return res.status(400).json({ error: "Invalid image index" });
    }

    gallery.images.splice(index, 1);
    await gallery.save();
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove image" });
  }
});

// DELETE entire gallery (admin only)
router.delete("/event-gallery/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const gallery = await EventGallery.findByIdAndDelete(req.params.id);
    if (!gallery) return res.status(404).json({ error: "Gallery not found" });
    res.json({ message: "Gallery deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete gallery" });
  }
});

export default router;
