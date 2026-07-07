import { getToken, saveToken, removeToken } from '@/lib/client-jwt'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
  requiresAuth: boolean = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const options: RequestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (requiresAuth) {
    const token = getToken()
    if (!token) {
      throw new Error('Not authenticated')
    }
    options.headers!['Authorization'] = `Bearer ${token}`
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  if (response.status === 401) {
    removeToken()
    window.location.href = '/admin/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

// Auth API
export async function loginAdmin(email: string, password: string) {
  const data = await apiRequest('/auth/login', 'POST', { email, password })
  saveToken(data.token)
  return data
}

export function logout() {
  removeToken()
}

// News API
export async function getNews() {
  return apiRequest('/news', 'GET')
}

export async function createNews(payload: unknown) {
  return apiRequest('/news', 'POST', payload, true)
}

export async function updateNews(id: string, payload: unknown) {
  return apiRequest(`/news/${id}`, 'PUT', payload, true)
}

export async function deleteNews(id: string) {
  return apiRequest(`/news/${id}`, 'DELETE', undefined, true)
}

// Events API
export async function getEvents() {
  return apiRequest('/events', 'GET')
}

export async function createEvent(payload: unknown) {
  return apiRequest('/events', 'POST', payload, true)
}

export async function updateEvent(id: string, payload: unknown) {
  return apiRequest(`/events/${id}`, 'PUT', payload, true)
}

export async function deleteEvent(id: string) {
  return apiRequest(`/events/${id}`, 'DELETE', undefined, true)
}

// Faculty API
export async function getFaculty() {
  return apiRequest('/faculty', 'GET')
}

export async function createFaculty(payload: unknown) {
  return apiRequest('/faculty', 'POST', payload, true)
}

export async function updateFaculty(id: string, payload: unknown) {
  return apiRequest(`/faculty/${id}`, 'PUT', payload, true)
}

export async function deleteFaculty(id: string) {
  return apiRequest(`/faculty/${id}`, 'DELETE', undefined, true)
}

// Gallery API
export async function getGallery() {
  return apiRequest('/gallery', 'GET')
}

export async function createGalleryItem(payload: unknown) {
  return apiRequest('/gallery', 'POST', payload, true)
}

export async function deleteGalleryItem(id: string) {
  return apiRequest(`/gallery/${id}`, 'DELETE', undefined, true)
}

// Messages API
export async function getMessages() {
  return apiRequest('/messages', 'GET', undefined, true)
}

export async function createMessage(payload: unknown) {
  return apiRequest('/messages', 'POST', payload)
}

export async function markMessageAsReplied(id: string) {
  return apiRequest(`/messages/${id}/reply`, 'PUT', {}, true)
}

export async function deleteMessage(id: string) {
  return apiRequest(`/messages/${id}`, 'DELETE', undefined, true)
}

// Upload API
export async function uploadImage(file: File) {
  const token = getToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  return response.json()
}

// Announcements API
export async function getAnnouncements() {
  return apiRequest('/announcements', 'GET')
}

export async function createAnnouncement(payload: unknown) {
  return apiRequest('/announcements', 'POST', payload, true)
}

export async function updateAnnouncement(id: string, payload: unknown) {
  return apiRequest(`/announcements/${id}`, 'PUT', payload, true)
}

export async function deleteAnnouncement(id: string) {
  return apiRequest(`/announcements/${id}`, 'DELETE', undefined, true)
}

// Departments API
export async function getDepartments() {
  return apiRequest('/departments', 'GET')
}

export async function createDepartment(payload: unknown) {
  return apiRequest('/departments', 'POST', payload, true)
}

export async function updateDepartment(id: string, payload: unknown) {
  return apiRequest(`/departments/${id}`, 'PUT', payload, true)
}

export async function deleteDepartment(id: string) {
  return apiRequest(`/departments/${id}`, 'DELETE', undefined, true)
}

// Programs API
export async function getPrograms() {
  return apiRequest('/programs', 'GET')
}

export async function createProgram(payload: unknown) {
  return apiRequest('/programs', 'POST', payload, true)
}

export async function updateProgram(id: string, payload: unknown) {
  return apiRequest(`/programs/${id}`, 'PUT', payload, true)
}

export async function deleteProgram(id: string) {
  return apiRequest(`/programs/${id}`, 'DELETE', undefined, true)
}
