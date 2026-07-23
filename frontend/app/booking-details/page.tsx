"use client"

import { useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Phone, MessageCircle, CalendarDays, UserRound, MapPin, Users, Hash } from "lucide-react"

type BookingDetails = {
  bookingNumber?: string
  fullName?: string
  eventName?: string
  eventDate?: string
  location?: string
  expectedAttendance?: string
  services?: string[]
  eventType?: string
  specialization?: string
  createdAt?: string
  language?: "ar" | "en"
}

const CONTACT_PHONE = "+201106653177"

function safeParseBookingData(encoded: string | null): BookingDetails | null {
  if (!encoded) return null
  try {
    const decoded = decodeURIComponent(escape(atob(encoded.replace(/ /g, "+"))));
    const parsed = JSON.parse(decoded);
    
    // Map compact keys back (supports both formats for safety)
    if (parsed.b) {
      return {
        bookingNumber: parsed.b,
        fullName: parsed.n,
        eventName: parsed.e,
        eventDate: parsed.d,
        location: parsed.l,
        expectedAttendance: parsed.a,
        services: parsed.s,
        createdAt: parsed.c,
        language: parsed.g,
        eventType: parsed.t,
        specialization: parsed.p
      }
    }
    // Old mapping fallback
    if (parsed.bn) {
        return {
          bookingNumber: parsed.bn,
          fullName: parsed.fn,
          eventName: parsed.en,
          eventDate: parsed.ed,
          location: parsed.l,
          expectedAttendance: parsed.ea,
          services: parsed.s,
          createdAt: parsed.c,
          language: parsed.lang,
          eventType: parsed.et,
          specialization: parsed.sp
        }
    }
    return parsed
  } catch (e) {
    try { return JSON.parse(decodeURIComponent(encoded)); } catch { return null; }
  }
}

function BookingDetailsContent() {
  const searchParams = useSearchParams()

  const details = useMemo(() => {
    // Try 'd' (compact) then 'data' (old)
    const raw = searchParams.get("d") || searchParams.get("data")
    return safeParseBookingData(raw)
  }, [searchParams])

  const isArabic = details?.language !== "en"
  const dir = isArabic ? "rtl" : "ltr"

  const labels = {
    title: isArabic ? "تفاصيل طلب الحجز" : "Booking Request Details",
    subtitle: isArabic
      ? "تم إنشاء هذه الصفحة تلقائيًا من رمز QR الخاص بطلبك."
      : "This page was generated automatically from your booking QR code.",
    booking: isArabic ? "رقم الحجز" : "Booking Number",
    name: isArabic ? "الاسم الكامل" : "Full Name",
    event: isArabic ? "اسم الفعالية" : "Event Name",
    date: isArabic ? "تاريخ الفعالية" : "Event Date",
    location: isArabic ? "الموقع" : "Location",
    attendance: isArabic ? "عدد الحضور المتوقع" : "Expected Attendance",
    services: isArabic ? "الخدمات الإضافية" : "Additional Services",
    createdAt: isArabic ? "وقت إنشاء الطلب" : "Created At",
    noServices: isArabic ? "لا توجد خدمات إضافية" : "No additional services",
    noData: isArabic ? "الرابط غير صالح أو البيانات ناقصة." : "Invalid link or missing request data.",
    callUs: isArabic ? "اتصل بنا" : "Call Us",
    whatsapp: isArabic ? "تواصل واتساب" : "WhatsApp",
    eventType: isArabic ? "نوع الفعالية" : "Event Type",
    specialization: isArabic ? "التخصص / المسمى" : "Specialization",
    conference: isArabic ? "مؤتمر" : "Conference",
    exhibition: isArabic ? "معرض" : "Exhibition",
    both: isArabic ? "كلاهما" : "Both",
  }

  const whatsappText = encodeURIComponent(
    isArabic
      ? `مرحبًا، أريد الاستفسار عن طلب الحجز رقم ${details?.bookingNumber || ""}`
      : `Hello, I want to ask about booking number ${details?.bookingNumber || ""}`
  )

  return (
    <main
      dir={dir}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff_0%,_#ffffff_100%)] p-6 md:p-12 flex items-center justify-center"
    >
      <div className="w-full max-w-sm md:max-w-md bg-white rounded-[2.5rem] shadow-[0_40px_100px_-30px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
            {!details ? (
                <div className="text-center py-10">
                    <p className="text-red-500 font-bold">{labels.noData}</p>
                </div>
            ) : (
                <>
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">✓</div>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{labels.title}</h1>
                        <p className="text-[12px] text-slate-400 font-medium leading-relaxed px-4">
                            {labels.subtitle}
                        </p>
                        <div className="inline-flex items-center px-4 py-1.5 bg-brand-purple/5 rounded-full border border-brand-purple/10">
                            <span className="text-brand-purple font-black tracking-widest text-xs">
                                #{details.bookingNumber}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 py-6 border-y border-slate-50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-brand-blue rounded-full"></div>
                            <h3 className="text-[10px] font-black text-slate-900 tracking-widest uppercase">
                                {isArabic ? "تفاصيل الطلب" : "REQUEST DETAILS"}
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: labels.name, value: details.fullName },
                                { label: labels.event, value: details.eventName },
                                { label: labels.eventType, value: details.eventType === 'both' ? labels.both : (details.eventType === 'conference' ? labels.conference : labels.exhibition) },
                                { label: labels.date, value: details.eventDate },
                                { label: labels.location, value: details.location },
                                { label: labels.attendance, value: details.expectedAttendance },
                                { label: labels.specialization, value: details.specialization }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-4 border-b border-slate-50 pb-2 last:border-0 text-start">
                                    <span className="text-slate-400 text-[10px] font-bold uppercase shrink-0">{item.label}</span>
                                    <span className="text-[12px] font-black text-slate-800 text-end">
                                        {item.value || "-"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href={`tel:${CONTACT_PHONE}`}
                            className="flex items-center justify-center h-12 rounded-2xl bg-slate-900 text-white font-bold text-xs transition active:scale-95"
                        >
                            {labels.callUs}
                        </a>
                        <a
                            href={`https://wa.me/${CONTACT_PHONE.replace("+", "")}?text=${whatsappText}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center h-12 rounded-2xl bg-emerald-600 text-white font-bold text-xs transition active:scale-95"
                        >
                            {labels.whatsapp}
                        </a>
                    </div>
                </>
            )}
        </div>
      </div>
    </main>
  )
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        </div>
    }>
      <BookingDetailsContent />
    </Suspense>
  )
}
