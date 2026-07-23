"use client"

import { Award, BadgeCheck, BarChart3, MessageSquareText, Repeat2, Users } from "lucide-react"
import { EventCard, FeatureGrid, PageHero, PublicPageFrame, SectionHeader, SplitPanel } from "@/components/public/page-building-blocks"
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
  seats: String(event.attendees_count || event.max_attendees || "TBA"),
  statusEn: "Event Completed",
  statusAr: "فعالية مكتملة",
  summaryEn: event.summary_en || "",
  summaryAr: event.summary_ar || "",
  satisfaction: event.rating ? String(event.rating) : "4.8",
  slug: event.slug,
  image: event.cover_image_url ? apiAssetUrl(event.cover_image_url) : null,
})

export default function PreviousEventsPage() {
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
          const cfg = normalized?.previousEvents || {}
          setCfg(cfg || {})
        if (!cfg?.enabled) {
          setEvents([])
          return
        }
        const sortMode = cfg.sortMode || 'nearest'
        const limit = cfg.itemsPerPage || 24
        return platformApi.listEvents({ status: 'published', page: 'previous', sortMode, limit })
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
      {/* Simple Image Hero */}
      <div className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-slate-900/60 z-10" />
        <img src="https://images.unsplash.com/photo-1511578314322-379fff116361?q=80&w=2070&auto=format&fit=crop" alt="Previous Events" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="relative z-20 text-center px-4 mt-16 md:mt-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
            {isRtl ? (cfg?.titleAr || 'فعاليات سابقة') : (cfg?.titleEn || 'Previous Events')}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 font-medium max-w-4xl mx-auto px-4">
            {isRtl ? (cfg?.descriptionAr || 'سجل فعاليات تم تنفيذها وقياسها بالتشغيل والتجربة') : (cfg?.descriptionEn || 'A record of delivered events, measured by operation and experience')}
          </p>
        </div>
      </div>

      {/* Events Grid Only */}
      <section className="px-4 py-14 sm:px-6 lg:py-20 bg-slate-50/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {events.length === 0 ? (
              <div className="text-center col-span-3 text-slate-500 py-10 font-medium">
                <p className="font-medium">{isRtl ? (cfg?.emptyTitleAr || 'لا توجد فعاليات سابقة حالياً.') : (cfg?.emptyTitleEn || 'No previous events available at the moment.')}</p>
                { (isRtl ? (cfg?.emptyDescriptionAr) : (cfg?.emptyDescriptionEn)) ? (
                  <p className="mt-2 text-sm">{isRtl ? cfg?.emptyDescriptionAr : cfg?.emptyDescriptionEn}</p>
                ) : null }
              </div>
            ) : (
              events.map((event, index) => <EventCard key={event.slug || index} event={event} previous />)
            )}
          </div>
        </div>
      </section>

      {/* Informational Section (configurable) */}
      {(() => {
        const info = cfg?.informationSection || {}
        const enabled = info?.enabled ?? true
        const title = isRtl ? (info?.titleAr || 'ما الذي يجعل الفعالية المنتهية ذات قيمة') : (info?.titleEn || 'What makes a finished event valuable')
        const desc = isRtl ? (info?.descriptionAr || 'الفعالية السابقة ليست معرض صور فقط. هي مصدر بيانات: حضور، سلوك شراء، تقييمات، ومشاكل الدخول.') : (info?.descriptionEn || 'A previous event is not just a photo gallery. It is a source of data: attendance, buying behavior, reviews, and check-in issues.')
        const bullets = info?.bullets || [
          { id: 'p-1', textEn: 'Final reports compare tickets sold and attendees.', textAr: 'التقارير النهائية تقارن التذاكر المباعة والحضور الفعلي.' },
          { id: 'p-2', textEn: 'Review analysis shows what guests valued.', textAr: 'تحليل التقييمات يوضح ما الذي أعجب الضيوف.' },
          { id: 'p-3', textEn: 'Certificate and event-card delivery logs.', textAr: 'سجلات تسليم الشهادات والكروت.' },
        ]
        if (!enabled) return null
        const imageRight = (info?.imagePosition || 'right') === 'right'
        const imageUrl = info?.imageUrl || 'https://images.unsplash.com/photo-1475721028070-205bc1ad2cca?q=80&w=2000&auto=format&fit=crop'
        const imageAlt = isRtl ? (info?.imageAltAr || 'حول الفعاليات السابقة') : (info?.imageAltEn || 'About Previous Events')
        return (
          <section className="px-4 py-14 sm:px-6 lg:py-24">
            <div className="container mx-auto max-w-7xl">
              <div className={`flex flex-col ${imageRight ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
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
                          <BadgeCheck className="w-4 h-4 text-brand-blue" />
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
