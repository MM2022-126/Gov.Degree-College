import { Router } from "express";
import { Programs } from "../models/Programs.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET all programs
router.get("/programs", async (req, res) => {
  try {
    const programs = await Programs.find().populate("department_id");
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// GET program by ID
router.get("/programs/:id", async (req, res) => {
  try {
    const program = await Programs.findById(req.params.id).populate("department_id");
    if (!program) return res.status(404).json({ error: "Program not found" });
    res.json(program);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch program" });
  }
});

// POST create program (protected)
router.post("/programs", verifyToken, async (req: AuthRequest, res) => {
  try {
    const program = new Programs(req.body);
    await program.save();
    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ error: "Failed to create program" });
  }
});

// PUT update program (protected)
router.put("/programs/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const program = await Programs.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true });
    if (!program) return res.status(404).json({ error: "Program not found" });
    res.json(program);
  } catch (error) {
    res.status(500).json({ error: "Failed to update program" });
  }
});

// DELETE program (protected)
router.delete("/programs/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const program = await Programs.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ error: "Program not found" });
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete program" });
  }
});

export default router;
