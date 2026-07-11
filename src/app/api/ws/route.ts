import { experimental_upgradeWebSocket, type WebSocketData } from '@vercel/functions'
import { dispatchClientEvent, parseClientEvent, register, unregister } from '@/lib/chat-realtime/hub'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    register(ws)

    ws.on('message', (data: WebSocketData) => {
      const event = parseClientEvent(data.toString())
      if (event) dispatchClientEvent(ws, event)
    })

    const close = () => void unregister(ws)
    ws.on('close', close)
    ws.on('error', close)
  })
}
