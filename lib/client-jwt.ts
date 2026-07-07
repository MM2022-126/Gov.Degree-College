// Client-side JWT utility for managing tokens in localStorage

export const JWT_TOKEN_KEY = 'admin_token'

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(JWT_TOKEN_KEY, token)
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(JWT_TOKEN_KEY)
  }
  return null
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(JWT_TOKEN_KEY)
  }
}

export function isTokenValid(): boolean {
  const token = getToken()
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiresIn = payload.exp * 1000
    return Date.now() < expiresIn
  } catch (error) {
    return false
  }
}

export function getAuthHeader(): { Authorization: string } | {} {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
