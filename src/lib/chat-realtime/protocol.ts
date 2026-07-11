export type ChatRole = 'visitor' | 'admin'

export type ChatMessagePayload = {
  _id?: string
  id?: string
  sessionId: string
  sender: 'user' | 'admin'
  text: string
  name?: string
  senderDisplayName?: string
  timestamp: string
  read: boolean
  tempId?: string | null
}

export type ClientEvent =
  | { type: 'join'; sessionId?: string; role: ChatRole }
  | { type: 'typing'; sessionId: string; isTyping: boolean; sender: 'user' | 'admin' }

export type ServerEvent =
  | { type: 'message'; message: ChatMessagePayload }
  | { type: 'typing'; sessionId: string; isTyping: boolean; sender: 'user' | 'admin' }
  | { type: 'conversation_update'; sessionId: string }

export const CHAT_STREAM = 'ggc:chat:events'
export const STREAM_MAXLEN = 500
