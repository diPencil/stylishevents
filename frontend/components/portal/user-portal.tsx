"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  ChevronDown,
  CircleHelp,
  Download,
  ExternalLink,
  FileBadge,
  Globe2,
  Home,
  LogOut,
  Menu,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  UserRound,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { defaultPlatformTheme, normalizePlatformTheme, readSavedPlatformTheme, resolvePlatformTheme } from "@/lib/platform-theme"
import { cn } from "@/lib/utils"
import type { PlatformThemeSettings } from "@/types/platform"

type PortalView = "overview" | "registrations" | "registration-detail" | "tickets" | "ticket-detail" | "certificates" | "notifications" | "reviews" | "profile" | "security" | "support"
type AuthState = "loading" | "authenticated" | "unauthenticated" | "forbidden"
type LangText = { en: string; ar: string }

const navItems = [
  { view: "overview", href: "/dashboard", label: { en: "Overview", ar: "الرئيسية" }, icon: Home },
  { view: "registrations", href: "/dashboard/registrations", label: { en: "My Registrations", ar: "تسجيلاتي" }, icon: CalendarDays },
  { view: "tickets", href: "/dashboard/tickets", label: { en: "My Tickets", ar: "تذاكري" }, icon: Ticket },
  { view: "certificates", href: "/dashboard/certificates", label: { en: "My Certificates", ar: "شهاداتي" }, icon: FileBadge },
  { view: "reviews", href: "/dashboard/reviews", label: { en: "My Reviews", ar: "تقييماتي" }, icon: Star },
  { view: "profile", href: "/dashboard/profile", label: { en: "Profile", ar: "الملف الشخصي" }, icon: UserRound },
  { view: "security", href: "/dashboard/security", label: { en: "Security", ar: "الأمان" }, icon: ShieldCheck },
  { view: "support", href: "/dashboard/support", label: { en: "Support", ar: "الدعم" }, icon: CircleHelp },
] as const

const viewTitles: Record<PortalView, LangText> = {
  overview: { en: "Overview", ar: "الرئيسية" },
  registrations: { en: "My Registrations", ar: "تسجيلاتي" },
  "registration-detail": { en: "Registration Details", ar: "تفاصيل التسجيل" },
  tickets: { en: "My Tickets", ar: "تذاكري" },
  "ticket-detail": { en: "Ticket Details", ar: "تفاصيل التذكرة" },
  certificates: { en: "My Certificates", ar: "شهاداتي" },
  notifications: { en: "Notifications", ar: "الإشعارات" },
  reviews: { en: "My Reviews", ar: "تقييماتي" },
  profile: { en: "Profile", ar: "الملف الشخصي" },
  security: { en: "Security", ar: "الأمان" },
  support: { en: "Support", ar: "الدعم" },
}

const statusTone: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  paid: "bg-emerald-50 text-emerald-700",
  issued: "bg-emerald-50 text-emerald-700",
  active: "bg-emerald-50 text-emerald-700",
  pending_payment: "bg-amber-50 text-amber-700",
  pending_verification: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-red-50 text-red-700",
  expired: "bg-slate-100 text-slate-700",
  revoked: "bg-red-50 text-red-700",
  used: "bg-slate-100 text-slate-700",
}

const statusLabels: Record<string, LangText> = {
  approved: { en: "Approved", ar: "معتمد" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  pending_payment: { en: "Pending payment", ar: "بانتظار الدفع" },
  pending_verification: { en: "Pending review", ar: "تسجيلك قيد المراجعة" },
  pending: { en: "Pending", ar: "قيد الانتظار" },
  rejected: { en: "Rejected", ar: "مرفوض" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
  issued: { en: "Issued", ar: "صادرة" },
  active: { en: "Active", ar: "نشطة" },
  used: { en: "Used", ar: "مستخدمة" },
  expired: { en: "Expired", ar: "منتهية" },
  revoked: { en: "Revoked", ar: "ملغاة" },
}

const honorificOnly = new Set(["dr", "doctor", "mr", "mrs", "ms", "prof", "eng"])

function t(text: LangText, isRtl: boolean) {
  return isRtl ? text.ar : text.en
}

function token() {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem("stylish-events-admin-token") || window.localStorage.getItem("stylish-events-auth-token") || window.localStorage.getItem("stylish-events-token") || ""
}

function clearSession() {
  window.localStorage.removeItem("stylish-events-admin-token")
  window.localStorage.removeItem("stylish-events-auth-token")
  window.localStorage.removeItem("stylish-events-token")
  window.localStorage.removeItem("stylish-events-admin-user")
}

function cleanDisplayName(value?: string | null) {
  const name = String(value || "").replace(/\s+/g, " ").trim()
  if (!name) return ""
  return honorificOnly.has(name.replace(/\./g, "").toLowerCase()) ? "" : name
}

function emailNameFallback(email?: string | null) {
  return cleanDisplayName(String(email || "").split("@")[0]?.replace(/[._-]+/g, " "))
}

function displayName(user: any, fallback = "Customer") {
  const fullName = cleanDisplayName(user?.customer_full_name || user?.customerFullName || user?.full_name || user?.fullName || user?.name)
  if (fullName) return fullName
  const combined = cleanDisplayName([user?.first_name || user?.firstName, user?.last_name || user?.lastName].filter(Boolean).join(" "))
  if (combined) return combined
  return cleanDisplayName(user?.username) || emailNameFallback(user?.email) || fallback
}

function avatarUrl(user: any) {
  return apiAssetUrl(user?.avatar_url || user?.avatarUrl || "")
}

function initialsFor(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "C"
}

function CustomerAvatar({ user, className }: { user: any; className?: string }) {
  const name = displayName(user)
  const src = avatarUrl(user)
  const [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [src])

  if (src && !broken) {
    return <img src={src} alt={name} onError={() => setBroken(true)} className={cn("shrink-0 rounded-2xl object-cover", className)} />
  }

  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-sm font-black text-[hsl(var(--primary))]", className)}>
      {initialsFor(name)}
    </div>
  )
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value))
}

function formatTime(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value))
}

function eventTitle(row: any, isRtl: boolean) {
  return isRtl ? row?.event_title_ar || row?.event_title_en : row?.event_title_en || row?.event_title_ar
}

function eventSummary(row: any, isRtl: boolean) {
  return isRtl ? row?.event_summary_ar || row?.event_description_ar || row?.event_summary_en || row?.event_description_en : row?.event_summary_en || row?.event_description_en || row?.event_summary_ar || row?.event_description_ar
}

function eventImage(row: any) {
  const gallery = typeof row?.gallery_json === "string" ? (() => { try { return JSON.parse(row.gallery_json) } catch { return [] } })() : row?.gallery_json
  const galleryImage = Array.isArray(gallery) ? gallery.find((item) => typeof item === "string" || item?.url)?.url || gallery.find((item) => typeof item === "string") : ""
  return apiAssetUrl(row?.cover_image_url || row?.banner_image_url || galleryImage || "")
}

function eventLocation(row: any, isRtl: boolean) {
  return isRtl
    ? row?.venue_name_ar || row?.city_ar || row?.address_ar || "أونلاين"
    : row?.venue_name_en || row?.city_en || row?.address_en || "Online"
}

function statusLabel(value: string, isRtl: boolean) {
  const normalized = String(value || "pending")
  const entry = statusLabels[normalized]
  return entry ? t(entry, isRtl) : normalized.replaceAll("_", " ")
}

function cardClass(className?: string) {
  return cn("rounded-[var(--radius)] border border-white/70 bg-white shadow-[0_18px_42px_rgba(93,58,138,0.08)]", className)
}

export function UserPortal({ view, recordId }: { view: PortalView; recordId?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/dashboard"
  const { language, setLanguage, isRtl } = useLanguage()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [theme, setTheme] = useState<PlatformThemeSettings>(() => defaultPlatformTheme)

  useEffect(() => {
    const syncTheme = (event?: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : null
      setTheme(detail ? normalizePlatformTheme(detail) : readSavedPlatformTheme())
    }
    syncTheme()
    platformApi.getThemeSettings().then((settings) => setTheme((current) => resolvePlatformTheme(settings, current))).catch(() => undefined)
    window.addEventListener("stylish-events-theme-settings-updated", syncTheme)
    return () => window.removeEventListener("stylish-events-theme-settings-updated", syncTheme)
  }, [])

  useEffect(() => {
    const currentToken = token()
    if (!currentToken) {
      setAuthState("unauthenticated")
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    platformApi.me(currentToken)
      .then((currentUser) => {
        const role = currentUser?.role_code || currentUser?.role?.code
        window.localStorage.setItem("stylish-events-admin-user", JSON.stringify(currentUser))
        if (["admin", "organizer", "employee", "back_office"].includes(role)) {
          setAuthState("forbidden")
          router.replace("/admin")
          return
        }
        setUser(currentUser)
        setAuthState("authenticated")
      })
      .catch(() => {
        clearSession()
        setAuthState("unauthenticated")
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      })
  }, [pathname, router])

  if (authState !== "authenticated") return <PortalLoading isRtl={isRtl} />

  const parentView = view === "registration-detail" ? "registrations" : view === "ticket-detail" ? "tickets" : view
  const current = navItems.find((item) => item.view === parentView) || navItems[0]
  const currentTitle = viewTitles[view] || current.label
  const customerName = displayName(user)
  const logoSrc = apiAssetUrl(isRtl ? theme.logoArUrl : theme.logoEnUrl) || (isRtl ? "/LogoAR.png" : "/logo.png")
  const projectName = "Stylish Events"

  const sidebar = (
    <aside className="flex h-full flex-col bg-white/70 p-5 backdrop-blur-xl">
      <div className="px-2 pb-5 pt-2">
        <Link href="/" className="flex h-16 items-center" aria-label={projectName}>
          <img src={logoSrc} alt={projectName} className={cn("h-auto max-h-12 w-full max-w-[190px] object-contain", isRtl ? "object-right" : "object-left")} />
        </Link>
        <div className="mt-4 flex items-center gap-3 rounded-[24px] bg-white p-4 shadow-[0_16px_35px_rgba(93,58,138,0.08)]">
          <CustomerAvatar user={user} className="h-12 w-12" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-extrabold text-[#17172f]">{customerName}</p>
            <p className="truncate text-xs font-bold text-[#8ea0bc]">{isRtl ? "حساب عميل" : "Customer Account"}</p>
          </div>
        </div>
      </div>
      <nav className="admin-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto px-1" aria-label={isRtl ? "تنقل حساب العميل" : "Customer navigation"}>
        <p className="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#c6d2e3]">{isRtl ? "القائمة" : "Main"}</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setDrawerOpen(false)}
              className={cn(
                "group flex min-h-[46px] items-center gap-3 rounded-2xl px-3 text-[13px] font-extrabold text-[#667792] transition hover:bg-white hover:text-[#17172f] hover:shadow-[0_14px_30px_rgba(93,58,138,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
                active && "bg-white text-[#17172f] shadow-[0_14px_30px_rgba(93,58,138,0.09)]",
              )}
            >
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-[#9aacc5] transition group-hover:bg-[hsl(var(--primary)/0.10)] group-hover:text-[hsl(var(--primary))]", active && "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]")}>
                <Icon className="h-4 w-4" />
              </span>
              <span>{t(item.label, isRtl)}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-5 space-y-3 px-1">
        <div className="rounded-[24px] bg-white p-4 shadow-[0_16px_35px_rgba(93,58,138,0.08)]">
          <p className="text-sm font-black text-[#17172f]">{isRtl ? "تحتاج مساعدة؟" : "Need help?"}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-[#7b8da8]">{isRtl ? "فريق الدعم جاهز لمتابعة التذاكر والشهادات والتسجيلات." : "Support can help with tickets, certificates, and registrations."}</p>
          <Button asChild variant="outline" className="mt-3 h-10 w-full rounded-2xl border-[hsl(var(--primary)/0.25)] font-extrabold text-[hsl(var(--primary))]">
            <Link href="/contact">{isRtl ? "تواصل معنا" : "Contact support"}</Link>
          </Button>
        </div>
        <Button asChild variant="ghost" className="h-11 w-full justify-start gap-2 rounded-2xl font-extrabold text-[#667792] hover:bg-white hover:text-[hsl(var(--primary))]">
          <Link href="/"><ExternalLink className="h-4 w-4" />{isRtl ? "الموقع الرئيسي" : "Public site"}</Link>
        </Button>
        <Button variant="ghost" className="h-11 w-full justify-start gap-2 rounded-2xl font-extrabold text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => { clearSession(); router.replace("/login") }}>
          <LogOut className="h-4 w-4" />
          {isRtl ? "تسجيل الخروج" : "Logout"}
        </Button>
      </div>
    </aside>
  )

  return (
    <main className="admin-dashboard min-h-dvh overflow-x-hidden bg-[hsl(var(--primary)/0.07)] text-[#17172f]" dir={isRtl ? "rtl" : "ltr"}>
      <div className={cn("min-h-dvh", isRtl ? "lg:pr-[280px]" : "lg:pl-[280px]")}>
        <div className={cn("fixed inset-y-0 z-40 hidden w-[280px] border-slate-100 shadow-[18px_0_50px_rgba(93,58,138,0.06)] lg:block", isRtl ? "right-0 border-l" : "left-0 border-r")}>{sidebar}</div>
        {drawerOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label={isRtl ? "إغلاق القائمة" : "Close menu"} className="absolute inset-0 bg-slate-950/30" onClick={() => setDrawerOpen(false)} />
            <div className={cn("absolute top-0 h-full w-[84%] max-w-sm shadow-2xl", isRtl ? "right-0" : "left-0")}>{sidebar}</div>
          </div>
        ) : null}
        <section className="min-w-0">
          <header className="sticky top-0 z-30 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 rounded-[28px] bg-white/95 px-4 py-3 shadow-[0_18px_42px_rgba(93,58,138,0.08)] backdrop-blur sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8f5fb] text-[#667792] lg:hidden" onClick={() => setDrawerOpen(true)} aria-label={isRtl ? "فتح القائمة" : "Open menu"}>
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[hsl(var(--primary))]">{projectName}</p>
                  <h1 className="truncate text-xl font-black sm:text-2xl">{t(currentTitle, isRtl)}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-10 gap-2 rounded-2xl bg-[#f8f5fb] px-3 font-black text-[#17172f]" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Globe2 className="h-4 w-4" />{language === "ar" ? "EN" : "AR"}</Button>
                <Button asChild variant="outline" className="hidden h-10 rounded-2xl border-[hsl(var(--primary)/0.20)] px-4 font-black text-[hsl(var(--primary))] md:inline-flex">
                  <Link href="/"><ExternalLink className="h-4 w-4" />{isRtl ? "الموقع" : "Public site"}</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-11 gap-2 rounded-2xl bg-[#f8f5fb] px-2 sm:px-3">
                      <CustomerAvatar user={user} className="h-8 w-8 rounded-full" />
                      <span className="hidden max-w-32 truncate text-sm font-black text-[#17172f] sm:inline">{customerName}</span>
                      <ChevronDown className="h-4 w-4 text-[#8ea0bc]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRtl ? "start" : "end"} className="w-56 rounded-2xl">
                    <DropdownMenuItem asChild><Link href="/dashboard/profile">{isRtl ? "الملف الشخصي" : "Profile"}</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/security">{isRtl ? "الأمان" : "Security"}</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { clearSession(); router.replace("/login") }} className="text-red-600">{isRtl ? "تسجيل الخروج" : "Logout"}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {view === "overview" ? <Overview user={user} /> : null}
            {view === "registrations" ? <RecordList kind="registrations" /> : null}
            {view === "registration-detail" ? <RichRegistrationDetail id={recordId || ""} /> : null}
            {view === "tickets" ? <RecordList kind="tickets" /> : null}
            {view === "ticket-detail" ? <SecureTicketDetail id={recordId || ""} /> : null}
            {view === "certificates" ? <RecordList kind="certificates" /> : null}
            {view === "notifications" ? <EmptyState message={isRtl ? "الإشعارات غير مفعلة حاليا لهذا الحساب." : "Customer notifications are not enabled yet."} /> : null}
            {view === "reviews" ? <Reviews /> : null}
            {view === "profile" ? <ProfileWithPhoto user={user} onUserUpdate={setUser} /> : null}
            {view === "security" ? <Security /> : null}
            {view === "support" ? <Support /> : null}
          </div>
        </section>
      </div>
    </main>
  )
}

function Overview({ user }: { user: any }) {
  const { isRtl } = useLanguage()
  const [state, setState] = useState<any>({ loading: true })
  useEffect(() => {
    platformApi.getMyDashboard().then((data) => setState({ loading: false, data })).catch((error) => setState({ loading: false, error }))
  }, [])
  if (state.loading) return <SkeletonGrid />
  if (state.error) return <ErrorState />
  const data = state.data || {}
  const summary = data.summary || {}
  const nextEvent = data.nextEvent
  const pending = data.pendingUpcomingRegistration
  return (
    <div className="space-y-5">
      <section className={cardClass("p-5 sm:p-6")}>
        <p className="text-sm font-extrabold text-[hsl(var(--primary))]">{isRtl ? "مرحبا بعودتك،" : "Welcome back,"}</p>
        <h2 className="mt-1 text-2xl font-black text-[#17172f] sm:text-3xl">{displayName(user)}</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#667792]">{isRtl ? "تابع تسجيلاتك وتذاكرك وشهاداتك من مساحة واحدة مرتبطة بمنصة Stylish Events." : "Track your registrations, tickets, and certificates from one space connected to Stylish Events."}</p>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary icon={CalendarDays} label={isRtl ? "تسجيلات قادمة" : "Upcoming Registrations"} value={summary.upcomingRegistrations || 0} href="/dashboard/registrations" />
        <Summary icon={Ticket} label={isRtl ? "تذاكر نشطة" : "Active Tickets"} value={summary.activeTickets || 0} href="/dashboard/tickets" />
        <Summary icon={FileBadge} label={isRtl ? "شهادات متاحة" : "Available Certificates"} value={summary.availableCertificates || 0} href="/dashboard/certificates" />
        <Summary icon={BadgeCheck} label={isRtl ? "إجمالي التسجيلات" : "Total Registrations"} value={summary.totalRegistrations || 0} href="/dashboard/registrations" />
      </div>
      <CustomerNextEventCard row={nextEvent} pending={pending} />
      <section className={cardClass("p-5")}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">{isRtl ? "أحدث التسجيلات" : "Recent Registrations"}</h3>
            <p className="text-sm font-bold text-slate-500">{isRtl ? "آخر طلباتك على المنصة." : "Your latest activity on the platform."}</p>
          </div>
          <Button asChild variant="outline" className="h-10 rounded-2xl font-bold"><Link href="/dashboard/registrations">{isRtl ? "عرض الكل" : "View all"}</Link></Button>
        </div>
        <div className="mt-5"><Records rows={data.recentRegistrations || []} empty={isRtl ? "لا توجد تسجيلات بعد." : "No registrations yet."} /></div>
      </section>
    </div>
  )
}

function CustomerNextEventCard({ row, pending }: { row?: any; pending?: any }) {
  const { isRtl } = useLanguage()
  const item = row || pending
  const isPending = !row && Boolean(pending)
  if (!item) {
    return <EmptyState message={isRtl ? "لا يوجد حدث قادم بعد." : "No upcoming event yet."} />
  }
  const image = eventImage(item)
  const title = eventTitle(item, isRtl)
  const canShowQr = Boolean(item.ticket_id && item.registration_status === "approved" && (item.qr_status || "active") === "active" && !item.checked_in_at)

  return (
    <section className={cardClass("overflow-hidden")}>
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="relative min-h-[300px] bg-gradient-to-br from-[#17172f] to-[hsl(var(--primary))] p-6 text-white">
          {image ? <img src={image} alt={title || ""} className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-slate-950/5" />
          <div className="relative z-10 flex min-h-[250px] flex-col justify-end">
            <Badge className="mb-4 w-fit rounded-full bg-white/90 text-[hsl(var(--primary))] hover:bg-white/90">
              {isPending ? (isRtl ? "تسجيل قيد المراجعة" : "Under review") : (isRtl ? "الحدث القادم" : "Next Event")}
            </Badge>
            <h3 className="max-w-3xl text-2xl font-black sm:text-3xl">{title}</h3>
            <p className="mt-3 text-sm font-bold text-white/85">{formatDate(item.starts_at)} · {formatTime(item.starts_at)} - {formatTime(item.ends_at)}</p>
          </div>
        </div>
        <div className="p-6">
          {isPending ? <p className="mb-4 rounded-2xl bg-blue-50 p-4 text-sm font-black text-blue-700">{isRtl ? "تسجيلك قيد المراجعة" : "Your registration is under review"}</p> : null}
          {eventSummary(item, isRtl) ? <p className="mb-5 line-clamp-3 text-sm font-semibold leading-6 text-slate-500">{eventSummary(item, isRtl)}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label={isRtl ? "الموقع" : "Location"} value={eventLocation(item, isRtl)} />
            <DetailItem label={isRtl ? "رقم التسجيل" : "Reference"} value={item.registration_number} ltr />
            <DetailItem label={isRtl ? "حالة التسجيل" : "Registration status"} value={statusLabel(item.registration_status, isRtl)} />
            <DetailItem label={isRtl ? "حالة التذكرة" : "Ticket status"} value={item.ticket_id ? statusLabel(item.qr_status || "active", isRtl) : (isRtl ? "غير متاحة بعد" : "Not available yet")} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="h-11 rounded-2xl bg-[hsl(var(--primary))] font-black text-white">
              <Link href={`/dashboard/registrations/${item.id}`}>{isRtl ? "عرض التسجيل" : "View Registration"}</Link>
            </Button>
            {item.ticket_id ? (
              <Button asChild variant="outline" className="h-11 rounded-2xl font-black">
                <Link href={`/dashboard/tickets/${item.ticket_id}`}>{canShowQr ? (isRtl ? "عرض رمز الدخول" : "Show Check-in QR") : (isRtl ? "عرض التذكرة" : "View Ticket")}</Link>
              </Button>
            ) : null}
            {!canShowQr ? <span className="inline-flex min-h-11 items-center rounded-2xl bg-slate-50 px-4 text-sm font-bold text-slate-500">{isRtl ? "QR متاح بعد الموافقة" : "QR available after approval"}</span> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function NextEventCard({ row, pending }: { row?: any; pending?: any }) {
  const { isRtl } = useLanguage()
  const item = row || pending
  const isPending = !row && Boolean(pending)
  if (!item) {
    return <EmptyState message={isRtl ? "لا يوجد حدث قادم بعد." : "No upcoming event yet."} />
  }
  const image = apiAssetUrl(item.cover_image_url)
  return (
    <section className={cardClass("overflow-hidden")}>
      <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="relative min-h-[260px] bg-[#17172f] p-6 text-white">
          {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" /> : null}
          <div className="relative z-10 flex min-h-[220px] flex-col justify-end">
            <Badge className="mb-4 w-fit rounded-full bg-white/90 text-[hsl(var(--primary))] hover:bg-white/90">{isPending ? (isRtl ? "تسجيل قيد المراجعة" : "Under review") : (isRtl ? "الحدث القادم" : "Next Event")}</Badge>
            <h3 className="max-w-3xl text-2xl font-black sm:text-3xl">{isRtl ? item.event_title_ar : item.event_title_en}</h3>
            <p className="mt-3 text-sm font-bold text-white/80">{formatDate(item.starts_at)} · {formatTime(item.starts_at)}</p>
          </div>
        </div>
        <div className="p-6">
          {isPending ? <p className="mb-4 rounded-2xl bg-blue-50 p-4 text-sm font-black text-blue-700">{isRtl ? "تسجيلك قيد المراجعة" : "Your registration is under review"}</p> : null}
          <div className="grid gap-3">
            <DetailItem label={isRtl ? "الموقع" : "Location"} value={isRtl ? item.venue_name_ar || item.city_ar || "أونلاين" : item.venue_name_en || item.city_en || "Online"} />
            <DetailItem label={isRtl ? "رقم التسجيل" : "Reference"} value={item.registration_number} ltr />
            <DetailItem label={isRtl ? "حالة التسجيل" : "Registration status"} value={statusLabel(item.registration_status, isRtl)} />
            <DetailItem label={isRtl ? "حالة التذكرة" : "Ticket status"} value={item.ticket_id ? statusLabel(item.qr_status || "active", isRtl) : (isRtl ? "غير متاحة بعد" : "Not available yet")} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="h-11 rounded-2xl bg-[hsl(var(--primary))] font-black text-white"><Link href={`/dashboard/registrations/${item.id}`}>{isRtl ? "عرض التسجيل" : "View Registration"}</Link></Button>
            {item.ticket_id ? <Button asChild variant="outline" className="h-11 rounded-2xl font-black"><Link href={`/dashboard/tickets/${item.ticket_id}`}>{isRtl ? "عرض التذكرة" : "View Ticket"}</Link></Button> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function RecordList({ kind }: { kind: "registrations" | "tickets" | "certificates" }) {
  const { isRtl } = useLanguage()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [period, setPeriod] = useState("all")
  const [page, setPage] = useState(1)
  const [state, setState] = useState<any>({ loading: true, rows: [], pagination: { total: 0, page: 1, perPage: 10 } })
  const title = kind === "tickets" ? (isRtl ? "تذاكري" : "My Tickets") : kind === "certificates" ? (isRtl ? "شهاداتي" : "My Certificates") : (isRtl ? "تسجيلاتي" : "My Registrations")
  useEffect(() => { setPage(1) }, [search, status, period])
  useEffect(() => {
    const params = { search, status: status === "all" ? "" : status, period, page, perPage: 10 }
    const loader = kind === "tickets" ? platformApi.listMyTickets(params) : kind === "certificates" ? platformApi.listMyCertificates(params) : platformApi.listMyRegistrations(params)
    setState((current: any) => ({ ...current, loading: true }))
    loader.then((data: any) => setState({ loading: false, rows: data.data || [], pagination: data.pagination || {} })).catch((error: any) => setState({ loading: false, error, rows: [] }))
  }, [kind, page, period, search, status])
  return (
    <section className="space-y-4">
      <div className={cardClass("p-5")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 className="text-2xl font-black">{title}</h2><p className="text-sm font-bold text-slate-500">{isRtl ? "القوائم مفلترة من الخادم حسب حسابك." : "Lists are server-filtered to your account."}</p></div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="relative"><Search className="absolute top-3 h-4 w-4 text-slate-400 ltr:left-3 rtl:right-3" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isRtl ? "بحث..." : "Search..."} className="h-11 rounded-2xl border-slate-200 bg-[#f8f5fb] ltr:pl-9 rtl:pr-9" /></div>
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-11 rounded-2xl bg-[#f8f5fb]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{isRtl ? "كل الحالات" : "All statuses"}</SelectItem><SelectItem value="approved">{isRtl ? "معتمد" : "Approved"}</SelectItem><SelectItem value="pending_verification">{isRtl ? "قيد المراجعة" : "Pending review"}</SelectItem><SelectItem value="cancelled">{isRtl ? "ملغي" : "Cancelled"}</SelectItem></SelectContent></Select>
            {kind === "registrations" ? <Select value={period} onValueChange={setPeriod}><SelectTrigger className="h-11 rounded-2xl bg-[#f8f5fb]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{isRtl ? "كل المواعيد" : "All dates"}</SelectItem><SelectItem value="upcoming">{isRtl ? "القادمة" : "Upcoming"}</SelectItem><SelectItem value="past">{isRtl ? "السابقة" : "Past"}</SelectItem></SelectContent></Select> : null}
          </div>
        </div>
      </div>
      <div className={cardClass("p-5")}>
        {state.loading ? <SkeletonGrid /> : state.error ? <ErrorState /> : <Records rows={state.rows} empty={isRtl ? "لا توجد بيانات متاحة." : "No records found."} />}
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-500">{isRtl ? "الإجمالي" : "Total"}: {state.pagination?.total || 0}</p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="h-10 rounded-2xl font-bold">{isRtl ? "السابق" : "Previous"}</Button>
            <Button variant="outline" disabled={page * (state.pagination?.perPage || 10) >= (state.pagination?.total || 0)} onClick={() => setPage((current) => current + 1)} className="h-10 rounded-2xl font-bold">{isRtl ? "التالي" : "Next"}</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Records({ rows, empty }: { rows: any[]; empty: string }) {
  const { isRtl } = useLanguage()
  if (!rows.length) return <EmptyState message={empty} />
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <article key={`${row.id}-${row.registration_number || row.ticket_number || row.certificate_number || "record"}`} className="grid gap-4 rounded-2xl border border-slate-100 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <p className="truncate text-base font-black">{isRtl ? row.event_title_ar : row.event_title_en}</p>
            <p className="mt-1 text-sm font-bold text-slate-500"><span dir="ltr">{row.registration_number || row.ticket_number || row.certificate_number}</span> · {formatDate(row.starts_at || row.created_at || row.issued_at)}</p>
            <div className="mt-3 flex flex-wrap gap-2"><StatusBadge value={row.registration_status || row.qr_status || row.certificate_status} />{row.ticket_number ? <Badge className="rounded-full bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.12)]"><span dir="ltr">{row.ticket_number}</span></Badge> : null}</div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button asChild variant="outline" className="h-10 rounded-2xl font-bold"><Link href={`/dashboard/registrations/${row.registration_id || row.id}`}>{isRtl ? "التفاصيل" : "Details"}</Link></Button>
            {row.ticket_id ? <Button asChild variant="outline" className="h-10 rounded-2xl font-bold"><Link href={`/dashboard/tickets/${row.ticket_id}`}>{isRtl ? "التذكرة" : "Ticket"}</Link></Button> : null}
          </div>
        </article>
      ))}
    </div>
  )
}

function RichRegistrationDetail({ id }: { id: string }) {
  const { isRtl } = useLanguage()
  const [state, setState] = useState<any>({ loading: true })
  useEffect(() => { if (id) platformApi.getMyRegistration(id).then((data) => setState({ loading: false, data })).catch((error) => setState({ loading: false, error })) }, [id])
  if (!id || state.error) return <ErrorState />
  if (state.loading) return <SkeletonGrid />
  const row = state.data
  const title = eventTitle(row, isRtl)
  const image = eventImage(row)
  return (
    <section className="space-y-4">
      <Button asChild variant="outline" className="h-10 rounded-2xl font-bold"><Link href="/dashboard/registrations">{isRtl ? "رجوع" : "Back"}</Link></Button>
      <div className={cardClass("overflow-hidden")}>
        <div className="relative min-h-[280px] bg-gradient-to-br from-[#17172f] to-[hsl(var(--primary))] p-6 text-white">
          {image ? <img src={image} alt={title || ""} className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
          <div className="relative z-10 flex min-h-[230px] flex-col justify-end">
            <p className="text-sm font-black text-white/80" dir="ltr">{row.registration_number}</p>
            <h2 className="mt-2 max-w-4xl text-3xl font-black">{title}</h2>
            <p className="mt-3 text-sm font-bold text-white/85">{formatDate(row.starts_at)} · {formatTime(row.starts_at)} - {formatTime(row.ends_at)} · {eventLocation(row, isRtl)}</p>
          </div>
        </div>
        <div className="p-5">
          {eventSummary(row, isRtl) ? <p className="max-w-4xl text-sm font-semibold leading-7 text-slate-600">{eventSummary(row, isRtl)}</p> : null}
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label={isRtl ? "حامل التسجيل" : "Registration holder"} value={row.full_name} />
            <DetailItem label={isRtl ? "البريد الإلكتروني" : "Email"} value={row.email} ltr />
            <DetailItem label={isRtl ? "نوع التذكرة" : "Ticket type"} value={isRtl ? row.ticket_name_ar : row.ticket_name_en} />
            <DetailItem label={isRtl ? "حالة التسجيل" : "Registration status"} value={statusLabel(row.registration_status, isRtl)} />
            <DetailItem label={isRtl ? "حالة الدفع" : "Payment status"} value={statusLabel(row.payment_status, isRtl)} />
            <DetailItem label={isRtl ? "المبلغ" : "Amount"} value={`${row.selected_currency || ""} ${Number(row.selected_price || 0).toLocaleString()}`} ltr />
            <DetailItem label={isRtl ? "العنوان" : "Address"} value={isRtl ? row.address_ar || row.city_ar : row.address_en || row.city_en} />
            <DetailItem label={isRtl ? "آخر موعد للتسجيل" : "Registration deadline"} value={formatDate(row.registration_ends_at)} />
            <DetailItem label={isRtl ? "حالة التذكرة" : "Ticket status"} value={row.ticket_id ? statusLabel(row.qr_status || "active", isRtl) : (isRtl ? "غير متاحة بعد" : "Not available yet")} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {row.ticket_id ? <Button asChild className="h-11 rounded-2xl bg-[hsl(var(--primary))] font-black text-white"><Link href={`/dashboard/tickets/${row.ticket_id}`}>{isRtl ? "عرض التذكرة" : "View Ticket"}</Link></Button> : null}
            {row.google_maps_url ? <Button asChild variant="outline" className="h-11 rounded-2xl font-black"><Link href={row.google_maps_url} target="_blank">{isRtl ? "الموقع على الخريطة" : "Open map"}</Link></Button> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function RegistrationDetail({ id }: { id: string }) {
  const { isRtl } = useLanguage()
  const [state, setState] = useState<any>({ loading: true })
  useEffect(() => { if (id) platformApi.getMyRegistration(id).then((data) => setState({ loading: false, data })).catch((error) => setState({ loading: false, error })) }, [id])
  if (!id || state.error) return <ErrorState />
  if (state.loading) return <SkeletonGrid />
  const row = state.data
  return <DetailPage back="/dashboard/registrations" row={row} title={isRtl ? row.event_title_ar : row.event_title_en} reference={row.registration_number} />
}

function SecureTicketDetail({ id }: { id: string }) {
  const { isRtl } = useLanguage()
  const [state, setState] = useState<any>({ loading: true })
  const [qrState, setQrState] = useState<any>({ open: false, loading: false })
  useEffect(() => { if (id) platformApi.getMyTicket(id).then((data) => setState({ loading: false, data })).catch((error) => setState({ loading: false, error })) }, [id])
  if (!id || state.error) return <ErrorState />
  if (state.loading) return <SkeletonGrid />
  const row = state.data
  const qrReady = row.registration_status === "approved" && (row.qr_status || "active") === "active" && !row.checked_in_at
  return (
    <section className="space-y-4">
      <Button asChild variant="outline" className="h-10 rounded-2xl font-bold"><Link href="/dashboard/tickets">{isRtl ? "رجوع للتذاكر" : "Back to tickets"}</Link></Button>
      <div className={cardClass("grid gap-5 overflow-hidden p-5 lg:grid-cols-[360px_1fr]")}>
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <div className="relative h-56 bg-gradient-to-br from-[#17172f] to-[hsl(var(--primary))]">
            {eventImage(row) ? <img src={eventImage(row)} alt={eventTitle(row, isRtl) || ""} className="absolute inset-0 h-full w-full object-cover" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.12em] opacity-80">{isRtl ? "تذكرة دخول" : "Check-in Ticket"}</p>
              <h2 className="mt-1 line-clamp-2 text-lg font-black">{eventTitle(row, isRtl)}</h2>
            </div>
          </div>
          <div className="p-4">
            <StatusBadge value={row.checked_in_at ? "used" : row.qr_status || "active"} />
            <p className="mt-3 text-sm font-black" dir="ltr">{row.ticket_number}</p>
            <Button className="mt-4 h-11 w-full rounded-2xl bg-[hsl(var(--primary))] font-black text-white" disabled={!qrReady || qrState.loading} onClick={async () => { setQrState({ open: true, loading: true }); try { const qr = await platformApi.getMyTicketQr(id); setQrState({ open: true, loading: false, data: qr }) } catch (error) { setQrState({ open: true, loading: false, error: error instanceof Error ? error.message : "QR unavailable" }) } }}>
              <QrCode className="h-4 w-4" />
              {qrReady ? (isRtl ? "عرض رمز الدخول" : "Show Check-in QR") : (isRtl ? "QR متاح بعد الموافقة" : "QR available after approval")}
            </Button>
            {!qrReady ? <p className="mt-3 text-xs font-bold leading-5 text-slate-500">{isRtl ? "سيصبح رمز QR متاحا بعد الموافقة على تسجيلك وإصدار التذكرة." : "Your QR code will be available once your registration is approved and your ticket is issued."}</p> : null}
          </div>
        </div>
        <TicketInfo row={row} />
      </div>
      {qrState.open ? <QrOverlay qrState={qrState} onClose={() => setQrState({ open: false, loading: false })} /> : null}
    </section>
  )
}

function QrOverlay({ qrState, onClose }: { qrState: any; onClose: () => void }) {
  const { isRtl } = useLanguage()
  const data = qrState.data || {}
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/80 p-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 text-center shadow-2xl" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-[hsl(var(--primary))]">{isRtl ? "رمز الدخول" : "Check-in QR"}</p>
          <Button variant="ghost" className="h-10 rounded-xl" onClick={onClose}>{isRtl ? "إغلاق" : "Close"}</Button>
        </div>
        {qrState.loading ? <SkeletonGrid /> : qrState.error ? <ErrorState /> : (
          <div className="mt-4">
            <div className="mx-auto inline-block rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm" dir="ltr">
              <QRCodeSVG value={data.qrPayload || ""} size={260} level="H" />
            </div>
            <h2 className="mt-4 text-lg font-black">{isRtl ? data.eventTitleAr || data.eventTitleEn : data.eventTitleEn || data.eventTitleAr}</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">{isRtl ? "اعرض رمز QR هذا لموظف تسجيل الدخول." : "Present this QR code to the check-in staff."}</p>
            <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
              <span dir="ltr">{data.ticketNumber}</span>
              <span>{data.holderName}</span>
              <span>{formatDate(data.startsAt)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TicketDetail({ id }: { id: string }) {
  const { isRtl } = useLanguage()
  const [state, setState] = useState<any>({ loading: true })
  useEffect(() => { if (id) platformApi.getMyTicket(id).then((data) => setState({ loading: false, data })).catch((error) => setState({ loading: false, error })) }, [id])
  if (!id || state.error) return <ErrorState />
  if (state.loading) return <SkeletonGrid />
  const row = state.data
  return (
    <section className="space-y-4">
      <Button asChild variant="outline" className="h-10 rounded-2xl font-bold"><Link href="/dashboard/tickets">{isRtl ? "رجوع للتذاكر" : "Back to tickets"}</Link></Button>
      <div className={cardClass("grid gap-4 p-5 lg:grid-cols-[280px_1fr]")}>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center" dir="ltr">{row.qr_token ? <div className="inline-block rounded-2xl bg-white p-4 shadow-sm"><QRCodeSVG value={row.qr_token} size={180} level="H" /></div> : <EmptyState message={isRtl ? "رمز QR غير متاح بعد." : "QR code is not available yet."} />}<p className="mt-4 text-sm font-black text-slate-900">{row.ticket_number}</p><StatusBadge value={row.qr_status || "active"} /></div>
        <TicketInfo row={row} />
      </div>
    </section>
  )
}

function TicketInfo({ row }: { row: any }) {
  const { isRtl } = useLanguage()
  return <div><p className="text-sm font-black text-[hsl(var(--primary))]" dir="ltr">{row.registration_number}</p><h2 className="mt-2 text-xl font-black">{isRtl ? row.event_title_ar : row.event_title_en}</h2><div className="mt-6 grid gap-3 md:grid-cols-2"><DetailItem label={isRtl ? "حامل التذكرة" : "Ticket holder"} value={row.full_name} /><DetailItem label={isRtl ? "البريد الإلكتروني" : "Email"} value={row.email} ltr /><DetailItem label={isRtl ? "نوع التذكرة" : "Ticket type"} value={isRtl ? row.ticket_name_ar : row.ticket_name_en} /><DetailItem label={isRtl ? "تاريخ الفعالية" : "Event date"} value={formatDate(row.starts_at)} /></div>{row.pdf_url ? <Button asChild className="mt-6 h-11 rounded-xl bg-[hsl(var(--primary))] font-black"><Link href={apiAssetUrl(row.pdf_url)}>{isRtl ? "تحميل التذكرة" : "Download Ticket"}</Link></Button> : null}</div>
}

function DetailPage({ back, row, title, reference }: { back: string; row: any; title: string; reference?: string }) {
  const { isRtl } = useLanguage()
  return <section className="space-y-4"><Button asChild variant="outline" className="h-10 rounded-2xl font-bold"><Link href={back}>{isRtl ? "رجوع" : "Back"}</Link></Button><div className={cardClass("p-5")}><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><p className="text-sm font-black text-[hsl(var(--primary))]" dir="ltr">{reference}</p><h2 className="mt-2 text-xl font-black">{title}</h2><p className="mt-2 text-sm font-bold text-slate-500">{formatDate(row.starts_at)} · {isRtl ? row.venue_name_ar || row.city_ar : row.venue_name_en || row.city_en || "Online"}</p></div><StatusBadge value={row.registration_status} /></div><div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3"><DetailItem label={isRtl ? "حامل التسجيل" : "Registration holder"} value={row.full_name} /><DetailItem label={isRtl ? "البريد الإلكتروني" : "Email"} value={row.email} ltr /><DetailItem label={isRtl ? "نوع التذكرة" : "Ticket type"} value={isRtl ? row.ticket_name_ar : row.ticket_name_en} /><DetailItem label={isRtl ? "حالة الدفع" : "Payment status"} value={statusLabel(row.payment_status, isRtl)} /><DetailItem label={isRtl ? "المبلغ" : "Amount"} value={`${row.selected_currency || ""} ${Number(row.selected_price || 0).toLocaleString()}`} ltr /><DetailItem label={isRtl ? "تاريخ الإنشاء" : "Created"} value={formatDate(row.created_at)} /></div><div className="mt-6 flex flex-wrap gap-3">{row.ticket_id ? <Button asChild className="h-11 rounded-2xl bg-[hsl(var(--primary))] font-black text-white"><Link href={`/dashboard/tickets/${row.ticket_id}`}>{isRtl ? "عرض التذكرة" : "View Ticket"}</Link></Button> : null}</div></div></section>
}

function DetailItem({ label, value, ltr = false }: { label: string; value?: string | number | null; ltr?: boolean }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-black text-slate-900" dir={ltr ? "ltr" : undefined}>{value || "-"}</p></div>
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function ProfileWithPhoto({ user, onUserUpdate }: { user: any; onUserUpdate: (user: any) => void }) {
  const { isRtl } = useLanguage()
  const [form, setForm] = useState({ name: displayName(user, ""), phone: user?.phone || "", preferredLanguage: user?.preferred_language || "en" })
  const [photoPreview, setPhotoPreview] = useState("")
  const [saving, setSaving] = useState(false)
  const [photoSaving, setPhotoSaving] = useState(false)
  const [message, setMessage] = useState("")
  const photoSrc = photoPreview || avatarUrl(user)

  return (
    <section className={cardClass("p-5")}>
      <h2 className="text-2xl font-black">{isRtl ? "الملف الشخصي" : "Profile"}</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-4">
            <CustomerAvatar user={{ ...user, avatar_url: photoSrc }} className="h-20 w-20" />
            <div>
              <p className="text-sm font-black text-slate-900">{isRtl ? "الصورة الشخصية" : "Profile photo"}</p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{isRtl ? "PNG أو JPG أو WebP حتى 2MB." : "PNG, JPG, or WebP up to 2MB."}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--primary)/0.25)] bg-white px-4 text-sm font-black text-[hsl(var(--primary))]">
              <Camera className="h-4 w-4" />
              {isRtl ? "اختيار صورة" : "Choose photo"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={photoSaving} onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return setMessage(isRtl ? "نوع الصورة غير مدعوم." : "Unsupported image type.")
                if (file.size > 2 * 1024 * 1024) return setMessage(isRtl ? "الصورة أكبر من 2MB." : "Image is larger than 2MB.")
                setPhotoSaving(true)
                setMessage("")
                try {
                  const dataUrl = await fileToDataUrl(file)
                  setPhotoPreview(dataUrl)
                  const result = await platformApi.uploadMyAvatar({ fileName: file.name, dataUrl })
                  onUserUpdate((current: any) => ({ ...current, avatar_url: result.url || result.avatar_url }))
                  setPhotoPreview("")
                  setMessage(isRtl ? "تم تحديث الصورة." : "Profile photo updated.")
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Upload failed")
                } finally {
                  setPhotoSaving(false)
                  event.target.value = ""
                }
              }} />
            </label>
            <Button variant="outline" className="h-11 rounded-2xl font-black text-red-600" disabled={photoSaving || !avatarUrl(user)} onClick={async () => {
              setPhotoSaving(true)
              setMessage("")
              try {
                await platformApi.removeMyAvatar()
                onUserUpdate((current: any) => ({ ...current, avatar_url: null, avatarUrl: null }))
                setPhotoPreview("")
                setMessage(isRtl ? "تم حذف الصورة." : "Profile photo removed.")
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Remove failed")
              } finally {
                setPhotoSaving(false)
              }
            }}>{isRtl ? "حذف الصورة" : "Remove photo"}</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={isRtl ? "الاسم الكامل" : "Full name"} value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <div className="grid gap-2 text-sm font-extrabold text-slate-700">{isRtl ? "البريد الإلكتروني" : "Email"}<Input value={user?.email || ""} readOnly dir="ltr" className="h-11 rounded-2xl border-slate-200 bg-[#f8f5fb] text-slate-500" /><p className="text-xs font-bold text-slate-400">{isRtl ? "تغيير البريد يحتاج تواصل مع الدعم حاليا." : "Email changes currently require support verification."}</p></div>
          <Field label={isRtl ? "الهاتف" : "Phone"} value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
        </div>
      </div>
      {message ? <p className="mt-4 text-sm font-bold text-slate-600">{message}</p> : null}
      <Button className="mt-5 h-11 rounded-2xl bg-[hsl(var(--primary))] font-black text-white" disabled={saving} onClick={async () => {
        setSaving(true)
        setMessage("")
        try {
          const updated = await platformApi.updateMe(form)
          window.localStorage.setItem("stylish-events-admin-user", JSON.stringify(updated))
          onUserUpdate((current: any) => ({ ...current, ...updated, customer_full_name: updated.customer_full_name || updated.name || current?.customer_full_name }))
          setMessage(isRtl ? "تم حفظ الملف الشخصي." : "Profile saved.")
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Save failed")
        } finally {
          setSaving(false)
        }
      }}>{saving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ" : "Save")}</Button>
    </section>
  )
}

function Profile({ user, onUserUpdate }: { user: any; onUserUpdate: (user: any) => void }) {
  const { isRtl } = useLanguage()
  const [form, setForm] = useState({ name: displayName(user, ""), phone: user?.phone || "", preferredLanguage: user?.preferred_language || "en" })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  return <section className={cardClass("p-5")}><h2 className="text-2xl font-black">{isRtl ? "الملف الشخصي" : "Profile"}</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label={isRtl ? "الاسم الكامل" : "Full name"} value={form.name} onChange={(name) => setForm({ ...form, name })} /><div className="grid gap-2 text-sm font-extrabold text-slate-700">{isRtl ? "البريد الإلكتروني" : "Email"}<Input value={user?.email || ""} readOnly dir="ltr" className="h-11 rounded-2xl border-slate-200 bg-[#f8f5fb] text-slate-500" /><p className="text-xs font-bold text-slate-400">{isRtl ? "تغيير البريد يحتاج تواصل مع الدعم حاليا." : "Email changes currently require support verification."}</p></div><Field label={isRtl ? "الهاتف" : "Phone"} value={form.phone} onChange={(phone) => setForm({ ...form, phone })} /></div>{message ? <p className="mt-4 text-sm font-bold text-slate-600">{message}</p> : null}<Button className="mt-5 h-11 rounded-2xl bg-[hsl(var(--primary))] font-black text-white" disabled={saving} onClick={async () => { setSaving(true); setMessage(""); try { const updated = await platformApi.updateMe(form); window.localStorage.setItem("stylish-events-admin-user", JSON.stringify(updated)); onUserUpdate((current: any) => ({ ...current, ...updated, customer_full_name: updated.customer_full_name || updated.name || current?.customer_full_name })); setMessage(isRtl ? "تم حفظ الملف الشخصي." : "Profile saved.") } catch (error) { setMessage(error instanceof Error ? error.message : "Save failed") } finally { setSaving(false) } }}>{saving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ" : "Save")}</Button></section>
}

function Security() {
  const { isRtl } = useLanguage()
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" })
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  return <section className={cardClass("p-5")}><h2 className="text-2xl font-black">{isRtl ? "الأمان" : "Security"}</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label={isRtl ? "كلمة المرور الحالية" : "Current password"} type="password" value={form.currentPassword} onChange={(currentPassword) => setForm({ ...form, currentPassword })} /><Field label={isRtl ? "كلمة المرور الجديدة" : "New password"} type="password" value={form.newPassword} onChange={(newPassword) => setForm({ ...form, newPassword })} /><Field label={isRtl ? "تأكيد كلمة المرور" : "Confirm password"} type="password" value={form.confirm} onChange={(confirm) => setForm({ ...form, confirm })} /></div>{message ? <p className="mt-4 text-sm font-bold text-slate-600">{message}</p> : null}<Button className="mt-5 h-11 rounded-2xl bg-[hsl(var(--primary))] font-black text-white" disabled={saving} onClick={async () => { if (form.newPassword !== form.confirm) return setMessage(isRtl ? "كلمة المرور غير متطابقة." : "Passwords do not match."); setSaving(true); try { await platformApi.updateMyPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }); setForm({ currentPassword: "", newPassword: "", confirm: "" }); setMessage(isRtl ? "تم تحديث كلمة المرور." : "Password updated.") } catch (error) { setMessage(error instanceof Error ? error.message : "Update failed") } finally { setSaving(false) } }}>{saving ? (isRtl ? "جاري التحديث..." : "Updating...") : (isRtl ? "تحديث كلمة المرور" : "Update password")}</Button></section>
}

function Reviews() {
  const { isRtl } = useLanguage()
  const [state, setState] = useState<any>({ loading: true })
  useEffect(() => { platformApi.listMyReviews().then((data: any) => setState({ loading: false, rows: data.data || [] })).catch((error: any) => setState({ loading: false, error })) }, [])
  if (state.loading) return <SkeletonGrid />
  if (state.error) return <ErrorState />
  return <Records rows={state.rows} empty={isRtl ? "لا توجد تقييمات مرتبطة بحسابك." : "No reviews linked to your account."} />
}

function Support() {
  const { isRtl } = useLanguage()
  return <section className={cardClass("p-5")}><h2 className="text-2xl font-black">{isRtl ? "الدعم" : "Support"}</h2><p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">{isRtl ? "لأي استفسار عن التسجيلات أو التذاكر أو الشهادات، استخدم صفحة التواصل الرسمية وسيتم إنشاء رقم متابعة." : "For registration, ticket, or certificate support, use the official Contact page and you will receive a support reference."}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><DetailItem label={isRtl ? "البريد" : "Email"} value="info@stylish-holidays.com" ltr /><DetailItem label={isRtl ? "الدعم" : "Support"} value={isRtl ? "متابعة عبر صفحة التواصل" : "Handled through the Contact workflow"} /></div><Button asChild className="mt-5 h-11 rounded-2xl bg-[hsl(var(--primary))] font-black text-white"><Link href="/contact">{isRtl ? "إرسال استفسار" : "Submit inquiry"} <ExternalLink className="h-4 w-4" /></Link></Button></section>
}

function Summary({ icon: Icon, label, value, href }: { icon: any; label: string; value: number; href: string }) {
  return <Link href={href} className="grid min-h-[126px] rounded-[var(--radius)] border border-white/70 bg-white p-4 shadow-[0_18px_42px_rgba(93,58,138,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(93,58,138,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"><Icon className="h-5 w-5 stroke-[1.8]" /></span><p className="mt-3 min-h-10 text-sm font-extrabold leading-5 text-slate-500">{label}</p><p className="mt-1 font-mono text-3xl font-black tabular-nums text-[#020617]">{Number(value || 0).toLocaleString("en")}</p></Link>
}

function StatusBadge({ value }: { value?: string }) {
  const { isRtl } = useLanguage()
  const normalized = String(value || "pending")
  return <Badge className={cn("rounded-full capitalize hover:bg-current", statusTone[normalized] || "bg-slate-100 text-slate-700")}>{statusLabel(normalized, isRtl)}</Badge>
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="grid gap-2 text-sm font-extrabold text-slate-700">{label}<Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-2xl border-slate-200 bg-[#f8f5fb]" /></label>
}

function EmptyState({ message }: { message: string }) {
  const { isRtl } = useLanguage()
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"><p className="text-base font-black text-slate-700">{message}</p><Button asChild variant="outline" className="mt-4 h-10 rounded-xl font-bold"><Link href="/upcoming-events">{isRtl ? "استعرض الفعاليات القادمة" : "Explore Upcoming Events"}</Link></Button></div>
}

function ErrorState() {
  const { isRtl } = useLanguage()
  return <div className="rounded-2xl bg-red-50 p-5 text-sm font-bold text-red-700">{isRtl ? "تعذر تحميل البيانات. حاول مرة أخرى." : "Could not load data. Please try again."}</div>
}

function SkeletonGrid() {
  return <div className="grid gap-4"><div className="h-36 animate-pulse rounded-2xl bg-slate-100" /><div className="h-24 animate-pulse rounded-2xl bg-slate-100" /></div>
}

function PortalLoading({ isRtl }: { isRtl: boolean }) {
  return <main className="grid min-h-dvh place-items-center bg-slate-50" dir={isRtl ? "rtl" : "ltr"}><div className="flex items-center gap-3 text-sm font-black text-slate-500"><RefreshCw className="h-5 w-5 animate-spin text-[hsl(var(--primary))]" />{isRtl ? "جاري تحميل حسابك..." : "Loading your account..."}</div></main>
}
