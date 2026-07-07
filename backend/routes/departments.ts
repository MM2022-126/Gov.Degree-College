import { Router } from "express";
import { Departments } from "../models/Departments.js";
import { Programs } from "../models/Programs.js";
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

// GET all departments (includes programs subdocument array)
router.get("/departments", async (req, res) => {
  try {
    const departments = await Departments.find()
      .sort({ display_order: 1 })
      .lean();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// GET department by ID or slug with programs subdocument
router.get("/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let department;
    
    // Try to find by ID first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      department = await Departments.findById(id).lean();
    }
    
    // If not found by ID, try slug
    if (!department) {
      department = await Departments.findOne({ slug: id }).lean();
    }
    
    if (!department) return res.status(404).json({ error: "Department not found" });
    // Programs are already included in the department document as subdocument array
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch department" });
  }
});

// GET programs for a department
router.get("/departments/:id/programs", async (req, res) => {
  try {
    const programs = await Programs.find({ department_id: req.params.id });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// POST create department (protected)
router.post("/departments", verifyToken, async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    // Generate slug if not provided
    if (!body.slug && body.name) {
      body.slug = generateSlug(body.name);
    }
    const department = new Departments(body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: "Failed to create department" });
  }
});

// PUT update department (protected)
router.put("/departments/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    // Update slug if name changed
    if (body.name) {
      body.slug = generateSlug(body.name);
    }
    const department = await Departments.findByIdAndUpdate(req.params.id, { ...body, updated_at: new Date() }, { new: true });
    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: "Failed to update department" });
  }
});

// DELETE department (protected)
router.delete("/departments/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const department = await Departments.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete department" });
  }
});

export default router;
