export interface ChatMessageLike {
  _id?: string;
  id?: string;
  sessionId: string;
  sender: 'user' | 'admin';
  text: string;
  name?: string;
  senderDisplayName?: string;
  timestamp: string;
  read: boolean;
  tempId?: string;
}

export interface AdminChatConversationLike {
  sessionId: string;
  messages: ChatMessageLike[];
  lastMessage?: ChatMessageLike;
  unreadCount: number;
  visitorName: string;
}

export function normalizeAdminChatConversations<T extends Record<string, any>>(payload: T[]): AdminChatConversationLike[] {
  return payload.map((item) => ({
    sessionId: item.sessionId || item._id,
    messages: Array.isArray(item.messages) ? item.messages : [],
    lastMessage: item.lastMessage,
    unreadCount: Number(item.unreadCount || 0),
    visitorName: item.visitorName || item.lastMessage?.senderDisplayName || item.lastMessage?.name || 'Visitor',
  }));
}

export function mergeChatMessages<T extends ChatMessageLike>(
  existingMessages: T[],
  incomingMessages: T[]
): T[] {
  const byIdentity = new Map<string, T>();

  const getIdentity = (message: T) => {
    // Prioritize tempId to link optimistic + persisted versions
    if (message.tempId) return message.tempId;
    const explicitId = message._id || message.id;
    if (explicitId) return explicitId;
    return `${message.sessionId}-${message.timestamp}`;
  };

  for (const message of [...existingMessages, ...incomingMessages]) {
    const key = getIdentity(message);
    if (!key) continue;

    const current = byIdentity.get(key);
    const messageTime = new Date(message.timestamp).getTime();
    const currentTime = current ? new Date(current.timestamp).getTime() : Number.NEGATIVE_INFINITY;

    if (!current || messageTime >= currentTime) {
      byIdentity.set(key, message);
    }
  }

  return Array.from(byIdentity.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
