import { Router } from "express";
import { Settings } from "../models/Settings.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Default settings to initialize if none exist
const DEFAULT_SETTINGS = {
  college_name: "Government Graduate College Ravi Road Shahdara",
  address: "Ravi Road, Shahdara, Lahore, Punjab 54000",
  phone: "+92-42-XXXXXXX",
  email: "info@ggc.edu.pk",
  chat_enabled: "true",
  contact_form_enabled: "true",
};

// GET all settings or specific key
router.get("/settings", async (req, res) => {
  try {
    const { key } = req.query;

    if (key) {
      // Get specific setting by key
      const setting = await Settings.findOne({ key });
      if (!setting) {
        // If key doesn't exist, return default value for that key
        const defaultValue = DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS];
        if (defaultValue !== undefined) {
          return res.json({ key, value: defaultValue });
        }
        return res.json({ key, value: null });
      }
      return res.json(setting);
    }

    // Get all settings, or initialize with defaults if none exist
    let settings = await Settings.find();

    if (settings.length === 0) {
      // Initialize default settings
      const defaultDocs = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      await Settings.insertMany(defaultDocs);
      settings = await Settings.find();
    }

    // Format as object
    const settingsObj: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    // Ensure all default settings are present
    Object.entries(DEFAULT_SETTINGS).forEach(([key, defaultValue]) => {
      if (!(key in settingsObj)) {
        settingsObj[key] = String(defaultValue);
      }
    });

    res.json(settingsObj);
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Always return defaults instead of 404
    res.json(DEFAULT_SETTINGS);
  }
});

// GET specific setting by key
router.get("/settings/:key", async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });

    if (!setting) {
      const defaultValue = DEFAULT_SETTINGS[req.params.key as keyof typeof DEFAULT_SETTINGS];
      return res.json({
        key: req.params.key,
        value: defaultValue ?? null,
      });
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch setting" });
  }
});

// POST create or update settings (admin only)
router.post("/settings", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: "Key and value required" });
    }

    let setting = await Settings.findOneAndUpdate(
      { key },
      { value: String(value), updated_at: new Date() },
      { new: true, upsert: true }
    );

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: "Failed to save setting" });
  }
});

// PUT update settings (admin only)
router.put("/settings/:key", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Value required" });
    }

    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value: String(value), updated_at: new Date() },
      { new: true, upsert: true }
    );

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: "Failed to update setting" });
  }
});

// DELETE setting (admin only)
router.delete("/settings/:key", verifyToken, async (req: AuthRequest, res) => {
  try {
    const setting = await Settings.findOneAndDelete({ key: req.params.key });

    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json({ message: "Setting deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete setting" });
  }
});

export default router;
