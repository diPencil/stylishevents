"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Star, Ticket, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl } from "@/lib/platform-api"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export function PublicPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site min-h-screen overflow-x-hidden bg-[hsl(var(--primary)/0.07)] text-[#111827]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export function PublicPageHero({
  title,
  description,
  backgroundImage,
  backgroundPosition = "center",
  imageAlt,
}: {
  title: string
  description: string
  backgroundImage?: string
  backgroundPosition?: string
  imageAlt?: string
}) {
  const { isRtl } = useLanguage()
  const resolvedImage =
    apiAssetUrl(backgroundImage || "") ||
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"

  return (
    <section
      className="relative flex h-[300px] items-center justify-center overflow-hidden bg-slate-900 bg-cover bg-no-repeat md:h-[400px]"
      style={{ backgroundImage: `url("${resolvedImage}")`, backgroundPosition }}
      role={imageAlt ? "img" : undefined}
      aria-label={imageAlt}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 z-10 bg-slate-900/60" />
      <div className="absolute inset-0 bg-slate-900/20" />
      <div className="relative z-20 mt-16 px-4 text-center md:mt-24">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto max-w-4xl px-4 text-lg font-medium text-slate-200 md:text-xl">
          {description}
        </p>
      </div>
    </section>
  )
}

export function PageHero({
  eyebrowEn,
  eyebrowAr,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  stats,
}: {
  eyebrowEn: string
  eyebrowAr: string
  titleEn: string
  titleAr: string
  subtitleEn: string
  subtitleAr: string
  stats?: Array<{ value: string; labelEn: string; labelAr: string }>
}) {
  const { isRtl } = useLanguage()

  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-36 sm:px-6 lg:pb-20 lg:pt-44">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,hsl(var(--primary)/0.18),transparent_30%),radial-gradient(circle_at_80%_5%,hsl(var(--brand-purple)/0.14),transparent_28%)]" />
      <div className="container relative mx-auto max-w-7xl">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_420px]">
          <div>
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary shadow-sm">
              {isRtl ? eyebrowAr : eyebrowEn}
            </span>
            <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight text-[#0f172a] sm:text-5xl lg:text-7xl">
              {isRtl ? titleAr : titleEn}
            </h1>
            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
              {isRtl ? subtitleAr : subtitleEn}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full px-6 font-extrabold shadow-lg shadow-primary/20">
                <Link href="/contact">{isRtl ? "ابدأ تجهيز فعاليتك" : "Start planning"}</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full bg-white px-6 font-extrabold">
                <Link href="/upcoming-events">{isRtl ? "شاهد الفعاليات" : "View events"}</Link>
              </Button>
            </div>
          </div>

          {stats?.length ? (
            <div className="grid grid-cols-2 gap-3 rounded-[32px] bg-white/80 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.10)] backdrop-blur">
              {stats.map((stat) => (
                <div key={stat.labelEn} className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-3xl font-black text-[#0f172a]">{stat.value}</p>
                  <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">{isRtl ? stat.labelAr : stat.labelEn}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function SectionHeader({
  eyebrowEn,
  eyebrowAr,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  align = "center",
}: {
  eyebrowEn: string
  eyebrowAr: string
  titleEn: string
  titleAr: string
  subtitleEn?: string
  subtitleAr?: string
  align?: "start" | "center"
}) {
  const { isRtl } = useLanguage()

  return (
    <div className={cn("mb-10", align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl")}>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{isRtl ? eyebrowAr : eyebrowEn}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0f172a] md:text-5xl">{isRtl ? titleAr : titleEn}</h2>
      {(subtitleEn || subtitleAr) && (
        <p className="mt-4 text-base font-medium leading-8 text-slate-600">{isRtl ? subtitleAr : subtitleEn}</p>
      )}
    </div>
  )
}

export function FeatureGrid({ items }: { items: Array<{ icon: LucideIcon; titleEn: string; titleAr: string; textEn: string; textAr: string }> }) {
  const { isRtl } = useLanguage()

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <article key={item.titleEn} className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-[#0f172a]">{isRtl ? item.titleAr : item.titleEn}</h3>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{isRtl ? item.textAr : item.textEn}</p>
          </article>
        )
      })}
    </div>
  )
}

export function EventCard({ event, previous = false }: { event: any; previous?: boolean }) {
  const { isRtl } = useLanguage()

  return (
    <article className="group overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className={`relative h-52 p-5 text-white ${event.image ? 'bg-slate-900' : 'bg-gradient-to-br from-[hsl(var(--secondary))] via-primary to-[hsl(var(--brand-purple))]'}`}>
        {event.image && (
          <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105" />
        )}
        {!event.image && (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0,transparent_35%,rgba(255,255,255,0.10)_100%)]" />
        )}
        {event.image && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        )}
        <div className="relative z-10 flex h-full flex-col justify-between">
          <span className="w-fit rounded-full bg-white/16 px-3 py-1 text-xs font-extrabold backdrop-blur">{isRtl ? event.typeAr || event.cityAr : event.typeEn || event.cityEn}</span>
          <div>
            <p className="text-sm font-bold opacity-80">{isRtl ? event.dateAr : event.dateEn}</p>
            <h3 className="mt-2 text-2xl font-black leading-tight">{isRtl ? event.titleAr : event.titleEn}</h3>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-6">
        <p className="text-sm font-medium leading-7 text-slate-600">{isRtl ? event.summaryAr || event.outcomeAr : event.summaryEn || event.outcomeEn}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniMeta icon={MapPin} label={isRtl ? event.cityAr : event.cityEn} />
          <MiniMeta icon={previous ? Star : Users} label={previous ? event.satisfaction : event.seats} />
          <MiniMeta icon={previous ? CheckCircle2 : Ticket} label={isRtl ? event.statusAr || event.attendees : event.statusEn || event.attendees} />
        </div>
        <Button asChild variant={previous ? "outline" : "default"} className="h-11 w-full rounded-2xl font-extrabold">
          <Link href={previous ? "/contact" : "/register"}>
            {previous ? (isRtl ? "اطلب دراسة حالة مشابهة" : "Request similar case") : (isRtl ? "اطلب تفاصيل الحجز" : "Request booking details")}
            <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
          </Link>
        </Button>
      </div>
    </article>
  )
}

function MiniMeta({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex min-h-12 items-center gap-2 rounded-2xl bg-slate-50 px-3 text-sm font-extrabold text-slate-600">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="line-clamp-2">{label}</span>
    </div>
  )
}

export function Timeline({ steps }: { steps: Array<{ titleEn: string; titleAr: string; textEn: string; textAr: string }> }) {
  const { isRtl } = useLanguage()

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {steps.map((step, index) => (
        <div key={step.titleEn} className="rounded-[28px] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white">{index + 1}</span>
          <h3 className="mt-5 text-lg font-black text-[#0f172a]">{isRtl ? step.titleAr : step.titleEn}</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{isRtl ? step.textAr : step.textEn}</p>
        </div>
      ))}
    </div>
  )
}

export function SplitPanel({
  titleEn,
  titleAr,
  textEn,
  textAr,
  bullets,
}: {
  titleEn: string
  titleAr: string
  textEn: string
  textAr: string
  bullets: Array<{ en: string; ar: string }>
}) {
  const { isRtl } = useLanguage()

  return (
    <section className="px-4 py-16 sm:px-6 lg:py-24">
      <div className="container mx-auto max-w-7xl">
        <div className="grid overflow-hidden rounded-[36px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[hsl(var(--secondary))] p-8 text-white md:p-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Stylish Events</p>
            <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">{isRtl ? titleAr : titleEn}</h2>
            <p className="mt-5 text-base font-medium leading-8 text-white/70">{isRtl ? textAr : textEn}</p>
          </div>
          <div className="grid gap-3 p-6 md:p-10">
            {bullets.map((bullet) => (
              <div key={bullet.en} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm font-bold leading-7 text-slate-700">{isRtl ? bullet.ar : bullet.en}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
