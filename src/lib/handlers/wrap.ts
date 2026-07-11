import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/auth'
import { jsonOk, jsonError } from '@/lib/route-utils'

type Handler = () => Promise<unknown>
type HandlerWithReq = (req: NextRequest) => Promise<unknown>

function handleResult(result: unknown, status = 200) {
  if (result instanceof NextResponse) return result
  return jsonOk(result, status)
}

function handleError(error: unknown) {
  if (error instanceof AuthError) return jsonError(error.message, error.status)
  const err = error as { status?: number; message?: string }
  const status = err.status || 500
  const message = err.message || 'Internal server error'
  if (status >= 500) console.error('Handler error:', error)
  return jsonError(message, status)
}

export async function runHandler(handler: Handler | HandlerWithReq, req?: NextRequest) {
  try {
    const result = req ? await (handler as HandlerWithReq)(req) : await (handler as Handler)()
    return handleResult(result)
  } catch (error) {
    return handleError(error)
  }
}

export async function runHandlerCreated(handler: Handler | HandlerWithReq, req?: NextRequest) {
  try {
    const result = req ? await (handler as HandlerWithReq)(req) : await (handler as Handler)()
    return handleResult(result, 201)
  } catch (error) {
    return handleError(error)
  }
}
