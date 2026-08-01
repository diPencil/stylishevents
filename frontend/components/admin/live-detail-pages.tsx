"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  IdCard,
  ImageIcon,
  Mail,
  MapPin,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  ThumbsDown,
  Trash2,
  User,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { useAdminPermissions } from "@/components/admin/admin-shell"
import { ImageGalleryDropzone, ImageUrlDropzone } from "@/components/admin/image-url-dropzone"
import { TableDateTime } from "@/components/admin/table-date-time"
import { platformApi } from "@/lib/platform-api"
import { useLanguage } from "@/contexts/language-context"
import { adminStatusT, adminT } from "@/lib/admin-translations"
import { cn } from "@/lib/utils"

type DetailState<T> = {
  loading: boolean
  error: string
  data: T | null
}

function emptyState<T>(): DetailState<T> {
  return { loading: true, error: "", data: null }
}

function value(row: any, ...keys: string[]) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== "") return row[key]
  }
  return ""
}

function eventTitle(row: any) {
  return value(row, "event_title_en", "title_en", "titleEn") || "Untitled event"
}

function money(amount: unknown, currency = "USD") {
  const numeric = Number(amount || 0)
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(numeric)
}

function statusClass(status: string) {
  if (["paid", "approved", "published", "checked in", "sent", "active"].includes(status)) return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (["pending", "pending_payment", "pending_verification", "pending_review", "waiting", "draft"].includes(status)) return "bg-amber-50 text-amber-700 hover:bg-amber-50"
  if (["refunded", "ready", "used"].includes(status)) return "bg-slate-100 text-slate-600 hover:bg-slate-100"
  return "bg-red-50 text-red-700 hover:bg-red-50"
}

function PageState({ backHref, backLabel, loading, error }: { backHref: string; backLabel: string; loading: boolean; error: string }) {
  return (
    <div className="space-y-5">
      <BackButton href={backHref} label={backLabel} />
      <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
        <CardContent className="p-8">
          <p className="text-base font-extrabold text-[#17172f]">{loading ? "Loading live data..." : "Could not load this record"}</p>
          {error ? <p className="mt-2 text-sm font-semibold text-red-500">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}

function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="ghost" className="h-10 rounded-2xl bg-white px-4 font-bold">
      <Link href={href}>
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}

function Metric({ label, value: metricValue, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <Card className="rounded-2xl border-0 bg-slate-50">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="truncate text-sm font-extrabold text-[#17172f]">{metricValue}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Detail({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("rounded-2xl bg-slate-50 p-4", wide && "md:col-span-2")}>
      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 whitespace-pre-line text-sm font-extrabold leading-6 text-[#17172f]">{children || "-"}</div>
    </div>
  )
}

function Hero({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
      <div className="bg-[linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--primary)),hsl(var(--brand-purple)))] p-6 text-white md:p-8">
        <Badge className="rounded-xl bg-white/20 text-white hover:bg-white/20">{badge}</Badge>
        <h1 className="mt-5 text-2xl font-extrabold md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm font-semibold text-white/75">{subtitle}</p>
      </div>
    </section>
  )
}

function Field({ label, inputValue, onChange, type = "text", className, disabled }: { label: string; inputValue: string; onChange: (next: string) => void; type?: string; className?: string; disabled?: boolean }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Input type={type} value={inputValue} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold disabled:opacity-70" />
    </div>
  )
}

function TextAreaField({ label, inputValue, onChange }: { label: string; inputValue: string; onChange: (next: string) => void }) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Textarea value={inputValue} onChange={(event) => onChange(event.target.value)} className="min-h-[112px] rounded-2xl border-slate-200 bg-slate-50 font-semibold leading-6" />
    </div>
  )
}

function toLocalInput(input?: string) {
  if (!input) return ""
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function fromLocalInput(input: string) {
  return input ? new Date(input).toISOString().slice(0, 19).replace("T", " ") : null
}

export function LiveEventDetailPage({ id, initialMode }: { id: string; initialMode: "preview" | "edit" }) {
  const { language } = useLanguage()
  const [state, setState] = useState<DetailState<any>>(emptyState)
  const [form, setForm] = useState<any>(null)
  const [periods, setPeriods] = useState<any[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await platformApi.getEvent(id)
        const allPeriods = await Promise.all((data.tickets || []).map((ticket: any) => platformApi.listPricePeriods(ticket.id)))
        if (!active) return
        setState({ loading: false, error: "", data })
        setPeriods(allPeriods.flat())
        const event = data.event
        setForm({
          titleAr: value(event, "title_ar"),
          titleEn: value(event, "title_en"),
          slug: value(event, "slug"),
          status: value(event, "status") || "draft",
          type: value(event, "type") || "conference",
          maxAttendees: String(value(event, "max_attendees") || ""),
          startsAt: toLocalInput(value(event, "starts_at")),
          endsAt: toLocalInput(value(event, "ends_at")),
          registrationStartsAt: toLocalInput(value(event, "registration_starts_at")),
          registrationEndsAt: toLocalInput(value(event, "registration_ends_at")),
          summaryAr: value(event, "summary_ar"),
          summaryEn: value(event, "summary_en"),
          descriptionAr: value(event, "description_ar"),
          descriptionEn: value(event, "description_en"),
          coverImageUrl: value(event, "cover_image_url"),
          bannerImageUrl: value(event, "banner_image_url"),
          gallery: JSON.parse(value(event, "gallery_json") || "[]").join("\n"),
          googleMapsUrl: value(event, "google_maps_url"),
          publicRegistrationEnabled: Number(value(event, "public_registration_enabled") || 1) === 1,
          registrationApprovalMode: value(event, "registration_approval_mode") || "automatic",
          registrationAccess: value(event, "registration_access") || "guest_allowed",
          maxTicketsPerCheckout: String(value(event, "max_tickets_per_checkout") || "1"),
          capacityHoldHoursOverride: String(value(event, "capacity_hold_hours_override") || ""),
          manualPaymentEnabled: Number(value(event, "manual_payment_enabled") || 1) === 1,
        })
      } catch (error) {
        if (active) setState({ loading: false, error: error instanceof Error ? error.message : "Request failed", data: null })
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  const event = state.data?.event
  const tickets = state.data?.tickets || []
  const bookedPercent = event?.max_attendees ? Math.round((Number(event.attendees_count || 0) / Number(event.max_attendees)) * 100) : 0
  const gallery = useMemo(() => String(form?.gallery || "").split("\n").map((item) => item.trim()).filter(Boolean), [form?.gallery])

  async function saveEvent() {
    if (!form) return
    try {
      await platformApi.updateEvent(id, {
        slug: form.slug,
        titleAr: form.titleAr,
        titleEn: form.titleEn,
        summaryAr: form.summaryAr,
        summaryEn: form.summaryEn,
        descriptionAr: form.descriptionAr,
        descriptionEn: form.descriptionEn,
        type: String(form.type || "conference").toLowerCase(),
        status: form.status,
        startsAt: fromLocalInput(form.startsAt),
        endsAt: fromLocalInput(form.endsAt),
        registrationStartsAt: fromLocalInput(form.registrationStartsAt),
        registrationEndsAt: fromLocalInput(form.registrationEndsAt),
        publicRegistrationEnabled: Boolean(form.publicRegistrationEnabled),
        registrationApprovalMode: form.registrationApprovalMode || "automatic",
        registrationAccess: form.registrationAccess || "guest_allowed",
        maxTicketsPerCheckout: 1,
        capacityHoldHoursOverride: Number(form.capacityHoldHoursOverride || 0) || null,
        manualPaymentEnabled: Boolean(form.manualPaymentEnabled),
        timezone: "Africa/Cairo",
        maxAttendees: Number(form.maxAttendees || 0) || null,
        coverImageUrl: form.coverImageUrl || null,
        bannerImageUrl: form.bannerImageUrl || null,
        gallery: gallery,
        googleMapsUrl: form.googleMapsUrl || null,
        venueId: event?.venue_id || null,
        organizerId: event?.organizer_id || null,
      })
      toast.success(language === "ar" ? "تم حفظ الفعالية" : "Event saved", { description: language === "ar" ? "تم تحديث سجل قاعدة البيانات الفعلي." : "Event details were updated." })
    } catch (error) {
      toast.error(language === "ar" ? "فشل الحفظ" : "Save failed", { description: error instanceof Error ? error.message : (language === "ar" ? "تعذر تحديث الفعالية." : "Could not update event.") })
    }
  }

  if (state.loading || state.error || !event || !form) return <PageState backHref="/admin/events" backLabel={language === "ar" ? "رجوع للفعاليات" : "Back to Events"} loading={state.loading} error={state.error} />

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <BackButton href="/admin/events" label={language === "ar" ? "رجوع للفعاليات" : "Back to Events"} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">{language === "ar" ? "تفاصيل الفعالية" : "Event Details"}</Badge>
            <Badge className={cn("rounded-xl capitalize", statusClass(form.status))}>{adminStatusT(language, form.status)}</Badge>
          </div>
          <h1 className="mt-3 text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">{form.titleEn}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">{language === "ar" ? (form.summaryAr || "تفاصيل الفعالية المباشرة.") : (form.summaryEn || "Live event details.")}</p>
        </div>
        <ConfirmAction title={language === "ar" ? "حفظ تعديلات الفعالية؟" : "Save event changes?"} description={language === "ar" ? "سيتم تحديث تفاصيل الفعالية." : "This will update the event details."} confirmLabel={language === "ar" ? "حفظ التعديلات" : "Save changes"} tone="success" onConfirm={saveEvent}>
          <Button className="h-10 rounded-2xl px-5 font-extrabold">
            <CheckCircle2 className="h-4 w-4" />
            {language === "ar" ? "حفظ التعديلات" : "Save Changes"}
          </Button>
        </ConfirmAction>
      </div>

      <Tabs defaultValue={initialMode} className="space-y-5">
        <TabsList className="grid h-auto w-full rounded-2xl bg-white/70 p-1 sm:w-[420px] sm:grid-cols-2">
          <TabsTrigger value="preview" className="rounded-xl py-2.5 font-extrabold">{adminT(language, "common.preview")}</TabsTrigger>
          <TabsTrigger value="edit" className="rounded-xl py-2.5 font-extrabold">{adminT(language, "events.editEvent")}</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-5">
          <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
            <div className="grid lg:grid-cols-[1fr_360px]">
              <div className="p-6 md:p-8">
                <Badge className="rounded-xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.10)]">{form.type}</Badge>
                <h2 className="mt-5 text-2xl font-extrabold text-[#17172f] md:text-3xl">{language === "ar" ? form.titleAr : form.titleEn}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-400">{form.slug}</p>
                <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600">{language === "ar" ? (form.descriptionAr || form.summaryAr) : (form.descriptionEn || form.summaryEn)}</p>
              </div>
              <div className="min-h-[260px] bg-slate-100">
                {form.coverImageUrl ? <img src={form.coverImageUrl} alt={form.titleEn} className="h-full w-full object-cover" /> : null}
              </div>
            </div>
            <div className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-4 md:p-6">
              <Metric label={adminT(language, "events.seats")} value={Number(event.max_attendees || 0).toLocaleString()} icon={Ticket} />
              <Metric label={adminT(language, "status.registered")} value={Number(event.attendees_count || event.registrations_count || 0).toLocaleString()} icon={Users} />
              <Metric label={adminT(language, "common.tickets")} value={language === "ar" ? `${tickets.length} أنواع` : `${tickets.length} types`} icon={CalendarDays} />
              <Metric label={adminT(language, "events.rating")} value={Number(event.average_rating || 0).toFixed(1)} icon={BadgeCheck} />
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
              <CardHeader><CardTitle className="text-base font-extrabold">{language === "ar" ? "كل تفاصيل الفعالية" : "Full Event Details"}</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Detail label={adminT(language, "createEvent.arabicTitle")}>{form.titleAr}</Detail>
                <Detail label={language === "ar" ? "المكان" : "Venue"}>{value(event, "venue_name_en") || "-"}</Detail>
                <Detail label={language === "ar" ? "المدينة" : "City"}>{value(event, "venue_city_en") || "-"}</Detail>
                <Detail label={language === "ar" ? "خريطة Google" : "Google map"}>{form.googleMapsUrl || "-"}</Detail>
                <Detail label={language === "ar" ? "بداية الفعالية" : "Event starts"}><TableDateTime value={event.starts_at} /></Detail>
                <Detail label={language === "ar" ? "نهاية الفعالية" : "Event ends"}><TableDateTime value={event.ends_at} /></Detail>
                <Detail label={language === "ar" ? "فتح التسجيل" : "Registration opens"}><TableDateTime value={event.registration_starts_at} /></Detail>
                <Detail label={language === "ar" ? "غلق التسجيل" : "Registration closes"}><TableDateTime value={event.registration_ends_at} /></Detail>
                <Detail label={language === "ar" ? "الوصف العربي" : "Arabic description"} wide>{form.descriptionAr || form.summaryAr}</Detail>
              </CardContent>
            </Card>
            <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
              <CardHeader><CardTitle className="text-base font-extrabold">{language === "ar" ? "سعة الحجز" : "Booking Capacity"}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-extrabold">{bookedPercent}%</p>
                    <p className="text-sm font-medium text-slate-400">{language === "ar" ? "مقاعد مسجلة" : "registered seats"}</p>
                  </div>
                  <Badge className={cn("rounded-xl capitalize", statusClass(form.status))}>{adminStatusT(language, form.status)}</Badge>
                </div>
                <Progress value={bookedPercent} className="mt-5 h-3 bg-slate-100 [&>div]:bg-[hsl(var(--primary))]" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
              <CardHeader><CardTitle className="text-base font-extrabold">{language === "ar" ? "التذاكر والتسعير" : "Tickets & Pricing"}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {tickets.length ? tickets.map((ticket: any) => (
                  <div key={ticket.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-[#17172f]">{ticket.name_en}</p>
                        <p className="text-xs font-bold text-slate-400">{ticket.sold_count || 0}/{ticket.quota || 0} {language === "ar" ? "مباع" : "sold"}</p>
                      </div>
                      <Badge className={cn("rounded-xl", ticket.is_active ? statusClass("active") : statusClass("disabled"))}>{adminStatusT(language, ticket.is_active ? "active" : "disabled")}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {periods.filter((period) => period.ticket_type_id === ticket.id).map((period) => (
                        <span key={period.id} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-600">
                          {period.label_en}: {money(period.price_usd || period.price, "USD")} / {money(period.price_egp || period.price, "EGP")}
                        </span>
                      ))}
                    </div>
                  </div>
                )) : <p className="text-sm font-semibold text-slate-400">{language === "ar" ? "لم يتم إنشاء تذاكر لهذه الفعالية بعد." : "No tickets created for this event yet."}</p>}
              </CardContent>
            </Card>
            <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
              <CardHeader><CardTitle className="text-base font-extrabold">{language === "ar" ? "معرض الصور" : "Gallery"}</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                {gallery.length ? gallery.map((image) => (
                  <div key={image} className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    <img src={image} alt="Event gallery" className="h-full w-full object-cover" />
                  </div>
                )) : <p className="col-span-3 text-sm font-semibold text-slate-400">{language === "ar" ? "لا توجد صور في المعرض بعد." : "No gallery images yet."}</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-5">
          <EditorSection icon={Search} title="Event Identity">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Arabic title" inputValue={form.titleAr} onChange={(next) => setForm({ ...form, titleAr: next })} />
              <Field label="English title" inputValue={form.titleEn} onChange={(next) => setForm({ ...form, titleEn: next })} />
              <Field label="Slug" inputValue={form.slug} onChange={(next) => setForm({ ...form, slug: next })} />
              <Select value={form.status} onValueChange={(next) => setForm({ ...form, status: next })}>
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>{["draft", "published", "disabled", "sold_out", "completed", "cancelled"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
              <Field label="Type" inputValue={form.type} onChange={(next) => setForm({ ...form, type: next })} />
              <Field label="Max attendees" inputValue={form.maxAttendees} type="number" onChange={(next) => setForm({ ...form, maxAttendees: next })} />
            </div>
          </EditorSection>
          <EditorSection icon={CalendarDays} title="Dates & Registration">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Event starts" inputValue={form.startsAt} type="datetime-local" onChange={(next) => setForm({ ...form, startsAt: next })} />
              <Field label="Event ends" inputValue={form.endsAt} type="datetime-local" onChange={(next) => setForm({ ...form, endsAt: next })} />
              <Field label="Registration opens" inputValue={form.registrationStartsAt} type="datetime-local" onChange={(next) => setForm({ ...form, registrationStartsAt: next })} />
              <Field label="Registration closes" inputValue={form.registrationEndsAt} type="datetime-local" onChange={(next) => setForm({ ...form, registrationEndsAt: next })} />
            </div>
          </EditorSection>
          <EditorSection icon={ShieldCheck} title={language === "ar" ? "التسجيل والدفع" : "Registration & Checkout"}>
            <div className="grid gap-4 md:grid-cols-2">
              <Select value={form.publicRegistrationEnabled ? "enabled" : "disabled"} onValueChange={(next) => setForm({ ...form, publicRegistrationEnabled: next === "enabled" })}>
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">{language === "ar" ? "تفعيل التسجيل العام" : "Public registration enabled"}</SelectItem>
                  <SelectItem value="disabled">{language === "ar" ? "إيقاف التسجيل العام" : "Public registration disabled"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.registrationApprovalMode} onValueChange={(next) => setForm({ ...form, registrationApprovalMode: next })}>
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">{language === "ar" ? "اعتماد تلقائي" : "Automatic approval"}</SelectItem>
                  <SelectItem value="manual_review">{language === "ar" ? "مراجعة يدوية" : "Manual review"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.registrationAccess} onValueChange={(next) => setForm({ ...form, registrationAccess: next })}>
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest_allowed">{language === "ar" ? "السماح للضيف والعميل" : "Guest and customer checkout"}</SelectItem>
                  <SelectItem value="login_required">{language === "ar" ? "تسجيل الدخول مطلوب" : "Login required"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.manualPaymentEnabled ? "enabled" : "disabled"} onValueChange={(next) => setForm({ ...form, manualPaymentEnabled: next === "enabled" })}>
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">{language === "ar" ? "تفعيل التحويل البنكي" : "Manual bank payment enabled"}</SelectItem>
                  <SelectItem value="disabled">{language === "ar" ? "إيقاف التحويل البنكي" : "Manual bank payment disabled"}</SelectItem>
                </SelectContent>
              </Select>
              <Field label={language === "ar" ? "أقصى عدد تذاكر في الطلب" : "Maximum tickets per checkout"} inputValue="1" type="number" onChange={() => setForm({ ...form, maxTicketsPerCheckout: "1" })} disabled />
              <Field label={language === "ar" ? "مدة حجز المقعد بالساعات" : "Seat reservation hours override"} inputValue={form.capacityHoldHoursOverride} type="number" onChange={(next) => setForm({ ...form, capacityHoldHoursOverride: next })} />
            </div>
          </EditorSection>
          <EditorSection icon={ImageIcon} title="Media & Gallery">
            <div className="grid gap-4 lg:grid-cols-2">
              <ImageUrlDropzone label="Cover image URL" value={form.coverImageUrl} onChange={(next) => setForm({ ...form, coverImageUrl: next })} />
              <ImageGalleryDropzone label="Gallery images" value={form.gallery} onChange={(next) => setForm({ ...form, gallery: next })} />
            </div>
          </EditorSection>
          <EditorSection icon={MapPin} title="Content">
            <div className="grid gap-4 md:grid-cols-2">
              <TextAreaField label="Arabic summary" inputValue={form.summaryAr} onChange={(next) => setForm({ ...form, summaryAr: next })} />
              <TextAreaField label="English summary" inputValue={form.summaryEn} onChange={(next) => setForm({ ...form, summaryEn: next })} />
              <TextAreaField label="Arabic description" inputValue={form.descriptionAr} onChange={(next) => setForm({ ...form, descriptionAr: next })} />
              <TextAreaField label="English description" inputValue={form.descriptionEn} onChange={(next) => setForm({ ...form, descriptionEn: next })} />
              <Field label="Google maps URL" inputValue={form.googleMapsUrl} onChange={(next) => setForm({ ...form, googleMapsUrl: next })} className="md:col-span-2" />
            </div>
          </EditorSection>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EditorSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-extrabold">
          <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function LiveRegistrationDetailPage({ id, variant }: { id: string; variant: "ticket" | "order" }) {
  const { language } = useLanguage()
  const [state, setState] = useState<DetailState<any>>(emptyState)

  useEffect(() => {
    let active = true
    platformApi.getRegistration(id)
      .then((data) => active && setState({ loading: false, error: "", data }))
      .catch((error) => active && setState({ loading: false, error: error instanceof Error ? error.message : "Request failed", data: null }))
    return () => {
      active = false
    }
  }, [id])

  async function updateStatus(status: "paid" | "cancelled" | "refunded") {
    try {
      await platformApi.updateRegistrationOrderStatus(id, status)
      const data = await platformApi.getRegistration(id)
      setState({ loading: false, error: "", data })
      toast.success(language === "ar" ? "تم تحديث الحالة" : "Status updated", { description: language === "ar" ? `أصبح الطلب ${adminStatusT(language, status)}.` : `Order is now ${status}.` })
    } catch (error) {
      toast.error(language === "ar" ? "فشل الإجراء" : "Action failed", { description: error instanceof Error ? error.message : (language === "ar" ? "تعذر تحديث الحالة." : "Could not update status.") })
    }
  }

  async function reviewPayment(status: "approved" | "rejected") {
    try {
      await platformApi.reviewPayment(id, { status })
      const data = await platformApi.getRegistration(id)
      setState({ loading: false, error: "", data })
      toast.success(language === "ar" ? "تمت مراجعة الدفع" : "Payment reviewed")
    } catch (error) {
      toast.error(language === "ar" ? "فشلت مراجعة الدفع" : "Payment review failed", { description: error instanceof Error ? error.message : "Could not review payment." })
    }
  }

  async function reviewRegistration(status: "approved" | "rejected") {
    try {
      await platformApi.reviewRegistration(id, { status })
      const data = await platformApi.getRegistration(id)
      setState({ loading: false, error: "", data })
      toast.success(language === "ar" ? "تمت مراجعة التسجيل" : "Registration reviewed")
    } catch (error) {
      toast.error(language === "ar" ? "فشلت مراجعة التسجيل" : "Registration review failed", { description: error instanceof Error ? error.message : "Could not review registration." })
    }
  }

  const row = state.data
  if (state.loading || state.error || !row) return <PageState backHref={variant === "ticket" ? "/admin/tickets" : "/admin/orders"} backLabel={variant === "ticket" ? (language === "ar" ? "رجوع للتذاكر" : "Back to Tickets") : (language === "ar" ? "رجوع للحجوزات" : "Back to Orders")} loading={state.loading} error={state.error} />

  const status = value(row, "order_status", "registration_status") || "pending"
  const currency = value(row, "selected_currency", "currency") || "USD"
  const amount = money(value(row, "selected_price", "grand_total"), currency)
  const title = variant === "ticket" ? value(row, "ticket_number", "registration_number") : value(row, "order_number", "registration_number")

  return (
    <div className="space-y-5">
      <BackButton href={variant === "ticket" ? "/admin/tickets" : "/admin/orders"} label={variant === "ticket" ? (language === "ar" ? "رجوع للتذاكر" : "Back to Tickets") : (language === "ar" ? "رجوع للحجوزات" : "Back to Orders")} />
      <Hero badge={status} title={title} subtitle={eventTitle(row)} />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label={adminT(language, "common.customer")} value={row.doctor_name || "-"} icon={User} />
        <Metric label={adminT(language, "common.ticket")} value={row.ticket_name_en || "-"} icon={Ticket} />
        <Metric label={adminT(language, "common.amount")} value={amount} icon={CreditCard} />
        <Metric label={adminT(language, "common.status")} value={adminStatusT(language, status)} icon={CheckCircle2} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader><CardTitle className="text-base font-extrabold">{variant === "ticket" ? (language === "ar" ? "تفاصيل التذكرة" : "Ticket Details") : (language === "ar" ? "تفاصيل الطلب" : "Order Details")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Detail label={language === "ar" ? "البريد الإلكتروني" : "Email"}>{row.doctor_email}</Detail>
            <Detail label={language === "ar" ? "الموبايل" : "Mobile"}>{row.doctor_mobile}</Detail>
            <Detail label={language === "ar" ? "الدولة" : "Country"}>{row.country_name}</Detail>
            <Detail label={language === "ar" ? "الجنسية" : "Nationality"}>{row.nationality}</Detail>
            <Detail label={language === "ar" ? "التسجيل" : "Registration"}><TableDateTime value={row.created_at} /></Detail>
            <Detail label={language === "ar" ? "مرجع الدفع" : "Payment reference"}>{row.payment_reference || "-"}</Detail>
            <Detail label={language === "ar" ? "موعد انتهاء حجز المقعد" : "Seat hold deadline"}><TableDateTime value={row.reservation_expires_at} /></Detail>
            <Detail label={language === "ar" ? "حالة حجز المقعد" : "Capacity reservation state"}>{row.capacity_reservation_status || "-"}</Detail>
            <Detail label={language === "ar" ? "سبب تحرير السعة" : "Capacity release reason"}>{row.capacity_release_reason || "-"}</Detail>
            <Detail label={language === "ar" ? "رمز QR" : "QR token"} wide>{row.qr_token || (language === "ar" ? "اعتماد الدفع لازم يولد تذكرة QR أولاً." : "Payment approval must generate a QR ticket first.")}</Detail>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base font-extrabold"><ReceiptText className="h-4 w-4 text-[hsl(var(--primary))]" />{adminT(language, "common.actions")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Badge className={cn("rounded-xl capitalize", statusClass(status))}>{adminStatusT(language, status)}</Badge>
            {row.payment_status !== "approved" ? (
              <ConfirmAction title={language === "ar" ? "اعتماد الدفع؟" : "Approve payment?"} description={language === "ar" ? "سيتم تطبيق سياسة اعتماد التسجيل الخاصة بالفعالية." : "The event registration approval policy will be applied."} confirmLabel={language === "ar" ? "اعتماد الدفع" : "Approve payment"} tone="success" onConfirm={() => reviewPayment("approved")}>
                <Button className="h-10 w-full rounded-xl font-bold"><BadgeCheck className="h-4 w-4" /> {language === "ar" ? "اعتماد الدفع" : "Approve payment"}</Button>
              </ConfirmAction>
            ) : null}
            {row.registration_status === "pending_review" ? (
              <ConfirmAction title={language === "ar" ? "اعتماد التسجيل؟" : "Approve registration?"} description={language === "ar" ? "سيتم إصدار التذكرة ورمز QR." : "This issues the ticket and QR code."} confirmLabel={language === "ar" ? "اعتماد التسجيل" : "Approve registration"} tone="success" onConfirm={() => reviewRegistration("approved")}>
                <Button className="h-10 w-full rounded-xl font-bold"><UserCheck className="h-4 w-4" /> {language === "ar" ? "اعتماد التسجيل" : "Approve registration"}</Button>
              </ConfirmAction>
            ) : null}
            {row.payment_status !== "rejected" && row.registration_status !== "rejected" ? (
              <ConfirmAction title={language === "ar" ? "رفض التسجيل؟" : "Reject registration?"} description={language === "ar" ? "سيتم تحرير السعة وعدم إصدار التذكرة." : "This releases capacity and will not issue a ticket."} confirmLabel={language === "ar" ? "رفض" : "Reject"} tone="danger" onConfirm={() => row.payment_status !== "approved" ? reviewPayment("rejected") : reviewRegistration("rejected")}>
                <Button variant="outline" className="h-10 w-full rounded-xl font-bold text-red-600"><XCircle className="h-4 w-4" /> {language === "ar" ? "رفض" : "Reject"}</Button>
              </ConfirmAction>
            ) : null}
            <ConfirmAction title={language === "ar" ? "تأكيد دفع هذا الطلب؟" : "Mark this order paid?"} description={language === "ar" ? "سيتم تحديث الحجز الفعلي وقد يتم إنشاء سجلات دخول العميل." : "This updates the live booking and can generate customer access records."} confirmLabel={adminT(language, "common.markPaid")} tone="success" onConfirm={() => updateStatus("paid")}>
              <Button className="h-10 w-full rounded-xl font-bold"><CheckCircle2 className="h-4 w-4" /> {adminT(language, "common.markPaid")}</Button>
            </ConfirmAction>
            <ConfirmAction title={language === "ar" ? "استرداد هذا الطلب؟" : "Refund this order?"} description={language === "ar" ? "سيتم تحديث حالة الدفع إلى مسترد." : "This updates payment status to refunded."} confirmLabel={adminT(language, "common.refund")} onConfirm={() => updateStatus("refunded")}>
              <Button variant="outline" className="h-10 w-full rounded-xl font-bold"><ReceiptText className="h-4 w-4" /> {adminT(language, "common.refund")}</Button>
            </ConfirmAction>
            <ConfirmAction title={language === "ar" ? "إلغاء هذا الحجز؟" : "Cancel this booking?"} description={language === "ar" ? "سيتم إلغاء أي رمز QR مرتبط بالحضور." : "This revokes any related attendee QR token."} confirmLabel={adminT(language, "common.cancelBooking")} tone="danger" onConfirm={() => updateStatus("cancelled")}>
              <Button variant="outline" className="h-10 w-full rounded-xl font-bold text-red-600"><XCircle className="h-4 w-4" /> {adminT(language, "common.cancelBooking")}</Button>
            </ConfirmAction>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function LiveAttendeeDetailPage({ id }: { id: string }) {
  const { language } = useLanguage()
  const { can } = useAdminPermissions()
  const canCheckIn = can("checkin.manage")
  const canManageCertificates = can("certificates.manage")
  const [state, setState] = useState<DetailState<any>>(emptyState)

  async function load(active = true) {
    try {
      const data = await platformApi.getAttendee(id)
      if (active) setState({ loading: false, error: "", data })
    } catch (error) {
      if (active) setState({ loading: false, error: error instanceof Error ? error.message : "Request failed", data: null })
    }
  }

  useEffect(() => {
    let active = true
    load(active)
    return () => {
      active = false
    }
  }, [id])

  const row = state.data
  if (state.loading || state.error || !row) return <PageState backHref="/admin/attendees" backLabel={language === "ar" ? "رجوع للحضور" : "Back to Attendees"} loading={state.loading} error={state.error} />

  async function checkIn() {
    try {
      await platformApi.checkin(row.qr_token)
      await load()
      toast.success(language === "ar" ? "تم تسجيل الحضور" : "Attendee checked in", { description: row.full_name })
    } catch (error) {
      toast.error(language === "ar" ? "فشل تسجيل الحضور" : "Check-in failed", { description: error instanceof Error ? error.message : (language === "ar" ? "تعذر تسجيل حضور العميل." : "Could not check in attendee.") })
    }
  }

  async function issueCertificate() {
    try {
      await platformApi.issueCertificate({ attendeeId: row.id, templateKey: "default" })
      await load()
      toast.success(language === "ar" ? "تم إصدار الشهادة" : "Certificate issued", { description: row.full_name })
    } catch (error) {
      toast.error(language === "ar" ? "فشل إصدار الشهادة" : "Certificate failed", { description: error instanceof Error ? error.message : (language === "ar" ? "تعذر إصدار الشهادة." : "Could not issue certificate.") })
    }
  }

  return (
    <div className="space-y-5">
      <BackButton href="/admin/attendees" label={language === "ar" ? "رجوع للحضور" : "Back to Attendees"} />
      <Hero badge={row.qr_status || "attendee"} title={row.full_name} subtitle={eventTitle(row)} />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label={adminT(language, "common.ticket")} value={row.ticket_name_en || "-"} icon={Ticket} />
        <Metric label={language === "ar" ? "رقم الحضور" : "Attendee No."} value={row.attendee_number || "-"} icon={IdCard} />
        <Metric label="QR" value={row.qr_status || "-"} icon={QrCode} />
        <Metric label={adminT(language, "attendees.certificate")} value={adminStatusT(language, row.certificate_status || "pending")} icon={BadgeCheck} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader><CardTitle className="text-base font-extrabold">{language === "ar" ? "تفاصيل الحضور" : "Attendee Details"}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Detail label={language === "ar" ? "البريد الإلكتروني" : "Email"}>{row.email}</Detail>
            <Detail label={language === "ar" ? "الهاتف" : "Phone"}>{row.phone}</Detail>
            <Detail label={adminT(language, "status.registered")}><TableDateTime value={row.created_at} /></Detail>
            <Detail label={adminT(language, "attendees.checkin")}><TableDateTime value={row.checked_in_at} /></Detail>
            <Detail label={language === "ar" ? "رقم التذكرة" : "Ticket number"}>{row.ticket_number || "-"}</Detail>
            <Detail label={language === "ar" ? "رقم الكارت" : "Card number"}>{row.card_number || "-"}</Detail>
            <Detail label={language === "ar" ? "رمز QR" : "QR token"} wide>{row.qr_token}</Detail>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader><CardTitle className="text-base font-extrabold">{adminT(language, "overview.quickActions")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {canCheckIn && <Button onClick={checkIn} className="h-10 w-full rounded-xl bg-[hsl(var(--primary))] font-bold text-white"><UserCheck className="h-4 w-4" /> {adminT(language, "attendees.checkin")}</Button>}
            {canManageCertificates && <Button onClick={issueCertificate} variant="outline" className="h-10 w-full rounded-xl font-bold"><BadgeCheck className="h-4 w-4" /> {adminT(language, "certificates.sendCertificate")}</Button>}
            <Button variant="outline" className="h-10 w-full rounded-xl font-bold"><Mail className="h-4 w-4" /> {language === "ar" ? "إرسال بريد للحضور" : "Email attendee"}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function LiveCustomerAssetPreviewPage({ id, kind }: { id: string; kind: "certificate" | "card" }) {
  const { language } = useLanguage()
  const { can } = useAdminPermissions()
  const canManageCertificates = can("certificates.manage")
  const [state, setState] = useState<DetailState<any>>(emptyState)

  useEffect(() => {
    let active = true
    platformApi.listCertificateDelivery()
      .then((rows) => {
        const record = rows.find((item: any) => String(item.attendee_id) === String(id) || String(item.certificate_id) === String(id) || String(item.card_id) === String(id))
        if (active) setState({ loading: false, error: record ? "" : "Record not found", data: record || null })
      })
      .catch((error) => active && setState({ loading: false, error: error instanceof Error ? error.message : "Request failed", data: null }))
    return () => {
      active = false
    }
  }, [id])

  const row = state.data
  if (state.loading || state.error || !row) return <PageState backHref="/admin/certificates" backLabel={adminT(language, "common.back")} loading={state.loading} error={state.error} />

  const title = kind === "certificate" ? row.certificate_number || `CERT-${row.attendee_id}` : row.card_number || `CARD-${row.attendee_id}`
  const status = kind === "certificate" ? row.certificate_status || "ready" : row.card_file_url ? "sent" : "ready"

  async function sendAsset() {
    try {
      if (kind === "certificate") {
        await platformApi.issueCertificate({ attendeeId: Number(row.attendee_id || row.id), templateKey: "default" })
        toast.success(language === "ar" ? "تم إرسال الشهادة" : "Certificate sent", { description: row.full_name })
      } else {
        await platformApi.generateEventCard({ attendeeId: Number(row.attendee_id || row.id), templateKey: "default" })
        toast.success(language === "ar" ? "تم إرسال كارت الفعالية" : "Event card sent", { description: row.full_name })
      }
    } catch (error) {
      toast.error(language === "ar" ? "فشل الإرسال" : "Send failed", { description: error instanceof Error ? error.message : (language === "ar" ? "تعذر إرسال هذا الملف." : "Could not send this asset.") })
    }
  }

  function downloadAsset() {
    window.print()
    toast.success(language === "ar" ? "تم فتح نافذة الطباعة" : "Print dialog opened", { description: language === "ar" ? "اختر حفظ كـ PDF لتحميل هذه المعاينة." : "Choose Save as PDF to download this preview." })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <BackButton href="/admin/certificates" label={adminT(language, "common.back")} />
          <Badge className="mb-3 mt-4 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">
            {kind === "certificate" ? adminT(language, "certificates.previewCertificate") : adminT(language, "certificates.previewEventCard")}
          </Badge>
          <h1 className="text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">{title}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">{row.full_name} - {eventTitle(row)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadAsset} variant="outline" className="h-10 rounded-2xl bg-white px-4 text-sm font-extrabold"><Download className="h-4 w-4" /> {adminT(language, "common.download")}</Button>
          {canManageCertificates && <Button onClick={sendAsset} className="h-10 rounded-2xl bg-[hsl(var(--primary))] px-4 text-sm font-extrabold text-white"><Mail className="h-4 w-4" /> {adminT(language, "common.send")}</Button>}
        </div>
      </div>

      {kind === "certificate" ? (
        <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardContent className="p-4 md:p-6">
            <div className="relative mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-100 bg-gradient-to-br from-[#eef6ff] via-white to-[#f8effb] shadow-inner">
              <div className="absolute left-[6%] top-[7%]"><img src="/logo.png" alt="Stylish Events" className="h-9 w-auto" /></div>
              <div className="absolute right-[6%] top-[8%] rounded-full bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[hsl(var(--primary))]">{language === "ar" ? "حضور موثق" : "Verified Attendance"}</div>
              <div className="absolute inset-x-[9%] top-[25%] text-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-slate-400">{adminT(language, "certificates.certificateOfAttendance")}</p>
                <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-[#17172f] md:text-5xl">{row.full_name}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-500">has successfully attended <span className="font-extrabold text-[#17172f]">{eventTitle(row)}</span></p>
              </div>
              <div className="absolute bottom-[17%] left-[9%] right-[9%] grid grid-cols-3 gap-3 text-center">
                <DetailMini label={adminT(language, "attendees.checkin")} value={<TableDateTime value={row.checked_in_at} />} />
                <DetailMini label={adminT(language, "certificates.certificateNo")} value={title} />
                <DetailMini label={adminT(language, "common.status")} value={adminStatusT(language, status)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6">
              <div className="mx-auto max-w-xl rounded-[34px] bg-gradient-to-br from-[#0f172a] to-[hsl(var(--primary))] p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between"><img src="/favicon.png" alt="Stylish Events" className="h-12 w-12 rounded-full bg-white p-1" /><Badge className="rounded-xl bg-white/20 text-white hover:bg-white/20">{status}</Badge></div>
                <p className="mt-10 text-xs font-bold uppercase tracking-widest text-white/60">{language === "ar" ? "كارت دخول الفعالية" : "Event Access Card"}</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight">{row.full_name}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/70">{eventTitle(row)}</p>
                <div className="mt-8 grid grid-cols-2 gap-4 text-sm font-semibold text-white/75">
                  <div><p className="text-white/45">{language === "ar" ? "رقم الكارت" : "Card No."}</p><p>{title}</p></div>
                  <div><p className="text-white/45">{adminT(language, "common.ticket")}</p><p>{row.ticket_name_en}</p></div>
                  <div><p className="text-white/45">{language === "ar" ? "رقم الحضور" : "Attendee"}</p><p>{row.attendee_number}</p></div>
                  <div><p className="text-white/45">{adminT(language, "attendees.checkin")}</p><p>{row.checked_in_at ? adminStatusT(language, "checkedIn") : adminStatusT(language, "notChecked")}</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-28 items-center justify-center rounded-[24px] bg-slate-50"><QrCode className="h-16 w-16 text-[#17172f]" /></div>
              <Detail label={adminT(language, "common.customer")}>{row.email}</Detail>
              <Detail label={language === "ar" ? "إرسال الكارت" : "Card sent"}><TableDateTime value={row.card_sent_at} /></Detail>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label={adminT(language, "common.customer")} value={row.email || "-"} icon={ShieldCheck} />
        <Metric label={adminT(language, "common.event")} value={eventTitle(row)} icon={CalendarDays} />
        <Metric label={adminT(language, "common.status")} value={adminStatusT(language, status)} icon={BadgeCheck} />
      </div>
    </div>
  )
}

export function LiveReviewDetailPage({ id }: { id: string }) {
  const { language } = useLanguage()
  const { can } = useAdminPermissions()
  const canManageReviews = can("reviews.manage")
  const [state, setState] = useState<DetailState<any>>(emptyState)

  async function load(active = true) {
    try {
      const data = await platformApi.getReview(id)
      if (active) setState({ loading: false, error: "", data })
    } catch (error) {
      if (active) setState({ loading: false, error: error instanceof Error ? error.message : "Request failed", data: null })
    }
  }

  useEffect(() => {
    let active = true
    load(active)
    return () => {
      active = false
    }
  }, [id])

  const row = state.data
  if (state.loading || state.error || !row) return <PageState backHref="/admin/reviews" backLabel={language === "ar" ? "رجوع للمراجعات" : "Back to Reviews"} loading={state.loading} error={state.error} />

  const normalizedStatus = row.status === "approved" ? "published" : row.status || "pending"
  const customerName = row.attendee_name || row.customer_name || "Customer"
  const customerEmail = row.attendee_email || row.customer_email || "-"

  async function updateStatus(status: "published" | "rejected" | "pending") {
    try {
      await platformApi.updateReviewStatus(id, status)
      await load()
      toast.success(language === "ar" ? "تم تحديث المراجعة" : "Review updated", { description: language === "ar" ? `أصبحت المراجعة ${adminStatusT(language, status)}.` : `Review is now ${status}.` })
    } catch (error) {
      toast.error(language === "ar" ? "فشل تحديث المراجعة" : "Review update failed", { description: error instanceof Error ? error.message : (language === "ar" ? "تعذر تحديث المراجعة." : "Could not update review.") })
    }
  }

  async function deleteReview() {
    try {
      await platformApi.deleteReview(id)
      toast.success(language === "ar" ? "تم حذف المراجعة" : "Review deleted")
      window.location.href = "/admin/reviews"
    } catch (error) {
      toast.error(language === "ar" ? "فشل الحذف" : "Delete failed", { description: error instanceof Error ? error.message : (language === "ar" ? "تعذر حذف المراجعة." : "Could not delete review.") })
    }
  }

  return (
    <div className="space-y-5">
      <BackButton href="/admin/reviews" label={language === "ar" ? "رجوع للمراجعات" : "Back to Reviews"} />
      <Hero badge={adminStatusT(language, normalizedStatus)} title={row.title || (language === "ar" ? "مراجعة عميل" : "Customer Review")} subtitle={eventTitle(row)} />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label={adminT(language, "common.customer")} value={customerName} icon={User} />
        <Metric label={adminT(language, "events.rating")} value={`${Number(row.rating || 0).toFixed(1)} / 5`} icon={Star} />
        <Metric label={adminT(language, "common.status")} value={adminStatusT(language, normalizedStatus)} icon={BadgeCheck} />
        <Metric label={language === "ar" ? "تاريخ الإرسال" : "Submitted"} value={row.created_at ? new Date(row.created_at).toLocaleDateString("en-US") : "-"} icon={CalendarDays} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader><CardTitle className="text-base font-extrabold">{language === "ar" ? "تفاصيل المراجعة" : "Review Details"}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Detail label={adminT(language, "common.customer")}>{customerName}</Detail>
            <Detail label={language === "ar" ? "البريد الإلكتروني" : "Email"}>{customerEmail}</Detail>
            <Detail label={language === "ar" ? "الهاتف" : "Phone"}>{row.attendee_phone || row.customer_phone || "-"}</Detail>
            <Detail label={language === "ar" ? "الدولة" : "Country"}>{row.country_name || "-"}</Detail>
            <Detail label={adminT(language, "common.event")}>{eventTitle(row)}</Detail>
            <Detail label={language === "ar" ? "تاريخ الفعالية" : "Event date"}><TableDateTime value={row.event_starts_at} /></Detail>
            <Detail label={language === "ar" ? "تاريخ الإرسال" : "Submitted"}><TableDateTime value={row.created_at} /></Detail>
            <Detail label={adminT(language, "attendees.checkin")}><TableDateTime value={row.checked_in_at} /></Detail>
            <Detail label={language === "ar" ? "التعليق" : "Comment"} wide>{row.comment || "-"}</Detail>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader><CardTitle className="text-base font-extrabold">{language === "ar" ? "مراجعة الاعتماد" : "Moderation"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Badge className={cn("rounded-xl capitalize", statusClass(normalizedStatus))}>{adminStatusT(language, normalizedStatus)}</Badge>
            {canManageReviews && (
              <>
            <ConfirmAction title={language === "ar" ? "نشر هذه المراجعة؟" : "Publish this review?"} description={language === "ar" ? "سيتم احتساب هذه المراجعة ضمن تقييمات الفعالية العامة." : "This review will count toward public event ratings."} confirmLabel={adminT(language, "common.publish")} tone="success" onConfirm={() => updateStatus("published")}>
              <Button className="h-10 w-full rounded-xl font-bold"><BadgeCheck className="h-4 w-4" /> {adminT(language, "common.publish")}</Button>
            </ConfirmAction>
            <ConfirmAction title={language === "ar" ? "رفض هذه المراجعة؟" : "Reject this review?"} description={language === "ar" ? "سيتم إخفاء هذه المراجعة من التقييمات العامة." : "This review will be hidden from public ratings."} confirmLabel={adminT(language, "status.rejected")} tone="danger" onConfirm={() => updateStatus("rejected")}>
              <Button variant="outline" className="h-10 w-full rounded-xl font-bold text-red-600"><ThumbsDown className="h-4 w-4" /> {adminT(language, "status.rejected")}</Button>
            </ConfirmAction>
            <ConfirmAction title={language === "ar" ? "حذف هذه المراجعة؟" : "Delete this review?"} description={language === "ar" ? "سيتم حذف المراجعة من قائمة الاعتماد." : "This removes the review from the moderation queue."} confirmLabel={adminT(language, "common.delete")} tone="danger" onConfirm={deleteReview}>
              <Button variant="outline" className="h-10 w-full rounded-xl font-bold text-red-600"><Trash2 className="h-4 w-4" /> {adminT(language, "common.delete")}</Button>
            </ConfirmAction>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DetailMini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="text-xs font-extrabold text-[#17172f] md:text-sm">{value}</div>
    </div>
  )
}
