"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Banknote, CalendarDays, CheckCircle2, FileUp, Globe2, Loader2, MapPin, Stethoscope, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { platformApi } from "@/lib/platform-api"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { CountrySelect } from "@/components/country-select"
import { applyCountryDialCode } from "@/lib/country-dial-codes"

type EventRow = {
  id: number
  title_en?: string
  title_ar?: string
  venue_name?: string
  city?: string
  starts_at?: string
  ends_at?: string
}

type TicketRow = {
  id: number
  event_id?: number
  name_en?: string
  name_ar?: string
  quota?: number
  sold_count?: number
  min_price_egp?: number
  max_price_egp?: number
  min_price_usd?: number
  max_price_usd?: number
}

type PricePeriod = {
  id: number
  ticket_type_id?: number
  label_en?: string
  label_ar?: string
  price_egp?: number
  price_usd?: number
  starts_at?: string
  ends_at?: string
}

const initialForm = {
  fullName: "",
  mobile: "+20 ",
  email: "",
  address: "",
  countryCode: "EG",
  countryName: "Egypt",
  city: "Cairo",
  specialty: "",
  nationality: "Egyptian",
  preferredLanguage: "en",
  paymentReference: "",
  paymentProofUrl: "",
}

function isEgypt(form: typeof initialForm) {
  return form.countryCode.toUpperCase() === "EG"
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value))
}

function activePeriod(periods: PricePeriod[], ticketId?: number) {
  const rows = periods.filter((period) => Number(period.ticket_type_id || ticketId) === Number(ticketId))
  return rows[0] || periods[0]
}

export function DoctorRegistrationFlow() {
  const { isRtl } = useLanguage()
  const [events, setEvents] = useState<EventRow[]>([])
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [periods, setPeriods] = useState<PricePeriod[]>([])
  const [eventId, setEventId] = useState(0)
  const [ticketId, setTicketId] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [proofSubmitting, setProofSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const selectedEvent = events.find((event) => Number(event.id) === Number(eventId)) || events[0]
  const eventTickets = tickets.filter((ticket) => Number(ticket.event_id) === Number(eventId) || !ticket.event_id)
  const selectedTicket = eventTickets.find((ticket) => Number(ticket.id) === Number(ticketId)) || eventTickets[0]
  const currency = isEgypt(form) ? "EGP" : "USD"
  const selectedPeriod = useMemo(() => activePeriod(periods, selectedTicket?.id), [periods, selectedTicket?.id])
  const price = currency === "EGP" ? selectedPeriod?.price_egp : selectedPeriod?.price_usd

  useEffect(() => {
    platformApi.listEvents()
      .then((rows) => {
        if (rows?.length) {
          setEvents(rows)
          setEventId(Number(rows[0].id))
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    platformApi.listTickets(eventId)
      .then((rows) => {
        const nextTickets = rows || []
        setTickets(nextTickets)
        setTicketId(Number(nextTickets[0]?.id || 0))
      })
      .catch(() => {
        setTickets([])
        setTicketId(0)
      })
  }, [eventId])

  useEffect(() => {
    if (!ticketId) return
    platformApi.listPricePeriods(ticketId)
      .then((rows) => setPeriods(rows || []))
      .catch(() => setPeriods([]))
  }, [ticketId])

  function update(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function createRegistration() {
    setSubmitting(true)
    setError("")
    try {
      const data = await platformApi.createRegistration({
        eventId,
        ticketTypeId: ticketId,
        source: "online",
        ...form,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  async function submitProof() {
    if (!result?.id || !form.paymentProofUrl) return
    setProofSubmitting(true)
    setError("")
    try {
      await platformApi.submitPaymentProof(result.id, {
        paymentReference: form.paymentReference,
        paymentProofUrl: form.paymentProofUrl,
      })
      setResult((current: any) => ({ ...current, status: "pending_verification" }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment proof failed")
    } finally {
      setProofSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#eef6ff] px-4 py-10 text-[#111827] sm:px-6 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 grid gap-5 rounded-[30px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_360px]">
          <div>
            <Badge className="mb-4 rounded-full bg-primary px-4 py-1 text-white hover:bg-primary">Doctor Registration</Badge>
            <h1 className="max-w-3xl text-3xl font-black leading-tight text-[#0f172a] md:text-5xl">
              {isRtl ? "سجل في الفعالية واستلم تذكرتك بعد اعتماد الدفع" : "Register for your event and receive the ticket after payment approval"}
            </h1>
            <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-slate-500">
              {isRtl
                ? "املأ بياناتك الطبية، اختر التذكرة المناسبة، ثم ارفع إثبات التحويل البنكي. المصري يحاسب بالجنيه، وأي جنسية أخرى بالدولار تلقائيا."
                : "Add your professional details, pick the right ticket, then upload bank-transfer proof. Egyptian profiles use EGP, every other nationality uses USD automatically."}
            </p>
          </div>
          <div className="rounded-[24px] bg-[#eef6ff] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Selected event</p>
            <h2 className="mt-2 text-xl font-black">{isRtl ? selectedEvent?.title_ar : selectedEvent?.title_en}</h2>
            <div className="mt-4 space-y-3 text-sm font-bold text-slate-500">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {selectedEvent?.venue_name || selectedEvent?.city || "-"}</p>
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {formatDate(selectedEvent?.starts_at)} - {formatDate(selectedEvent?.ends_at)}</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
            <div className="mb-6 flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Stethoscope className="h-5 w-5" /></span>
              <div>
                <h2 className="text-2xl font-black">{isRtl ? "بيانات الدكتور" : "Doctor profile"}</h2>
                <p className="mt-1 text-sm font-medium text-slate-400">{isRtl ? "هذه البيانات ستظهر في التذكرة والشهادة." : "These details feed the ticket, QR badge, and certificate."}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label={isRtl ? "الاسم بالكامل" : "Full name"} value={form.fullName} onChange={(value) => update("fullName", value)} />
              <Field label={isRtl ? "الموبايل" : "Mobile"} value={form.mobile} onChange={(value) => update("mobile", value)} />
              <Field label={isRtl ? "البريد الإلكتروني" : "Email"} type="email" value={form.email} onChange={(value) => update("email", value)} />
              <Field label={isRtl ? "التخصص" : "Specialty"} value={form.specialty} onChange={(value) => update("specialty", value)} />
              <CountrySelect
                label={isRtl ? "الدولة" : "Country"}
                value={{ code: form.countryCode, name: form.countryName }}
                onChange={(country) => setForm((current) => ({
                  ...current,
                  countryCode: country.code,
                  countryName: country.name,
                  nationality: current.nationality || country.name,
                  mobile: applyCountryDialCode(current.mobile, country.code),
                }))}
              />
              <Field label={isRtl ? "المدينة" : "City"} value={form.city} onChange={(value) => update("city", value)} />
              <Field label={isRtl ? "الجنسية" : "Nationality"} value={form.nationality} onChange={(value) => update("nationality", value)} />
              <div className="md:col-span-2">
                <Label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isRtl ? "العنوان" : "Address"}</Label>
                <Textarea className="mt-2 min-h-24 rounded-2xl border-slate-200 bg-slate-50 font-bold" value={form.address} onChange={(event) => update("address", event.target.value)} />
              </div>
            </div>

            {error ? (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
                <AlertCircle className="h-5 w-5" /> {error}
              </div>
            ) : null}

            <Button onClick={createRegistration} disabled={submitting || !selectedTicket} className="mt-6 h-12 w-full rounded-2xl text-base font-black">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              {!selectedTicket ? (isRtl ? "لا توجد تذاكر متاحة الآن" : "No tickets available yet") : isRtl ? "إنشاء طلب التسجيل" : "Create registration request"}
            </Button>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Ticket className="h-5 w-5" /></span>
                <h2 className="text-xl font-black">{isRtl ? "اختيار الفعالية والتذكرة" : "Event and ticket"}</h2>
              </div>
              <div className="space-y-4">
                <SelectBox label={isRtl ? "الفعالية" : "Event"} value={eventId} onChange={setEventId} emptyLabel={isRtl ? "لا توجد فعاليات متاحة" : "No events available"} options={events.map((event) => ({ value: event.id, label: isRtl ? event.title_ar || event.title_en || "" : event.title_en || event.title_ar || "" }))} />
                <SelectBox label={isRtl ? "نوع التذكرة" : "Ticket type"} value={ticketId} onChange={setTicketId} emptyLabel={isRtl ? "لا توجد تذاكر متاحة" : "No tickets available"} options={eventTickets.map((ticket) => ({ value: ticket.id, label: isRtl ? ticket.name_ar || ticket.name_en || "" : ticket.name_en || ticket.name_ar || "" }))} />
              </div>
              <div className="mt-5 rounded-[24px] bg-[#eef6ff] p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-black text-slate-500">{isRtl ? "العملة" : "Currency"}</p>
                  <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10"><Globe2 className="mr-1 h-3.5 w-3.5" /> {currency}</Badge>
                </div>
                <p className="mt-3 text-3xl font-black text-[#0f172a]">{price ? `${currency} ${Number(price).toLocaleString()}` : "-"}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">{isRtl ? selectedPeriod?.label_ar : selectedPeriod?.label_en} · {formatDate(selectedPeriod?.starts_at)} - {formatDate(selectedPeriod?.ends_at)}</p>
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Banknote className="h-5 w-5" /></span>
                <h2 className="text-xl font-black">{isRtl ? "الدفع البنكي" : "Bank transfer"}</h2>
              </div>
              {result ? (
                <div className="mb-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                  {isRtl ? "تم إنشاء الطلب:" : "Request created:"} {result.registrationNumber || result.id}
                </div>
              ) : null}
              <div className="space-y-4">
                <Field label={isRtl ? "رقم التحويل" : "Payment reference"} value={form.paymentReference} onChange={(value) => update("paymentReference", value)} />
                <Field label={isRtl ? "رابط إثبات الدفع" : "Payment proof URL"} value={form.paymentProofUrl} onChange={(value) => update("paymentProofUrl", value)} />
              </div>
              <Button variant="outline" onClick={submitProof} disabled={!result?.id || !form.paymentProofUrl || proofSubmitting} className="mt-5 h-11 w-full rounded-2xl font-black">
                {proofSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                {isRtl ? "رفع إثبات الدفع" : "Submit payment proof"}
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</Label>
      <Input type={type} className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function SelectBox({ label, value, onChange, options, emptyLabel }: { label: string; value: number; onChange: (value: number) => void; options: Array<{ value: number; label: string }>; emptyLabel: string }) {
  return (
    <div>
      <Label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</Label>
      <select
        className={cn("mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-primary")}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {options.length === 0 ? <option value={0}>{emptyLabel}</option> : options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  )
}
