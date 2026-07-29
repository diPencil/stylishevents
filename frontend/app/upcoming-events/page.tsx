"use client"

import { CheckCircle2 } from "lucide-react"
import { EventCard, PublicPageFrame, PublicPageHero } from "@/components/public/page-building-blocks"
import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"
import { platformApi, apiAssetUrl } from "@/lib/platform-api"
import { normalizeSiteContentSettings } from "@/lib/site-content-defaults"

const mapEventToCard = (event: any) => ({
  titleEn: event.title_en,
  titleAr: event.title_ar,
  typeEn: event.type,
  typeAr: event.type, 
  cityEn: event.venue_name_en || event.venue_city_en || "",
  cityAr: event.venue_name_ar || event.venue_city_ar || "",
  dateEn: event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "",
  dateAr: event.starts_at ? new Date(event.starts_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' }) : "",
  seats: String(event.max_attendees || "TBA"),
  statusEn: "Registration open",
  statusAr: "متاح للتسجيل",
  summaryEn: event.summary_en || "",
  summaryAr: event.summary_ar || "",
  slug: event.slug,
  image: event.cover_image_url ? apiAssetUrl(event.cover_image_url) : null,
})

export default function UpcomingEventsPage() {
  const { isRtl } = useLanguage()
  const [events, setEvents] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [cfg, setCfg] = useState<any>({})

  useEffect(() => {
      setMounted(true)
      let mountedFlag = true
      platformApi.getSiteContentSettings()
        .then((site) => {
          const normalized = normalizeSiteContentSettings(site || {})
          const cfg = normalized?.upcomingEvents || {}
          setCfg(cfg || {})
          if (!cfg?.enabled) {
            setEvents([])
            return
          }
          const sortMode = cfg.sortMode || 'default'
          const limit = cfg.itemsPerPage || 24
          return platformApi.listEvents({ status: 'published', page: 'upcoming', sortMode, limit })
        })
        .then((res) => {
          if (!mountedFlag) return
          if (!res) return
          setEvents(res.map(mapEventToCard))
        })
        .catch(console.error)

      return () => { mountedFlag = false }
    }, [])

  if (!mounted) return null

  return (
    <PublicPageFrame>
      <PublicPageHero
        title={isRtl ? (cfg?.titleAr || '\u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a \u0627\u0644\u0642\u0627\u062f\u0645\u0629') : (cfg?.titleEn || 'Upcoming Events')}
        description={isRtl ? (cfg?.descriptionAr || '\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0627\u0644\u062c\u0627\u0647\u0632\u0629 \u0644\u0644\u062a\u0633\u062c\u064a\u0644 \u0648\u0627\u0644\u062a\u0634\u063a\u064a\u0644') : (cfg?.descriptionEn || 'Discover the next events ready for registration and operation')}
        backgroundImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"
        imageAlt={isRtl ? '\u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a \u0627\u0644\u0642\u0627\u062f\u0645\u0629' : 'Upcoming Events'}
      />

      {/* Events Grid Only */}
      <section className="px-4 py-14 sm:px-6 lg:py-20 bg-slate-50/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {events.length === 0 ? (
              <div className="text-center col-span-3 text-slate-500 py-10 font-medium">
                <p className="font-medium">{isRtl ? (cfg?.emptyTitleAr || 'لا توجد فعاليات قادمة حالياً.') : (cfg?.emptyTitleEn || 'No upcoming events available at the moment.')}</p>
                { (isRtl ? (cfg?.emptyDescriptionAr) : (cfg?.emptyDescriptionEn)) ? (
                  <p className="mt-2 text-sm">{isRtl ? cfg?.emptyDescriptionAr : cfg?.emptyDescriptionEn}</p>
                ) : null }
              </div>
            ) : (
              events.map((event, index) => <EventCard key={event.slug || index} event={event} />)
            )}
          </div>
        </div>
      </section>

      {/* Informational Section (configurable) */}
      {(() => {
        const info = cfg?.informationSection || {}
        const enabled = info?.enabled ?? true
        const title = isRtl ? (info?.titleAr || 'مصمم للتسجيل وليس العرض فقط') : (info?.titleEn || 'Built for registration, not just promotion')
        const desc = isRtl ? (info?.descriptionAr || 'صفحات الفعاليات القادمة مصممة لمساعدة العميل على فهم الفعالية، واختيار التذكرة المناسبة، وإتمام الحجز بكل سهولة.') : (info?.descriptionEn || 'Upcoming event pages should help customers understand the event, choose the right ticket, and complete the booking without confusion.')
        const bullets = info?.bullets || [
          { id: 'b-1', textEn: 'Ticket types separated by access and benefits.', textAr: 'فصل أنواع التذاكر حسب الدخول والمزايا.' },
          { id: 'b-2', textEn: 'Pricing periods support early bird and VIP.', textAr: 'فترات الأسعار تدعم الحجز المبكر والـ VIP.' },
          { id: 'b-3', textEn: 'Every customer receives a QR ticket.', textAr: 'كل عميل يستلم تذكرة بـ QR code.' },
        ]
        if (!enabled) return null
        const imageLeft = (info?.imagePosition || 'left') === 'left'
        const imageUrl = info?.imageUrl || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop'
        const imageAlt = isRtl ? (info?.imageAltAr || 'حول الفعاليات القادمة') : (info?.imageAltEn || 'About Upcoming Events')
        return (
          <section className="px-4 py-14 sm:px-6 lg:py-24">
            <div className="container mx-auto max-w-7xl">
              <div className={`flex flex-col ${imageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                <div className="w-full lg:w-1/2">
                  {imageUrl ? <img src={apiAssetUrl(imageUrl)} alt={imageAlt} className="rounded-3xl shadow-2xl w-full h-[350px] md:h-[450px] object-cover" /> : (
                    <div className="rounded-3xl shadow-2xl w-full h-[350px] md:h-[450px] bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-300 font-extrabold">{isRtl ? 'لا توجد صورة' : 'No image'}</span>
                    </div>
                  )}
                </div>
                <div className="w-full lg:w-1/2 space-y-6">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">{title}</h2>
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">{desc}</p>
                  <ul className="space-y-4 mt-8">
                    {bullets.filter(Boolean).slice(0,6).map((item:any) => (
                      <li key={item.id} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                        </div>
                        <span className="text-slate-700 font-medium">{isRtl ? item.textAr : item.textEn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )
      })()}
    </PublicPageFrame>
  )
}
