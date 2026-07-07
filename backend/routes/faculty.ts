import { Router } from "express";
import { Faculty } from "../models/Faculty.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET all faculty
router.get("/faculty", async (req, res) => {
  try {
    const faculty = await Faculty.find();
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
});

// GET faculty by ID
router.get("/faculty/:id", async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
});

// POST create faculty (protected)
router.post("/faculty", verifyToken, async (req: AuthRequest, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Failed to create faculty" });
  }
});

// PUT update faculty (protected)
router.put("/faculty/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true });
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Failed to update faculty" });
  }
});

// DELETE faculty (protected)
router.delete("/faculty/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });
    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete faculty" });
  }
});

export default router;
