"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { BadgeCheck, Banknote, CalendarDays, Ticket } from "lucide-react"
import { PublicPageFrame } from "@/components/public/page-building-blocks"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { platformApi } from "@/lib/platform-api"

function formatDate(value?: string, locale = "en-US") {
  if (!value) return "-"
  return new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })
}

function statusLabel(value: string, isRtl: boolean) {
  const labels: Record<string, { en: string; ar: string }> = {
    pending_payment: { en: "Awaiting payment", ar: "بانتظار الدفع" },
    pending_verification: { en: "Payment under review", ar: "الدفع قيد المراجعة" },
    pending: { en: "Pending", ar: "قيد الانتظار" },
    approved: { en: "Approved", ar: "معتمد" },
    rejected: { en: "Rejected", ar: "مرفوض" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
    expired: { en: "Reservation expired", ar: "انتهت مهلة حجز المقعد" },
    active: { en: "Ticket issued", ar: "تم إصدار التذكرة" },
    not_issued: { en: "Ticket not issued", ar: "لم تصدر التذكرة بعد" },
    used: { en: "Checked in", ar: "تم تسجيل الحضور" },
    revoked: { en: "Revoked", ar: "ملغاة" },
  }
  return labels[value] ? (isRtl ? labels[value].ar : labels[value].en) : String(value || "-").replaceAll("_", " ")
}

export default function RegistrationConfirmationPage() {
  const params = useParams<{ reference: string }>()
  const searchParams = useSearchParams()
  const reference = params?.reference || ""
  const token = searchParams?.get("token") || ""
  const { isRtl } = useLanguage()
  const [data, setData] = useState<any>(null)
  const [bankAccount, setBankAccount] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    if (!reference) return
    platformApi.getPublicRegistration(reference, token)
      .then((result) => {
        if (!active) return
        setData(result.registration)
        if (token && typeof window !== "undefined") {
          window.history.replaceState(null, "", `/registration/confirmation/${reference}`)
        }
        const stored = window.sessionStorage.getItem(`checkout-bank-${reference}`)
        setBankAccount(stored ? JSON.parse(stored) : null)
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Registration not found") })
    return () => { active = false }
  }, [reference, token])

  const locale = isRtl ? "ar-EG" : "en-US"

  return (
    <PublicPageFrame>
      <section className="px-4 pb-16 pt-36 sm:px-6 lg:pt-44" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-[36px] bg-white p-6 text-center shadow-[0_26px_80px_rgba(15,23,42,0.10)] md:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <BadgeCheck className="h-8 w-8" />
            </div>
            <p className="mt-6 text-xs font-black uppercase text-primary">{isRtl ? "تم إنشاء التسجيل" : "Registration created"}</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-5xl">
              {error ? (isRtl ? "لم يتم العثور على التسجيل" : "Registration not found") : (isRtl ? "احتفظ برقم التسجيل" : "Save your registration reference")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
              {isRtl ? "ستظهر التذكرة داخل داشبورد العميل بعد اعتماد الدفع وإصدار QR بشكل آمن." : "Your ticket will appear in the Customer Dashboard once payment is approved and the secure QR is issued."}
            </p>

            {error ? <p className="mt-8 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

            {data ? (
              <div className="mt-8 grid gap-4 text-start md:grid-cols-2">
                <Detail icon={Ticket} label={isRtl ? "رقم التسجيل" : "Reference"} value={data.registration_number} ltr />
                <Detail icon={CalendarDays} label={isRtl ? "الفعالية" : "Event"} value={isRtl ? data.event_title_ar : data.event_title_en} />
                <Detail icon={Ticket} label={isRtl ? "نوع التذكرة" : "Ticket type"} value={isRtl ? data.ticket_name_ar : data.ticket_name_en} />
                <Detail icon={Banknote} label={isRtl ? "المبلغ" : "Amount"} value={`${data.selected_currency} ${Number(data.selected_price || 0).toLocaleString()}`} ltr />
                <Detail icon={CalendarDays} label={isRtl ? "الموعد" : "Date"} value={formatDate(data.starts_at, locale)} />
                <Detail icon={BadgeCheck} label={isRtl ? "حالة التسجيل" : "Registration status"} value={statusLabel(data.registration_status, isRtl)} />
                <Detail icon={Banknote} label={isRtl ? "حالة الدفع" : "Payment status"} value={statusLabel(data.payment_status, isRtl)} />
                <Detail icon={Ticket} label={isRtl ? "حالة التذكرة" : "Ticket status"} value={statusLabel(data.ticket_status || "not_issued", isRtl)} />
                {data.reservation_expires_at ? <Detail icon={CalendarDays} label={isRtl ? "مهلة الدفع" : "Payment deadline"} value={formatDate(data.reservation_expires_at, locale)} /> : null}
              </div>
            ) : null}

            {bankAccount ? (
              <div className="mt-8 rounded-3xl bg-slate-50 p-5 text-start">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><Banknote className="h-5 w-5 text-primary" />{isRtl ? "بيانات التحويل" : "Bank transfer details"}</h2>
                <div className="mt-4 grid gap-3 text-sm font-bold text-slate-600 md:grid-cols-2">
                  <p>{bankAccount.bank_name}</p>
                  <p>{bankAccount.account_name}</p>
                  <p dir="ltr">{bankAccount.account_number}</p>
                  {bankAccount.iban ? <p dir="ltr">{bankAccount.iban}</p> : null}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="h-12 rounded-full bg-[hsl(var(--primary))] px-6 font-black text-white">
                <Link href="/login">{isRtl ? "تسجيل الدخول للداشبورد" : "Login to dashboard"}</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full px-6 font-black">
                <Link href="/upcoming-events">{isRtl ? "تصفح الفعاليات" : "Browse events"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicPageFrame>
  )
}

function Detail({ icon: Icon, label, value, ltr }: { icon: any; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-4 text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm font-black leading-6 text-slate-950" dir={ltr ? "ltr" : undefined}>{value}</p>
    </div>
  )
}
