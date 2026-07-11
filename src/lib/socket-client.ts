// Real-time chat uses native WebSockets via /api/ws (Vercel Fluid compute).
// Legacy Socket.io API surface — kept for useSocket hook compatibility.

import type { ChatMessagePayload } from '@/lib/chat-realtime/protocol'

type Listener = (data: unknown) => void

const listeners: {
  message: Set<Listener>
  typing: Set<Listener>
  read: Set<Listener>
  conversation: Set<Listener>
} = {
  message: new Set(),
  typing: new Set(),
  read: new Set(),
  conversation: new Set(),
}

/** @deprecated Prefer useChatRealtime hook — returns null on Vercel WebSocket setup */
export const getSocket = () => null as any

export const joinConversation = (_conversationId: string) => {}

export const leaveConversation = (_conversationId: string) => {}

export const sendMessage = (_conversationId: string, _message: string, _senderType: 'visitor' | 'admin', _senderName: string) => {}

export const sendTyping = (_conversationId: string, _isTyping: boolean, _sender: 'visitor' | 'admin') => {}

export const markAsRead = (_conversationId: string, _messageIds: string[]) => {}

export const onNewMessage = (callback: (message: ChatMessagePayload) => void) => {
  listeners.message.add(callback as Listener)
  return () => listeners.message.delete(callback as Listener)
}

export const onUserTyping = (callback: (data: { isTyping: boolean; senderType?: string }) => void) => {
  listeners.typing.add(callback as Listener)
  return () => listeners.typing.delete(callback as Listener)
}

export const onMessagesRead = (callback: (data: { messageIds: string[] }) => void) => {
  listeners.read.add(callback as Listener)
  return () => listeners.read.delete(callback as Listener)
}

export const onConversationUpdated = (callback: (data: unknown) => void) => {
  listeners.conversation.add(callback as Listener)
  return () => listeners.conversation.delete(callback as Listener)
}

export const disconnectSocket = () => {}
