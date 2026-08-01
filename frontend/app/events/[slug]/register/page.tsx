"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { ArrowRight, CreditCard, ShieldCheck, Ticket } from "lucide-react"
import { PublicPageFrame, PublicPageHero } from "@/components/public/page-building-blocks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl, currentAuthToken, platformApi } from "@/lib/platform-api"
import { cn } from "@/lib/utils"

const initialForm = {
  fullName: "",
  mobile: "",
  email: "",
  address: "",
  countryCode: "EG",
  countryName: "Egypt",
  city: "",
  specialty: "",
  nationality: "Egyptian",
  preferredLanguage: "en",
  paymentReference: "",
  paymentProofUrl: "",
}

export default function EventRegisterPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug || ""
  const router = useRouter()
  const { isRtl, language } = useLanguage()
  const [data, setData] = useState<any>(null)
  const [ticketTypeId, setTicketTypeId] = useState("")
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [hasAuthToken, setHasAuthToken] = useState(false)

  useEffect(() => {
    let active = true
    if (!slug) return
    platformApi.getPublicEvent(slug)
      .then((result) => {
        if (!active) return
        setData(result)
        const firstTicket = (result.tickets || []).find((ticket: any) => ticket.price_period_id && !ticket.is_sold_out)
        if (firstTicket) setTicketTypeId(String(firstTicket.id))
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load event") })
    return () => { active = false }
  }, [slug])

  useEffect(() => {
    setForm((current) => ({ ...current, preferredLanguage: language }))
  }, [language])

  useEffect(() => {
    setHasAuthToken(Boolean(currentAuthToken()))
  }, [])

  const event = data?.event
  const tickets = data?.tickets || []
  const selectedTicket = useMemo(() => tickets.find((ticket: any) => String(ticket.id) === ticketTypeId), [tickets, ticketTypeId])
  const policy = event?.registration_policy || {}
  const currency = form.countryCode.toUpperCase() === "EG" ? "EGP" : "USD"
  const price = selectedTicket ? Number(currency === "EGP" ? selectedTicket.price_egp ?? selectedTicket.price : selectedTicket.price_usd ?? selectedTicket.price) : 0
  const registrationUnavailable = policy.publicRegistrationEnabled === false || event?.state !== "open"
  const loginRequired = policy.access === "login_required" && !hasAuthToken
  const manualPaymentUnavailable = price > 0 && policy.manualPaymentEnabled === false
  const submitDisabled = submitting || !selectedTicket || registrationUnavailable || loginRequired || manualPaymentUnavailable

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))

  async function submit(eventSubmit: FormEvent) {
    eventSubmit.preventDefault()
    if (submitDisabled) return
    setSubmitting(true)
    setError("")
    try {
      const result = await platformApi.createPublicCheckout(slug, {
        ...form,
        ticketTypeId: Number(selectedTicket.id),
        quantity: 1,
        idempotencyKey: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        paymentReference: form.paymentReference || null,
        paymentProofUrl: form.paymentProofUrl || null,
      })
      const reference = result?.registration?.registration_number
      if (reference) {
        const token = result?.confirmationToken || ""
        window.sessionStorage.setItem(`checkout-bank-${reference}`, JSON.stringify(result.bankAccount || null))
        router.push(`/registration/confirmation/${reference}${token ? `?token=${encodeURIComponent(token)}` : ""}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (!event) {
    return (
      <PublicPageFrame>
        <section className="px-4 py-40"><div className="mx-auto h-72 max-w-5xl animate-pulse rounded-[32px] bg-white/70" /></section>
      </PublicPageFrame>
    )
  }

  return (
    <PublicPageFrame>
      <PublicPageHero
        title={isRtl ? "تسجيل الفعالية" : "Event Registration"}
        description={isRtl ? event.title_ar : event.title_en}
        backgroundImage={apiAssetUrl(event.banner_image_url || event.cover_image_url)}
        imageAlt={isRtl ? event.title_ar : event.title_en}
      />
      <section className="px-4 py-12 sm:px-6 lg:py-16" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={submit} className="rounded-[32px] bg-white p-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] md:p-8">
            <div className="mb-7">
              <p className="text-xs font-black uppercase text-primary">{isRtl ? "بيانات التسجيل" : "Registration details"}</p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">{isRtl ? "أكمل بياناتك لتأكيد الحجز" : "Complete your booking details"}</h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                {isRtl ? "سننشئ التسجيل من الخادم ونؤكد السعة والسعر قبل عرض رقم التسجيل." : "The server confirms capacity and pricing before returning your registration reference."}
              </p>
            </div>

            {error ? <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
            {registrationUnavailable ? (
              <div className="mb-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700">
                {isRtl ? "التسجيل غير متاح لهذه الفعالية حالياً." : "Registration is not available for this event right now."}
              </div>
            ) : null}
            {loginRequired ? (
              <div className="mb-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700">
                <p>{isRtl ? "يجب تسجيل الدخول قبل إكمال التسجيل." : "Please log in before completing this registration."}</p>
                <Button asChild className="mt-3 rounded-2xl font-black">
                  <Link href={`/login?next=${encodeURIComponent(`/events/${slug}/register`)}`}>{isRtl ? "تسجيل الدخول" : "Log in"}</Link>
                </Button>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label={isRtl ? "الاسم بالكامل" : "Full name"} value={form.fullName} onChange={(v) => update("fullName", v)} required />
              <Field label={isRtl ? "البريد الإلكتروني" : "Email"} type="email" value={form.email} onChange={(v) => update("email", v)} required ltr />
              <Field label={isRtl ? "رقم الهاتف" : "Mobile"} value={form.mobile} onChange={(v) => update("mobile", v)} required ltr />
              <Field label={isRtl ? "التخصص / الوظيفة" : "Specialty / job title"} value={form.specialty} onChange={(v) => update("specialty", v)} required />
              <Field label={isRtl ? "الدولة" : "Country"} value={form.countryName} onChange={(v) => update("countryName", v)} required />
              <Field label={isRtl ? "كود الدولة" : "Country code"} value={form.countryCode} onChange={(v) => update("countryCode", v.toUpperCase().slice(0, 2))} required ltr />
              <Field label={isRtl ? "المدينة" : "City"} value={form.city} onChange={(v) => update("city", v)} required />
              <Field label={isRtl ? "الجنسية" : "Nationality"} value={form.nationality} onChange={(v) => update("nationality", v)} required />
              <div className="md:col-span-2"><Field label={isRtl ? "العنوان" : "Address"} value={form.address} onChange={(v) => update("address", v)} /></div>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-50 p-5">
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><CreditCard className="h-5 w-5 text-primary" />{isRtl ? "الدفع" : "Payment"}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {price <= 0
                  ? (isRtl ? "هذه التذكرة مجانية وسيتم إصدارها مباشرة عند نجاح التسجيل." : "This ticket is free and will be issued immediately after registration.")
                  : manualPaymentUnavailable
                    ? (isRtl ? "الدفع اليدوي غير متاح لهذه التذكرة حالياً." : "Manual payment is not available for this ticket right now.")
                    : (isRtl ? "الدفع اليدوي متاح. يمكنك ترك بيانات التحويل فارغة وإرسالها لاحقاً، أو إضافتها الآن للمراجعة." : "Manual payment is available. You may submit bank-transfer details now or add them later for review.")}
              </p>
              {price > 0 && !manualPaymentUnavailable ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label={isRtl ? "رقم/مرجع التحويل" : "Transfer reference"} value={form.paymentReference} onChange={(v) => update("paymentReference", v)} ltr />
                  <Field label={isRtl ? "رابط إثبات الدفع" : "Payment proof URL"} value={form.paymentProofUrl} onChange={(v) => update("paymentProofUrl", v)} ltr />
                </div>
              ) : null}
            </div>

            <Button disabled={submitDisabled} className="mt-7 h-12 w-full rounded-2xl bg-[hsl(var(--primary))] font-black text-white">
              {submitting ? (isRtl ? "جاري إنشاء التسجيل..." : "Creating registration...") : (isRtl ? "تأكيد التسجيل" : "Confirm registration")}
              <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
            </Button>
          </form>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[32px] bg-white p-5 shadow-[0_22px_70px_rgba(15,23,42,0.10)]">
              <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950"><Ticket className="h-6 w-6 text-primary" />{isRtl ? "اختيار التذكرة" : "Ticket selection"}</h2>
              <select value={ticketTypeId} onChange={(e) => setTicketTypeId(e.target.value)} className="mt-5 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none focus:border-primary">
                {tickets.filter((ticket: any) => ticket.price_period_id && !ticket.is_sold_out).map((ticket: any) => (
                  <option key={ticket.id} value={ticket.id}>{isRtl ? ticket.name_ar : ticket.name_en}</option>
                ))}
              </select>
              <div className="mt-5 rounded-3xl bg-primary/5 p-5">
                <p className="text-xs font-black uppercase text-slate-400">{isRtl ? "الإجمالي" : "Total"}</p>
                <p className="mt-2 text-3xl font-black text-primary" dir="ltr">{currency} {price.toLocaleString()}</p>
                <p className="mt-2 text-sm font-bold text-slate-500">{isRtl ? selectedTicket?.price_label_ar : selectedTicket?.price_label_en}</p>
              </div>
              <div className="mt-5 flex gap-3 rounded-3xl bg-slate-50 p-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-xs font-bold leading-5 text-slate-500">
                  {isRtl ? "لا يتم إصدار QR إلا بعد اعتماد الدفع أو إذا كانت التذكرة مجانية." : "QR tickets are issued only after payment approval or immediately for free tickets."}
                </p>
              </div>
              <Button asChild variant="outline" className="mt-4 h-11 w-full rounded-2xl font-black">
                <Link href={`/events/${event.slug}`}>{isRtl ? "رجوع للتفاصيل" : "Back to details"}</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </PublicPageFrame>
  )
}

function Field({ label, value, onChange, type = "text", required, ltr }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; ltr?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-950">{label}</span>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        dir={ltr ? "ltr" : undefined}
        className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50 font-semibold"
      />
    </label>
  )
}
