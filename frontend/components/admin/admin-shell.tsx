"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  GalleryHorizontalEnd,
  Globe2,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  QrCode,
  ReceiptText,
  Search,
  Settings,
  Ticket,
  UserCog,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"
import { canAccessAdminRoute, isAllowed, isStaffRole, userPermissionKeys, type PermissionKey, type PermissionRule } from "@/lib/admin-permissions"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { readSavedPlatformTheme, resolvePlatformTheme } from "@/lib/platform-theme"
import { cn } from "@/lib/utils"
import type { PlatformThemeSettings } from "@/types/platform"

const defaultTheme: PlatformThemeSettings = {
  primaryColor: "#EA580C",
  secondaryColor: "#0f172a",
  accentColor: "#2563EB",
  radius: "12",
  fontFamily: "Rubik",
  fontFamilyAr: "Cairo",
  buttonStyle: "solid",
  density: "comfortable",
  logoEnUrl: "/logo.png",
  logoArUrl: "/LogoAR.png",
  faviconUrl: "/favicon.png",
  footerLocationEn: "26 Tarablous Street, Abbas El Akkad, 2nd floor, Flat 5, Nasr City, Cairo, Egypt",
  footerLocationAr: "\u0662\u0666 \u0634\u0627\u0631\u0639 \u0637\u0631\u0627\u0628\u0644\u0633\u060c \u0639\u0628\u0627\u0633 \u0627\u0644\u0639\u0642\u0627\u062f\u060c \u0627\u0644\u062f\u0648\u0631 \u0627\u0644\u062b\u0627\u0646\u064a\u060c \u0634\u0642\u0629 \u0665\u060c \u0645\u062f\u064a\u0646\u0629 \u0646\u0635\u0631\u060c \u0627\u0644\u0642\u0627\u0647\u0631\u0629\u060c \u0645\u0635\u0631",
  footerMobile: "+2 0100 607 1661",
  footerWhatsapp: "+2 0100 607 1661",
}

const profileStorageKey = "stylish-events-admin-profile"
const adminTokenKeys = ["stylish-events-admin-token", "stylish-events-auth-token", "stylish-events-token", "stylish-events-admin-user"]

type AdminProfile = {
  name: string
  email: string
  phone: string
  username: string
  password: string
  avatarUrl: string
}

type SearchItem = {
  title: string
  subtitle: string
  href: string
  type: string
}

type AdminNotification = {
  title: string
  body: string
  time: string
  href?: string
  unread: boolean
}

type AdminPermissionContextValue = {
  permissions: PermissionKey[]
  can: (permission: PermissionKey) => boolean
}

type AuthState = "loading" | "authenticated" | "unauthenticated" | "forbidden"

const AdminPermissionContext = createContext<AdminPermissionContextValue>({
  permissions: [],
  can: () => false,
})

export function useAdminPermissions() {
  return useContext(AdminPermissionContext)
}

const defaultProfile: AdminProfile = {
  name: "Super Admin",
  email: "admin@stylish-events.com",
  phone: "+20 100 000 0000",
  username: "superadmin",
  password: "",
  avatarUrl: "",
}

function normalizeAdminProfile(user: any): AdminProfile {
  return {
    ...defaultProfile,
    name: user?.name || defaultProfile.name,
    email: user?.email || defaultProfile.email,
    phone: user?.phone || defaultProfile.phone,
    username: user?.username || defaultProfile.username,
    avatarUrl: apiAssetUrl(user?.avatarUrl || user?.avatar_url || ""),
  }
}

function readSavedProfile() {
  if (typeof window === "undefined") return null
  try {
    const saved = window.localStorage.getItem(profileStorageKey)
    return saved ? normalizeAdminProfile(JSON.parse(saved)) : null
  } catch {
    return null
  }
}

function readAdminToken() {
  if (typeof window === "undefined") return ""
  return (
    window.localStorage.getItem("stylish-events-admin-token") ||
    window.localStorage.getItem("stylish-events-auth-token") ||
    window.localStorage.getItem("stylish-events-token") ||
    ""
  )
}

function clearAdminSession() {
  if (typeof window === "undefined") return
  adminTokenKeys.forEach((key) => window.localStorage.removeItem(key))
  window.localStorage.removeItem(profileStorageKey)
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "")
  const bigint = Number.parseInt(normalized, 16)

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function platformFontStack(fontFamily: string) {
  const stacks: Record<string, string> = {
    Rubik: '"Rubik", "Segoe UI", Tahoma, Arial, sans-serif',
    Poppins: '"Poppins", "Segoe UI", Tahoma, Arial, sans-serif',
    Cairo: '"Cairo", "Segoe UI", Tahoma, Arial, sans-serif',
    Tahoma: 'Tahoma, "Segoe UI", Arial, sans-serif',
    Arial: 'Arial, "Segoe UI", Tahoma, sans-serif',
  }

  return stacks[fontFamily] || stacks.Rubik
}

function readSavedTheme() {
  return readSavedPlatformTheme()
}

function cleanThemeAssets(theme: PlatformThemeSettings): PlatformThemeSettings {
  return {
    ...theme,
    logoEnUrl: /^blob:/i.test(theme.logoEnUrl) ? defaultTheme.logoEnUrl : theme.logoEnUrl,
    logoArUrl: /^blob:/i.test(theme.logoArUrl) ? defaultTheme.logoArUrl : theme.logoArUrl,
    faviconUrl: /^blob:/i.test(theme.faviconUrl) ? defaultTheme.faviconUrl : theme.faviconUrl,
  }
}

function applyAdminTheme(theme: PlatformThemeSettings) {
  const root = document.documentElement
  root.style.setProperty("--primary", rgbToHsl(hexToRgb(theme.primaryColor)))
  root.style.setProperty("--secondary", rgbToHsl(hexToRgb(theme.secondaryColor)))
  root.style.setProperty("--brand-blue", rgbToHsl(hexToRgb(theme.primaryColor)))
  root.style.setProperty("--brand-purple", rgbToHsl(hexToRgb(theme.accentColor)))
  root.style.setProperty("--admin-primary", theme.primaryColor)
  root.style.setProperty("--admin-secondary", theme.secondaryColor)
  root.style.setProperty("--admin-accent", theme.accentColor)
  root.style.setProperty("--admin-primary-hsl", rgbToHsl(hexToRgb(theme.primaryColor)))
  root.style.setProperty("--radius", `${Number(theme.radius) / 16}rem`)
  root.style.setProperty("--platform-font", platformFontStack(theme.fontFamily))
  root.dataset.platformButton = theme.buttonStyle
  root.dataset.platformDensity = theme.density
}

function useAdminTheme() {
  const [theme, setTheme] = useState<PlatformThemeSettings>(() => readSavedTheme())

  useEffect(() => {
    const savedTheme = readSavedTheme()
    setTheme(savedTheme)
    applyAdminTheme(savedTheme)

    platformApi.getThemeSettings()
      .then((remote) => {
        if (!remote || !Object.keys(remote).length) return
        const nextTheme = resolvePlatformTheme(remote, readSavedTheme())
        setTheme(nextTheme)
        applyAdminTheme(nextTheme)
        window.localStorage.setItem("stylish-events-theme-settings", JSON.stringify(nextTheme))
      })
      .catch(() => undefined)

    const syncTheme = () => {
      const nextTheme = readSavedTheme()
      setTheme(nextTheme)
      applyAdminTheme(nextTheme)
    }

    window.addEventListener("stylish-events-theme-settings-updated", syncTheme)
    return () => window.removeEventListener("stylish-events-theme-settings-updated", syncTheme)
  }, [])

  return theme
}

const navItems: Array<{ href: string; key: string; icon: LucideIcon; rule: PermissionRule }> = [
  { href: "/admin", key: "overview", icon: LayoutDashboard, rule: { permissions: ["dashboard.view"] } },
  { href: "/admin/events", key: "events", icon: CalendarDays, rule: { permissions: ["events.manage"] } },
  { href: "/admin/tickets", key: "tickets", icon: Ticket, rule: { permissions: ["tickets.manage", "pricing.manage"] } },
  { href: "/admin/orders", key: "orders", icon: ReceiptText, rule: { permissions: ["registrations.manage", "payments.verify"] } },
  { href: "/admin/contact-inquiries", key: "contactInquiries", icon: Inbox, rule: { permissions: ["contact_inquiries.manage"] } },
  { href: "/admin/attendees", key: "attendees", icon: Users, rule: { permissions: ["attendees.manage"] } },
  { href: "/admin/users", key: "users", icon: UserCog, rule: { permissions: ["users.manage", "roles.manage"] } },
  { href: "/admin/checkin", key: "checkin", icon: QrCode, rule: { permissions: ["checkin.manage"] } },
  { href: "/admin/certificates", key: "certificates", icon: BadgeCheck, rule: { permissions: ["certificates.view", "certificates.manage"] } },
  { href: "/admin/reviews", key: "reviews", icon: MessageSquareText, rule: { permissions: ["reviews.view", "reviews.manage"] } },
  { href: "/admin/reports", key: "reports", icon: ClipboardList, rule: { permissions: ["reports.view"] } },
  { href: "/admin/settings", key: "settings", icon: Settings, rule: { permissions: ["settings.manage", "website_content.manage", "theme_identity.manage"] } },
]

const baseSearchItems = [
  { title: "Events table", subtitle: "Manage events, drafts, and deleted items", href: "/admin/events", type: "Page" },
  { title: "Ticket bookings", subtitle: "Customers, QR codes, and live check-in", href: "/admin/tickets", type: "Page" },
  { title: "Bookings & payments", subtitle: "Orders, invoices, refunds, and cancellations", href: "/admin/orders", type: "Page" },
  { title: "Contact inquiries", subtitle: "General questions, support, partnerships, and planning inquiries", href: "/admin/contact-inquiries", type: "Page" },
  { title: "Users and roles", subtitle: "Admin users, organizers, employees, and permissions", href: "/admin/users", type: "Page" },
  { title: "Theme settings", subtitle: "Colors, logos, radius, and font", href: "/admin/settings", type: "Settings" },
]

function StylishEventsMark({ collapsed, theme }: { collapsed?: boolean; theme: PlatformThemeSettings }) {
  const { language, isRtl } = useLanguage()
  const logoSrc = apiAssetUrl(collapsed ? theme.faviconUrl : language === "ar" ? theme.logoArUrl : theme.logoEnUrl) || (collapsed ? "/favicon.png" : language === "ar" ? "/LogoAR.png" : "/logo.png")

  return (
    <div className={cn("flex h-16 items-center", collapsed && "justify-center")}>
      <img
        src={logoSrc}
        alt="Stylish Events"
        className={cn(
          "h-auto object-contain transition-all",
          collapsed ? "max-h-10 w-10 rounded-xl object-center" : cn("max-h-12 w-full max-w-[190px]", isRtl ? "object-right" : "object-left")
        )}
      />
    </div>
  )
}

function AdminNav({ collapsed, permissions }: { collapsed?: boolean; permissions: readonly PermissionKey[] }) {
  const pathname = usePathname()
  const currentPath = pathname || ""
  const { language, isRtl } = useLanguage()

  return (
    <nav className="space-y-1">
      {navItems.filter((item) => isAllowed(permissions, item.rule)).map((item) => {
        const Icon = item.icon
        const active = item.href === "/admin" ? currentPath === item.href : currentPath.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            title={collapsed ? adminT(language, `nav.${item.key}`) : undefined}
            className={cn(
              "admin-nav-item group flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-bold text-slate-500 transition duration-200 hover:bg-white",
              isRtl && !collapsed && "text-right",
              collapsed && "justify-center px-0",
              active && "admin-nav-item-active bg-white shadow-[0_10px_25px_rgba(93,58,138,0.08)]"
            )}
          >
            <Icon className={cn("h-4.5 w-4.5 shrink-0 transition", active ? "admin-nav-icon-active" : "text-slate-400")} />
            {!collapsed && <span className="truncate">{adminT(language, `nav.${item.key}`)}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarBody({
  collapsed = false,
  onToggle,
  theme,
  profile = defaultProfile,
  permissions = [],
}: {
  collapsed?: boolean
  onToggle?: () => void
  theme: PlatformThemeSettings
  profile?: AdminProfile
  permissions?: readonly PermissionKey[]
}) {
  const { language } = useLanguage()
  const isRtl = language === "ar"

  return (
    <div className="flex h-full flex-col">
      <div className={cn("px-2 pb-5 pt-2", collapsed && "px-0")}>
        <StylishEventsMark collapsed={collapsed} theme={theme} />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "mt-3 flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-xs font-extrabold text-slate-500 shadow-[0_10px_25px_rgba(93,58,138,0.08)] transition hover:text-[hsl(var(--primary))]",
              collapsed ? "mx-auto w-10" : "w-full"
            )}
            title={collapsed ? "Open sidebar" : "Close sidebar"}
          >
            {isRtl
              ? collapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />
              : collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && <span>{adminT(language, "common.collapse")}</span>}
          </button>
        )}
      </div>

      <div className={cn("admin-scrollbar min-h-0 flex-1 overflow-y-auto", collapsed ? "px-0" : isRtl ? "pl-1" : "pr-1")}>
        {!collapsed && <p className={cn("mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.20em] text-slate-300", isRtl && "text-right")}>{adminT(language, "common.main")}</p>}
        <AdminNav collapsed={collapsed} permissions={permissions} />
      </div>

      <div className={cn("mt-5 rounded-[26px] bg-white shadow-[0_16px_35px_rgba(93,58,138,0.08)]", collapsed ? "p-2" : "p-4")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" /> : <Users className="h-6 w-6" />}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-extrabold text-[#17172f]">{profile.name}</p>
              <p className="text-xs font-bold text-slate-400">{adminT(language, "common.adminRole")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, isRtl } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const theme = useAdminTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [profile, setProfile] = useState<AdminProfile>(defaultProfile)
  const [searchItems, setSearchItems] = useState<SearchItem[]>(baseSearchItems)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [accessDenied, setAccessDenied] = useState(false)
  const [permissions, setPermissions] = useState<PermissionKey[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredSearchItems = searchItems
    .filter((item) => {
      const query = searchQuery.trim().toLowerCase()
      if (!query) return false
      return `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(query)
    })
    .slice(0, 6)

  useEffect(() => {
    const saved = window.localStorage.getItem("stylish-events-admin-sidebar-collapsed")
    setSidebarCollapsed(saved === "true")
  }, [])

  useEffect(() => {
    if (authState !== "authenticated" || accessDenied) return
    let active = true
    async function loadTopbarData() {
      try {
        const canLoadEvents = isAllowed(permissions, { permissions: ["events.manage"] })
        const canLoadRegistrations = isAllowed(permissions, { permissions: ["registrations.manage", "payments.verify"] })
        const [events, registrations] = await Promise.all([
          canLoadEvents ? platformApi.listEvents() : Promise.resolve([]),
          canLoadRegistrations ? platformApi.listRegistrations() : Promise.resolve([]),
        ])
        if (!active) return

        const liveSearchItems: SearchItem[] = [
          ...baseSearchItems,
          ...(events || []).slice(0, 8).map((event: any) => ({
            title: event.title_en || event.title_ar || "Event",
            subtitle: event.slug || event.venue_name_en || "Live event",
            href: `/admin/events/${event.id}`,
            type: "Event",
          })),
          ...(registrations || []).slice(0, 8).map((registration: any) => ({
            title: registration.order_number || registration.registration_number || `Booking ${registration.id}`,
            subtitle: `${registration.doctor_name || "Customer"} - ${registration.event_title_en || "Event"}`,
            href: `/admin/orders/${registration.id}`,
            type: "Booking",
          })),
        ]

        const registrationNotifications = (registrations || []).slice(0, 4).map((registration: any) => ({
          title: registration.order_status === "paid" || registration.payment_status === "approved" ? "Booking paid" : "Booking needs review",
          body: `${registration.doctor_name || "Customer"} - ${registration.event_title_en || "Event"}`,
          time: registration.created_at ? new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(registration.created_at)) : "now",
          href: `/admin/orders/${registration.id}`,
          unread: registration.payment_status !== "approved",
        }))

        setSearchItems(liveSearchItems)
        setNotifications(registrationNotifications)
      } catch {
        if (!active) return
        setSearchItems(baseSearchItems)
        setNotifications([])
      }
    }
    loadTopbarData()
    return () => {
      active = false
    }
  }, [authState, accessDenied, permissions])

  useEffect(() => {
    const storedProfile = readSavedProfile()
    if (storedProfile) setProfile(storedProfile)

    const token = readAdminToken()

    if (!token) {
      clearAdminSession()
      setAuthState("unauthenticated")
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`)
      return
    }

    platformApi.me(token)
      .then((user) => {
        const roleCode = user?.role?.code || user?.roleCode || user?.role_code
        const effectivePermissions = userPermissionKeys(user)
        if (!isStaffRole(roleCode)) {
          setAuthState("forbidden")
          router.replace("/dashboard")
          return
        }
        const normalized = normalizeAdminProfile(user)
        setProfile(normalized)
        setPermissions(effectivePermissions)
        setAccessDenied(!canAccessAdminRoute(pathname || "/admin", effectivePermissions))
        window.localStorage.setItem(profileStorageKey, JSON.stringify(normalized))
        setAuthState("authenticated")
      })
      .catch(() => {
        clearAdminSession()
        setProfile(defaultProfile)
        setAuthState("unauthenticated")
        router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`)
      })

    const syncProfile = (event: Event) => {
      const nextProfile = normalizeAdminProfile((event as CustomEvent<AdminProfile>).detail || readSavedProfile())
      setProfile(nextProfile)
    }

    window.addEventListener("stylish-events-admin-profile-updated", syncProfile)
    return () => window.removeEventListener("stylish-events-admin-profile-updated", syncProfile)
  }, [pathname, router])

  useEffect(() => {
    if (authState !== "authenticated") return
    setAccessDenied(!canAccessAdminRoute(pathname || "/admin", permissions))
  }, [authState, pathname, permissions])

  const handleLogout = () => {
    clearAdminSession()
    setProfile(defaultProfile)
    setAuthState("unauthenticated")
    setPermissions([])
    setAccessDenied(false)
    window.dispatchEvent(new CustomEvent("stylish-events-admin-profile-updated", { detail: defaultProfile }))
    router.replace("/login")
  }

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current
      window.localStorage.setItem("stylish-events-admin-sidebar-collapsed", String(next))
      return next
    })
  }

  if (!mounted) return null

  if (authState !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--primary)/0.07)] px-4 text-center">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_45px_rgba(93,58,138,0.08)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-sm font-extrabold text-[#17172f]">{language === "ar" ? "جاري فحص جلسة الأدمن..." : "Checking admin session..."}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">{language === "ar" ? "سيتم تحويلك لتسجيل الدخول عند الحاجة." : "Redirecting to login when needed."}</p>
        </div>
      </div>
    )
  }

  return (
    <AdminPermissionContext.Provider value={{ permissions, can: (permission) => permissions.includes(permission) }}>
    <div className="admin-dashboard min-h-screen bg-[hsl(var(--primary)/0.07)] text-[#17172f]" dir={isRtl ? "rtl" : "ltr"}>
      <aside className={cn(
        "fixed inset-y-0 z-30 hidden border-[hsl(var(--primary)/0.08)] bg-white/65 p-5 backdrop-blur-xl transition-all duration-300 lg:block",
        isRtl
          ? "right-0 border-l shadow-[-18px_0_55px_rgba(15,23,42,0.04)]"
          : "left-0 border-r shadow-[18px_0_55px_rgba(15,23,42,0.04)]",
        sidebarCollapsed ? "w-[92px]" : "w-[252px]"
      )}>
        <SidebarBody collapsed={sidebarCollapsed} onToggle={toggleSidebar} theme={theme} profile={profile} permissions={permissions} />
      </aside>

      <div
        className={cn(
          "min-h-screen min-w-0 overflow-x-hidden transition-[padding] duration-300",
          sidebarCollapsed
            ? isRtl ? "lg:pr-[92px]" : "lg:pl-[92px]"
            : isRtl ? "lg:pr-[252px]" : "lg:pl-[252px]"
        )}
      >
        <header className="sticky top-0 z-20 px-4 pt-4 md:px-6">
          <div className="grid min-h-[72px] grid-cols-[auto_1fr] items-center gap-3 rounded-[26px] bg-white/90 px-4 shadow-[0_18px_45px_rgba(93,58,138,0.08)] backdrop-blur-xl lg:grid-cols-[minmax(260px,1fr)_auto]">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={adminT(language, "common.main")} className="h-11 w-11 rounded-2xl bg-[#f8f5fb] lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRtl ? "right" : "left"} className="w-[292px] bg-white/90 p-5 backdrop-blur-xl">
                  <SheetTitle className="sr-only">{adminT(language, "common.main")}</SheetTitle>
                  <SidebarBody theme={theme} profile={profile} permissions={permissions} />
                </SheetContent>
              </Sheet>

              <div className="relative flex h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#f8f5fb] px-4 text-slate-400">
                <Search className="h-5 w-5 shrink-0" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  dir={isRtl ? "rtl" : "ltr"}
                  className={cn("h-10 border-0 bg-transparent p-0 text-sm font-semibold text-slate-600 shadow-none placeholder:text-slate-400 focus-visible:ring-0", isRtl && "text-right")}
                  placeholder={adminT(language, "common.searchPlaceholder")}
                />
                {searchQuery.trim() && (
                  <div className="absolute left-0 right-0 top-[58px] z-50 overflow-hidden rounded-[22px] bg-white p-2 shadow-[0_22px_55px_rgba(15,23,42,0.14)]">
                    {filteredSearchItems.length > 0 ? (
                      filteredSearchItems.map((item) => (
                        <Link
                          key={`${item.type}-${item.title}`}
                          href={item.href}
                          onClick={() => setSearchQuery("")}
                          className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 transition hover:bg-[hsl(var(--primary)/0.06)]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-[#17172f]">{item.title}</p>
                            <p className="truncate text-xs font-medium text-slate-400">{item.subtitle}</p>
                          </div>
                          <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-extrabold uppercase text-slate-400">{item.type}</span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-sm font-semibold text-slate-400">{adminT(language, "common.noResults")}</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2 md:gap-3">
              <div className="hidden rounded-2xl bg-[#f8f5fb] p-1 sm:flex">
                <button
                  onClick={() => setLanguage("en")}
                  className={cn("h-9 cursor-pointer rounded-xl px-3 text-xs font-extrabold transition", language === "en" ? "bg-white text-[hsl(var(--primary))] shadow-sm" : "text-slate-400")}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("ar")}
                  className={cn("h-9 cursor-pointer rounded-xl px-3 text-xs font-extrabold transition", language === "ar" ? "bg-white text-[hsl(var(--primary))] shadow-sm" : "text-slate-400")}
                >
                  AR
                </button>
              </div>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                aria-label="Open website"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-[#f8f5fb] text-slate-500 transition hover:bg-white hover:text-[hsl(var(--primary))] hover:shadow-sm"
              >
                <Globe2 className="h-5 w-5" />
              </a>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-[#f8f5fb] text-slate-500 transition hover:bg-white hover:text-[hsl(var(--primary))]">
                    <Bell className="h-5 w-5" />
                    <span className={cn("absolute top-2.5 h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))]", isRtl ? "left-2.5" : "right-2.5")} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={cn("w-[360px] rounded-[24px] border-0 p-3 shadow-[0_22px_55px_rgba(15,23,42,0.16)]", isRtl ? "[direction:rtl]" : "[direction:ltr]")}>
                  <div className="mb-2 flex items-center justify-between px-2">
                    <DropdownMenuLabel className="p-0 text-base font-extrabold">{adminT(language, "common.notifications")}</DropdownMenuLabel>
                    <span className="rounded-full bg-[hsl(var(--primary)/0.10)] px-2 py-1 text-[10px] font-extrabold text-[hsl(var(--primary))]">{notifications.filter((item) => item.unread).length} {language === "ar" ? "جديد" : "new"}</span>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="space-y-1">
                    {notifications.length ? notifications.map((notification) => (
                      <DropdownMenuItem key={`${notification.title}-${notification.body}`} asChild className="cursor-pointer items-start rounded-2xl p-3 focus:bg-[hsl(var(--primary)/0.06)]">
                        <Link href={notification.href || "/admin/orders"} className="flex gap-3">
                          <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", notification.unread ? "bg-[hsl(var(--primary))]" : "bg-slate-200")} />
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-[#17172f]">{notification.title}</p>
                            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{notification.body}</p>
                            <p className="mt-1 text-[11px] font-bold text-slate-400">{notification.time}</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )) : (
                      <div className="px-3 py-4 text-sm font-semibold text-slate-400">{adminT(language, "common.noNotifications")}</div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="hidden items-center gap-3 md:flex">
                <div className="text-end">
                  <p className="text-sm font-extrabold leading-tight text-[#17172f]">{profile.name}</p>
                  <p className="text-xs font-bold text-slate-400">{adminT(language, "common.adminRole")}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex cursor-pointer items-center gap-2 rounded-2xl transition hover:bg-slate-50">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
                        {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" /> : <Users className="h-5 w-5" />}
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={cn("w-[280px] rounded-[24px] border-0 p-3 shadow-[0_22px_55px_rgba(15,23,42,0.16)]", isRtl ? "[direction:rtl]" : "[direction:ltr]")}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
                        {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" /> : <Users className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-[#17172f]">{profile.name}</p>
                        <p className="text-xs font-bold text-slate-400">{profile.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="grid gap-1 py-2">
                      <DropdownMenuItem asChild className="cursor-pointer rounded-2xl px-3 py-3 font-bold">
                        <Link href="/admin/profile">
                          <Users className="h-4 w-4" />
                          {adminT(language, "common.accountSettings")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-2xl px-3 py-3 font-bold">
                        <Link href="/admin/profile/security">
                          <Settings className="h-4 w-4" />
                          {adminT(language, "common.security")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-2xl px-3 py-3 font-bold">
                        <Link href="/admin/profile/avatar">
                          <GalleryHorizontalEnd className="h-4 w-4" />
                          {adminT(language, "common.profileImage")}
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <Button onClick={handleLogout} variant="outline" className="mt-3 h-10 w-full rounded-xl font-extrabold text-red-600 hover:text-red-700">{adminT(language, "common.logout")}</Button>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 px-4 py-5 md:px-6">
          {accessDenied ? (
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_18px_45px_rgba(93,58,138,0.08)]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-extrabold text-[#17172f]">{language === "ar" ? "غير مصرح بالدخول" : "Access denied"}</h1>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  {language === "ar" ? "حسابك لا يملك الصلاحية المطلوبة لعرض هذه الصفحة." : "Your account does not have the required permission to view this page."}
                </p>
              </div>
            </div>
          ) : children}
        </main>
      </div>
    </div>
    </AdminPermissionContext.Provider>
  )
}

