'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { ChatMessagePayload, ServerEvent } from '@/lib/chat-realtime/protocol'

type Options = {
  sessionId?: string | null
  role: 'visitor' | 'admin'
  enabled?: boolean
  onMessage?: (message: ChatMessagePayload) => void
  onTyping?: (sessionId: string, isTyping: boolean, sender: 'user' | 'admin') => void
  onConversationUpdate?: (sessionId: string) => void
  onConnectionChange?: (connected: boolean) => void
}

function getWsUrl(): string {
  if (typeof window === 'undefined') return ''
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/api/ws`
}

function isWebSocketSupported(): boolean {
  if (typeof window === 'undefined') return false
  if (process.env.NEXT_PUBLIC_ENABLE_WS === 'true') return true
  if (process.env.NEXT_PUBLIC_ENABLE_WS === 'false') return false
  // /api/ws requires Vercel runtime — plain `next dev` cannot upgrade WebSockets.
  if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
    return false
  }
  return true
}

export function useChatRealtime(options: Options) {
  const {
    sessionId,
    role,
    enabled = true,
    onMessage,
    onTyping,
    onConversationUpdate,
    onConnectionChange,
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectDelay = useRef(1000)
  const reconnectTimer = useRef<number | null>(null)
  const mountedRef = useRef(true)

  const sendTyping = useCallback(
    (targetSessionId: string, isTyping: boolean, sender: 'user' | 'admin') => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      ws.send(
        JSON.stringify({
          type: 'typing',
          sessionId: targetSessionId,
          isTyping,
          sender,
        }),
      )
    },
    [],
  )

  useEffect(() => {
    mountedRef.current = true
    if (!enabled || typeof window === 'undefined') return

    if (!isWebSocketSupported()) {
      onConnectionChange?.(false)
      return
    }

    const connect = () => {
      if (!mountedRef.current) return
      if (wsRef.current?.readyState === WebSocket.OPEN) return

      try {
        const ws = new WebSocket(getWsUrl())
        wsRef.current = ws

        ws.addEventListener('open', () => {
          reconnectDelay.current = 1000
          onConnectionChange?.(true)
          ws.send(
            JSON.stringify({
              type: 'join',
              role,
              sessionId: role === 'visitor' ? sessionId : undefined,
            }),
          )
        })

        ws.addEventListener('message', (event) => {
          let payload: ServerEvent
          try {
            payload = JSON.parse(String(event.data))
          } catch {
            return
          }

          switch (payload.type) {
            case 'message':
              onMessage?.(payload.message)
              break
            case 'typing':
              onTyping?.(payload.sessionId, payload.isTyping, payload.sender)
              break
            case 'conversation_update':
              onConversationUpdate?.(payload.sessionId)
              break
          }
        })

        ws.addEventListener('close', () => {
          onConnectionChange?.(false)
          wsRef.current = null
          if (!mountedRef.current) return
          reconnectTimer.current = window.setTimeout(() => {
            reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30_000)
            connect()
          }, reconnectDelay.current)
        })

        ws.addEventListener('error', () => {
          ws.close()
        })
      } catch {
        onConnectionChange?.(false)
      }
    }

    connect()

    return () => {
      mountedRef.current = false
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [enabled, role, sessionId, onMessage, onTyping, onConversationUpdate, onConnectionChange])

  // Re-join when visitor session changes
  useEffect(() => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    if (role !== 'visitor' || !sessionId) return
    ws.send(JSON.stringify({ type: 'join', role: 'visitor', sessionId }))
  }, [role, sessionId])

  return { sendTyping }
}
