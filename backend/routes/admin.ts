import { Router, Request, Response } from "express";
import { AuthRequest, verifyToken } from "../middleware/auth.js";

// Import models
import { Events } from "../models/Events.js";
import { News } from "../models/News.js";
import { Announcements } from "../models/Announcements.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { Media } from "../models/Media.js";
import { Departments } from "../models/Departments.js";
import { Faculty } from "../models/Faculty.js";

const router = Router();

// GET dashboard stats (admin only)
router.get("/dashboard-stats", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Run all queries in parallel
    const [
      totalEvents,
      eventsThisMonth,
      totalNews,
      newsThisMonth,
      totalAnnouncements,
      activeAnnouncements,
      totalMessages,
      unreadMessages,
      totalMedia,
      mediaThisWeek,
      totalDepartments,
      totalFaculty,
      recentActivity
    ] = await Promise.all([
      Events.countDocuments({ isPublished: true }),
      Events.countDocuments({ isPublished: true, createdAt: { $gte: startOfMonth } }),
      News.countDocuments({ isPublished: true }),
      News.countDocuments({ isPublished: true, createdAt: { $gte: startOfMonth } }),
      Announcements.countDocuments(),
      Announcements.countDocuments({ isActive: true }),
      ChatMessage.countDocuments(),
      ChatMessage.countDocuments({ read: false, sender: "user" }),
      Media.countDocuments(),
      Media.countDocuments({ uploadedAt: { $gte: startOfWeek } }),
      Departments.countDocuments(),
      Faculty.countDocuments(),
      // Recent activity: last 10 items across collections
      Promise.all([
        Events.find({ isPublished: true }, "title createdAt").sort({ createdAt: -1 }).limit(3).lean(),
        News.find({ isPublished: true }, "title createdAt").sort({ createdAt: -1 }).limit(3).lean(),
        Media.find({}, "altText category uploadedAt").sort({ uploadedAt: -1 }).limit(2).lean(),
        ChatMessage.find({ sender: "user" }, "senderDisplayName text createdAt")
                   .sort({ createdAt: -1 }).limit(2).lean()
      ])
    ]);

    // Build recent activity array with type labels
    const [recentEvents, recentNews, recentMedia, recentMessages] = recentActivity;
    const activityItems = [
      ...recentEvents.map((e: any) => ({
        type: "event",
        label: "New event created",
        title: e.title,
        time: e.createdAt
      })),
      ...recentNews.map((n: any) => ({
        type: "news",
        label: "News article published",
        title: n.title,
        time: n.createdAt
      })),
      ...recentMedia.map((m: any) => ({
        type: "media",
        label: `Media uploaded (${m.category})`,
        title: m.altText || "New image",
        time: m.uploadedAt
      })),
      ...recentMessages.map((m: any) => ({
        type: "message",
        label: "New message received",
        title: `From ${m.senderDisplayName}: ${m.text.substring(0, 40)}...`,
        time: m.createdAt
      }))
    ]
    .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

    res.json({
      stats: {
        events: { total: totalEvents, thisMonth: eventsThisMonth },
        news: { total: totalNews, thisMonth: newsThisMonth },
        announcements: { total: totalAnnouncements, active: activeAnnouncements },
        messages: { total: totalMessages, unread: unreadMessages },
        media: { total: totalMedia, thisWeek: mediaThisWeek },
        departments: { total: totalDepartments },
        faculty: { total: totalFaculty }
      },
      recentActivity: activityItems
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
