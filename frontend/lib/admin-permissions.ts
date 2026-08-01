export const permissionKeys = [
  "dashboard.view",
  "users.manage",
  "roles.manage",
  "events.manage",
  "tickets.manage",
  "pricing.manage",
  "registrations.manage",
  "payments.verify",
  "attendees.manage",
  "checkin.manage",
  "certificates.view",
  "certificates.manage",
  "reviews.view",
  "reviews.manage",
  "reports.view",
  "settings.manage",
  "contact_inquiries.manage",
  "website_content.manage",
  "theme_identity.manage",
  "kiosk.use",
  "profile.manage",
] as const

export type PermissionKey = (typeof permissionKeys)[number]

export type PermissionMode = "any" | "all"

export type PermissionRule = {
  permissions: PermissionKey[]
  mode?: PermissionMode
}

export type AdminRoutePermission = PermissionRule & {
  prefix: string
  exact?: boolean
}

export function can(userPermissions: readonly string[], permission: PermissionKey) {
  return userPermissions.includes(permission)
}

export function canAny(userPermissions: readonly string[], permissions: readonly PermissionKey[]) {
  return permissions.some((permission) => can(userPermissions, permission))
}

export function canAll(userPermissions: readonly string[], permissions: readonly PermissionKey[]) {
  return permissions.every((permission) => can(userPermissions, permission))
}

export function isAllowed(userPermissions: readonly string[], rule?: PermissionRule) {
  if (!rule || !rule.permissions.length) return true
  return rule.mode === "all" ? canAll(userPermissions, rule.permissions) : canAny(userPermissions, rule.permissions)
}

export function userPermissionKeys(user: any): PermissionKey[] {
  if (!Array.isArray(user?.permissions)) return []
  return user.permissions
    .map((permission: any) => String(permission))
    .filter((permission: string): permission is PermissionKey => (permissionKeys as readonly string[]).includes(permission))
}

export const staffRoleCodes = ["admin", "organizer", "employee", "back_office"] as const

export function isStaffRole(roleCode?: string | null) {
  return Boolean(roleCode && staffRoleCodes.includes(roleCode as any))
}

export const adminRoutePermissions: AdminRoutePermission[] = [
  { prefix: "/admin", exact: true, permissions: ["dashboard.view"] },
  { prefix: "/admin/events", permissions: ["events.manage"] },
  { prefix: "/admin/tickets", permissions: ["tickets.manage", "pricing.manage"] },
  { prefix: "/admin/orders", permissions: ["registrations.manage", "payments.verify"] },
  { prefix: "/admin/registrations", permissions: ["registrations.manage"] },
  { prefix: "/admin/contact-inquiries", permissions: ["contact_inquiries.manage"] },
  { prefix: "/admin/attendees", permissions: ["attendees.manage"] },
  { prefix: "/admin/users", permissions: ["users.manage", "roles.manage"] },
  { prefix: "/admin/checkin", permissions: ["checkin.manage"] },
  { prefix: "/admin/certificates/builder", permissions: ["certificates.manage"] },
  { prefix: "/admin/certificates/cards", permissions: ["certificates.manage"] },
  { prefix: "/admin/certificates", permissions: ["certificates.view", "certificates.manage"] },
  { prefix: "/admin/reviews", permissions: ["reviews.view", "reviews.manage"] },
  { prefix: "/admin/reports", permissions: ["reports.view"] },
  { prefix: "/admin/settings", permissions: ["settings.manage", "website_content.manage", "theme_identity.manage"] },
  { prefix: "/admin/profile", permissions: ["profile.manage"] },
]

export function routeRuleForPath(pathname: string) {
  const normalized = pathname || "/admin"
  return adminRoutePermissions
    .filter((rule) => (rule.exact ? normalized === rule.prefix : normalized === rule.prefix || normalized.startsWith(`${rule.prefix}/`)))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]
}

export function canAccessAdminRoute(pathname: string, userPermissions: readonly string[]) {
  return isAllowed(userPermissions, routeRuleForPath(pathname))
}
