const API_URL = '/api'

interface DashboardStatsResponse {
  stats: Record<string, unknown>
  recentActivity: unknown[]
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/admin/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error?.error || `API Error: ${response.statusText}`)
  }

  return response.json()
}

export const requestAdminLoginOtp = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  })
  const data = await response.json().catch(() => ({ error: 'Login failed' }))
  if (!response.ok) throw new Error(data?.error || 'Invalid credentials')
  return data as {
    requiresOtp: boolean
    message: string
    emailSent: boolean
    expiresInSeconds: number
    devOtp?: string
  }
}

export const verifyAdminLoginOtp = async (email: string, otp: string) => {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
    credentials: 'include',
  })
  const data = await response.json().catch(() => ({ error: 'Verification failed' }))
  if (!response.ok) throw new Error(data?.error || 'Invalid verification code')
  if (data.admin?.email) sessionStorage.setItem('admin_email', data.admin.email)
  return data
}

/** @deprecated Prefer requestAdminLoginOtp + verifyAdminLoginOtp (OTP login). */
export const loginAdmin = async (email: string, password: string) => {
  return requestAdminLoginOtp(email, password)
}

export const logout = async () => {
  sessionStorage.removeItem('admin_email')
  try {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
  } catch (error) {
    console.error('Logout error:', error)
  }
}

export const verifyAuth = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, { credentials: 'include' })
    if (response.ok) {
      const data = await response.json()
      if (data.valid) {
        if (data.admin?.email) sessionStorage.setItem('admin_email', data.admin.email)
        return true
      }
    }
    return false
  } catch {
    return false
  }
}

export const getAdminEmail = () =>
  typeof window !== 'undefined' ? sessionStorage.getItem('admin_email') || 'Admin' : 'Admin'

export const getNews = () => apiCall('/news')
export const getNewsById = (id: string) => apiCall(`/news/${id}`)
export const createNews = (data: unknown) => apiCall('/news', { method: 'POST', body: JSON.stringify(data) })
export const updateNews = (id: string, data: unknown) => apiCall(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteNews = (id: string) => apiCall(`/news/${id}`, { method: 'DELETE' })

export const getEvents = () => apiCall('/events')
export const getEventById = (id: string) => apiCall(`/events/${id}`)
export const getEventBySlug = (slug: string) => apiCall(`/events/${slug}`)
export const createEvent = (data: unknown) => apiCall('/events', { method: 'POST', body: JSON.stringify(data) })
export const updateEvent = (id: string, data: unknown) => apiCall(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteEvent = (id: string) => apiCall(`/events/${id}`, { method: 'DELETE' })

export const getFaculty = () => apiCall('/faculty')
export const getFacultyById = (id: string) => apiCall(`/faculty/${id}`)
export const createFaculty = (data: unknown) => apiCall('/faculty', { method: 'POST', body: JSON.stringify(data) })
export const updateFaculty = (id: string, data: unknown) => apiCall(`/faculty/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteFaculty = (id: string) => apiCall(`/faculty/${id}`, { method: 'DELETE' })

export const getGallery = () => apiCall('/gallery')
export const getGalleryById = (id: string) => apiCall(`/gallery/${id}`)
export const createGallery = (data: unknown) => apiCall('/gallery', { method: 'POST', body: JSON.stringify(data) })
export const updateGallery = (id: string, data: unknown) => apiCall(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteGallery = (id: string) => apiCall(`/gallery/${id}`, { method: 'DELETE' })

export const getMessages = () => apiCall('/messages')
export const getMessageById = (id: string) => apiCall(`/messages/${id}`)
export const createMessage = (data: unknown) => apiCall('/messages', { method: 'POST', body: JSON.stringify(data) })
export const markMessageAsReplied = (id: string) => apiCall(`/messages/${id}/reply`, { method: 'PUT', body: JSON.stringify({}) })
export const deleteMessage = (id: string) => apiCall(`/messages/${id}`, { method: 'DELETE' })

export const getAnnouncements = () => apiCall('/announcements')
export const getAnnouncementById = (id: string) => apiCall(`/announcements/${id}`)
export const createAnnouncement = (data: unknown) => apiCall('/announcements', { method: 'POST', body: JSON.stringify(data) })
export const updateAnnouncement = (id: string, data: unknown) => apiCall(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteAnnouncement = (id: string) => apiCall(`/announcements/${id}`, { method: 'DELETE' })

export const getDepartments = () => apiCall('/departments')
export const getDepartmentById = (id: string) => apiCall(`/departments/${id}`)
export const createDepartment = (data: unknown) => apiCall('/departments', { method: 'POST', body: JSON.stringify(data) })
export const updateDepartment = (id: string, data: unknown) => apiCall(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteDepartment = (id: string) => apiCall(`/departments/${id}`, { method: 'DELETE' })

export const getPrograms = () => apiCall('/programs')
export const getProgramById = (id: string) => apiCall(`/programs/${id}`)
export const getProgramsByDepartment = (departmentId: string) => apiCall(`/departments/${departmentId}/programs`)
export const createProgram = (data: unknown) => apiCall('/programs', { method: 'POST', body: JSON.stringify(data) })
export const updateProgram = (id: string, data: unknown) => apiCall(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteProgram = (id: string) => apiCall(`/programs/${id}`, { method: 'DELETE' })

export const getPages = () => apiCall('/pages')
export const getPageBySlug = (slug: string) => apiCall(`/pages/${slug}`)
export const createPage = (data: unknown) => apiCall('/pages', { method: 'POST', body: JSON.stringify(data) })
export const updatePage = (slug: string, data: unknown) => apiCall(`/pages/${slug}`, { method: 'PUT', body: JSON.stringify(data) })
export const deletePage = (slug: string) => apiCall(`/pages/${slug}`, { method: 'DELETE' })

export const uploadImage = async (file: File): Promise<{ url: string; publicId: string }> => {
  const { uploadToCloudinary } = await import('@/lib/cloudinary-client')
  return uploadToCloudinary(file)
}

export const getOrCreateChatConversation = (visitorName: string) =>
  apiCall('/chat/conversation', { method: 'POST', body: JSON.stringify({ visitor_name: visitorName }) })

export const getChatMessages = (conversationId: string) => apiCall(`/chat/messages/${conversationId}`)
export const getChatConversations = (status?: string) => apiCall(`/chat/conversations${status ? `?status=${status}` : ''}`)
export const closeChatConversation = (conversationId: string) =>
  apiCall(`/chat/conversations/${conversationId}/close`, { method: 'POST', body: JSON.stringify({}) })
export const getUnreadChatCount = () => apiCall('/chat/unread-count')
export const getChatStats = () => apiCall('/chat/stats')

export const getSchedule = () => apiCall('/schedule')
export const getScheduleById = (id: string) => apiCall(`/schedule/${id}`)
export const createSchedule = (data: unknown) => apiCall('/schedule', { method: 'POST', body: JSON.stringify(data) })
export const updateSchedule = (id: string, data: unknown) => apiCall(`/schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteSchedule = (id: string) => apiCall(`/schedule/${id}`, { method: 'DELETE' })

export const getPrincipals = () => apiCall('/principals')
export const getPrincipalById = (id: string) => apiCall(`/principals/${id}`)
export const createPrincipal = (data: unknown) => apiCall('/principals', { method: 'POST', body: JSON.stringify(data) })
export const updatePrincipal = (id: string, data: unknown) => apiCall(`/principals/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deletePrincipal = (id: string) => apiCall(`/principals/${id}`, { method: 'DELETE' })

export const getEventGalleries = () => apiCall('/event-gallery')
export const getEventGalleryById = (id: string) => apiCall(`/event-gallery/${id}`)
export const createEventGallery = (data: unknown) => apiCall('/event-gallery', { method: 'POST', body: JSON.stringify(data) })
export const updateEventGallery = (id: string, data: unknown) => apiCall(`/event-gallery/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteEventGallery = (id: string) => apiCall(`/event-gallery/${id}`, { method: 'DELETE' })
export const addImagesToGallery = (id: string, images: unknown[]) =>
  apiCall(`/event-gallery/${id}/images`, { method: 'POST', body: JSON.stringify({ images }) })
export const removeImageFromGallery = (id: string, imageIndex: number) =>
  apiCall(`/event-gallery/${id}/images/${imageIndex}`, { method: 'DELETE' })

export const getSettings = () => apiCall('/settings')
export const getDashboardStats = () => apiCall<DashboardStatsResponse>('/admin/dashboard-stats')

export const getMedia = (category?: string, page = 1) =>
  apiCall(`/media?${category ? `category=${category}&` : ''}page=${page}`)
