import { Router, Request, Response } from "express";
import Principal from "../models/Principal.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// Get all principals
router.get("/", async (req: Request, res: Response) => {
  try {
    const principals = await Principal.find().sort({ role: 1, createdAt: -1 });
    res.json(principals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch principals" });
  }
});

// Get principal by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const principal = await Principal.findById(req.params.id);
    if (!principal) {
      res.status(404).json({ error: "Principal not found" });
      return;
    }
    res.json(principal);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch principal" });
  }
});

// Create new principal (admin only)
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { name, tenure, image, description, role } = req.body;

    if (!name || !tenure) {
      res.status(400).json({ error: "Name and tenure are required" });
      return;
    }

    const principal = new Principal({
      name,
      tenure,
      image: image || "",
      description: description || "",
      role: role || "principal",
    });

    await principal.save();
    res.status(201).json(principal);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create principal" });
  }
});

// Update principal (admin only)
router.put("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { name, tenure, image, description, role } = req.body;

    const principal = await Principal.findByIdAndUpdate(
      req.params.id,
      { name, tenure, image, description, role },
      { new: true, runValidators: true }
    );

    if (!principal) {
      res.status(404).json({ error: "Principal not found" });
      return;
    }

    res.json(principal);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update principal" });
  }
});

// Delete principal (admin only)
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const principal = await Principal.findByIdAndDelete(req.params.id);

    if (!principal) {
      res.status(404).json({ error: "Principal not found" });
      return;
    }

    res.json({ message: "Principal deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete principal" });
  }
});

export default router;
