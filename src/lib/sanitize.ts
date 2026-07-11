/** Sanitize user input — no external DOM dependency for Vercel/serverless compatibility */

export function sanitizeText(input: unknown, maxLength = 10000): string {
  if (input == null) return ''
  const str = String(input).trim().slice(0, maxLength)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function sanitizeHtml(input: unknown, maxLength = 50000): string {
  if (input == null) return ''
  return sanitizeText(input, maxLength)
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const clean = {} as T
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      clean[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T]
    } else if (typeof value === 'string') {
      clean[key as keyof T] = sanitizeText(value) as T[keyof T]
    } else {
      clean[key as keyof T] = value as T[keyof T]
    }
  }
  return clean
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

export function isObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
