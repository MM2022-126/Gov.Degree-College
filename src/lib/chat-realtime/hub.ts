import type { WebSocket } from 'ws'
import type Redis from 'ioredis'
import { fieldsToObject, redis } from '@/lib/redis'
import type { ChatMessagePayload, ChatRole, ClientEvent, ServerEvent } from './protocol'
import { CHAT_STREAM, STREAM_MAXLEN } from './protocol'

type Conn = {
  connectionId: string
  role: ChatRole | null
  sessionId: string | null
}

type StreamPayload =
  | { kind: 'message'; message: ChatMessagePayload }
  | { kind: 'typing'; sessionId: string; isTyping: boolean; sender: 'user' | 'admin' }
  | { kind: 'conversation_update'; sessionId: string }

type Hub = {
  instanceId: string
  conns: Map<WebSocket, Conn>
  lastStreamId: string
  streamClient: Redis | null
  streaming: boolean
}

const globalForHub = globalThis as unknown as { __ggcChatHub?: Hub }

const hub: Hub =
  globalForHub.__ggcChatHub ??
  (globalForHub.__ggcChatHub = {
    instanceId: crypto.randomUUID(),
    conns: new Map(),
    lastStreamId: '0-0',
    streamClient: null,
    streaming: false,
  })

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const BLOCK_MS = 5_000

function parseJson<T>(value: unknown): T | null {
  try {
    const obj = typeof value === 'string' ? JSON.parse(value) : value
    return obj && typeof obj === 'object' ? (obj as T) : null
  } catch {
    return null
  }
}

function send(ws: WebSocket, event: ServerEvent): void {
  if (ws.readyState !== 1) return
  try {
    ws.send(JSON.stringify(event))
  } catch {
    /* best-effort */
  }
}

function shouldReceive(conn: Conn, sessionId: string): boolean {
  if (conn.role === 'admin') return true
  if (conn.role === 'visitor' && conn.sessionId === sessionId) return true
  return false
}

function broadcastLocal(event: ServerEvent, sessionId?: string): void {
  for (const [ws, conn] of hub.conns.entries()) {
    if (!conn.role) continue
    if (event.type === 'message' || event.type === 'typing' || event.type === 'conversation_update') {
      const sid = sessionId ?? ('sessionId' in event ? event.sessionId : event.message?.sessionId)
      if (sid && !shouldReceive(conn, sid)) continue
    }
    send(ws, event)
  }
}

async function publishStream(payload: StreamPayload): Promise<void> {
  if (!redis) return
  try {
    await redis.xadd(
      CHAT_STREAM,
      'MAXLEN',
      '~',
      STREAM_MAXLEN,
      '*',
      'd',
      JSON.stringify(payload),
      'o',
      hub.instanceId,
    )
  } catch (err) {
    console.error('[chat] stream publish failed', err)
  }
}

async function runReadLoop(): Promise<void> {
  const client = hub.streamClient
  if (!client) return

  while (hub.streaming) {
    try {
      const res = (await client.xread(
        'BLOCK',
        BLOCK_MS,
        'STREAMS',
        CHAT_STREAM,
        hub.lastStreamId,
      )) as Array<[string, Array<[string, string[]]>]> | null

      if (!res) continue

      for (const [, entries] of res) {
        for (const [id, flat] of entries) {
          hub.lastStreamId = id
          const fields = fieldsToObject(flat)
          if (fields.o === hub.instanceId) continue

          const payload = parseJson<StreamPayload>(fields.d)
          if (!payload) continue

          if (payload.kind === 'message') {
            broadcastLocal({ type: 'message', message: payload.message }, payload.message.sessionId)
          } else if (payload.kind === 'typing') {
            broadcastLocal(
              {
                type: 'typing',
                sessionId: payload.sessionId,
                isTyping: payload.isTyping,
                sender: payload.sender,
              },
              payload.sessionId,
            )
          } else if (payload.kind === 'conversation_update') {
            broadcastLocal({ type: 'conversation_update', sessionId: payload.sessionId }, payload.sessionId)
          }
        }
      }
    } catch (err) {
      if (!hub.streaming) break
      console.error('[chat] read loop failed', err)
      await sleep(1_000)
    }
  }
}

async function startStream(): Promise<void> {
  if (hub.streaming || !redis) return

  hub.streamClient = redis.duplicate()
  hub.streaming = true

  try {
    const tail = await redis.xrevrange(CHAT_STREAM, '+', '-', 'COUNT', 1)
    hub.lastStreamId = tail[0]?.[0] ?? '0-0'
  } catch {
    hub.lastStreamId = '0-0'
  }

  void runReadLoop()
}

function stopStream(): void {
  hub.streaming = false
  if (hub.streamClient) {
    void hub.streamClient.quit().catch(() => {})
    hub.streamClient = null
  }
}

export function register(ws: WebSocket): void {
  hub.conns.set(ws, {
    connectionId: crypto.randomUUID(),
    role: null,
    sessionId: null,
  })
  void startStream()
}

export async function join(
  ws: WebSocket,
  sessionId: string | undefined,
  role: ChatRole,
): Promise<void> {
  const conn = hub.conns.get(ws)
  if (!conn) return

  conn.role = role
  conn.sessionId = role === 'visitor' ? (sessionId?.slice(0, 128) || null) : null

  if (role === 'visitor' && !conn.sessionId) {
    send(ws, { type: 'conversation_update', sessionId: '' })
  }
}

export async function handleTyping(
  ws: WebSocket,
  sessionId: string,
  isTyping: boolean,
  sender: 'user' | 'admin',
): Promise<void> {
  const conn = hub.conns.get(ws)
  if (!conn?.role) return

  const sid = sessionId.slice(0, 128)
  broadcastLocal({ type: 'typing', sessionId: sid, isTyping, sender }, sid)
  await publishStream({ kind: 'typing', sessionId: sid, isTyping, sender })
}

export async function unregister(ws: WebSocket): Promise<void> {
  hub.conns.delete(ws)
  if (hub.conns.size === 0) stopStream()
}

/** Called from REST API after a message is saved to MongoDB. */
export async function broadcastChatMessage(message: ChatMessagePayload): Promise<void> {
  const normalized: ChatMessagePayload = {
    ...message,
    timestamp:
      typeof message.timestamp === 'string'
        ? message.timestamp
        : new Date(message.timestamp as unknown as Date).toISOString(),
  }

  broadcastLocal({ type: 'message', message: normalized }, normalized.sessionId)
  broadcastLocal({ type: 'conversation_update', sessionId: normalized.sessionId }, normalized.sessionId)
  await publishStream({ kind: 'message', message: normalized })
  await publishStream({ kind: 'conversation_update', sessionId: normalized.sessionId })
}

export function dispatchClientEvent(ws: WebSocket, event: ClientEvent): void {
  switch (event.type) {
    case 'join':
      void join(ws, event.sessionId, event.role)
      break
    case 'typing':
      void handleTyping(ws, event.sessionId, event.isTyping, event.sender)
      break
  }
}

export function parseClientEvent(raw: string): ClientEvent | null {
  try {
    const event = JSON.parse(raw) as ClientEvent
    if (!event?.type) return null
    return event
  } catch {
    return null
  }
}
