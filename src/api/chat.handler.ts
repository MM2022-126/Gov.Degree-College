// Backend Chat API Handlers
// Copy this to your backend/api/chat.handler.ts

// Imports for production use (uncomment when moving to backend):
// import ChatConversation from "@/models/ChatConversation";
// import ChatMessage from "@/models/ChatMessage";
// import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";

interface IChatConversation {
  _id: string;
  visitor_name: string;
  visitor_session_id: string;
  status: "active" | "closed";
  created_at: Date;
  updated_at: Date;
}

interface IChatMessage {
  _id: string;
  conversation_id: string;
  sender_type: "visitor" | "admin" | "system";
  sender_name: string;
  message: string;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get or create a chat conversation for a visitor
 * GET /api/chat/conversation?sessionId=xxx
 * POST /api/chat/conversation
 */
export async function handleGetOrCreateConversation(
  sessionId: string,
  visitorName?: string
): Promise<IChatConversation> {
  // In production:
  // Check for existing active conversation
  // const existing = await ChatConversation.findOne({
  //   visitor_session_id: sessionId,
  //   status: "active",
  // }).sort({ created_at: -1 });
  //
  // if (existing) return existing;
  //
  // If creating new (visitorName provided):
  // if (visitorName) {
  //   return await ChatConversation.create({
  //     visitor_name: visitorName,
  //     visitor_session_id: sessionId,
  //     status: "active",
  //   });
  // }

  // Mock response for frontend integration
  return {
    _id: "mock-conv-" + Date.now(),
    visitor_name: visitorName || "Guest",
    visitor_session_id: sessionId,
    status: "active",
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/**
 * Get chat messages for a conversation
 * GET /api/chat/messages/:conversationId
 */
export async function handleGetMessages(conversationId: string, limit: number = 50): Promise<IChatMessage[]> {
  // In production:
  // return await ChatMessage.find({
  //   conversation_id: conversationId,
  // })
  //   .sort({ created_at: 1 })
  //   .limit(limit);

  // Mock response
  return [];
}

/**
 * Close a conversation
 * POST /api/chat/conversations/:conversationId/close
 */
export async function handleCloseConversation(conversationId: string): Promise<IChatConversation> {
  // In production:
  // return await ChatConversation.findByIdAndUpdate(
  //   conversationId,
  //   { status: "closed" },
  //   { new: true }
  // );

  // Mock response
  return {
    _id: conversationId,
    visitor_name: "Guest",
    visitor_session_id: "xxx",
    status: "closed",
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/**
 * Get conversations list (for admin)
 * GET /api/chat/conversations
 * Requires JWT token
 */
export async function handleGetConversations(
  status?: "active" | "closed",
  limit: number = 20
): Promise<IChatConversation[]> {
  // In production with JWT verification:
  // const token = extractTokenFromHeader(req);
  // const decoded = verifyToken(token);
  // if (!decoded) throw new Error("Unauthorized");
  //
  // const query: any = {};
  // if (status) query.status = status;
  //
  // return await ChatConversation.find(query)
  //   .sort({ updated_at: -1 })
  //   .limit(limit);

  // Mock response
  return [];
}

/**
 * Get unread message count for conversation
 * GET /api/chat/conversations/:conversationId/unread
 */
export async function handleGetUnreadCount(conversationId: string): Promise<number> {
  // In production:
  // return await ChatMessage.countDocuments({
  //   conversation_id: conversationId,
  //   sender_type: "admin",
  //   read_at: null,
  // });

  // Mock response
  return 0;
}

/**
 * Get conversation statistics (for admin dashboard)
 * GET /api/chat/stats
 * Requires JWT token
 */
export async function handleGetChatStats(): Promise<{
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
}> {
  // In production:
  // const total = await ChatConversation.countDocuments();
  // const active = await ChatConversation.countDocuments({ status: "active" });
  // const messages = await ChatMessage.countDocuments();
  //
  // return { totalConversations: total, activeConversations: active, totalMessages: messages };

  // Mock response
  return {
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
  };
}

// Export all handlers
export const chatHandlers = {
  handleGetOrCreateConversation,
  handleGetMessages,
  handleCloseConversation,
  handleGetConversations,
  handleGetUnreadCount,
  handleGetChatStats,
};
