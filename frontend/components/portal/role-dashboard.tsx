"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BadgeCheck, CalendarDays, Download, FileUp, Loader2, Mail, QrCode, Search, ShieldCheck, Stethoscope, TicketCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { platformApi } from "@/lib/platform-api"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

type Role = "customer" | "organizer" | "employee"

const demoProfile = {
  doctor: {
    id: 1,
    full_name: "Ahmed Samir",
    email: "ahmed@example.com",
    mobile: "+20 100 111 2222",
    specialty: "Cardiology",
    country_name: "Egypt",
    city: "Cairo",
    registrations_count: 2,
    tickets_count: 1,
    certificates_count: 1,
  },
  history: [
    {
      id: 1,
      registration_number: "REG-DTS-1001",
      registration_status: "approved",
      payment_status: "approved",
      selected_currency: "EGP",
      selected_price: 12000,
      event_title_en: "Digital Transformation Summit",
      event_title_ar: "قمة التحول الرقمي",
      ticket_name_en: "VIP Pass",
      ticket_name_ar: "تذكرة VIP",
      starts_at: "2026-08-18T10:00:00",
      ticket_number: "TKT-DTS-1001",
      ticket_pdf_url: "/tickets/TKT-DTS-1001.pdf",
      certificate_number: "CERT-DTS-1001",
      certificate_file_url: "/certificates/CERT-DTS-1001.pdf",
      certificate_status: "issued",
      created_at: "2026-08-01T12:15:00",
    },
    {
      id: 2,
      registration_number: "REG-DTS-1002",
      registration_status: "pending_verification",
      payment_status: "pending",
      selected_currency: "USD",
      selected_price: 140,
      event_title_en: "Digital Transformation Summit",
      event_title_ar: "قمة التحول الرقمي",
      ticket_name_en: "Regular Pass",
      ticket_name_ar: "تذكرة عادية",
      starts_at: "2026-08-18T10:00:00",
      ticket_number: null,
      ticket_pdf_url: null,
      certificate_number: null,
      certificate_file_url: null,
      certificate_status: "waiting",
      created_at: "2026-08-03T09:40:00",
    },
  ],
}

function formatDate(value?: string) {
  if (!value) return { date: "-", time: "" }
  const date = new Date(value)
  return {
    date: new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date) + ",",
    time: new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(date),
  }
}

export function RoleDashboard({ role }: { role: Role }) {
  if (role === "customer") return <DoctorPortalDashboard />
  return <OperationsPortal role={role} />
}

function DoctorPortalDashboard() {
  const { isRtl } = useLanguage()
  const [identity, setIdentity] = useState("")
  const [profile, setProfile] = useState<any>(demoProfile)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [proof, setProof] = useState<Record<string, { reference: string; url: string; loading?: boolean }>>({})

  const totals = useMemo(() => {
    const history = profile?.history || []
    return {
      registrations: history.length,
      approved: history.filter((item: any) => item.payment_status === "approved").length,
      pending: history.filter((item: any) => item.payment_status !== "approved").length,
      certificates: history.filter((item: any) => item.certificate_file_url || item.certificate_status === "issued").length,
    }
  }, [profile])

  async function lookup() {
    if (!identity.trim()) return
    setLoading(true)
    setMessage("")
    try {
      const data = await platformApi.lookupDoctorProfile(identity.trim())
      setProfile(data)
      setMessage(isRtl ? "تم تحميل ملف الدكتور بنجاح." : "Doctor profile loaded.")
    } catch (err) {
      setProfile(demoProfile)
      setMessage(isRtl ? "لم يتم العثور على بيانات حية، يتم عرض بيانات تجريبية واضحة." : "No live profile found. Showing a clear demo profile.")
    } finally {
      setLoading(false)
    }
  }

  async function submitProof(registrationId: number) {
    const state = proof[String(registrationId)]
    if (!state?.url) return
    setProof((current) => ({ ...current, [registrationId]: { ...state, loading: true } }))
    try {
      await platformApi.submitPaymentProof(registrationId, {
        paymentReference: state.reference,
        paymentProofUrl: state.url,
      })
      setProfile((current: any) => ({
        ...current,
        history: current.history.map((item: any) => item.id === registrationId ? { ...item, payment_status: "pending", registration_status: "pending_verification", payment_reference: state.reference, payment_proof_url: state.url } : item),
      }))
      setMessage(isRtl ? "تم إرسال إثبات الدفع للمراجعة." : "Payment proof submitted for review.")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Payment proof failed")
    } finally {
      setProof((current) => ({ ...current, [registrationId]: { ...state, loading: false } }))
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-[30px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_420px]">
        <div>
          <Badge className="mb-4 rounded-full bg-primary px-4 py-1 text-white hover:bg-primary">Doctor Portal</Badge>
          <h1 className="text-3xl font-black leading-tight text-[#0f172a] md:text-5xl">
            {isRtl ? "ملف الدكتور والتذاكر والشهادات" : "Doctor profile, tickets, and certificates"}
          </h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-8 text-slate-500">
            {isRtl
              ? "ابحث بالإيميل أو الموبايل أو رقم التسجيل لمتابعة حالة الدفع، تحميل التذكرة بعد الاعتماد، وتحميل الشهادة بعد الحضور."
              : "Search by email, mobile, or registration number to track payment, download approved tickets, and access certificates after attendance."}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 rounded-[24px] bg-[#eef6ff] p-4">
          <Label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isRtl ? "بحث الدكتور" : "Doctor lookup"}</Label>
          <div className="flex gap-2">
            <Input value={identity} onChange={(event) => setIdentity(event.target.value)} placeholder={isRtl ? "الإيميل / الموبايل / رقم التسجيل" : "Email / mobile / registration ID"} className="h-12 rounded-2xl border-slate-200 bg-white font-bold" />
            <Button onClick={lookup} disabled={loading} className="h-12 rounded-2xl px-5 font-black">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {message ? <p className="text-sm font-bold text-slate-500">{message}</p> : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Stat icon={CalendarDays} label={isRtl ? "التسجيلات" : "Registrations"} value={totals.registrations} />
        <Stat icon={TicketCheck} label={isRtl ? "تذاكر معتمدة" : "Approved tickets"} value={totals.approved} />
        <Stat icon={FileUp} label={isRtl ? "بانتظار الدفع" : "Pending payment"} value={totals.pending} />
        <Stat icon={BadgeCheck} label={isRtl ? "الشهادات" : "Certificates"} value={totals.certificates} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary"><UserRound className="h-7 w-7" /></span>
            <div>
              <h2 className="text-xl font-black">{profile.doctor.full_name}</h2>
              <p className="text-sm font-bold text-slate-400">{profile.doctor.specialty}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm font-bold text-slate-600">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {profile.doctor.email}</p>
            <p>{profile.doctor.mobile}</p>
            <p>{profile.doctor.city}, {profile.doctor.country_name}</p>
          </div>
          <Button asChild className="mt-6 h-11 w-full rounded-2xl font-black">
            <Link href="/register">{isRtl ? "تسجيل جديد في فعالية" : "Register for another event"}</Link>
          </Button>
        </aside>

        <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black">{isRtl ? "سجل التسجيلات" : "Registration history"}</h2>
              <p className="mt-1 text-sm font-medium text-slate-400">{isRtl ? "كل فعالية مرتبطة بحالة الدفع والتذكرة والشهادة." : "Each event is connected to payment, ticket, and certificate status."}</p>
            </div>
            <Badge className="w-fit rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">Annex workflow</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-slate-50 text-sm font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">{isRtl ? "التسجيل" : "Registration"}</th>
                  <th className="px-6 py-4">{isRtl ? "الفعالية" : "Event"}</th>
                  <th className="px-6 py-4">{isRtl ? "التذكرة" : "Ticket"}</th>
                  <th className="px-6 py-4">{isRtl ? "الدفع" : "Payment"}</th>
                  <th className="px-6 py-4">{isRtl ? "التاريخ" : "Created"}</th>
                  <th className="px-6 py-4">{isRtl ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {profile.history.map((item: any) => {
                  const created = formatDate(item.created_at)
                  const needsProof = item.payment_status !== "approved"
                  const proofState = proof[String(item.id)] || { reference: item.payment_reference || "", url: item.payment_proof_url || "" }
                  return (
                    <tr key={item.id} className="border-t border-slate-100 align-top">
                      <td className="px-6 py-5">
                        <p className="font-black">{item.registration_number}</p>
                        <Status value={item.registration_status} />
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-black">{isRtl ? item.event_title_ar : item.event_title_en}</p>
                        <p className="mt-1 text-sm font-bold text-slate-400">{formatDate(item.starts_at).date}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-black text-primary"><TicketCheck className="h-4 w-4" /> {isRtl ? item.ticket_name_ar : item.ticket_name_en}</p>
                        <p className="mt-2 text-sm font-bold text-slate-500">{item.selected_currency} {Number(item.selected_price || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-5"><Status value={item.payment_status} /></td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-slate-600">{created.date}</p>
                        <p className="text-xs font-bold text-slate-400">{created.time}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <Button asChild disabled={!item.ticket_pdf_url} variant="outline" className="h-9 rounded-xl font-black">
                            <Link href={item.ticket_pdf_url || "#"}><Download className="h-4 w-4" /> {isRtl ? "التذكرة" : "Ticket"}</Link>
                          </Button>
                          <Button asChild disabled={!item.certificate_file_url} variant="outline" className="h-9 rounded-xl font-black">
                            <Link href={item.certificate_file_url || "#"}><BadgeCheck className="h-4 w-4" /> {isRtl ? "الشهادة" : "Certificate"}</Link>
                          </Button>
                        </div>
                        {needsProof ? (
                          <div className="mt-3 grid gap-2 rounded-2xl bg-slate-50 p-3">
                            <Input className="h-10 rounded-xl bg-white text-sm font-bold" placeholder={isRtl ? "رقم التحويل" : "Transfer reference"} value={proofState.reference} onChange={(event) => setProof((current) => ({ ...current, [item.id]: { ...proofState, reference: event.target.value } }))} />
                            <Input className="h-10 rounded-xl bg-white text-sm font-bold" placeholder={isRtl ? "رابط إثبات الدفع" : "Payment proof URL"} value={proofState.url} onChange={(event) => setProof((current) => ({ ...current, [item.id]: { ...proofState, url: event.target.value } }))} />
                            <Button onClick={() => submitProof(item.id)} disabled={!proofState.url || proofState.loading} className="h-10 rounded-xl font-black">
                              {proofState.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                              {isRtl ? "إرسال للمراجعة" : "Send for review"}
                            </Button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  )
}

function OperationsPortal({ role }: { role: Exclude<Role, "customer"> }) {
  const { isRtl } = useLanguage()
  const copy = role === "employee"
    ? {
        badge: "Back office",
        titleEn: "Manual registration and kiosk support",
        titleAr: "التسجيل اليدوي ودعم الكشك",
        bodyEn: "Search registrations, verify bank-transfer proof, print tickets, and support event-day check-in from the operations console.",
        bodyAr: "ابحث في التسجيلات، راجع إثباتات التحويل البنكي، اطبع التذاكر، وساعد فريق الدخول يوم الفعالية.",
      }
    : {
        badge: "Organizer",
        titleEn: "Organizer event operations",
        titleAr: "تشغيل الفعاليات للمنظم",
        bodyEn: "Follow live capacity, registrations, ticket sales, reviews, and certificate delivery for assigned events.",
        bodyAr: "تابع السعة، التسجيلات، مبيعات التذاكر، التقييمات، وتسليم الشهادات للفعاليات المسندة إليك.",
      }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <Badge className="mb-4 rounded-full bg-primary px-4 py-1 text-white hover:bg-primary">{copy.badge}</Badge>
        <h1 className="max-w-4xl text-3xl font-black leading-tight text-[#0f172a] md:text-5xl">{isRtl ? copy.titleAr : copy.titleEn}</h1>
        <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-slate-500">{isRtl ? copy.bodyAr : copy.bodyEn}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Stat icon={CalendarDays} label={isRtl ? "فعاليات نشطة" : "Active events"} value={role === "employee" ? 4 : 7} />
        <Stat icon={ShieldCheck} label={isRtl ? "طلبات دفع" : "Payment reviews"} value={12} />
        <Stat icon={QrCode} label={isRtl ? "جاهز للدخول" : "QR ready"} value="100%" />
      </section>
      <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
        <div className="grid gap-3 md:grid-cols-3">
          <Button asChild className="h-12 rounded-2xl font-black"><Link href="/admin/bookings">{isRtl ? "مراجعة الحجوزات" : "Review bookings"}</Link></Button>
          <Button asChild variant="outline" className="h-12 rounded-2xl font-black"><Link href="/admin/checkin">{isRtl ? "كونسول QR" : "QR console"}</Link></Button>
          <Button asChild variant="outline" className="h-12 rounded-2xl font-black"><Link href="/register">{isRtl ? "تسجيل يدوي" : "Manual registration"}</Link></Button>
        </div>
      </section>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-[26px] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#0f172a]">{value}</p>
    </div>
  )
}

function Status({ value }: { value?: string }) {
  const normalized = String(value || "waiting").replace("_", " ")
  const isGood = ["approved", "issued", "checked in", "paid"].includes(normalized)
  const isBad = ["rejected", "cancelled", "failed"].includes(normalized)
  return (
    <span
      className={cn(
        "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black capitalize",
        isGood && "bg-emerald-50 text-emerald-700",
        isBad && "bg-red-50 text-red-600",
        !isGood && !isBad && "bg-blue-50 text-primary"
      )}
    >
      {normalized}
    </span>
  )
}
