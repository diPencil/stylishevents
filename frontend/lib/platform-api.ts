const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export function apiAssetUrl(url?: string | null) {
  if (!url) return ""
  if (url.startsWith(API_BASE_URL)) {
    const path = url.slice(API_BASE_URL.length) || ""
    return path.startsWith("/uploads/") ? url : path || ""
  }
  if (/^blob:/i.test(url)) return ""
  if (/^(https?:|data:)/i.test(url)) return url
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`
  if (url.startsWith("uploads/")) return `${API_BASE_URL}/${url}`
  if (url.startsWith("/")) return url
  return `/${url}`
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token =
    window.localStorage.getItem("stylish-events-admin-token") ||
    window.localStorage.getItem("stylish-events-auth-token") ||
    window.localStorage.getItem("stylish-events-token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function clearAuthSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem("stylish-events-admin-token")
  window.localStorage.removeItem("stylish-events-auth-token")
  window.localStorage.removeItem("stylish-events-token")
  window.localStorage.removeItem("stylish-events-admin-user")
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: ({
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(init?.headers || {}),
      } as unknown) as HeadersInit,
    })
  } catch {
    throw new Error(`Backend API is not reachable at ${API_BASE_URL}`)
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success === false) {
    const err = new Error(payload.message || "Request failed")
    ;(err as any).status = response.status
    throw err
  }

  return payload.data as T
}

export const platformApi = {
  login: (data: { login: string; password: string }) =>
    request<any>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: Record<string, unknown>) =>
    request<any>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  forgotPassword: (data: { login: string }) =>
    request<any>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(data) }),
  uploadAuthAvatar: (data: { fileName: string; dataUrl: string }) =>
    request<any>("/api/auth/avatar-upload", { method: "POST", body: JSON.stringify(data) }),
  me: (token: string) =>
    request<any>("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
  updateMe: (data: Record<string, unknown>) =>
    request<any>("/api/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
  updateMyPassword: (data: { currentPassword: string; newPassword: string }) =>
    request<any>("/api/auth/me/password", { method: "PATCH", body: JSON.stringify(data) }),
  bootstrapAdmin: (data: Record<string, unknown>) =>
    request<any>("/api/auth/bootstrap-admin", { method: "POST", body: JSON.stringify(data) }),
  getThemeSettings: () => request<any>("/api/platform/settings/theme"),
  updateThemeSettings: (data: Record<string, unknown>) =>
    request<any>("/api/platform/settings/theme", { method: "PUT", body: JSON.stringify(data) }),
  getSiteContentSettings: () => request<any>("/api/platform/settings/site-content"),
  updateSiteContentSettings: (data: Record<string, unknown>) =>
    request<any>("/api/platform/settings/site-content", { method: "PUT", body: JSON.stringify(data) }),
  getCurrencySettings: () => request<any>("/api/platform/settings/currency"),
  updateCurrencySettings: (data: Record<string, unknown>) =>
    request<any>("/api/platform/settings/currency", { method: "PUT", body: JSON.stringify(data) }),
  uploadPlatformAsset: (data: { fileName: string; dataUrl: string }) =>
    request<any>("/api/platform/assets/upload", { method: "POST", body: JSON.stringify(data) }),
  listEvents: (params?: { status?: string; includeDeleted?: boolean; page?: 'upcoming' | 'previous'; sortMode?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set("status", params.status)
    if (params?.includeDeleted) searchParams.set("includeDeleted", "true")
    if (params?.page) searchParams.set("page", params.page)
    if (params?.sortMode) searchParams.set("sortMode", params.sortMode)
    if (params?.limit) searchParams.set("limit", String(params.limit))
    const queryString = searchParams.toString()
    return request<any[]>(`/api/events${queryString ? `?${queryString}` : ""}`)
  },
  getEvent: (id: number | string) => request<any>(`/api/events/${id}`),
  createEvent: (data: Record<string, unknown>) =>
    request<any>("/api/events", { method: "POST", body: JSON.stringify(data) }),
  updateEvent: (id: number | string, data: Record<string, unknown>) =>
    request<any>(`/api/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateEventStatus: (id: number | string, status: string) =>
    request<any>(`/api/events/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteEvent: (id: number | string) =>
    request<any>(`/api/events/${id}`, { method: "DELETE" }),
  restoreEvent: (id: number | string) =>
    request<any>(`/api/events/${id}/restore`, { method: "POST" }),
  listTickets: (eventId?: number) =>
    request<any[]>(`/api/tickets${eventId ? `?eventId=${eventId}` : ""}`),
  createTicket: (data: Record<string, unknown>) =>
    request<any>("/api/tickets", { method: "POST", body: JSON.stringify(data) }),
  updateTicket: (id: number | string, data: Record<string, unknown>) =>
    request<any>(`/api/tickets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateTicketStatus: (id: number | string, isActive: boolean) =>
    request<any>(`/api/tickets/${id}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
  deleteTicket: (id: number | string) =>
    request<any>(`/api/tickets/${id}`, { method: "DELETE" }),
  createPricePeriod: (data: Record<string, unknown>) =>
    request<any>("/api/tickets/price-periods", { method: "POST", body: JSON.stringify(data) }),
  updatePricePeriod: (id: number | string, data: Record<string, unknown>) =>
    request<any>(`/api/tickets/price-periods/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updatePricePeriodStatus: (id: number | string, isActive: boolean) =>
    request<any>(`/api/tickets/price-periods/${id}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
  deletePricePeriod: (id: number | string) =>
    request<any>(`/api/tickets/price-periods/${id}`, { method: "DELETE" }),
  listPricePeriods: (ticketTypeId: number | string) =>
    request<any[]>(`/api/tickets/${ticketTypeId}/price-periods`),
  listAttendees: (eventId?: number) =>
    request<any[]>(`/api/attendees${eventId ? `?eventId=${eventId}` : ""}`),
  getAttendee: (id: number | string) => request<any>(`/api/attendees/${id}`),
  checkin: (qrToken: string) =>
    request<any>("/api/attendees/checkin", { method: "POST", body: JSON.stringify({ qrToken }) }),
  updateAttendeeQrStatus: (id: number | string, status: "active" | "revoked" | "used") =>
    request<any>(`/api/attendees/${id}/qr-status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  listDoctors: (search?: string) =>
    request<any[]>(`/api/doctors${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  lookupDoctorProfile: (identity: string) =>
    request<any>(`/api/doctors/lookup/profile?identity=${encodeURIComponent(identity)}`),
  getDoctor: (id: number | string) => request<any>(`/api/doctors/${id}`),
  createDoctor: (data: Record<string, unknown>) =>
    request<any>("/api/doctors", { method: "POST", body: JSON.stringify(data) }),
  listRegistrations: (params?: { status?: string; eventId?: number; limit?: number; offset?: number; search?: string; includeMeta?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set("status", params.status)
    if (params?.eventId) searchParams.set("eventId", String(params.eventId))
    if (typeof params?.limit === "number") searchParams.set("limit", String(params.limit))
    if (typeof params?.offset === "number") searchParams.set("offset", String(params.offset))
    if (params?.search) searchParams.set("search", params.search)
    const queryString = searchParams.toString()
    const path = `/api/registrations${queryString ? `?${queryString}` : ""}`
    if (params?.includeMeta) return request<any>(`${path}${queryString ? '&' : '?'}meta=true`)
    return request<any[]>(path)
  },
  getRegistration: (id: number | string) => request<any>(`/api/registrations/${id}`),
  createRegistration: (data: Record<string, unknown>) =>
    request<any>("/api/registrations", { method: "POST", body: JSON.stringify(data) }),
  submitPaymentProof: (id: number | string, data: Record<string, unknown>) =>
    request<any>(`/api/registrations/${id}/payment-proof`, { method: "PATCH", body: JSON.stringify(data) }),
  reviewPayment: (id: number | string, data: Record<string, unknown>) =>
    request<any>(`/api/registrations/${id}/payment-review`, { method: "PATCH", body: JSON.stringify(data) }),
  updateRegistrationOrderStatus: (id: number | string, status: "paid" | "cancelled" | "refunded") =>
    request<any>(`/api/registrations/${id}/order-status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  listReviews: () => request<any[]>("/api/reviews"),
  getReview: (id: number | string) => request<any>(`/api/reviews/${id}`),
  updateReviewStatus: (id: number | string, status: string) =>
    request<any>(`/api/reviews/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteReview: (id: number | string) =>
    request<any>(`/api/reviews/${id}`, { method: "DELETE" }),
  kioskSearch: (data: Record<string, unknown>) =>
    request<any>("/api/kiosk/search", { method: "POST", body: JSON.stringify(data) }),
  reportSummary: (eventId?: number) =>
    request<any>(`/api/reports/summary${eventId ? `?eventId=${eventId}` : ""}`),
  reportRegistrations: (eventId?: number) =>
    request<any[]>(`/api/reports/registrations${eventId ? `?eventId=${eventId}` : ""}`),
  reportNationalities: (eventId?: number) =>
    request<any[]>(`/api/reports/nationalities${eventId ? `?eventId=${eventId}` : ""}`),
  reportSpecialties: (eventId?: number) =>
    request<any[]>(`/api/reports/specialties${eventId ? `?eventId=${eventId}` : ""}`),
  reportTicketPerformance: (eventId?: number) =>
    request<any[]>(`/api/reports/ticket-performance${eventId ? `?eventId=${eventId}` : ""}`),
  listCertificateTemplates: (eventId?: number) =>
    request<any[]>(`/api/certificates/templates${eventId ? `?eventId=${eventId}` : ""}`),
  listCertificateDelivery: (eventId?: number) =>
    request<any[]>(`/api/certificates/delivery${eventId ? `?eventId=${eventId}` : ""}`),
  createCertificateTemplate: (data: Record<string, unknown>) =>
    request<any>("/api/certificates/templates", { method: "POST", body: JSON.stringify(data) }),
  updateCertificateTemplateStatus: (id: number | string, isActive: boolean) =>
    request<any>(`/api/certificates/templates/${id}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
  issueCertificate: (data: Record<string, unknown>) =>
    request<any>("/api/certificates/issue", { method: "POST", body: JSON.stringify(data) }),
  generateEventCard: (data: Record<string, unknown>) =>
    request<any>("/api/certificates/event-card", { method: "POST", body: JSON.stringify(data) }),
  listUsers: (params?: { search?: string; role?: string; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.role) searchParams.set("role", params.role)
    if (params?.status) searchParams.set("status", params.status)
    const queryString = searchParams.toString()
    return request<any[]>(`/api/users${queryString ? `?${queryString}` : ""}`)
  },
  getUser: (id: number | string) => request<any>(`/api/users/${id}`),
  createUser: (data: Record<string, unknown>) =>
    request<any>("/api/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number | string, data: Record<string, unknown>) =>
    request<any>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateUserStatus: (id: number | string, status: string) =>
    request<any>(`/api/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  resetUserPassword: (id: number | string, password: string) =>
    request<any>(`/api/users/${id}/password`, { method: "PATCH", body: JSON.stringify({ password }) }),
  uploadUserAvatar: (data: { fileName: string; dataUrl: string }) =>
    request<any>("/api/users/avatar-upload", { method: "POST", body: JSON.stringify(data) }),
  listRoles: () => request<any>("/api/users/roles"),
  updateRolePermissions: (roleCode: string, permissions: { key: string; allowed: boolean }[]) =>
    request<any>(`/api/users/roles/${roleCode}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    }),
}

