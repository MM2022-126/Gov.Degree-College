import { getApiBaseUrl } from "./api-url";

const API_URL = getApiBaseUrl();

// Helper function for API calls with credentials
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Send cookies with every request
  });

  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error?.error || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// ============ AUTH ============
export const loginAdmin = async (email: string, password: string) => {
  // Browser automatically handles the HttpOnly cookie via credentials: 'include'
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Allow browser to send and receive cookies
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Login failed" }));
    throw new Error(error?.error || "Invalid credentials");
  }

  return response.json();
};

export const logout = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const verifyAuth = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "GET",
      credentials: "include", // Send the authentication cookie
    });

    if (response.ok) {
      const data = await response.json();
      if (data.valid) {
        // Store admin email in sessionStorage for later use
        if (data.admin?.email) {
          sessionStorage.setItem("admin_email", data.admin.email);
        }
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Auth verification error:", error);
    return false;
  }
};

// Get the authenticated admin's email
export const getAdminEmail = () => {
  return sessionStorage.getItem("admin_email") || "Admin";
};

// ============ NEWS ============
export const getNews = () => apiCall("/news");
export const getNewsById = (id: string) => apiCall(`/news/${id}`);
export const createNews = (data: any) => apiCall("/news", { method: "POST", body: JSON.stringify(data) });
export const updateNews = (id: string, data: any) => apiCall(`/news/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteNews = (id: string) => apiCall(`/news/${id}`, { method: "DELETE" });

// ============ EVENTS ============
export const getEvents = () => apiCall("/events");
export const getEventById = (id: string) => apiCall(`/events/${id}`);
export const getEventBySlug = (slug: string) => apiCall(`/events/${slug}`);
export const createEvent = (data: any) => apiCall("/events", { method: "POST", body: JSON.stringify(data) });
export const updateEvent = (id: string, data: any) => apiCall(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteEvent = (id: string) => apiCall(`/events/${id}`, { method: "DELETE" });

// ============ FACULTY ============
export const getFaculty = () => apiCall("/faculty");
export const getFacultyById = (id: string) => apiCall(`/faculty/${id}`);
export const createFaculty = (data: any) => apiCall("/faculty", { method: "POST", body: JSON.stringify(data) });
export const updateFaculty = (id: string, data: any) => apiCall(`/faculty/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteFaculty = (id: string) => apiCall(`/faculty/${id}`, { method: "DELETE" });

// ============ GALLERY ============
export const getGallery = () => apiCall("/gallery");
export const getGalleryById = (id: string) => apiCall(`/gallery/${id}`);
export const createGallery = (data: any) => apiCall("/gallery", { method: "POST", body: JSON.stringify(data) });
export const updateGallery = (id: string, data: any) => apiCall(`/gallery/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteGallery = (id: string) => apiCall(`/gallery/${id}`, { method: "DELETE" });

// ============ MESSAGES ============
export const getMessages = () => apiCall("/messages");
export const getMessageById = (id: string) => apiCall(`/messages/${id}`);
export const createMessage = (data: any) => apiCall("/messages", { method: "POST", body: JSON.stringify(data) });
export const markMessageAsReplied = (id: string) => apiCall(`/messages/${id}/reply`, { method: "PUT", body: JSON.stringify({}) });
export const deleteMessage = (id: string) => apiCall(`/messages/${id}`, { method: "DELETE" });

// ============ ANNOUNCEMENTS ============
export const getAnnouncements = () => apiCall("/announcements");
export const getAnnouncementById = (id: string) => apiCall(`/announcements/${id}`);
export const createAnnouncement = (data: any) => apiCall("/announcements", { method: "POST", body: JSON.stringify(data) });
export const updateAnnouncement = (id: string, data: any) => apiCall(`/announcements/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteAnnouncement = (id: string) => apiCall(`/announcements/${id}`, { method: "DELETE" });

// ============ DEPARTMENTS ============
export const getDepartments = () => apiCall("/departments");
export const getDepartmentById = (id: string) => apiCall(`/departments/${id}`);
export const createDepartment = (data: any) => apiCall("/departments", { method: "POST", body: JSON.stringify(data) });
export const updateDepartment = (id: string, data: any) => apiCall(`/departments/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDepartment = (id: string) => apiCall(`/departments/${id}`, { method: "DELETE" });

// ============ PROGRAMS ============
export const getPrograms = () => apiCall("/programs");
export const getProgramById = (id: string) => apiCall(`/programs/${id}`);
export const getProgramsByDepartment = (departmentId: string) => apiCall(`/departments/${departmentId}/programs`);
export const createProgram = (data: any) => apiCall("/programs", { method: "POST", body: JSON.stringify(data) });
export const updateProgram = (id: string, data: any) => apiCall(`/programs/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProgram = (id: string) => apiCall(`/programs/${id}`, { method: "DELETE" });

// ============ PAGES ============
export const getPages = () => apiCall("/pages");
export const getPageBySlug = (slug: string) => apiCall(`/pages/${slug}`);
export const createPage = (data: any) => apiCall("/pages", { method: "POST", body: JSON.stringify(data) });
export const updatePage = (slug: string, data: any) => apiCall(`/pages/${slug}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePage = (slug: string) => apiCall(`/pages/${slug}`, { method: "DELETE" });

// ============ UPLOAD ============
export const uploadImage = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Do NOT set Content-Type header — browser sets it with boundary automatically
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error?.error || "Upload failed");
  }

  const data = await response.json();
  return { url: data.url, publicId: data.publicId };
};

// ============ CHAT ============
export const getOrCreateChatConversation = (visitorName: string) =>
  apiCall("/chat/conversation", { method: "POST", body: JSON.stringify({ visitor_name: visitorName }) });

export const getChatMessages = (conversationId: string) =>
  apiCall(`/chat/messages/${conversationId}`);

export const getChatConversations = (status?: string) =>
  apiCall(`/chat/conversations${status ? `?status=${status}` : ""}`);

export const closeChatConversation = (conversationId: string) =>
  apiCall(`/chat/conversations/${conversationId}/close`, { method: "POST", body: JSON.stringify({}) });

export const getUnreadChatCount = () =>
  apiCall("/chat/unread-count");

export const getChatStats = () =>
  apiCall("/chat/stats");

// ============ SCHEDULE ============
export const getSchedule = () => apiCall("/schedule");
export const getScheduleById = (id: string) => apiCall(`/schedule/${id}`);
export const createSchedule = (data: any) => apiCall("/schedule", { method: "POST", body: JSON.stringify(data) });
export const updateSchedule = (id: string, data: any) => apiCall(`/schedule/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSchedule = (id: string) => apiCall(`/schedule/${id}`, { method: "DELETE" });

// ============ PRINCIPALS ============
export const getPrincipals = () => apiCall("/principals");
export const getPrincipalById = (id: string) => apiCall(`/principals/${id}`);
export const createPrincipal = (data: any) => apiCall("/principals", { method: "POST", body: JSON.stringify(data) });
export const updatePrincipal = (id: string, data: any) => apiCall(`/principals/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePrincipal = (id: string) => apiCall(`/principals/${id}`, { method: "DELETE" });

// ============ EVENT GALLERY ============
export const getEventGalleries = () => apiCall("/event-gallery");
export const getEventGalleryById = (id: string) => apiCall(`/event-gallery/${id}`);
export const createEventGallery = (data: any) => apiCall("/event-gallery", { method: "POST", body: JSON.stringify(data) });
export const updateEventGallery = (id: string, data: any) => apiCall(`/event-gallery/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteEventGallery = (id: string) => apiCall(`/event-gallery/${id}`, { method: "DELETE" });
export const addImagesToGallery = (id: string, images: any[]) =>
  apiCall(`/event-gallery/${id}/images`, { method: "POST", body: JSON.stringify({ images }) });
export const removeImageFromGallery = (id: string, imageIndex: number) =>
  apiCall(`/event-gallery/${id}/images/${imageIndex}`, { method: "DELETE" });
