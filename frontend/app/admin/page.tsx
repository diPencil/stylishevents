"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, Ticket, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { platformApi } from "@/lib/platform-api"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"

export default function AdminOverviewPage() {
  const { language } = useLanguage()
  const [latestRegistrations, setLatestRegistrations] = useState<any[]>([])

  // Minimal state + helpers to preserve original dashboard sections
  const [revenueMode, setRevenueMode] = useState<any>("monthly")
  const [state, setState] = useState<any>({
    loading: true,
    events: [],
    registrations: [],
    attendees: [],
    tickets: [],
    reviews: [],
    certificateDelivery: [],
    ticketPerformance: [],
    summary: { registrations: [], payments: [], revenue: [], certificates: [] },
  })

  const computed: any = {
    upcoming: [],
    published: 0,
    activeEvents: 0,
    draftEvents: 0,
    disabledEvents: 0,
    seats: 0,
    capacityLeft: 0,
    registrations: 0,
    approved: 0,
    pending: 0,
    cancelledRegistrations: 0,
    rejectedPayments: 0,
    checkedIn: 0,
    notCheckedIn: 0,
    ticketsSold: 0,
    ticketQuota: 1,
    certificateIssued: 0,
    certificatesSent: 0,
    certificatesWaiting: 0,
    eventCardsSent: 0,
    eventCardsReady: 0,
    publishedReviews: 0,
    pendingReviews: 0,
    todayRegistrations: 0,
    todayCheckIns: 0,
    todayEvents: 0,
    attendanceRate: 0,
    approvalRate: 0,
    latestReviews: [],
    revenue: "0",
    avgRating: 0,
    nextEvent: {},
  }

  const ticketSoldPercent = computed.ticketQuota ? Math.min(100, Math.round((computed.ticketsSold / computed.ticketQuota) * 100)) : 0

  function formatDate(_?: string) {
    return { date: "-", time: "" }
  }

  function eventImage(_?: any) {
    return ""
  }

  function eventTitle(_?: any, _lang?: string) {
    return _lang === "ar" ? "" : ""
  }

  function eventVenue(_?: any) {
    return ""
  }

  function buildEventCalendar(_?: any) {
    return { label: "", cells: [] }
  }

  useEffect(() => {
    let active = true
    platformApi
      .listRegistrations({ limit: 4 })
      .then((res) => {
        if (!active) return
        setLatestRegistrations(Array.isArray(res) ? res : res?.data?.items || [])
      })
      .catch(() => {
        if (active) setLatestRegistrations([])
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold text-slate-500 uppercase">{adminT(language, "overview.eyebrow")}</p>
          <h1 className="text-2xl font-extrabold">{adminT(language, "overview.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{adminT(language, "overview.subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">{adminT(language, "common.createEvent")}</Link>
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[hsl(var(--primary)/0.10)] p-3 text-[hsl(var(--primary))]">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-400">{adminT(language, "overview.totalEvents")}</p>
                <p className="text-lg font-extrabold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[hsl(var(--primary)/0.10)] p-3 text-[hsl(var(--primary))]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-400">{adminT(language, "overview.registrations")}</p>
                <p className="text-lg font-extrabold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[hsl(var(--primary)/0.10)] p-3 text-[hsl(var(--primary))]">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-400">{adminT(language, "overview.ticketsSold")}</p>
                <p className="text-lg font-extrabold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.recentRegistrations")}</CardTitle>
              <Button asChild variant="link">
                <Link href="/admin/registrations">{adminT(language, "overview.viewAll")}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {latestRegistrations.length ? (
              latestRegistrations.map((item) => (
                <div key={item.id || item.registration_number} className="grid grid-cols-[150px_1fr_120px] gap-3 py-2">
                  <div className="font-extrabold">{item.registration_number || item.order_number || "-"}</div>
                  <div>
                    <div className="font-extrabold">{item.doctor_name || item.customer_name || adminT(language, "common.customer")}</div>
                    <div className="text-xs text-slate-500">{item.event_title_en || item.event_title_ar || "-"}</div>
                  </div>
                  <div className="text-right text-xs text-slate-500">{new Date(item.created_at || item.createdAt || Date.now()).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">{adminT(language, "overview.noRegistrations")}</div>
            )}
          </CardContent>
        </Card>
      </section>

            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.ticketSales")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="mx-auto flex h-44 w-44 items-center justify-center rounded-full p-5"
                    style={{
                      background: `conic-gradient(hsl(var(--primary)) 0 ${ticketSoldPercent}%, hsl(var(--secondary)) ${ticketSoldPercent}% ${Math.min(ticketSoldPercent + 12, 100)}%, #eee7f5 ${Math.min(ticketSoldPercent + 12, 100)}% 100%)`,
                    }}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                      <p className="text-xs font-bold text-slate-400">{language === "ar" ? "مباع" : "Sold"}</p>
                      <p className="text-xl font-extrabold">{computed.ticketsSold.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    <PulseRow label="Sold" value={computed.ticketsSold} percent={ticketSoldPercent} />
                    <PulseRow label="Checked in" value={computed.checkedIn} percent={computed.ticketsSold ? Math.round((computed.checkedIn / computed.ticketsSold) * 100) : 0} />
                    <PulseRow label="Certificates" value={computed.certificatesSent} percent={computed.checkedIn ? Math.round((computed.certificatesSent / computed.checkedIn) * 100) : 0} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.revenuePayments")}</CardTitle>
                  <Badge className="rounded-xl bg-[#f8f5fb] text-slate-500 hover:bg-[#f8f5fb]">MySQL</Badge>
                </CardHeader>
                <CardContent>
                  <div className="mb-5 grid gap-3 sm:grid-cols-3">
                    <MiniMetric label="Revenue" value={computed.revenue} icon={CreditCard} />
                    <MiniMetric label="Pending" value={computed.pending} icon={Clock3} />
                    <MiniMetric label="Rating" value={`${computed.avgRating.toFixed(1)}/5`} icon={Star} />
                  </div>
                  <div className="space-y-4">
                    {state.ticketPerformance.slice(0, 5).map((item, idx) => {
                      const percent = item.quota ? Math.round((number(item.registrations) / number(item.quota)) * 100) : 0
                      return (
                        <div key={item.id ?? `${item.event_title_en}-${item.ticket_name_en}-${idx}`} className="grid gap-2 text-sm md:grid-cols-[220px_1fr_96px] md:items-center md:gap-3">
                          <span className="min-w-0 truncate font-bold text-slate-500">{item.ticket_name_en || item.ticket_name_ar || "Ticket"}</span>
                          <Progress value={Math.min(percent, 100)} className="h-3 bg-[#f8f5fb] [&>div]:bg-[hsl(var(--primary))]" />
                          <span className="text-xs font-bold text-slate-400 md:text-end">{number(item.registrations).toLocaleString()} / {number(item.quota).toLocaleString()}</span>
                        </div>
                      )
                    })}
                    {state.ticketPerformance.length === 0 && <p className="text-sm font-semibold text-slate-400">{adminT(language, "overview.noTicketPerformance")}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.eventStatus")}</CardTitle>
                  <p className="mt-1 text-xs font-bold text-slate-400">{language === "ar" ? "الحالة التشغيلية لكل الفعاليات." : "Operational state of all events."}</p>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {eventStatusCards.map((item) => (
                    <MiniMetric key={item.label} label={item.label} value={item.value} icon={item.icon} />
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.certificatesCards")}</CardTitle>
                  <p className="mt-1 text-xs font-bold text-slate-400">{language === "ar" ? "حالة التسليم بعد الحضور واعتماد العميل." : "Delivery status after check-in and attendee approval."}</p>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <MiniMetric label={language === "ar" ? "شهادات مرسلة" : "Certificates sent"} value={computed.certificatesSent} icon={FileBadge} />
                  <MiniMetric label={language === "ar" ? "شهادات بانتظار الإرسال" : "Certificates waiting"} value={computed.certificatesWaiting} icon={Clock3} />
                  <MiniMetric label={language === "ar" ? "كروت مرسلة" : "Cards sent"} value={computed.eventCardsSent} icon={Send} />
                  <MiniMetric label={language === "ar" ? "كروت جاهزة" : "Cards ready"} value={computed.eventCardsReady} icon={BadgeCheck} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.recentRegistrations")}</CardTitle>
                  <Button asChild variant="link" size="sm" className="text-primary">
                    <Link href="/admin/registrations">{adminT(language, "overview.viewAll")}</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestRegistrations.length > 0 ? (
                  latestRegistrations.map((item) => {
                    const created = formatDate(item.created_at)
                    return (
                      <div key={item.id || item.registration_number} className="grid gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-[150px_1fr_130px_120px] md:items-center">
                        <p className="break-words text-sm font-extrabold">{item.registration_number || item.order_number || "-"}</p>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold">{item.doctor_name || item.customer_name || adminT(language, "common.customer")}</p>
                          <p className="truncate text-xs font-bold text-slate-400">{language === "ar" ? item.event_title_ar || item.event_title_en || adminT(language, "common.event") : item.event_title_en || item.event_title_ar || adminT(language, "common.event")}</p>
                        </div>
                        <Status value={item.payment_status || item.registration_status} />
                        <DateBlock label={language === "ar" ? "تاريخ الإنشاء" : "Created"} date={created.date} time={created.time} />
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm font-semibold text-slate-400">{adminT(language, "overview.noRegistrations")}</p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.recentReviews")}</CardTitle>
                    <p className="mt-1 text-xs font-bold text-slate-400">{adminT(language, "overview.latestFeedback")}</p>
                  </div>
                  <Button asChild variant="ghost" className="h-9 rounded-2xl px-3 text-xs font-extrabold text-[hsl(var(--primary))]">
                    <Link href="/admin/reviews">{adminT(language, "overview.moderate")}</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {computed.latestReviews.map((review) => (
                    <Link
                      key={review.id}
                      href={`/admin/reviews/${review.id}`}
                      className="grid gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-[hsl(var(--primary)/0.08)] sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#17172f]">{review.customer_name || review.attendee_name || (language === "ar" ? "مراجعة عميل" : "Customer review")}</p>
                        <p className="truncate text-xs font-bold text-slate-400">{language === "ar" ? review.event_title_ar || review.event_title_en || review.comment || "رأي عن الفعالية" : review.event_title_en || review.event_title_ar || review.comment || "Event feedback"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-50">
                          <Star className="mr-1 h-3 w-3 fill-current" />
                          {number(review.rating).toFixed(1)}
                        </Badge>
                        <Status value={review.status} />
                      </div>
                    </Link>
                  ))}
                  {computed.latestReviews.length === 0 && <p className="text-sm font-semibold text-slate-400">{adminT(language, "overview.noReviews")}</p>}
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.paymentHealth")}</CardTitle>
                  <p className="mt-1 text-xs font-bold text-slate-400">{language === "ar" ? "حالات الحجز المدفوعة والمعلقة والملغية والمرفوضة." : "Paid, pending, cancelled, and rejected booking state."}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <HealthRow label={language === "ar" ? "معتمد / مدفوع" : "Approved / paid"} value={computed.approved} total={Math.max(computed.registrations, 1)} tone="primary" />
                  <HealthRow label={language === "ar" ? "قيد المراجعة" : "Pending review"} value={computed.pending} total={Math.max(computed.registrations, 1)} tone="warning" />
                  <HealthRow label={adminStatusT(language, "cancelled")} value={computed.cancelledRegistrations} total={Math.max(computed.registrations, 1)} tone="danger" />
                  <HealthRow label={language === "ar" ? "مدفوعات مرفوضة" : "Rejected payments"} value={computed.rejectedPayments} total={Math.max(computed.registrations, 1)} tone="muted" />
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.availableEvents")}</CardTitle>
                  <p className="mt-1 text-xs font-bold text-slate-400">{language === "ar" ? "كروت الفعاليات المباشرة من MySQL." : "Live event cards pulled from MySQL."}</p>
                </div>
                <Button asChild variant="ghost" className="h-9 rounded-2xl px-3 text-xs font-extrabold text-[hsl(var(--primary))]">
                  <Link href="/admin/events">{adminT(language, "overview.viewAll")}</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {computed.upcoming.length ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {computed.upcoming.slice(0, 3).map((event) => {
                      const start = formatDate(event.starts_at)
                      const image = eventImage(event)
                      const registrations = number(event.registrations_count)
                      const capacity = number(event.max_attendees || event.venue_capacity)
                      const bookedPercent = capacity ? Math.min(100, Math.round((registrations / capacity) * 100)) : 0
                      return (
                        <Link
                          key={event.id}
                          href={`/admin/events/${event.id}`}
                          className="group overflow-hidden rounded-[22px] border border-slate-100 bg-[#f8fbff] p-3 transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(15,23,42,0.10)]"
                        >
                          <div className="relative h-32 overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--primary)),hsl(var(--brand-purple)))]">
                            {image ? <img src={image} alt={eventTitle(event, language)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : null}
                            <div className="absolute left-3 top-3">
                              <Badge className="rounded-xl bg-white/85 px-3 py-1 text-[11px] font-extrabold text-[hsl(var(--primary))] hover:bg-white/85">{event.type || "Event"}</Badge>
                            </div>
                          </div>
                          <div className="pt-3">
                            <h3 className="line-clamp-2 min-h-10 text-sm font-extrabold leading-5 text-[#17172f]">{eventTitle(event, language)}</h3>
                            <p className="mt-1 truncate text-xs font-bold text-slate-400">{eventVenue(event)}</p>
                            <div className="mt-3 flex items-end justify-between gap-3">
                              <DateBlock label={adminT(language, "events.start")} date={start.date} time={start.time} />
                              <div className="min-w-[82px] text-end">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{adminT(language, "overview.booked")}</p>
                                <p className="text-xs font-black text-[#17172f]">{registrations.toLocaleString()} / {capacity.toLocaleString()}</p>
                              </div>
                            </div>
                            <Progress value={bookedPercent} className="mt-3 h-2 bg-white [&>div]:bg-[hsl(var(--primary))]" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#f8fbff] p-5 text-sm font-semibold text-slate-400">
                    {language === "ar" ? "لا توجد فعاليات متاحة حتى الآن. الفعاليات المنشورة والقادمة ستظهر هنا تلقائيا." : "No available events yet. Published upcoming events will appear here automatically."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="overflow-hidden rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.nextEvent")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-44 overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--primary)),hsl(var(--brand-purple)))] p-4 text-white">
                  {eventImage(computed.nextEvent) ? <img src={eventImage(computed.nextEvent)} alt={eventTitle(computed.nextEvent, language)} className="absolute inset-0 h-full w-full object-cover opacity-85" /> : null}
                  <div className="relative z-10">
                    <Badge className="rounded-xl bg-white/20 text-white hover:bg-white/20">{computed.nextEvent?.type || adminT(language, "common.event")}</Badge>
                    <p className="mt-20 text-sm font-bold opacity-90">{nextEventDate.date} {nextEventDate.time}</p>
                  </div>
                </div>
                <h3 className="mt-4 text-base font-extrabold leading-6">{eventTitle(computed.nextEvent, language)}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-400">{eventVenue(computed.nextEvent)}</p>
                <Button asChild className="mt-4 h-10 rounded-2xl bg-[hsl(var(--primary))] px-5 text-sm font-extrabold text-white">
                  <Link href={`/admin/events/${computed.nextEvent?.id || ""}`}>{adminT(language, "overview.viewDetails")}</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <SideStatCard
                icon={Ticket}
                label={language === "ar" ? "مقاعد متاحة" : "Capacity left"}
                value={computed.capacityLeft}
                hint={language === "ar" ? "مقاعد مفتوحة في الفعاليات النشطة" : "Open seats across active events"}
              />
              <SideStatCard
                icon={AlertCircle}
                label={adminT(language, "overview.pendingPayments")}
                value={computed.pending}
                hint={language === "ar" ? "حجوزات في انتظار المراجعة" : "Bookings waiting for review"}
              />
              <SideStatCard
                icon={ClipboardCheck}
                label={language === "ar" ? "حضور اليوم" : "Today check-ins"}
                value={computed.todayCheckIns}
                hint={language === "ar" ? "تحديثات الحضور المباشر" : "Live attendance updates"}
              />
            </div>

            <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.eventCalendar")}</CardTitle>
                  <Badge className="rounded-xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.10)]">{eventCalendar.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <span key={`${day}-${index}`} className="text-[11px] font-extrabold text-slate-400">{day}</span>
                  ))}
                  {eventCalendar.cells.map((cell) => (
                    <span
                      key={cell.key}
                      className={[
                        "flex h-9 items-center justify-center rounded-2xl text-xs font-extrabold",
                        cell.day ? "bg-[#f8f5fb] text-slate-500" : "bg-transparent",
                        cell.active ? "bg-[hsl(var(--primary))] text-white shadow-[0_10px_24px_hsl(var(--primary)/0.24)]" : "",
                        cell.today && !cell.active ? "ring-2 ring-[hsl(var(--primary)/0.30)]" : "",
                      ].join(" ")}
                    >
                      {cell.day || ""}
                    </span>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-[#f8fbff] p-4">
                  <p className="truncate text-sm font-extrabold text-[#17172f]">{eventTitle(computed.nextEvent, language)}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <DateBlock label={adminT(language, "events.start")} date={nextEventDate.date} time={nextEventDate.time} />
                    <DateBlock label={adminT(language, "events.end")} date={nextEventEndDate.date} time={nextEventEndDate.time} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.liveAttendance")}</CardTitle>
                <p className="mt-1 text-xs font-bold text-slate-400">{language === "ar" ? "تقدم تسجيل الحضور للتذاكر المباعة." : "Check-in progress for sold tickets."}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[22px] bg-[#f8fbff] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{adminT(language, "overview.attendanceRate")}</span>
                    <span className="text-xl font-extrabold text-[#17172f]">{computed.attendanceRate}%</span>
                  </div>
                  <Progress value={computed.attendanceRate} className="h-3 bg-white [&>div]:bg-[hsl(var(--primary))]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric label={adminT(language, "overview.checkedIn")} value={computed.checkedIn} icon={ClipboardCheck} />
                  <MiniMetric label={adminStatusT(language, "waiting")} value={computed.notCheckedIn} icon={Clock3} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-extrabold">{adminT(language, "overview.quickActions")}</CardTitle>
                <p className="mt-1 text-xs font-bold text-slate-400">{adminT(language, "overview.fastPaths")}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <QuickAction href="/admin/events/create" label={adminT(language, "common.createEvent")} />
                <QuickAction href="/admin/orders" label={adminT(language, "overview.reviewPayments")} />
                <QuickAction href="/admin/checkin" label={adminT(language, "overview.openCheckin")} />
                <QuickAction href="/admin/certificates/builder" label={adminT(language, "overview.certificateBuilder")} />
              </CardContent>
            </Card>
          </aside>
        </section>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card className="rounded-[24px] border-0 bg-white shadow-[0_16px_35px_rgba(93,58,138,0.07)]">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 truncate text-xl font-extrabold text-[#17172f]">{typeof value === "number" ? value.toLocaleString() : value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function OperationCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint: string }) {
  return (
    <Card className="rounded-[24px] border-0 bg-white/95 shadow-[0_16px_35px_rgba(93,58,138,0.06)]">
      <CardContent className="flex min-h-[104px] items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 truncate text-lg font-extrabold text-[#17172f]">{typeof value === "number" ? value.toLocaleString() : value}</p>
          <p className="mt-1 truncate text-xs font-bold text-slate-400">{hint}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function HeroPill({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-[22px] bg-white/14 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-white/85" />
      <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-white/60">{label}</p>
      <p className="mt-1 text-lg font-extrabold">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  )
}

function RevenueTrendCard({
  title,
  subtitle,
  points,
  language,
  mode,
  onModeChange,
}: {
  title: string
  subtitle: string
  badge: string
  points: RevenueTrendPoint[]
  language: string
  mode: RevenueTrendMode
  onModeChange: (value: RevenueTrendMode) => void
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const chartWidth = 860
  const chartHeight = 235
  const left = 70
  const right = 52
  const top = 26
  const bottom = 44
  const plotWidth = chartWidth - left - right
  const plotHeight = chartHeight - top - bottom
  const formatCompact = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${Math.round(value / 1000)}k`
    return value.toLocaleString()
  }
  const totalRevenue = points.reduce((sum, point) => sum + point.value, 0)
  const totalOrders = points.reduce((sum, point) => sum + point.orders, 0)
  const averageOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0
  const chartPoints = points.map((point, index) => ({
    ...point,
    x: left + (plotWidth / Math.max(points.length - 1, 1)) * index,
  }))
  const series = [
    { key: "value" as const, label: language === "ar" ? "الإيرادات" : "Revenue", color: "hsl(var(--primary))", fill: true },
    { key: "orders" as const, label: language === "ar" ? "الطلبات المدفوعة" : "Paid orders", color: "#0f172a", fill: false },
    { key: "average" as const, label: language === "ar" ? "متوسط الطلب" : "Average order", color: "hsl(var(--brand-purple))", fill: false },
  ]
  const seriesPoints = series.map((item) => {
    const maxValue = Math.max(...points.map((point) => number(point[item.key])), 1)
    const values = chartPoints.map((point) => {
      const raw = number(point[item.key])
      return { ...point, raw, y: top + plotHeight - (raw / maxValue) * plotHeight }
    })
    const path = values
      .map((point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`
        const previous = values[index - 1]
        const midX = (previous.x + point.x) / 2
        return `C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`
      })
      .join(" ")
    const area = `${path} L ${values[values.length - 1]?.x || left} ${chartHeight - bottom} L ${left} ${chartHeight - bottom} Z`
    return { ...item, values, path, area }
  })
  const activePoint = activeIndex === null ? null : chartPoints[activeIndex]
  const activeSeries = activeIndex === null ? [] : seriesPoints.map((item) => ({ ...item, point: item.values[activeIndex] }))
  const maxValue = Math.max(...points.map((point) => point.value), 1)
  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <Card className="overflow-hidden rounded-[30px] border-0 bg-white shadow-[0_18px_45px_rgba(93,58,138,0.08)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
        <div>
          <CardTitle className="text-base font-extrabold text-[#17172f]">{title}</CardTitle>
          <p className="mt-1 text-sm font-bold text-slate-400">{subtitle}</p>
        </div>
        <Select value={mode} onValueChange={(value) => onModeChange(value as RevenueTrendMode)}>
          <SelectTrigger className="h-10 w-[140px] rounded-2xl border-0 bg-[#f8fbff] px-4 text-sm font-extrabold text-[#17172f] shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">{language === "ar" ? "شهري" : "Monthly"}</SelectItem>
            <SelectItem value="yearly">{language === "ar" ? "سنوي" : "Yearly"}</SelectItem>
          </SelectContent>
        </Select>
        <div className="hidden h-10 shrink-0 items-center rounded-2xl bg-[#f8fbff] px-4 text-sm font-bold text-[#17172f] shadow-sm">
          {language === "ar" ? "شهري" : "Monthly"}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-2 flex flex-wrap gap-2">
          {series.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-2 rounded-full bg-[#f8fbff] px-3 py-1 text-[11px] font-extrabold text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
        <div className="min-w-0">
          <div className="relative rounded-[26px] bg-white" onMouseLeave={() => setActiveIndex(null)}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[255px] w-full overflow-visible" role="img" aria-label={title}>
              <defs>
                <linearGradient id="revenueTrendArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              {gridLines.map((tick) => {
                const value = maxValue * tick
                const y = top + plotHeight - tick * plotHeight
                return (
                  <g key={tick}>
                    <line x1={left} x2={chartWidth - right} y1={y} y2={y} stroke="#e8eef7" strokeDasharray="7 10" strokeWidth="1" />
                    <text x={left - 14} y={y + 4} textAnchor="end" className="fill-[hsl(var(--primary))] text-[11px] font-bold">
                      {formatCompact(value)}
                    </text>
                  </g>
                )
              })}
              {chartPoints.map((point) => (
                <line key={`month-${point.label}`} x1={point.x} x2={point.x} y1={top} y2={chartHeight - bottom} stroke="#e6edf7" strokeDasharray="7 10" strokeWidth="1" />
              ))}
              {seriesPoints.map((item) =>
                item.fill ? <path key={`${item.key}-area`} d={item.area} fill="url(#revenueTrendArea)" /> : null,
              )}
              {seriesPoints.map((item) => (
                <path key={item.key} d={item.path} fill="none" stroke={item.color} strokeLinecap="round" strokeWidth={item.key === "value" ? 4 : 3} />
              ))}
              {seriesPoints.map((item) =>
                item.values.map((point) => (
                  <circle key={`${item.key}-${point.label}`} cx={point.x} cy={point.y} r={item.key === "value" ? 5 : 4} fill="white" stroke={item.color} strokeWidth="2.5" />
                )),
              )}
              {activePoint ? (
                <line x1={activePoint.x} x2={activePoint.x} y1={top} y2={chartHeight - bottom} stroke="#94a3b8" strokeDasharray="4 7" strokeWidth="1.5" />
              ) : null}
              {activeSeries.map(({ key, color, point }) => (
                <circle key={`active-${key}`} cx={point.x} cy={point.y} r="7" fill={color} stroke="white" strokeWidth="3" />
              ))}
              {chartPoints.map((point, index) => {
                const step = plotWidth / Math.max(points.length - 1, 1)
                const rectX = index === 0 ? left - step / 2 : point.x - step / 2
                return (
                  <g key={point.label}>
                    <rect
                      x={rectX}
                      y={top}
                      width={step}
                      height={plotHeight}
                      fill="transparent"
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseMove={() => setActiveIndex(index)}
                    />
                    <text x={point.x} y={chartHeight - 16} textAnchor="middle" className="fill-slate-400 text-[11px] font-bold">
                      {point.label}
                    </text>
                  </g>
                )
              })}
            </svg>
            {activePoint ? (
              <div
                className="pointer-events-none absolute top-4 min-w-[190px] rounded-2xl border border-slate-100 bg-white/95 p-3 text-xs shadow-[0_16px_35px_rgba(15,23,42,0.14)] backdrop-blur"
                style={{ left: `${Math.min(78, Math.max(8, (activePoint.x / chartWidth) * 100))}%`, transform: "translateX(-35%)" }}
              >
                <p className="mb-2 font-extrabold text-[#17172f]">{activePoint.label}</p>
                {series.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 py-1 font-bold text-slate-500">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </span>
                    <span className="text-[#17172f]">{item.key === "orders" ? activePoint[item.key].toLocaleString() : formatCompact(activePoint[item.key])}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="hidden">
            <MiniMetric label={language === "ar" ? "إجمالي الإيرادات" : "Total revenue"} value={formatCompact(totalRevenue)} icon={CreditCard} />
            <MiniMetric label={language === "ar" ? "طلبات مدفوعة" : "Paid orders"} value={totalOrders} icon={BadgeCheck} />
            <MiniMetric label={language === "ar" ? "متوسط الطلب" : "Average order"} value={formatCompact(averageOrder)} icon={BarChart3} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FunnelTrendCard({
  title,
  subtitle,
  badge,
  items,
  language,
}: {
  title: string
  subtitle: string
  badge: string
  items: Array<{ icon: any; label: string; value: number; percent: number }>
  language: string
}) {
  const values = items.map((item) => Math.max(0, Math.min(100, item.percent || 0)))
  const chartWidth = 720
  const chartHeight = 220
  const left = 62
  const right = 38
  const top = 24
  const bottom = 48
  const plotWidth = chartWidth - left - right
  const plotHeight = chartHeight - top - bottom
  const points = values.map((value, index) => {
    const x = left + (plotWidth / Math.max(items.length - 1, 1)) * index
    const y = top + plotHeight - (value / 100) * plotHeight
    return { x, y, value }
  })
  const linePath = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      const previous = points[index - 1]
      const midX = (previous.x + point.x) / 2
      return `C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`
    })
    .join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || left} ${chartHeight - bottom} L ${left} ${chartHeight - bottom} Z`
  const gridLines = [0, 25, 50, 75, 100]

  return (
    <Card className="overflow-hidden rounded-[30px] border-0 bg-white shadow-[0_18px_45px_rgba(93,58,138,0.08)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
        <div>
          <CardTitle className="text-base font-extrabold text-[#17172f]">{title}</CardTitle>
          <p className="mt-1 text-sm font-bold text-slate-400">{subtitle}</p>
        </div>
        <div className="flex h-10 shrink-0 items-center rounded-2xl bg-[#f8fbff] px-4 text-sm font-bold text-[#17172f] shadow-sm">
          {language === "ar" ? "شهري" : "Monthly"}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative min-h-[300px] rounded-[26px] bg-white">
          <Badge className="absolute right-3 top-0 z-10 rounded-xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.10)]">
            {badge}
          </Badge>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[240px] w-full overflow-visible" role="img" aria-label={title}>
            <defs>
              <linearGradient id="funnelTrendArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.28" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {gridLines.map((tick) => {
              const y = top + plotHeight - (tick / 100) * plotHeight
              return (
                <g key={tick}>
                  <line x1={left} x2={chartWidth - right} y1={y} y2={y} stroke="#e8eef7" strokeDasharray="7 10" strokeWidth="1" />
                  <text x={left - 12} y={y + 4} textAnchor="end" className="fill-[hsl(var(--primary))] text-[11px] font-bold">
                    {tick}%
                  </text>
                </g>
              )
            })}
            {points.map((point) => (
              <line key={`v-${point.x}`} x1={point.x} x2={point.x} y1={top} y2={chartHeight - bottom} stroke="#e6edf7" strokeDasharray="7 10" strokeWidth="1" />
            ))}
            <path d={areaPath} fill="url(#funnelTrendArea)" />
            <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeWidth="4" />
            {points.map((point, index) => (
              <g key={items[index].label}>
                <circle cx={point.x} cy={point.y} r="6" fill="white" stroke="hsl(var(--primary))" strokeWidth="3" />
                <text x={point.x} y={chartHeight - 18} textAnchor="middle" className="fill-slate-400 text-[11px] font-bold">
                  {items[index].label}
                </text>
              </g>
            ))}
          </svg>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-[#f8fbff] p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                    <p className="mt-0.5 text-base font-extrabold text-[#17172f]">{item.value.toLocaleString()}</p>
                  </div>
                  <span className="ms-auto shrink-0 rounded-xl bg-white px-2 py-1 text-xs font-bold text-[hsl(var(--primary))] shadow-sm">
                    {Math.min(item.percent, 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FunnelCard({ icon: Icon, label, value, percent }: { icon: any; label: string; value: number; percent: number }) {
  return (
    <div className="rounded-[22px] bg-[#f8fbff] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-extrabold text-slate-400">{Math.min(percent, 100)}%</span>
      </div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-[#17172f]">{value.toLocaleString()}</p>
      <Progress value={Math.min(percent, 100)} className="mt-3 h-2 bg-white [&>div]:bg-[hsl(var(--primary))]" />
    </div>
  )
}

function DateBlock({ label, date, time }: { label: string; date: string; time: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-black text-slate-600">{date}</p>
      <p className="text-[11px] font-bold text-slate-400">{time || "-"}</p>
    </div>
  )
}

function MiniMetric({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#f8fbff] p-4">
      <Icon className="mb-3 h-5 w-5 text-[hsl(var(--primary))]" />
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 truncate text-base font-extrabold text-[#17172f]">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  )
}

function SideStatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint: string }) {
  return (
    <Card className="rounded-[22px] border-0 bg-white shadow-[0_14px_30px_rgba(93,58,138,0.06)]">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 truncate text-lg font-extrabold text-[#17172f]">{typeof value === "number" ? value.toLocaleString() : value}</p>
          <p className="mt-0.5 truncate text-[11px] font-bold text-slate-400">{hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PulseRow({ label, value, percent }: { label: string; value: number; percent: number }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs font-bold">
      <span className="text-slate-500">{label}</span>
      <span>{Number(value).toLocaleString()}</span>
      <span className="rounded-lg bg-[#f8f5fb] px-2 py-1 text-slate-500">{Math.min(percent, 100)}%</span>
    </div>
  )
}

function HealthRow({ label, value, total, tone }: { label: string; value: number; total: number; tone: "primary" | "warning" | "danger" | "muted" | "slate" }) {
  const percent = Math.min(100, Math.round((value / total) * 100))
  const color = tone === "primary" ? "bg-[hsl(var(--primary))]" : tone === "warning" ? "bg-amber-400" : tone === "danger" ? "bg-red-500" : tone === "muted" ? "bg-slate-400" : "bg-slate-500"
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-slate-600">{label}</p>
        <p className="text-xs font-black text-slate-400">{value.toLocaleString()} / {total.toLocaleString()}</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#f8f5fb]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="ghost" className="h-11 w-full justify-between rounded-2xl bg-[#f8fbff] px-4 text-sm font-extrabold text-slate-600 hover:bg-[hsl(var(--primary)/0.10)] hover:text-[hsl(var(--primary))]">
      <Link href={href}>
        <span className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          {label}
        </span>
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </Button>
  )
}

function Status({ value }: { value?: string }) {
  const normalized = String(value || "pending").replace("_", " ")
  const good = ["approved", "paid", "published", "checked in", "sent"].includes(normalized)
  const bad = ["rejected", "cancelled", "refunded", "disabled"].includes(normalized)
  return (
    <Badge className={`${good ? "bg-emerald-50 text-emerald-700" : bad ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"} rounded-xl px-3 py-1 text-xs font-extrabold capitalize hover:bg-current/0`}>
      {normalized}
    </Badge>
  )
}
