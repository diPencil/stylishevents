// @ts-nocheck
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  FileBadge,
  MessageSquareText,
  QrCode,
  ReceiptText,
  Send,
  Star,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminPermissions } from "@/components/admin/admin-shell"
import { useLanguage } from "@/contexts/language-context"
import { adminStatusT, adminT } from "@/lib/admin-translations"
import { canAny } from "@/lib/admin-permissions"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"

type RevenueTrendMode = "monthly" | "yearly"

const emptyState = {
  events: [],
  registrations: [],
  attendees: [],
  tickets: [],
  reviews: [],
  certificateDelivery: [],
  ticketPerformance: [],
  summary: { registrations: [], payments: [], revenue: [], certificates: [] },
}

export default function AdminOverviewPage() {
  const { language } = useLanguage()
  const { permissions } = useAdminPermissions()
  const [revenueMode, setRevenueMode] = useState<RevenueTrendMode>("monthly")
  const [state, setState] = useState<any>({ ...emptyState, loading: true })

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      const safe = async (task: Promise<any>, fallback: any) => task.catch(() => fallback)
      const [events, registrations, attendees, tickets, reviews, certificateDelivery, ticketPerformance, summary] =
        await Promise.all([
          safe(platformApi.listEvents({ includeDeleted: true }), []),
          safe(platformApi.listRegistrations({ limit: 1000 }), []),
          safe(platformApi.listAttendees(), []),
          safe(platformApi.listTickets(), []),
          safe(platformApi.listReviews(), []),
          safe(platformApi.listCertificateDelivery(), []),
          safe(platformApi.reportTicketPerformance(), []),
          safe(platformApi.reportSummary(), emptyState.summary),
        ])

      if (!active) return
      setState({
        loading: false,
        events: normalizeList(events),
        registrations: normalizeList(registrations),
        attendees: normalizeList(attendees),
        tickets: normalizeList(tickets),
        reviews: normalizeList(reviews),
        certificateDelivery: normalizeList(certificateDelivery),
        ticketPerformance: normalizeList(ticketPerformance),
        summary: summary || emptyState.summary,
      })
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [])

  const computed = useMemo(() => buildOverviewState(state), [state])
  const nextEventDate = formatDate(computed.nextEvent?.starts_at, language)
  const nextEventEndDate = formatDate(computed.nextEvent?.ends_at, language)
  const eventCalendar = buildEventCalendar(computed.nextEvent)
  const ticketSoldPercent = computed.ticketQuota ? Math.min(100, Math.round((computed.ticketsSold / computed.ticketQuota) * 100)) : 0

  const metricCards = [
    { label: adminT(language, "overview.totalEvents") || "Total Events", value: computed.eventsCount, icon: CalendarDays },
    { label: adminT(language, "overview.registrations") || "Registrations", value: computed.registrations, icon: Users },
    { label: adminT(language, "overview.ticketsSold") || "Tickets Sold", value: computed.ticketsSold, icon: Ticket },
    { label: adminT(language, "overview.seats") || "Seats", value: computed.seats, icon: Ticket },
  ]

  const eventStatusCards = [
    { label: adminT(language, "overview.activeEvents") || "Active events", value: computed.activeEvents, icon: CalendarDays },
    { label: adminT(language, "overview.draftEvents") || "Draft events", value: computed.draftEvents, icon: FileBadge },
    { label: adminT(language, "overview.upcomingEvents") || "Upcoming events", value: computed.upcoming.length, icon: Clock3 },
    { label: adminT(language, "overview.disabledEvents") || "Disabled events", value: computed.disabledEvents, icon: AlertCircle },
  ]

  const canManageEvents = canAny(permissions, ["events.manage"])
  const quickActions = [
    canManageEvents && { href: "/admin/events/create", label: adminT(language, "common.createEvent") || "Create Event", icon: CalendarDays },
    canAny(permissions, ["registrations.manage"]) && {
      href: "/admin/registrations",
      label: adminT(language, "overview.reviewRegistrations") || "Review registrations",
      icon: ClipboardList,
    },
    canAny(permissions, ["registrations.manage", "payments.verify"]) && {
      href: "/admin/orders",
      label: adminT(language, "overview.reviewPayments") || "Review payments",
      icon: ReceiptText,
    },
    canAny(permissions, ["checkin.manage"]) && { href: "/admin/checkin", label: adminT(language, "overview.openCheckin") || "Open check-in", icon: QrCode },
    canAny(permissions, ["certificates.manage"]) && {
      href: "/admin/certificates/builder",
      label: adminT(language, "overview.certificateBuilder") || "Certificate builder",
      icon: FileBadge,
    },
    canAny(permissions, ["contact_inquiries.manage"]) && {
      href: "/admin/contact-inquiries",
      label: adminT(language, "overview.contactInquiries") || "Contact inquiries",
      icon: MessageSquareText,
    },
    canAny(permissions, ["reports.view"]) && {
      href: "/admin/reports",
      label: adminT(language, "overview.viewReports") || "View reports",
      icon: ClipboardCheck,
    },
  ].filter(Boolean)

  const businessIndicators = [
    canAny(permissions, ["dashboard.view", "events.manage"]) && {
      label: adminT(language, "overview.businessEvents") || "Events",
      value: state.loading ? "—" : computed.eventsCount,
      icon: CalendarDays,
    },
    canAny(permissions, ["tickets.manage", "registrations.manage", "payments.verify"]) && {
      label: adminT(language, "overview.businessSold") || "Sold",
      value: state.loading ? "—" : computed.ticketsSold,
      icon: Ticket,
    },
    canAny(permissions, ["checkin.manage", "attendees.manage"]) && {
      label: adminT(language, "overview.businessCheckin") || "Check-in",
      value: state.loading ? "—" : `${computed.attendanceRate}%`,
      icon: ClipboardCheck,
    },
    canAny(permissions, ["reviews.view", "reviews.manage"]) && {
      label: adminT(language, "overview.businessRating") || "Rating",
      value: state.loading ? "—" : computed.avgRating ? computed.avgRating.toFixed(1) : "—",
      icon: Star,
    },
  ].filter(Boolean)

  return (
    <div className="admin-overview-shell pt-2">
      <div className="admin-dashboard-density space-y-7">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <Badge className="mb-3 rounded-xl bg-[hsl(var(--primary))] px-3 py-1 text-white hover:bg-[hsl(var(--primary))]">
            {adminT(language, "overview.eyebrow") || "Dashboard"}
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#17172f] md:text-4xl">
            {adminT(language, "overview.title") || "Dashboard"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500 md:text-base">
            {adminT(language, "overview.subtitle") || "Manage events, registrations, tickets, payments, and attendees from one place."}
          </p>
        </div>
        {canManageEvents ? (
          <Button asChild className="h-12 rounded-2xl bg-[hsl(var(--primary))] px-5 text-sm font-extrabold text-white shadow-lg shadow-[hsl(var(--primary)/0.20)]">
            <Link href="/admin/events/create">
              <CalendarDays className="h-4 w-4" />
              {adminT(language, "common.createEvent") || "Create Event"}
            </Link>
          </Button>
        ) : null}
      </header>

      <BusinessOverviewCard
        eyebrow={adminT(language, "overview.commandCenter") || "Command Center"}
        title={adminT(language, "overview.businessOverview") || "Business Overview"}
        copy={adminT(language, "overview.businessCopy") || "A unified overview of events, registrations, ticketing, attendance, certificates, and reviews."}
        indicators={businessIndicators}
      />

      <section className="dashboard-metric-grid">
        {metricCards.map((card) => (
          <MetricCard key={card.label} icon={card.icon} label={card.label} value={state.loading ? "-" : card.value} />
        ))}
      </section>

      <section className="dashboard-secondary-grid">
        <SideStatCard icon={Ticket} label={language === "ar" ? "المقاعد المتاحة" : "Capacity left"} value={computed.capacityLeft} hint={language === "ar" ? "مقاعد مفتوحة في الفعاليات النشطة" : "Open seats across active events"} />
        <SideStatCard icon={AlertCircle} label={adminT(language, "overview.pendingPayments") || "Pending payments"} value={computed.pending} hint={language === "ar" ? "حجوزات في انتظار المراجعة" : "Bookings waiting for review"} />
        <SideStatCard icon={ClipboardCheck} label={language === "ar" ? "حضور اليوم" : "Today check-ins"} value={computed.todayCheckIns} hint={language === "ar" ? "تحديثات الحضور المباشر" : "Live attendance updates"} />
      </section>

      <section className="dashboard-analytics-grid">
            <Card className="min-w-0 rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
              <CardHeader className="px-6 pb-3 pt-6">
                <CardTitle className="text-xl font-extrabold">{adminT(language, "overview.ticketSales") || "Ticket Sales"}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div
                  className="mx-auto flex h-52 w-52 items-center justify-center rounded-full p-6"
                  style={{
                    background: `conic-gradient(hsl(var(--primary)) 0 ${ticketSoldPercent}%, hsl(var(--secondary)) ${ticketSoldPercent}% ${Math.min(ticketSoldPercent + 10, 100)}%, #eee7f5 ${Math.min(ticketSoldPercent + 10, 100)}% 100%)`,
                  }}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                    <p className="text-sm font-bold text-slate-400">{language === "ar" ? "مباع" : "Sold"}</p>
                    <p className="text-3xl font-extrabold">{formatNumber(computed.ticketsSold)}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3.5">
                  <PulseRow label={language === "ar" ? "مباع" : "Sold"} value={computed.ticketsSold} percent={ticketSoldPercent} />
                  <PulseRow label={language === "ar" ? "تم الحضور" : "Checked in"} value={computed.checkedIn} percent={computed.attendanceRate} />
                  <PulseRow label={language === "ar" ? "الشهادات" : "Certificates"} value={computed.certificatesSent} percent={computed.certificateRate} />
                </div>
              </CardContent>
            </Card>

            <RevenueTrendCard
              title={language === "ar" ? "نمو الإيرادات" : "Revenue Growth Trend"}
              subtitle={adminT(language, "overview.revenueTrendCopy") || "Track paid booking revenue and order performance over time."}
              points={buildRevenueTrend(state.registrations, revenueMode)}
              mode={revenueMode}
              onModeChange={setRevenueMode}
              language={language}
            />

            <Card className="min-w-0 overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
              <CardHeader className="px-6 pb-3 pt-6">
                <CardTitle className="text-xl font-extrabold">{adminT(language, "overview.nextEvent") || "Next Event"}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="relative h-56 w-full overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--primary)),hsl(var(--brand-purple)))] p-5 text-white">
                  {eventImage(computed.nextEvent) ? <img src={eventImage(computed.nextEvent)} alt={eventTitle(computed.nextEvent, language)} className="absolute inset-0 h-full w-full object-cover opacity-85" /> : null}
                  <div className="relative z-10">
                    <Badge className="rounded-xl bg-white/20 text-white hover:bg-white/20">{computed.nextEvent?.type || adminT(language, "common.event") || "Event"}</Badge>
                    <p className="mt-28 text-sm font-bold opacity-90">{nextEventDate.date} {nextEventDate.time}</p>
                  </div>
                </div>
                <h3 className="mt-5 break-words text-lg font-extrabold leading-7">{eventTitle(computed.nextEvent, language) || (language === "ar" ? "لا توجد فعالية قادمة" : "No upcoming event")}</h3>
                <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-400">{eventVenue(computed.nextEvent) || (language === "ar" ? "لم يتم تحديد المكان" : "Venue not set")}</p>
                <Button asChild className="mt-5 h-11 rounded-2xl bg-[hsl(var(--primary))] px-5 text-sm font-extrabold text-white">
                  <Link href={computed.nextEvent?.id ? `/admin/events/${computed.nextEvent.id}` : "/admin/events"}>{adminT(language, "overview.viewDetails") || "View Details"}</Link>
                </Button>
              </CardContent>
            </Card>
      </section>

      <section className="dashboard-operations-grid">
            <InfoGroupCard
              title={adminT(language, "overview.eventStatus") || "Event Status"}
              subtitle={language === "ar" ? "الحالة التشغيلية لكل الفعاليات." : "Operational state of all events."}
              items={eventStatusCards}
            />
            <InfoGroupCard
              title={adminT(language, "overview.certificatesCards") || "Certificates & Event Cards"}
              subtitle={language === "ar" ? "حالة التسليم بعد الحضور واعتماد العميل." : "Delivery status after check-in and attendee approval."}
              items={[
                { label: language === "ar" ? "شهادات مرسلة" : "Certificates sent", value: computed.certificatesSent, icon: FileBadge },
                { label: language === "ar" ? "شهادات منتظرة" : "Certificates waiting", value: computed.certificatesWaiting, icon: Clock3 },
                { label: language === "ar" ? "كروت مرسلة" : "Cards sent", value: computed.eventCardsSent, icon: Send },
                { label: language === "ar" ? "كروت جاهزة" : "Cards ready", value: computed.eventCardsReady, icon: BadgeCheck },
              ]}
            />
        <Card className="flex min-w-0 flex-col rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
          <CardHeader className="px-6 pb-3 pt-6">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl font-extrabold">{adminT(language, "overview.eventCalendar") || "Event Calendar"}</CardTitle>
              <Badge className="rounded-xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.10)]">{eventCalendar.label || "-"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col px-6 pb-6">
            <div className="grid grid-cols-7 gap-2.5 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`} className="text-[11px] font-extrabold text-slate-400">{day}</span>)}
              {eventCalendar.cells.map((cell) => (
                <span key={cell.key} className={[
                  "flex h-11 items-center justify-center rounded-2xl text-sm font-extrabold",
                  cell.day ? "bg-[#f8f5fb] text-slate-500" : "bg-transparent",
                  cell.active ? "bg-[hsl(var(--primary))] text-white shadow-[0_10px_24px_hsl(var(--primary)/0.24)]" : "",
                  cell.today && !cell.active ? "ring-2 ring-[hsl(var(--primary)/0.30)]" : "",
                ].join(" ")}>
                  {cell.day || ""}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-[#f8fbff] p-5">
              <p className="truncate text-base font-extrabold text-[#17172f]">{eventTitle(computed.nextEvent, language) || "-"}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <DateBlock label={adminT(language, "events.start") || "Start"} date={nextEventDate.date} time={nextEventDate.time} />
                <DateBlock label={adminT(language, "events.end") || "End"} date={nextEventEndDate.date} time={nextEventEndDate.time} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="dashboard-activity-grid">
            <Card className="flex flex-col rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)] xl:min-h-[360px]">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-extrabold">{adminT(language, "overview.recentRegistrations") || "Recent Registrations"}</CardTitle>
                  <p className="mt-1 text-xs font-bold text-slate-400">{language === "ar" ? "آخر طلبات التسجيل والحجز." : "Latest registration and booking requests."}</p>
                </div>
                <Button asChild variant="ghost" className="h-9 rounded-2xl px-3 text-xs font-extrabold text-[hsl(var(--primary))]">
                  <Link href="/admin/registrations">{adminT(language, "overview.viewAll") || "View All"}</Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {computed.latestRegistrations.length ? computed.latestRegistrations.map((item) => {
                  const created = formatDate(item.created_at, language)
                  return (
                    <Link key={item.id || item.registration_number} href={`/admin/orders/${item.id || ""}`} className="grid gap-3 rounded-2xl bg-[#f8fbff] p-3 transition hover:bg-[hsl(var(--primary)/0.08)] md:grid-cols-[150px_1fr_120px_100px] md:items-center">
                      <p className="break-words text-sm font-extrabold text-[#17172f]">{item.registration_number || item.order_number || "-"}</p>
                      <div className="min-w-0">
                  <p className="break-words text-sm font-extrabold">{item.doctor_name || item.customer_name || adminT(language, "common.customer") || "Customer"}</p>
                  <p className="line-clamp-2 text-xs font-bold leading-5 text-slate-400">{eventTitle(item, language)}</p>
                      </div>
                      <Status value={item.payment_status || item.registration_status} />
                      <DateBlock label={language === "ar" ? "تاريخ الإنشاء" : "Created"} date={created.date} time={created.time} />
                    </Link>
                  )
                }) : <EmptyLine text={adminT(language, "overview.noRegistrations") || "No registrations yet."} />}
              </CardContent>
            </Card>

            <Card className="flex flex-col rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)] xl:min-h-[360px]">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-extrabold">{adminT(language, "overview.recentReviews") || "Recent Reviews"}</CardTitle>
                  <p className="mt-1 text-xs font-bold text-slate-400">{adminT(language, "overview.latestFeedback") || "Latest customer feedback."}</p>
                </div>
                <Button asChild variant="ghost" className="h-9 rounded-2xl px-3 text-xs font-extrabold text-[hsl(var(--primary))]">
                  <Link href="/admin/reviews">{adminT(language, "overview.moderate") || "Moderate"}</Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {computed.latestReviews.length ? computed.latestReviews.map((review) => (
                  <Link key={review.id} href={`/admin/reviews/${review.id}`} className="grid gap-3 rounded-2xl bg-[#f8fbff] p-3 transition hover:bg-[hsl(var(--primary)/0.08)] sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                  <p className="break-words text-sm font-extrabold text-[#17172f]">{review.customer_name || review.attendee_name || (language === "ar" ? "مراجعة عميل" : "Customer review")}</p>
                  <p className="line-clamp-2 text-xs font-bold leading-5 text-slate-400">{eventTitle(review, language) || review.comment || "Event feedback"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-50">
                        <Star className="h-3 w-3 fill-current" />
                        {number(review.rating).toFixed(1)}
                      </Badge>
                      <Status value={review.status} />
                    </div>
                  </Link>
                )) : <EmptyLine text={adminT(language, "overview.noReviews") || "No reviews have been submitted yet."} />}
              </CardContent>
            </Card>

        <Card className="min-w-0 rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
          <CardHeader className="px-6 pb-3 pt-6">
            <CardTitle className="text-xl font-extrabold">{adminT(language, "overview.liveAttendance") || "Live Attendance"}</CardTitle>
            <p className="mt-1 text-sm font-semibold text-slate-400">{language === "ar" ? "تقدم تسجيل الحضور للتذاكر المباعة." : "Check-in progress for sold tickets."}</p>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            <div className="rounded-[22px] bg-[#f8fbff] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{adminT(language, "overview.attendanceRate") || "Attendance Rate"}</span>
                <span className="text-2xl font-extrabold text-[#17172f]">{computed.attendanceRate}%</span>
              </div>
              <Progress value={computed.attendanceRate} className="h-3 bg-white [&>div]:bg-[hsl(var(--primary))]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MiniMetric label={adminT(language, "overview.checkedIn") || "Checked in"} value={computed.checkedIn} icon={ClipboardCheck} />
              <MiniMetric label={adminStatusT(language, "waiting") || "Waiting"} value={computed.notCheckedIn} icon={Clock3} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="dashboard-final-grid">
          <Card className="min-w-0 rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-extrabold">{adminT(language, "overview.availableEvents") || "Available Events"}</CardTitle>
                <p className="mt-1 text-xs font-bold text-slate-400">{adminT(language, "overview.availableEventsCopy") || "Published upcoming event cards ready for registration."}</p>
              </div>
              <Button asChild variant="ghost" className="h-9 rounded-2xl px-3 text-xs font-extrabold text-[hsl(var(--primary))]">
                <Link href="/admin/events">{adminT(language, "overview.viewAll") || "View All"}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {computed.upcoming.length ? (
                <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
                  {computed.upcoming.slice(0, 3).map((event) => <EventCard key={event.id} event={event} language={language} />)}
                </div>
              ) : (
                <EmptyLine text={language === "ar" ? "لا توجد فعاليات منشورة قادمة حتى الآن." : "No available events yet. Published upcoming events will appear here automatically."} />
              )}
            </CardContent>
          </Card>
          {quickActions.length ? (
            <Card className="quick-actions-card min-w-0 rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
              <CardHeader className="px-6 pb-3 pt-6">
                <CardTitle className="text-xl font-extrabold">{adminT(language, "overview.quickActions") || "Quick Actions"}</CardTitle>
                <p className="mt-1 text-sm font-semibold text-slate-400">{adminT(language, "overview.fastPaths") || "Fast paths for daily admin work."}</p>
              </CardHeader>
              <CardContent className="quick-actions-list grid gap-3 px-6 pb-6">
                {quickActions.map((action) => (
                  <QuickAction key={action.href} href={action.href} label={action.label} icon={action.icon} />
                ))}
              </CardContent>
            </Card>
          ) : null}

      </section>
      </div>
    </div>
  )
}

function normalizeList(value: any) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.data?.items)) return value.data.items
  return []
}

function number(value: any) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizedStatus(value: any) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
}

function countStatuses(rows: any[], statuses: string[]) {
  const wanted = new Set(statuses.map(normalizedStatus))
  return rows.reduce((sum, row) => {
    const status = normalizedStatus(row.status)
    return wanted.has(status) ? sum + number(row.count) : sum
  }, 0)
}

function totalCount(rows: any[]) {
  return rows.reduce((sum, row) => sum + number(row.count), 0)
}

function revenueTotals(rows: any[]) {
  return rows.reduce(
    (acc, row) => {
      const currency = String(row.currency || "EGP").toUpperCase()
      const total = number(row.total)
      const paidOrders = number(row.paid_orders)
      acc.total += total
      acc.paidOrders += paidOrders
      acc.byCurrency[currency] = (acc.byCurrency[currency] || 0) + total
      return acc
    },
    { total: 0, paidOrders: 0, byCurrency: {} as Record<string, number> },
  )
}

function buildOverviewState(state: any) {
  const events = state.events || []
  const registrations = state.registrations || []
  const attendees = state.attendees || []
  const reviews = state.reviews || []
  const delivery = state.certificateDelivery || []
  const ticketPerformance = state.ticketPerformance || []
  const summary = state.summary || emptyState.summary
  const summaryRegistrations = normalizeList(summary.registrations)
  const summaryPayments = normalizeList(summary.payments)
  const summaryRevenue = normalizeList(summary.revenue)
  const summaryCertificates = normalizeList(summary.certificates)
  const revenue = revenueTotals(summaryRevenue)
  const now = Date.now()
  const today = new Date().toDateString()
  const upcoming = events
    .filter((event: any) => !event.deleted_at && ["published", "active"].includes(String(event.status || "published")) && new Date(event.starts_at || event.start_date || now).getTime() >= now - 86400000)
    .sort((a: any, b: any) => new Date(a.starts_at || a.start_date || 0).getTime() - new Date(b.starts_at || b.start_date || 0).getTime())

  const seats = events.reduce((sum: number, event: any) => sum + number(event.max_attendees || event.venue_capacity || event.capacity), 0)
  const registrationsCount = totalCount(summaryRegistrations) || registrations.length
  const approvedRegistrations =
    countStatuses(summaryRegistrations, ["approved", "paid"]) ||
    registrations.filter((item: any) => ["approved", "paid"].includes(normalizedStatus(item.registration_status))).length
  const approvedPayments =
    countStatuses(summaryPayments, ["approved", "paid"]) ||
    registrations.filter((item: any) => ["approved", "paid"].includes(normalizedStatus(item.payment_status || item.order_status))).length
  const pending =
    countStatuses(summaryPayments, ["pending", "pending payment", "pending verification", "waiting", "review"]) ||
    registrations.filter((item: any) => ["pending", "pending payment", "pending verification", "waiting", "review"].includes(normalizedStatus(item.payment_status || item.registration_status || item.order_status))).length
  const cancelled =
    countStatuses(summaryRegistrations, ["cancelled", "canceled"]) ||
    registrations.filter((item: any) => ["cancelled", "canceled"].includes(normalizedStatus(item.registration_status || item.order_status))).length
  const rejectedPayments =
    countStatuses(summaryPayments, ["rejected"]) ||
    registrations.filter((item: any) => normalizedStatus(item.payment_status) === "rejected").length
  const checkedIn = attendees.filter((item: any) => item.checked_in_at || String(item.checkin_status || item.status).includes("checked")).length
  const notCheckedIn = Math.max(registrationsCount - checkedIn, 0)
  const ticketsSold = approvedPayments || approvedRegistrations
  const ticketQuota = ticketPerformance.reduce((sum: number, item: any) => sum + number(item.quota), 0) || seats || 1
  const certificateIssuedSummary = countStatuses(summaryCertificates, ["issued", "sent"])
  const certificatesSent =
    delivery.filter((item: any) => ["sent", "issued"].includes(normalizedStatus(item.certificate_status || item.certificate))).length ||
    certificateIssuedSummary
  const certificatesWaiting = Math.max(checkedIn - certificatesSent, 0)
  const eventCardsSent = delivery.filter((item: any) => item.card_id || item.card_number || item.card_file_url || ["sent", "issued"].includes(normalizedStatus(item.card_status || item.event_card_status || item.event_card))).length
  const eventCardsReady = Math.max(delivery.length - eventCardsSent, 0)
  const latestReviews = [...reviews].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 3)
  const avgRating = reviews.length ? reviews.reduce((sum: number, item: any) => sum + number(item.rating), 0) / reviews.length : 0

  return {
    eventsCount: events.filter((event: any) => !event.deleted_at).length,
    upcoming,
    nextEvent: upcoming[0] || {},
    activeEvents: events.filter((event: any) => ["published", "active"].includes(String(event.status))).length,
    draftEvents: events.filter((event: any) => String(event.status) === "draft").length,
    disabledEvents: events.filter((event: any) => ["disabled", "inactive"].includes(String(event.status))).length,
    seats,
    registrations: registrationsCount,
    approved: approvedRegistrations,
    pending,
    paidOrders: revenue.paidOrders || approvedPayments,
    cancelledRegistrations: cancelled,
    rejectedPayments,
    checkedIn,
    notCheckedIn,
    ticketsSold,
    ticketQuota,
    capacityLeft: Math.max(seats - ticketsSold, 0),
    certificatesSent,
    certificatesWaiting,
    eventCardsSent,
    eventCardsReady,
    latestReviews,
    revenue: formatMoneyByCurrency(revenue.byCurrency),
    avgRating,
    todayRegistrations: registrations.filter((item: any) => item.created_at && new Date(item.created_at).toDateString() === today).length,
    todayCheckIns: attendees.filter((item: any) => item.checked_in_at && new Date(item.checked_in_at).toDateString() === today).length,
    attendanceRate: registrationsCount ? Math.round((checkedIn / registrationsCount) * 100) : 0,
    approvalRate: registrationsCount ? Math.round((approvedRegistrations / registrationsCount) * 100) : 0,
    paymentRate: registrationsCount ? Math.round(((revenue.paidOrders || approvedPayments) / registrationsCount) * 100) : 0,
    certificateRate: checkedIn ? Math.round((certificatesSent / checkedIn) * 100) : 0,
    latestRegistrations: [...registrations].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 4),
  }
}

function formatNumber(value: number) {
  return number(value).toLocaleString("en-US")
}

function formatMoneyByCurrency(values: Record<string, number>) {
  const entries = Object.entries(values || {}).filter(([, value]) => number(value) > 0)
  if (!entries.length) return "0"
  return entries.map(([currency, value]) => `${currency} ${formatNumber(value)}`).join(" / ")
}

function formatDate(value?: string, language = "en") {
  if (!value) return { date: "-", time: "" }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { date: "-", time: "" }
  const locale = language === "ar" ? "ar-EG" : "en-US"
  return {
    date: new Intl.DateTimeFormat(locale, { month: "short", day: "2-digit", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date),
  }
}

function eventTitle(event: any, language = "en") {
  if (!event) return ""
  return language === "ar"
    ? event.title_ar || event.event_title_ar || event.title_en || event.event_title_en || event.name || ""
    : event.title_en || event.event_title_en || event.title_ar || event.event_title_ar || event.name || ""
}

function eventVenue(event: any) {
  if (!event) return ""
  return event.venue_name_en || event.venue_name_ar || event.location || event.country_name || ""
}

function eventImage(event: any) {
  if (!event) return ""
  return apiAssetUrl(event.cover_image_url || event.image_url || event.hero_image_url || event.thumbnail_url || "")
}

function buildEventCalendar(event: any) {
  const base = event?.starts_at ? new Date(event.starts_at) : new Date()
  const year = base.getFullYear()
  const month = base.getMonth()
  const first = new Date(year, month, 1)
  const total = new Date(year, month + 1, 0).getDate()
  const startOffset = first.getDay()
  const activeDay = event?.starts_at ? base.getDate() : 0
  const today = new Date()
  const cells = []
  for (let index = 0; index < startOffset; index++) cells.push({ key: `blank-${index}`, day: "" })
  for (let day = 1; day <= total; day++) {
    cells.push({
      key: `day-${day}`,
      day,
      active: day === activeDay,
      today: today.getFullYear() === year && today.getMonth() === month && today.getDate() === day,
    })
  }
  return {
    label: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(base),
    cells: cells.slice(0, 42),
  }
}

function buildRevenueTrend(registrations: any[], mode: RevenueTrendMode) {
  const months = mode === "yearly" ? 12 : 6
  const now = new Date()
  return Array.from({ length: months }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const rows = registrations.filter((item) => {
      const created = new Date(item.created_at || item.paid_at || 0)
      return `${created.getFullYear()}-${created.getMonth()}` === key
    })
    const paidRows = rows.filter((item) => ["approved", "paid"].includes(String(item.payment_status || item.order_status)))
    const revenue = paidRows.reduce((sum, item) => sum + number(item.grand_total || item.total_amount || item.selected_price || item.amount), 0)
    const orders = paidRows.length
    return {
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
      value: revenue,
      orders,
      average: orders ? Math.round(revenue / orders) : 0,
    }
  })
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
      <CardContent className="flex min-h-[124px] items-center gap-5 p-5 md:p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-[#17172f]">{typeof value === "number" ? formatNumber(value) : value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function BusinessOverviewCard({ eyebrow, title, copy, indicators }: { eyebrow: string; title: string; copy: string; indicators: Array<{ icon: any; label: string; value: string | number }> }) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary))_58%,hsl(var(--primary)))] p-6 text-white shadow-[0_22px_50px_hsl(var(--primary)/0.22)] md:p-7">
      <div className="grid min-h-[160px] gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(420px,0.9fr)] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-[32px]">{title}</h2>
          <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-white/80">{copy}</p>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
          {indicators.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="min-w-0 rounded-[22px] bg-white/14 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/18">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="truncate text-[11px] font-extrabold uppercase tracking-wider text-white/70">{item.label}</p>
                <p className="mt-1 truncate text-2xl font-extrabold tabular-nums">{typeof item.value === "number" ? formatNumber(item.value) : item.value}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function MiniMetric({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="flex min-h-[104px] flex-col justify-between rounded-2xl bg-[#f8fbff] p-4">
      <Icon className="mb-3 h-5 w-5 text-[hsl(var(--primary))]" />
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 truncate text-base font-extrabold text-[#17172f]">{typeof value === "number" ? formatNumber(value) : value}</p>
    </div>
  )
}

function InfoGroupCard({ title, subtitle, items }: { title: string; subtitle: string; items: Array<{ icon: any; label: string; value: number }> }) {
  return (
    <Card className="flex h-full flex-col rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
      <CardHeader className="px-6 pb-3 pt-6">
        <CardTitle className="text-xl font-extrabold">{title}</CardTitle>
        <p className="mt-1 text-sm font-semibold text-slate-400">{subtitle}</p>
      </CardHeader>
      <CardContent className="dashboard-info-grid flex-1 px-6 pb-6">
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex min-h-[76px] items-center gap-4 border-b border-slate-100 py-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.09)] text-[hsl(var(--primary))]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-xs font-extrabold uppercase leading-5 tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-[#17172f]">{formatNumber(item.value)}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function PulseRow({ label, value, percent }: { label: string; value: number; percent: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_72px_58px] items-center gap-3 text-sm font-bold">
      <span className="break-words text-slate-500">{label}</span>
      <span className="text-center tabular-nums text-[#17172f]">{formatNumber(value)}</span>
      <span className="justify-self-end rounded-lg bg-[#f8f5fb] px-2 py-1 text-center tabular-nums text-slate-500">{Math.min(percent, 100)}%</span>
    </div>
  )
}

function DateBlock({ label, date, time }: { label: string; date: string; time: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-[11px] font-black text-slate-600">{date}</p>
      <p className="text-[10px] font-bold text-slate-400">{time || "-"}</p>
    </div>
  )
}

function Status({ value }: { value?: string }) {
  const normalized = String(value || "pending").replaceAll("_", " ")
  const good = ["approved", "paid", "published", "checked in", "sent"].includes(normalized)
  const bad = ["rejected", "cancelled", "canceled", "refunded", "disabled"].includes(normalized)
  return (
    <Badge className={`${good ? "bg-emerald-50 text-emerald-700" : bad ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"} rounded-xl px-3 py-1 text-xs font-extrabold capitalize hover:bg-current/0`}>
      {normalized}
    </Badge>
  )
}

function SideStatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint: string }) {
  return (
    <Card className="h-full rounded-[24px] border-0 bg-white shadow-[0_14px_30px_rgba(93,58,138,0.06)]">
      <CardContent className="flex h-full min-h-[118px] items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-extrabold uppercase leading-5 tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 truncate text-xl font-extrabold text-[#17172f]">{typeof value === "number" ? formatNumber(value) : value}</p>
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-400">{hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EventCard({ event, language }: { event: any; language: string }) {
  const start = formatDate(event.starts_at, language)
  const registrations = number(event.registrations_count)
  const capacity = number(event.max_attendees || event.venue_capacity || event.capacity)
  const bookedPercent = capacity ? Math.min(100, Math.round((registrations / capacity) * 100)) : 0
  const image = eventImage(event)

  return (
    <Link href={`/admin/events/${event.id}`} className="group overflow-hidden rounded-[24px] border border-slate-100 bg-[#f8fbff] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(15,23,42,0.10)]">
      <div className="relative h-40 overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--primary)),hsl(var(--brand-purple)))]">
        {image ? <img src={image} alt={eventTitle(event, language)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : null}
        <div className="absolute left-3 top-3">
          <Badge className="rounded-xl bg-white/85 px-3 py-1 text-[11px] font-extrabold text-[hsl(var(--primary))] hover:bg-white/85">{event.type || "Event"}</Badge>
        </div>
      </div>
      <div className="pt-4">
        <h3 className="line-clamp-2 min-h-12 text-base font-extrabold leading-6 text-[#17172f]">{eventTitle(event, language)}</h3>
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-400">{eventVenue(event) || "-"}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <DateBlock label={adminT(language, "events.start") || "Start"} date={start.date} time={start.time} />
          <div className="min-w-[82px] text-end">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{adminT(language, "overview.booked") || "Booked"}</p>
            <p className="text-sm font-black text-[#17172f]">{formatNumber(registrations)} / {formatNumber(capacity)}</p>
          </div>
        </div>
        <Progress value={bookedPercent} className="mt-3 h-2 bg-white [&>div]:bg-[hsl(var(--primary))]" />
      </div>
    </Link>
  )
}

function RevenueTrendCard({ title, subtitle, points, mode, onModeChange, language }: { title: string; subtitle: string; points: any[]; mode: RevenueTrendMode; onModeChange: (value: RevenueTrendMode) => void; language: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const chartWidth = 900
  const chartHeight = 330
  const left = 58
  const right = 18
  const top = 30
  const bottom = 48
  const plotWidth = chartWidth - left - right
  const plotHeight = chartHeight - top - bottom
  const maxValue = Math.max(...points.flatMap((point) => [number(point.value), number(point.average), number(point.orders)]), 1)
  const chartPoints = points.map((point, index) => ({ ...point, x: left + (plotWidth / Math.max(points.length - 1, 1)) * index }))
  const series = [
    { key: "value", label: language === "ar" ? "الإيرادات" : "Revenue", color: "hsl(var(--primary))", fill: true },
    { key: "orders", label: language === "ar" ? "الطلبات المدفوعة" : "Paid orders", color: "#0f172a", fill: false },
    { key: "average", label: language === "ar" ? "متوسط الطلب" : "Average order", color: "hsl(var(--brand-purple))", fill: false },
  ]
  const seriesPoints = series.map((item) => {
    const values = chartPoints.map((point) => {
      const raw = number(point[item.key])
      return { ...point, raw, y: top + plotHeight - (raw / maxValue) * plotHeight }
    })
    const path = values.map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      const previous = values[index - 1]
      const midX = (previous.x + point.x) / 2
      return `C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`
    }).join(" ")
    return { ...item, values, path, area: `${path} L ${values[values.length - 1]?.x || left} ${chartHeight - bottom} L ${left} ${chartHeight - bottom} Z` }
  })
  const activePoint = activeIndex === null ? null : chartPoints[activeIndex]

  return (
    <Card className="min-w-0 overflow-hidden rounded-[30px] border-0 bg-white shadow-[0_18px_45px_rgba(93,58,138,0.08)]">
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-0 pt-6">
        <div>
          <CardTitle className="text-xl font-extrabold text-[#17172f]">{title}</CardTitle>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">{subtitle}</p>
        </div>
        <Select value={mode} onValueChange={(value) => onModeChange(value as RevenueTrendMode)}>
          <SelectTrigger className="h-10 w-[142px] rounded-2xl border-0 bg-[#f8fbff] px-4 text-sm font-extrabold text-[#17172f] shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">{language === "ar" ? "شهري" : "Monthly"}</SelectItem>
            <SelectItem value="yearly">{language === "ar" ? "سنوي" : "Yearly"}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {series.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-2 rounded-full bg-[#f8fbff] px-3 py-1 text-[11px] font-extrabold text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
        <div className="relative" onMouseLeave={() => setActiveIndex(null)}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[320px] w-full overflow-visible" role="img" aria-label={title}>
            <defs>
              <linearGradient id="revenueTrendArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = top + plotHeight - tick * plotHeight
              return (
                <g key={tick}>
                  <line x1={left} x2={chartWidth - right} y1={y} y2={y} stroke="#e8eef7" strokeDasharray="7 10" />
                  <text x={left - 14} y={y + 4} textAnchor="end" className="fill-[hsl(var(--primary))] text-[11px] font-bold">{formatCompact(maxValue * tick)}</text>
                </g>
              )
            })}
            {chartPoints.map((point) => <line key={`v-${point.label}`} x1={point.x} x2={point.x} y1={top} y2={chartHeight - bottom} stroke="#e6edf7" strokeDasharray="7 10" />)}
            {seriesPoints.map((item) => item.fill ? <path key={`${item.key}-area`} d={item.area} fill="url(#revenueTrendArea)" /> : null)}
            {seriesPoints.map((item) => <path key={item.key} d={item.path} fill="none" stroke={item.color} strokeLinecap="round" strokeWidth={item.key === "value" ? 4 : 3} />)}
            {seriesPoints.map((item) => item.values.map((point) => <circle key={`${item.key}-${point.label}`} cx={point.x} cy={point.y} r={item.key === "value" ? 5 : 4} fill="white" stroke={item.color} strokeWidth="2.5" />))}
            {activePoint ? <line x1={activePoint.x} x2={activePoint.x} y1={top} y2={chartHeight - bottom} stroke="#94a3b8" strokeDasharray="4 7" strokeWidth="1.5" /> : null}
            {chartPoints.map((point, index) => {
              const step = plotWidth / Math.max(points.length - 1, 1)
              return (
                <g key={point.label}>
                  <rect x={point.x - step / 2} y={top} width={step} height={plotHeight} fill="transparent" onMouseEnter={() => setActiveIndex(index)} onMouseMove={() => setActiveIndex(index)} />
                  <text x={point.x} y={chartHeight - 14} textAnchor="middle" className="fill-slate-400 text-[11px] font-bold">{point.label}</text>
                </g>
              )
            })}
          </svg>
          {activePoint ? (
            <div className="pointer-events-none absolute top-4 min-w-[190px] rounded-2xl border border-slate-100 bg-white/95 p-3 text-xs shadow-[0_16px_35px_rgba(15,23,42,0.14)]" style={{ left: `${Math.min(78, Math.max(8, (activePoint.x / chartWidth) * 100))}%`, transform: "translateX(-35%)" }}>
              <p className="mb-2 font-extrabold text-[#17172f]">{activePoint.label}</p>
              {series.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-1 font-bold text-slate-500">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>
                  <span className="text-[#17172f]">{item.key === "orders" ? formatNumber(activePoint[item.key]) : formatCompact(activePoint[item.key])}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickAction({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Button asChild variant="ghost" className="h-11 w-full justify-between rounded-2xl bg-[#f8fbff] px-4 text-sm font-extrabold text-slate-600 hover:bg-[hsl(var(--primary)/0.10)] hover:text-[hsl(var(--primary))]">
      <Link href={href}>
        <span className="flex min-w-0 items-center gap-2"><Icon className="h-4 w-4 shrink-0" /><span className="truncate">{label}</span></span>
        <ArrowUpRight className="quick-action-arrow h-4 w-4 shrink-0" />
      </Link>
    </Button>
  )
}

function EmptyLine({ text }: { text: string }) {
  return <div className="rounded-2xl bg-[#f8fbff] p-5 text-sm font-semibold text-slate-400">{text}</div>
}

function formatCompact(value: number) {
  value = number(value)
  if (value >= 1000000) return `${Math.round(value / 100000) / 10}m`
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`
  return formatNumber(value)
}
