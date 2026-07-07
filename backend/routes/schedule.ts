import { Router, Request, Response } from "express";
import Schedule from "../models/Schedule.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// Get all schedule entries
router.get("/", async (req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find().sort({ date: 1, time: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// Get schedule by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

// Create new schedule entry (admin only)
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { subject, date, time, venue } = req.body;

    if (!subject || !date || !time || !venue) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const schedule = new Schedule({
      subject,
      date,
      time,
      venue,
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create schedule" });
  }
});

// Update schedule entry (admin only)
router.put("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { subject, date, time, venue } = req.body;

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { subject, date, time, venue },
      { new: true, runValidators: true }
    );

    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update schedule" });
  }
});

// Delete schedule entry (admin only)
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    res.json({ message: "Schedule deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete schedule" });
  }
});

export default router;
