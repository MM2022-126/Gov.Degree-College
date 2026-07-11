import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken, verifyToken, extractTokenFromHeader } from '../lib/jwt';
import { connectDB } from '../lib/mongodb';
import News from '../models/News';
import Event from '../models/Events';
import Announcement from '../models/Announcements';
import Department from '../models/Departments';
import Faculty from '../models/Faculty';
import Gallery from '../models/Gallery';
import Message from '../models/Messages';
import ChatMessage from '../models/ChatMessage';
import ChatConversation from '../models/ChatConversation';

function getRoute(req: VercelRequest): string {
  const route = req.query.route;
  if (Array.isArray(route)) return route.join('/');
  if (typeof route === 'string') return route;
  return '';
}

function sendJson(res: VercelResponse, status: number, payload: unknown) {
  res.status(status).json(payload);
}

async function tryConnect() {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    return await connectDB();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = getRoute(req);
  const method = req.method?.toUpperCase();

  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (route === '' || route === 'health') {
    sendJson(res, 200, { status: 'ok', message: 'Scholarshine Connect API is running on Vercel.' });
    return;
  }

  if (route === 'auth/login' && method === 'POST') {
    const { email, password } = req.body || {};
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = generateToken(String(email));
      sendJson(res, 200, { token, email });
      return;
    }
    sendJson(res, 401, { error: 'Invalid credentials' });
    return;
  }

  if (route === 'auth/verify' && method === 'GET') {
    const token = extractTokenFromHeader(req.headers.authorization as string | undefined);
    const payload = token ? verifyToken(token) : null;
    sendJson(res, 200, { valid: Boolean(payload), admin: payload ? { email: payload.email } : null });
    return;
  }

  if (route === 'auth/logout' && method === 'POST') {
    sendJson(res, 200, { message: 'Logged out successfully' });
    return;
  }

  if (route === 'news' && method === 'GET') {
    const db = await tryConnect();
    if (db) {
      const items = await News.find().sort({ createdAt: -1 }).lean();
      sendJson(res, 200, items);
      return;
    }
    sendJson(res, 200, []);
    return;
  }

  if (route === 'events' && method === 'GET') {
    const db = await tryConnect();
    if (db) {
      const items = await Event.find().sort({ createdAt: -1 }).lean();
      sendJson(res, 200, items);
      return;
    }
    sendJson(res, 200, []);
    return;
  }

  if (route === 'announcements' && method === 'GET') {
    const db = await tryConnect();
    if (db) {
      const items = await Announcement.find({ active: true }).sort({ createdAt: -1 }).lean();
      sendJson(res, 200, items);
      return;
    }
    sendJson(res, 200, []);
    return;
  }

  if (route === 'departments' && method === 'GET') {
    const db = await tryConnect();
    if (db) {
      const items = await Department.find().sort({ display_order: 1 }).lean();
      sendJson(res, 200, items);
      return;
    }
    sendJson(res, 200, []);
    return;
  }

  if (route === 'faculty' && method === 'GET') {
    const db = await tryConnect();
    if (db) {
      const items = await Faculty.find().sort({ createdAt: -1 }).lean();
      sendJson(res, 200, items);
      return;
    }
    sendJson(res, 200, []);
    return;
  }

  if (route === 'gallery' && method === 'GET') {
    const db = await tryConnect();
    if (db) {
      const items = await Gallery.find().sort({ createdAt: -1 }).lean();
      sendJson(res, 200, items);
      return;
    }
    sendJson(res, 200, []);
    return;
  }

  if (route === 'messages' && method === 'GET') {
    const token = extractTokenFromHeader(req.headers.authorization as string | undefined);
    if (!token || !verifyToken(token)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }
    const db = await tryConnect();
    if (db) {
      const items = await Message.find().sort({ createdAt: -1 }).lean();
      sendJson(res, 200, items);
      return;
    }
    sendJson(res, 200, []);
    return;
  }

  if (route === 'messages' && method === 'POST') {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      sendJson(res, 400, { error: 'Name, email, and message are required' });
      return;
    }
    const db = await tryConnect();
    if (db) {
      const created = await Message.create({ name, email, message, replied: false });
      sendJson(res, 201, created);
      return;
    }
    sendJson(res, 201, { name, email, message, replied: false });
    return;
  }

  if (route === 'chat-messages' && method === 'GET') {
    const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : '';
    if (!sessionId) {
      sendJson(res, 400, { error: 'sessionId is required' });
      return;
    }

    const db = await tryConnect();
    if (db) {
      const items = await ChatMessage.find({ sessionId }).sort({ timestamp: 1 }).lean();
      sendJson(res, 200, items);
      return;
    }

    sendJson(res, 200, []);
    return;
  }

  if (route === 'chat-messages' && method === 'POST') {
    const { sessionId, sender = 'user', text, name, senderDisplayName, read = false, timestamp, tempId } = req.body || {};

    if (!sessionId || !text) {
      sendJson(res, 400, { error: 'sessionId and text are required' });
      return;
    }

    const db = await tryConnect();
    if (db) {
      const created = await ChatMessage.create({
        sessionId,
        sender,
        text: String(text).trim(),
        name: name || (sender === 'admin' ? 'Admin' : 'Visitor'),
        senderDisplayName: senderDisplayName || (sender === 'admin' ? 'Admin' : name || 'Visitor'),
        read: Boolean(read),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        tempId: tempId || null,
      });
      sendJson(res, 201, created);
      return;
    }

    sendJson(res, 201, {
      sessionId,
      sender,
      text: String(text).trim(),
      name: name || (sender === 'admin' ? 'Admin' : 'Visitor'),
      senderDisplayName: senderDisplayName || (sender === 'admin' ? 'Admin' : name || 'Visitor'),
      read: Boolean(read),
      timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      tempId: tempId || null,
    });
    return;
  }

  // GET messages for a conversation (path: /chat/messages/:conversationId)
  if (route.startsWith('chat/messages/') && method === 'GET') {
    const parts = route.split('/');
    const conversationId = parts[2] || '';
    if (!conversationId) {
      sendJson(res, 400, { error: 'conversationId is required' });
      return;
    }

    const db = await tryConnect();
    if (db) {
      const items = await ChatMessage.find({ conversation_id: conversationId }).sort({ created_at: 1 }).lean();
      sendJson(res, 200, items);
      return;
    }

    sendJson(res, 200, []);
    return;
  }

  // POST create/get conversation (path: /chat/conversation)
  if (route === 'chat/conversation' && method === 'POST') {
    const { visitor_name, visitor_session_id } = req.body || {};
    if (!visitor_name) {
      sendJson(res, 400, { error: 'visitor_name is required' });
      return;
    }

    try {
      const db = await tryConnect();
      if (db) {
        let conversation = null;
        if (visitor_session_id) {
          conversation = await ChatConversation.findOne({ visitor_session_id, status: 'active' }).lean();
        }

        if (!conversation) {
          const created = await ChatConversation.create({ visitor_name, visitor_session_id, status: 'active' });
          sendJson(res, 200, created);
          return;
        }

        sendJson(res, 200, conversation);
        return;
      }

      sendJson(res, 200, { visitor_name, visitor_session_id, status: 'active' });
      return;
    } catch (error) {
      console.error('chat/conversation error:', error);
      sendJson(res, 500, { error: 'Failed to create/get conversation' });
      return;
    }
  }

  // GET conversations (admin) - /chat/conversations
  if (route === 'chat/conversations' && method === 'GET') {
    const token = extractTokenFromHeader(req.headers.authorization as string | undefined);
    if (!token || !verifyToken(token)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const db = await tryConnect();
    if (db) {
      const { status } = req.query;
      const filter: any = {};
      if (status && typeof status === 'string') filter.status = status;
      const items = await ChatConversation.find(filter).sort({ updated_at: -1 }).lean();
      sendJson(res, 200, items);
      return;
    }

    sendJson(res, 200, []);
    return;
  }

  // GET unread count and stats endpoints (admin)
  if (route === 'chat/unread-count' && method === 'GET') {
    const token = extractTokenFromHeader(req.headers.authorization as string | undefined);
    if (!token || !verifyToken(token)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const db = await tryConnect();
    if (db) {
      const count = await ChatMessage.countDocuments({ read_at: null, sender_type: 'visitor' });
      sendJson(res, 200, { count });
      return;
    }

    sendJson(res, 200, { count: 0 });
    return;
  }

  if (route === 'chat/stats' && method === 'GET') {
    const token = extractTokenFromHeader(req.headers.authorization as string | undefined);
    if (!token || !verifyToken(token)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const db = await tryConnect();
    if (db) {
      const totalConversations = await ChatConversation.countDocuments();
      const activeConversations = await ChatConversation.countDocuments({ status: 'active' });
      const totalMessages = await ChatMessage.countDocuments();
      const unreadMessages = await ChatMessage.countDocuments({ read_at: null });

      sendJson(res, 200, { totalConversations, activeConversations, totalMessages, unreadMessages });
      return;
    }

    sendJson(res, 200, { totalConversations: 0, activeConversations: 0, totalMessages: 0, unreadMessages: 0 });
    return;
  }

  if (route === 'chat-messages/all' && method === 'GET') {
    const db = await tryConnect();
    if (db) {
      const items = await ChatMessage.find().sort({ timestamp: -1 }).lean();
      const grouped = Object.values(items.reduce((acc, item) => {
        const sessionKey = item.sessionId;
        if (!acc[sessionKey]) {
          acc[sessionKey] = {
            sessionId: sessionKey,
            messages: [],
            lastMessage: null,
            unreadCount: 0,
            visitorName: item.senderDisplayName || item.name || 'Visitor',
          };
        }

        acc[sessionKey].messages.push(item);
        if (!acc[sessionKey].lastMessage || new Date(item.timestamp) > new Date(acc[sessionKey].lastMessage.timestamp)) {
          acc[sessionKey].lastMessage = item;
        }
        if (item.sender === 'user' && !item.read) {
          acc[sessionKey].unreadCount += 1;
        }
        return acc;
      }, {} as Record<string, any>));
      sendJson(res, 200, grouped);
      return;
    }

    sendJson(res, 200, []);
    return;
  }

  if (route === 'settings' && method === 'GET') {
    sendJson(res, 200, {
      site_name: 'Scholarshine Connect',
      contact_email: 'info@college.edu.pk',
      contact_phone: '+92-42-XXXXXXX',
    });
    return;
  }

  if (route === 'media' && method === 'GET') {
    sendJson(res, 200, []);
    return;
  }

  if (route === 'upload' && method === 'POST') {
    sendJson(res, 200, {
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
      publicId: 'demo-upload',
    });
    return;
  }

  if (route === 'admin/dashboard-stats' && method === 'GET') {
    sendJson(res, 200, {
      stats: {
        events: { total: 0, thisMonth: 0 },
        news: { total: 0, thisMonth: 0 },
        announcements: { total: 0, active: 0 },
        messages: { total: 0, unread: 0 },
        media: { total: 0, thisWeek: 0 },
        departments: { total: 0 },
        faculty: { total: 0 },
      },
      recentActivity: [],
    });
    return;
  }

  sendJson(res, 404, { error: 'Route not found' });
}
