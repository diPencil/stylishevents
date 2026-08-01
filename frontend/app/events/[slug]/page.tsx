"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Star, Ticket, Users } from "lucide-react"
import { PublicPageFrame, PublicPageHero } from "@/components/public/page-building-blocks"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { cn } from "@/lib/utils"

function formatDate(value?: string, locale = "en-US") {
  if (!value) return "-"
  return new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })
}

function stateLabel(state: string, isRtl: boolean) {
  const labels: Record<string, { en: string; ar: string }> = {
    open: { en: "Registration open", ar: "التسجيل متاح" },
    opens_soon: { en: "Opens soon", ar: "يفتح قريباً" },
    closed: { en: "Registration closed", ar: "التسجيل مغلق" },
    sold_out: { en: "Sold out", ar: "مكتمل العدد" },
    ended: { en: "Ended", ar: "انتهت الفعالية" },
    cancelled: { en: "Unavailable", ar: "غير متاحة" },
    disabled: { en: "Registration unavailable", ar: "التسجيل غير متاح" },
  }
  return isRtl ? labels[state]?.ar || state : labels[state]?.en || state
}

export default function PublicEventPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug || ""
  const { isRtl } = useLanguage()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    if (!slug) return
    platformApi.getPublicEvent(slug)
      .then((result) => { if (active) setData(result) })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load event") })
    return () => { active = false }
  }, [slug])

  const event = data?.event
  const tickets = data?.tickets || []
  const locale = isRtl ? "ar-EG" : "en-US"
  const policy = event?.registration_policy || {}

  if (error) {
    return (
      <PublicPageFrame>
        <section className="px-4 py-40 text-center">
          <h1 className="text-3xl font-black text-slate-950">{isRtl ? "الفعالية غير متاحة" : "Event unavailable"}</h1>
          <p className="mt-3 font-semibold text-slate-500">{error}</p>
          <Button asChild className="mt-8 rounded-full px-6 font-black"><Link href="/upcoming-events">{isRtl ? "العودة للفعاليات" : "Back to events"}</Link></Button>
        </section>
      </PublicPageFrame>
    )
  }

  if (!event) {
    return (
      <PublicPageFrame>
        <section className="px-4 py-40"><div className="mx-auto h-72 max-w-5xl animate-pulse rounded-[32px] bg-white/70" /></section>
      </PublicPageFrame>
    )
  }

  const heroImage = apiAssetUrl(event.banner_image_url || event.cover_image_url)
  const hasAvailableTicket = tickets.some((ticket: any) => ticket.price_period_id && !ticket.is_sold_out)
  const isLoginRequired = policy.access === "login_required"
  const canRegister = Boolean(policy.publicRegistrationEnabled !== false && event.state === "open" && hasAvailableTicket)
  const registerHref = isLoginRequired ? `/login?next=${encodeURIComponent(`/events/${event.slug}/register`)}` : `/events/${event.slug}/register`

  return (
    <PublicPageFrame>
      <PublicPageHero
        title={isRtl ? event.title_ar : event.title_en}
        description={isRtl ? event.summary_ar || "" : event.summary_en || ""}
        backgroundImage={heroImage}
        imageAlt={isRtl ? event.title_ar : event.title_en}
      />
      <section className="px-4 py-12 sm:px-6 lg:py-16" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-[32px] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] md:p-8">
              <div className="flex flex-wrap gap-3">
                <Badge icon={Ticket} label={event.type} />
                <Badge icon={CheckCircle2} label={stateLabel(event.state, isRtl)} />
              </div>
              <h2 className="mt-7 text-3xl font-black text-slate-950">{isRtl ? "عن الفعالية" : "About this event"}</h2>
              <p className="mt-4 whitespace-pre-line text-base font-semibold leading-8 text-slate-600">
                {isRtl ? event.description_ar || event.summary_ar : event.description_en || event.summary_en}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Info icon={CalendarDays} label={isRtl ? "الموعد" : "Date"} value={formatDate(event.starts_at, locale)} />
              <Info icon={MapPin} label={isRtl ? "المكان" : "Location"} value={isRtl ? event.venue_name_ar || event.venue_city_ar || "Online" : event.venue_name_en || event.venue_city_en || "Online"} />
              <Info icon={Users} label={isRtl ? "السعة" : "Capacity"} value={event.max_attendees ? Number(event.max_attendees).toLocaleString(locale) : (isRtl ? "حسب التوفر" : "Subject to availability")} />
            </div>

            {data.sessions?.length ? (
              <div className="rounded-[32px] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-black text-slate-950">{isRtl ? "جدول الفعالية" : "Agenda"}</h2>
                <div className="mt-5 space-y-3">
                  {data.sessions.map((session: any) => (
                    <div key={session.id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-black text-primary">{formatDate(session.starts_at, locale)}</p>
                      <h3 className="mt-1 text-lg font-black text-slate-950">{isRtl ? session.title_ar : session.title_en}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{session.speaker_name || session.room_name || ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[32px] bg-white p-5 shadow-[0_22px_70px_rgba(15,23,42,0.10)]">
              <h2 className="text-2xl font-black text-slate-950">{isRtl ? "التذاكر المتاحة" : "Available tickets"}</h2>
              <div className="mt-5 space-y-3">
                {tickets.map((ticket: any) => {
                  const currency = isRtl ? "EGP" : "USD"
                  const price = currency === "EGP" ? ticket.price_egp ?? ticket.price : ticket.price_usd ?? ticket.price
                  return (
                    <div key={ticket.id} className={cn("rounded-2xl border p-4", ticket.is_sold_out || !ticket.price_period_id ? "border-slate-100 bg-slate-50 opacity-70" : "border-primary/15 bg-primary/5")}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black text-slate-950">{isRtl ? ticket.name_ar : ticket.name_en}</h3>
                          <p className="mt-1 text-xs font-bold text-slate-500">{isRtl ? ticket.price_label_ar : ticket.price_label_en}</p>
                        </div>
                        <p className="font-black text-primary" dir="ltr">{currency} {Number(price || 0).toLocaleString()}</p>
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{isRtl ? ticket.description_ar : ticket.description_en}</p>
                      <div className="mt-3 flex items-center justify-between text-xs font-black text-slate-500">
                        <span>{ticket.remaining == null ? (isRtl ? "متاح" : "Available") : `${ticket.remaining} ${isRtl ? "متبقي" : "left"}`}</span>
                        <span>{ticket.is_sold_out ? (isRtl ? "مكتمل" : "Sold out") : stateLabel(event.state, isRtl)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button asChild disabled={!canRegister} className="mt-5 h-12 w-full rounded-2xl bg-[hsl(var(--primary))] font-black text-white">
                <Link href={canRegister ? registerHref : "#"} aria-disabled={!canRegister}>
                  {canRegister ? (isLoginRequired ? (isRtl ? "سجل الدخول للتسجيل" : "Login to register") : (isRtl ? "سجل الآن" : "Register now")) : (isRtl ? "التسجيل غير متاح" : "Registration unavailable")}
                  <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </PublicPageFrame>
  )
}

function Badge({ icon: Icon, label }: { icon: any; label: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black text-primary"><Icon className="h-4 w-4" />{label}</span>
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-4 text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-black leading-6 text-slate-950">{value}</p>
    </div>
  )
}
