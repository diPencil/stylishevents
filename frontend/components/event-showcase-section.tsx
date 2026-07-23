"use client"

import { CalendarDays, MapPin, Ticket, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { AnimatedCtaButton } from "@/components/ui/animated-cta-button"
import { useEffect, useState } from "react"

const defaultEvents = [
  {
    titleAr: "قمة التحول الرقمي",
    titleEn: "Digital Transformation Summit",
    locationAr: "الرياض، السعودية",
    locationEn: "Riyadh, Saudi Arabia",
    date: "18 Aug 2026",
    typeAr: "مؤتمر",
    typeEn: "Conference",
    seats: "1,200",
    price: "$80",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    titleAr: "معرض الضيافة الدولي",
    titleEn: "International Hospitality Expo",
    locationAr: "دبي، الإمارات",
    locationEn: "Dubai, UAE",
    date: "04 Sep 2026",
    typeAr: "معرض",
    typeEn: "Exhibition",
    seats: "2,400",
    price: "$120",
    gradient: "from-orange-600 to-amber-400",
  },
  {
    titleAr: "ملتقى رواد الأعمال",
    titleEn: "Founders Forum",
    locationAr: "القاهرة، مصر",
    locationEn: "Cairo, Egypt",
    date: "22 Sep 2026",
    typeAr: "ملتقى",
    typeEn: "Forum",
    seats: "750",
    price: "$60",
    gradient: "from-slate-900 to-blue-700",
  },
]

export function EventShowcaseSection() {
  const { isRtl } = useLanguage()
  const [siteContent, setSiteContent] = useState<any>(null)
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>(defaultEvents)

  useEffect(() => {
    import("@/lib/platform-api").then(({ platformApi }) => {
      platformApi.getSiteContentSettings().then((data) => {
        if (data) setSiteContent(data)
      })
      platformApi.listEvents({ status: "published" }).then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setAllEvents(data)
        }
      }).catch(err => console.error("Failed to load events", err))
    })
  }, [])

  useEffect(() => {
    if (allEvents.length > 0) {
      let sorted = [...allEvents]
      const order = siteContent?.homepage?.showcaseSortOrder || "default"
      
      if (order === "latest") {
        sorted = sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      } else if (order === "upcoming") {
        sorted = sorted.sort((a, b) => new Date(a.starts_at || Infinity).getTime() - new Date(b.starts_at || Infinity).getTime())
      }

      const mappedEvents = sorted.map((event, idx) => ({
        titleEn: event.title_en || event.titleEn,
        titleAr: event.title_ar || event.titleAr,
        locationEn: event.location || "Online",
        locationAr: event.location || "أونلاين",
        date: event.starts_at ? new Date(event.starts_at).toLocaleDateString() : "TBD",
        typeEn: event.type,
        typeAr: event.type === 'conference' ? 'مؤتمر' : event.type === 'exhibition' ? 'معرض' : 'ملتقى',
        seats: event.max_attendees || "1,000",
        price: "$50",
        gradient: defaultEvents[idx % defaultEvents.length].gradient,
        imageUrl: event.cover_image_url || event.coverImageUrl,
      }))
      setEvents(mappedEvents.slice(0, 3)) // Show top 3 events
    }
  }, [allEvents, siteContent])

  return (
    <section className="bg-[#f4f7fb] py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge className="mb-4 rounded-xl bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-600">
              {isRtl ? "الفعاليات المتاحة" : "Available Events"}
            </Badge>
            <h2 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              {isRtl ? siteContent?.homepage?.showcaseTitleAr || "اكتشف فعاليات جاهزة للحجز والمتابعة" : siteContent?.homepage?.showcaseTitleEn || "Discover events ready for booking and operations"}
            </h2>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-500">
              {isRtl ? siteContent?.homepage?.showcaseDescAr || "كروت الفعاليات تعرض حالة الحدث، المقاعد، السعر الابتدائي، والموقع بشكل سريع ومناسب لكل الشاشات." : siteContent?.homepage?.showcaseDescEn || "Event cards show status, seats, starting price, and location in a responsive operational layout."}
            </p>
          </div>
          <div className="mt-8 flex justify-center md:mt-0 md:justify-end">
            <AnimatedCtaButton
              onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              {isRtl ? siteContent?.homepage?.showcaseCtaAr || "احجز فعالية" : siteContent?.homepage?.showcaseCtaEn || "Book an Event"}
            </AnimatedCtaButton>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, index) => (
            <article key={index} className="overflow-hidden rounded-[30px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(15,23,42,0.10)] group cursor-pointer">
              <div className={`h-44 bg-gradient-to-br ${event.gradient} p-6 text-white relative overflow-hidden`}>
                {event.imageUrl && (
                  <>
                    <img src={event.imageUrl} alt={event.titleEn} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-slate-900/40 z-0 transition-opacity duration-300 group-hover:bg-slate-900/50" />
                  </>
                )}
                
                <div className="flex items-center justify-between relative z-10">
                  <Badge className="rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-0">
                    {isRtl ? event.typeAr : event.typeEn}
                  </Badge>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-8 text-2xl font-black leading-tight relative z-10 drop-shadow-md">
                  {isRtl ? event.titleAr : event.titleEn}
                </h3>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  {isRtl ? event.locationAr : event.locationEn}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{isRtl ? "التاريخ" : "Date"}</p>
                    <p className="mt-1 text-sm font-black">{event.date}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{isRtl ? "المقاعد" : "Seats"}</p>
                    <p className="mt-1 text-sm font-black">{event.seats}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{isRtl ? "من" : "From"}</p>
                    <p className="mt-1 text-sm font-black">{event.price}</p>
                  </div>
                </div>
                <Button variant="outline" className="h-12 w-full rounded-2xl border-slate-200 font-black">
                  <Users className="h-4 w-4" />
                  {isRtl ? "عرض التفاصيل" : "View Details"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
