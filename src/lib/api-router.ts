import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAuth, verifyTokenString, getTokenFromRequest, AuthError } from '@/lib/auth'
import { generateSlug, findByIdOrSlug } from '@/lib/slug'
import { sanitizeObject, sanitizeText, sanitizeHtml, isValidEmail } from '@/lib/sanitize'
import { DEFAULT_SETTINGS } from '@/lib/route-utils'
import { uploadImageBuffer, deleteCloudinaryImage } from '@/lib/cloudinary'
import Announcements from '@/models/Announcements'
import Departments from '@/models/Departments'
import Faculty from '@/models/Faculty'
import Gallery from '@/models/Gallery'
import Programs from '@/models/Programs'
import Pages from '@/models/Pages'
import Messages from '@/models/Messages'
import ChatMessage from '@/models/ChatMessage'
import ChatConversation from '@/models/ChatConversation'
import Settings from '@/models/Settings'
import Schedule from '@/models/Schedule'
import Principal from '@/models/Principal'
import EventGallery from '@/models/EventGallery'
import Media from '@/models/Media'
import Events from '@/models/Events'
import News from '@/models/News'
import { broadcastChatMessage } from '@/lib/chat-realtime/hub'

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

function err(message: string, status = 500) {
  return json({ error: message }, status)
}

async function body(req: NextRequest) {
  return sanitizeObject(await req.json())
}

export async function dispatchApi(req: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const method = req.method?.toUpperCase() || 'GET'
  const path = pathSegments.join('/')

  try {
    await connectDB()

    // ANNOUNCEMENTS
    if (path === 'announcements' && method === 'GET') {
      return json(await Announcements.find().sort({ created_at: -1 }).lean())
    }
    if (path.startsWith('announcements/') && method === 'GET') {
      const id = path.split('/')[1]
      const doc = await Announcements.findById(id).lean()
      if (!doc) return err('Announcement not found', 404)
      return json(doc)
    }
    if (path === 'announcements' && method === 'POST') {
      await requireAuth(req)
      return json(await Announcements.create(await body(req)), 201)
    }
    if (path.startsWith('announcements/') && method === 'PUT') {
      await requireAuth(req)
      const id = path.split('/')[1]
      const doc = await Announcements.findByIdAndUpdate(id, { ...await body(req), updated_at: new Date() }, { new: true })
      if (!doc) return err('Announcement not found', 404)
      return json(doc)
    }
    if (path.startsWith('announcements/') && method === 'DELETE') {
      await requireAuth(req)
      const id = path.split('/')[1]
      const doc = await Announcements.findByIdAndDelete(id)
      if (!doc) return err('Announcement not found', 404)
      return json({ message: 'Announcement deleted successfully' })
    }

    // DEPARTMENTS
    if (path === 'departments' && method === 'GET') {
      return json(await Departments.find().sort({ display_order: 1 }).lean())
    }
    if (path.match(/^departments\/[^/]+\/programs$/) && method === 'GET') {
      const id = path.split('/')[1]
      const dept = await findByIdOrSlug(Departments, id)
      if (!dept) return err('Department not found', 404)
      return json((dept as { programs?: unknown[] }).programs || [])
    }
    if (path.startsWith('departments/') && method === 'GET') {
      const id = path.split('/')[1]
      const doc = await findByIdOrSlug(Departments, id)
      if (!doc) return err('Department not found', 404)
      return json(doc)
    }
    if (path === 'departments' && method === 'POST') {
      await requireAuth(req)
      const b = await body(req)
      if (b.name && !b.slug) b.slug = generateSlug(String(b.name))
      return json(await Departments.create(b), 201)
    }
    if (path.startsWith('departments/') && method === 'PUT') {
      await requireAuth(req)
      const id = path.split('/')[1]
      const b = await body(req)
      if (b.name) b.slug = generateSlug(String(b.name))
      const doc = await Departments.findByIdAndUpdate(id, { ...b, updated_at: new Date() }, { new: true })
      if (!doc) return err('Department not found', 404)
      return json(doc)
    }
    if (path.startsWith('departments/') && method === 'DELETE') {
      await requireAuth(req)
      const id = path.split('/')[1]
      const doc = await Departments.findByIdAndDelete(id)
      if (!doc) return err('Department not found', 404)
      return json({ message: 'Department deleted successfully' })
    }

    // FACULTY
    if (path === 'faculty' && method === 'GET') {
      return json(await Faculty.find().sort({ created_at: -1 }).lean())
    }
    if (path.startsWith('faculty/') && method === 'GET') {
      const doc = await Faculty.findById(path.split('/')[1]).lean()
      if (!doc) return err('Faculty not found', 404)
      return json(doc)
    }
    if (path === 'faculty' && method === 'POST') {
      await requireAuth(req)
      return json(await Faculty.create(await body(req)), 201)
    }
    if (path.startsWith('faculty/') && method === 'PUT') {
      await requireAuth(req)
      const doc = await Faculty.findByIdAndUpdate(path.split('/')[1], { ...await body(req), updated_at: new Date() }, { new: true })
      if (!doc) return err('Faculty not found', 404)
      return json(doc)
    }
    if (path.startsWith('faculty/') && method === 'DELETE') {
      await requireAuth(req)
      const doc = await Faculty.findByIdAndDelete(path.split('/')[1])
      if (!doc) return err('Faculty not found', 404)
      return json({ message: 'Faculty deleted successfully' })
    }

    // GALLERY
    if (path === 'gallery' && method === 'GET') {
      return json(await Gallery.find().sort({ created_at: -1 }).lean())
    }
    if (path.startsWith('gallery/') && method === 'GET') {
      const doc = await Gallery.findById(path.split('/')[1]).lean()
      if (!doc) return err('Gallery item not found', 404)
      return json(doc)
    }
    if (path === 'gallery' && method === 'POST') {
      await requireAuth(req)
      return json(await Gallery.create(await body(req)), 201)
    }
    if (path.startsWith('gallery/') && method === 'PUT') {
      await requireAuth(req)
      const doc = await Gallery.findByIdAndUpdate(path.split('/')[1], { ...await body(req), updated_at: new Date() }, { new: true })
      if (!doc) return err('Gallery item not found', 404)
      return json(doc)
    }
    if (path.startsWith('gallery/') && method === 'DELETE') {
      await requireAuth(req)
      const doc = await Gallery.findByIdAndDelete(path.split('/')[1])
      if (!doc) return err('Gallery item not found', 404)
      return json({ message: 'Gallery item deleted successfully' })
    }

    // PROGRAMS
    if (path === 'programs' && method === 'GET') {
      return json(await Programs.find().lean())
    }
    if (path.startsWith('programs/') && method === 'GET') {
      const doc = await Programs.findById(path.split('/')[1]).lean()
      if (!doc) return err('Program not found', 404)
      return json(doc)
    }
    if (path === 'programs' && method === 'POST') {
      await requireAuth(req)
      return json(await Programs.create(await body(req)), 201)
    }
    if (path.startsWith('programs/') && method === 'PUT') {
      await requireAuth(req)
      const doc = await Programs.findByIdAndUpdate(path.split('/')[1], { ...await body(req), updated_at: new Date() }, { new: true })
      if (!doc) return err('Program not found', 404)
      return json(doc)
    }
    if (path.startsWith('programs/') && method === 'DELETE') {
      await requireAuth(req)
      const doc = await Programs.findByIdAndDelete(path.split('/')[1])
      if (!doc) return err('Program not found', 404)
      return json({ message: 'Program deleted successfully' })
    }

    // PAGES
    if (path === 'pages' && method === 'GET') {
      return json(await Pages.find().lean())
    }
    if (path.startsWith('pages/') && method === 'GET') {
      const slug = path.split('/').slice(1).join('/')
      const doc = await Pages.findOne({ slug }).lean()
      if (!doc) return err('Page not found', 404)
      return json(doc)
    }
    if (path === 'pages' && method === 'POST') {
      await requireAuth(req)
      const b = await body(req)
      if (b.content) b.content = sanitizeHtml(b.content)
      return json(await Pages.create(b), 201)
    }
    if (path.startsWith('pages/') && method === 'PUT') {
      await requireAuth(req)
      const slug = path.split('/').slice(1).join('/')
      const b = await body(req)
      if (b.content) b.content = sanitizeHtml(b.content)
      const doc = await Pages.findOneAndUpdate({ slug }, { ...b, updated_at: new Date() }, { new: true })
      if (!doc) return err('Page not found', 404)
      return json(doc)
    }
    if (path.startsWith('pages/') && method === 'DELETE') {
      await requireAuth(req)
      const slug = path.split('/').slice(1).join('/')
      const doc = await Pages.findOneAndDelete({ slug })
      if (!doc) return err('Page not found', 404)
      return json({ message: 'Page deleted successfully' })
    }

    // MESSAGES (contact form legacy)
    if (path === 'messages' && method === 'GET') {
      await requireAuth(req)
      return json(await Messages.find().sort({ created_at: -1 }).lean())
    }
    if (path.startsWith('messages/') && path.endsWith('/reply') && method === 'PUT') {
      await requireAuth(req)
      const id = path.split('/')[1]
      const doc = await Messages.findByIdAndUpdate(id, { replied: true, updated_at: new Date() }, { new: true })
      if (!doc) return err('Message not found', 404)
      return json(doc)
    }
    if (path.startsWith('messages/') && method === 'GET') {
      await requireAuth(req)
      const doc = await Messages.findById(path.split('/')[1]).lean()
      if (!doc) return err('Message not found', 404)
      return json(doc)
    }
    if (path === 'messages' && method === 'POST') {
      const b = await body(req)
      if (!b.name || !b.email || !b.message) return err('Name, email, and message required', 400)
      if (!isValidEmail(String(b.email))) return err('Invalid email', 400)
      return json(await Messages.create(b), 201)
    }
    if (path.startsWith('messages/') && method === 'DELETE') {
      await requireAuth(req)
      const doc = await Messages.findByIdAndDelete(path.split('/')[1])
      if (!doc) return err('Message not found', 404)
      return json({ message: 'Message deleted successfully' })
    }

    // CONTACT
    if (path === 'contact' && method === 'POST') {
      const b = await body(req)
      if (!b.name || !b.email || !b.message) return err('Name, email, and message are required', 400)
      if (!isValidEmail(String(b.email))) return err('Invalid email', 400)
      const doc = await Messages.create({
        name: sanitizeText(b.name, 200),
        email: sanitizeText(b.email, 254),
        subject: sanitizeText(b.subject || 'No Subject', 300),
        message: sanitizeText(b.message, 5000),
        replied: false,
      })
      return json({ success: true, message: 'Your message has been sent successfully!', data: doc }, 201)
    }
    if (path === 'contact' && method === 'GET') {
      await requireAuth(req)
      const { searchParams } = req.nextUrl
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const replied = searchParams.get('replied')
      const filter: Record<string, boolean> = {}
      if (replied === 'true') filter.replied = true
      if (replied === 'false') filter.replied = false
      const skip = (page - 1) * limit
      const [messages, total] = await Promise.all([
        Messages.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
        Messages.countDocuments(filter),
      ])
      return json({ messages, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
    }
    if (path.startsWith('contact/') && path.endsWith('/reply') && method === 'PUT') {
      await requireAuth(req)
      const id = path.split('/')[1]
      const doc = await Messages.findByIdAndUpdate(id, { replied: true, updated_at: new Date() }, { new: true })
      if (!doc) return err('Message not found', 404)
      return json(doc)
    }
    if (path.startsWith('contact/') && method === 'GET') {
      await requireAuth(req)
      const doc = await Messages.findById(path.split('/')[1]).lean()
      if (!doc) return err('Message not found', 404)
      return json(doc)
    }
    if (path.startsWith('contact/') && method === 'DELETE') {
      await requireAuth(req)
      const doc = await Messages.findByIdAndDelete(path.split('/')[1])
      if (!doc) return err('Message not found', 404)
      return json({ message: 'Message deleted successfully' })
    }

    // CHAT MESSAGES (session-based — primary live chat)
    if (path === 'chat-messages' && method === 'GET') {
      const sessionId = req.nextUrl.searchParams.get('sessionId')
      if (!sessionId) return err('sessionId is required', 400)
      return json(await ChatMessage.find({ sessionId }).sort({ timestamp: 1 }).lean())
    }
    if (path === 'chat-messages' && method === 'POST') {
      const b = await body(req)
      if (!b.sessionId || !b.sender || !b.text) return err('sessionId, sender, and text are required', 400)
      if (!['user', 'admin'].includes(String(b.sender))) return err("sender must be 'user' or 'admin'", 400)
      if (b.sender === 'admin') {
        const token = getTokenFromRequest(req)
        if (!token || !verifyTokenString(token)) return err('Unauthorized admin message', 401)
      }
      const doc = await ChatMessage.create({
        sessionId: b.sessionId,
        sender: b.sender,
        text: sanitizeText(b.text, 2000),
        name: b.sender === 'admin' ? 'Admin' : sanitizeText(b.name || 'Visitor', 100),
        senderDisplayName: b.sender === 'admin' ? 'Admin' : sanitizeText(b.senderDisplayName || b.name || 'Visitor', 100),
        read: b.sender === 'admin',
        timestamp: new Date(),
        tempId: b.tempId || null,
      })
      const plain = doc.toObject ? doc.toObject() : doc
      void broadcastChatMessage({
        _id: String(plain._id),
        sessionId: plain.sessionId,
        sender: plain.sender,
        text: plain.text,
        name: plain.name,
        senderDisplayName: plain.senderDisplayName,
        timestamp: new Date(plain.timestamp).toISOString(),
        read: plain.read,
        tempId: plain.tempId,
      })
      return json(doc, 201)
    }
    if (path === 'chat-messages/all' && method === 'GET') {
      await requireAuth(req)
      const grouped = await ChatMessage.aggregate([
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: '$sessionId',
            lastMessage: { $first: '$$ROOT' },
            messages: { $push: '$$ROOT' },
            unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$read', false] }, { $eq: ['$sender', 'user'] }] }, 1, 0] } },
          },
        },
      ])
      return json(grouped)
    }

    // CHAT CONVERSATIONS (legacy)
    if (path === 'chat/conversation' && method === 'POST') {
      const b = await body(req)
      if (!b.visitor_name) return err('Visitor name required', 400)
      let conversation = b.visitor_session_id
        ? await ChatConversation.findOne({ visitor_session_id: b.visitor_session_id, status: 'active' })
        : null
      if (!conversation) {
        conversation = await ChatConversation.create({
          visitor_name: sanitizeText(b.visitor_name, 100),
          visitor_session_id: b.visitor_session_id,
          status: 'active',
        })
      }
      return json(conversation)
    }
    if (path === 'chat/conversations' && method === 'GET') {
      await requireAuth(req)
      const status = req.nextUrl.searchParams.get('status')
      const filter = status ? { status } : {}
      return json(await ChatConversation.find(filter).sort({ updated_at: -1 }).lean())
    }
    if (path.match(/^chat\/messages\//) && method === 'GET') {
      const conversationId = path.split('/')[2]
      // Support both sessionId and conversation_id fields
      const messages = await ChatMessage.find({
        $or: [{ sessionId: conversationId }, { conversation_id: conversationId }],
      }).sort({ timestamp: 1, created_at: 1 }).lean()
      return json(messages)
    }
    if (path.match(/^chat\/conversations\/[^/]+\/close$/) && method === 'POST') {
      await requireAuth(req)
      const id = path.split('/')[2]
      const doc = await ChatConversation.findByIdAndUpdate(id, { status: 'closed', updated_at: new Date() }, { new: true })
      if (!doc) return err('Conversation not found', 404)
      return json(doc)
    }
    if (path === 'chat/unread-count' && method === 'GET') {
      await requireAuth(req)
      const count = await ChatMessage.countDocuments({ read: false, sender: 'user' })
      return json({ count })
    }
    if (path === 'chat/stats' && method === 'GET') {
      await requireAuth(req)
      const [totalConversations, activeConversations, totalMessages, unreadMessages] = await Promise.all([
        ChatConversation.countDocuments(),
        ChatConversation.countDocuments({ status: 'active' }),
        ChatMessage.countDocuments(),
        ChatMessage.countDocuments({ read: false, sender: 'user' }),
      ])
      return json({ totalConversations, activeConversations, totalMessages, unreadMessages })
    }

    // SETTINGS
    if (path === 'settings' && method === 'GET') {
      const key = req.nextUrl.searchParams.get('key')
      if (key) {
        const setting = await Settings.findOne({ key }).lean()
        const defaultValue = DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS]
        return json(setting || { key, value: defaultValue ?? null })
      }
      let settings = await Settings.find().lean()
      if (settings.length === 0) {
        await Settings.insertMany(Object.entries(DEFAULT_SETTINGS).map(([k, v]) => ({ key: k, value: String(v) })))
        settings = await Settings.find().lean()
      }
      const obj: Record<string, string> = { ...DEFAULT_SETTINGS }
      settings.forEach((s: any) => { obj[s.key] = s.value })
      return json(obj)
    }
    if (path.startsWith('settings/') && method === 'GET') {
      const key = path.split('/').slice(1).join('/')
      const setting = await Settings.findOne({ key }).lean()
      return json(setting || { key, value: DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS] ?? null })
    }
    if (path === 'settings' && method === 'POST') {
      await requireAuth(req)
      const b = await body(req)
      if (!b.key || b.value === undefined) return err('Key and value required', 400)
      const doc = await Settings.findOneAndUpdate({ key: b.key }, { value: String(b.value), updated_at: new Date() }, { upsert: true, new: true })
      return json(doc)
    }
    if (path.startsWith('settings/') && method === 'PUT') {
      await requireAuth(req)
      const key = path.split('/').slice(1).join('/')
      const b = await body(req)
      if (b.value === undefined) return err('Value required', 400)
      const doc = await Settings.findOneAndUpdate({ key }, { value: String(b.value), updated_at: new Date() }, { upsert: true, new: true })
      return json(doc)
    }
    if (path.startsWith('settings/') && method === 'DELETE') {
      await requireAuth(req)
      const key = path.split('/').slice(1).join('/')
      const doc = await Settings.findOneAndDelete({ key })
      if (!doc) return err('Setting not found', 404)
      return json({ message: 'Setting deleted successfully' })
    }

    // SCHEDULE
    if (path === 'schedule' && method === 'GET') {
      return json(await Schedule.find().sort({ created_at: -1 }).lean())
    }
    if (path.startsWith('schedule/') && method === 'GET') {
      const doc = await Schedule.findById(path.split('/')[1]).lean()
      if (!doc) return err('Schedule not found', 404)
      return json(doc)
    }
    if (path === 'schedule' && method === 'POST') {
      await requireAuth(req)
      return json(await Schedule.create(await body(req)), 201)
    }
    if (path.startsWith('schedule/') && method === 'PUT') {
      await requireAuth(req)
      const doc = await Schedule.findByIdAndUpdate(path.split('/')[1], { ...await body(req), updated_at: new Date() }, { new: true })
      if (!doc) return err('Schedule not found', 404)
      return json(doc)
    }
    if (path.startsWith('schedule/') && method === 'DELETE') {
      await requireAuth(req)
      const doc = await Schedule.findByIdAndDelete(path.split('/')[1])
      if (!doc) return err('Schedule not found', 404)
      return json({ message: 'Schedule deleted successfully' })
    }

    // PRINCIPALS
    if (path === 'principals' && method === 'GET') {
      return json(await Principal.find().sort({ created_at: -1 }).lean())
    }
    if (path.startsWith('principals/') && method === 'GET') {
      const doc = await Principal.findById(path.split('/')[1]).lean()
      if (!doc) return err('Principal not found', 404)
      return json(doc)
    }
    if (path === 'principals' && method === 'POST') {
      await requireAuth(req)
      return json(await Principal.create(await body(req)), 201)
    }
    if (path.startsWith('principals/') && method === 'PUT') {
      await requireAuth(req)
      const doc = await Principal.findByIdAndUpdate(path.split('/')[1], { ...await body(req), updated_at: new Date() }, { new: true })
      if (!doc) return err('Principal not found', 404)
      return json(doc)
    }
    if (path.startsWith('principals/') && method === 'DELETE') {
      await requireAuth(req)
      const doc = await Principal.findByIdAndDelete(path.split('/')[1])
      if (!doc) return err('Principal not found', 404)
      return json({ message: 'Principal deleted successfully' })
    }

    // EVENT GALLERY
    if (path === 'event-gallery' && method === 'GET') {
      return json(await EventGallery.find().sort({ eventDate: -1 }).lean())
    }
    if (path.startsWith('event-gallery/') && path.endsWith('/images') && method === 'POST') {
      await requireAuth(req)
      const id = path.split('/')[1]
      const b = await body(req)
      if (!Array.isArray(b.images)) return err('Images array required', 400)
      const gallery = await EventGallery.findById(id)
      if (!gallery) return err('Gallery not found', 404)
      gallery.images = [...gallery.images, ...b.images]
      await gallery.save()
      return json(gallery)
    }
    if (path.match(/^event-gallery\/[^/]+\/images\/\d+$/) && method === 'DELETE') {
      await requireAuth(req)
      const parts = path.split('/')
      const id = parts[1]
      const index = parseInt(parts[3], 10)
      const gallery = await EventGallery.findById(id)
      if (!gallery) return err('Gallery not found', 404)
      if (index < 0 || index >= gallery.images.length) return err('Invalid image index', 400)
      gallery.images.splice(index, 1)
      await gallery.save()
      return json(gallery)
    }
    if (path.startsWith('event-gallery/') && method === 'GET') {
      const id = path.split('/')[1]
      const doc = await findByIdOrSlug(EventGallery, id)
      if (!doc) return err('Gallery not found', 404)
      return json(doc)
    }
    if (path === 'event-gallery' && method === 'POST') {
      await requireAuth(req)
      const b = await body(req)
      if (!b.title) return err('Title is required', 400)
      return json(await EventGallery.create({ ...b, slug: generateSlug(String(b.title)), images: b.images || [] }), 201)
    }
    if (path.startsWith('event-gallery/') && method === 'PUT') {
      await requireAuth(req)
      const id = path.split('/')[1]
      const b = await body(req)
      if (b.title) b.slug = generateSlug(String(b.title))
      b.updatedAt = new Date()
      const doc = await EventGallery.findByIdAndUpdate(id, b, { new: true })
      if (!doc) return err('Gallery not found', 404)
      return json(doc)
    }
    if (path.startsWith('event-gallery/') && method === 'DELETE') {
      await requireAuth(req)
      const doc = await EventGallery.findByIdAndDelete(path.split('/')[1])
      if (!doc) return err('Gallery not found', 404)
      return json({ message: 'Gallery deleted successfully' })
    }

    // MEDIA
    if (path === 'media' && method === 'GET') {
      const { searchParams } = req.nextUrl
      const category = searchParams.get('category')
      const limit = Number(searchParams.get('limit') || 50)
      const page = Number(searchParams.get('page') || 1)
      const filter: Record<string, string> = {}
      if (category && category !== 'all') filter.category = category
      const skip = (page - 1) * limit
      const [media, total] = await Promise.all([
        Media.find(filter).sort({ uploadedAt: -1 }).skip(skip).limit(limit).lean(),
        Media.countDocuments(filter),
      ])
      return json({ media: media.filter((m: any) => m.url?.trim()), total, page })
    }
    if (path.startsWith('media/') && method === 'GET') {
      const doc = await Media.findById(path.split('/')[1]).lean()
      if (!doc) return err('Media not found', 404)
      return json(doc)
    }
    if (path === 'media' && method === 'POST') {
      await requireAuth(req)
      const b = await body(req)
      if (!b.url || !b.publicId || !b.category) return err('url, publicId, and category are required', 400)
      return json(await Media.create(b), 201)
    }
    if (path.startsWith('media/') && method === 'PUT') {
      await requireAuth(req)
      const doc = await Media.findByIdAndUpdate(path.split('/')[1], await body(req), { new: true })
      if (!doc) return err('Media not found', 404)
      return json(doc)
    }
    if (path.startsWith('media/') && method === 'DELETE') {
      await requireAuth(req)
      const doc = await Media.findById(path.split('/')[1])
      if (!doc) return err('Media not found', 404)
      await deleteCloudinaryImage(doc.publicId)
      await Media.findByIdAndDelete(path.split('/')[1])
      return json({ message: 'Media deleted successfully' })
    }

    // UPLOAD
    if (path === 'upload' && method === 'POST') {
      await requireAuth(req)
      const form = await req.formData()
      const file = form.get('file') as File | null
      if (!file) return err('No file provided', 400)
      if (!file.type.startsWith('image/')) return err('Only image files allowed', 400)
      if (file.size > 10 * 1024 * 1024) return err('File too large (max 10MB)', 400)
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await uploadImageBuffer(buffer)
      return json(result)
    }

    // ADMIN DASHBOARD
    if (path === 'admin/dashboard-stats' && method === 'GET') {
      await requireAuth(req)
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - 7)

      const [
        totalEvents, eventsThisMonth, totalNews, newsThisMonth,
        totalAnnouncements, activeAnnouncements, totalMessages, unreadMessages,
        totalMedia, mediaThisWeek, totalDepartments, totalFaculty, recentActivity,
      ] = await Promise.all([
        Events.countDocuments({ isPublished: true }),
        Events.countDocuments({ isPublished: true, created_at: { $gte: startOfMonth } }),
        News.countDocuments({ isPublished: true }),
        News.countDocuments({ isPublished: true, created_at: { $gte: startOfMonth } }),
        Announcements.countDocuments(),
        Announcements.countDocuments({ active: true }),
        ChatMessage.countDocuments(),
        ChatMessage.countDocuments({ read: false, sender: 'user' }),
        Media.countDocuments(),
        Media.countDocuments({ uploadedAt: { $gte: startOfWeek } }),
        Departments.countDocuments(),
        Faculty.countDocuments(),
        Promise.all([
          Events.find({ isPublished: true }, 'title created_at').sort({ created_at: -1 }).limit(3).lean(),
          News.find({ isPublished: true }, 'title created_at').sort({ created_at: -1 }).limit(3).lean(),
          Media.find({}, 'altText category uploadedAt').sort({ uploadedAt: -1 }).limit(2).lean(),
          ChatMessage.find({ sender: 'user' }, 'senderDisplayName text createdAt').sort({ createdAt: -1 }).limit(2).lean(),
        ]),
      ])

      const [recentEvents, recentNews, recentMedia, recentMsgs] = recentActivity
      const activityItems = [
        ...(recentEvents as any[]).map((e) => ({ type: 'event', label: 'New event created', title: e.title, time: e.created_at })),
        ...(recentNews as any[]).map((n) => ({ type: 'news', label: 'News article published', title: n.title, time: n.created_at })),
        ...(recentMedia as any[]).map((m) => ({ type: 'media', label: `Media uploaded (${m.category})`, title: m.altText || 'New image', time: m.uploadedAt })),
        ...(recentMsgs as any[]).map((m) => ({ type: 'message', label: 'New message received', title: `From ${m.senderDisplayName}: ${m.text.substring(0, 40)}...`, time: m.createdAt })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)

      return json({
        stats: {
          events: { total: totalEvents, thisMonth: eventsThisMonth },
          news: { total: totalNews, thisMonth: newsThisMonth },
          announcements: { total: totalAnnouncements, active: activeAnnouncements },
          messages: { total: totalMessages, unread: unreadMessages },
          media: { total: totalMedia, thisWeek: mediaThisWeek },
          departments: { total: totalDepartments },
          faculty: { total: totalFaculty },
        },
        recentActivity: activityItems,
      })
    }

    return err('Route not found', 404)
  } catch (error: unknown) {
    if (error instanceof AuthError) return err(error.message, error.status)
    const e = error as { status?: number; message?: string }
    if (e.status === 401) return err(e.message || 'Unauthorized', 401)
    console.error('API dispatch error:', path, error)
    return err(e.message || 'Internal server error', e.status || 500)
  }
}
