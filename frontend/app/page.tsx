"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { AnimatedCtaButton } from "@/components/ui/animated-cta-button"
import { FaqSection } from "@/components/faq-section"
import { useLanguage } from "@/contexts/language-context"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import {
  History,
  Hotel,
  PlaneLanding,
  Palmtree,
  ClipboardCheck,
  Star,
  ShieldCheck,
  ChevronsRight
} from "lucide-react"
import { VideoHero } from "@/components/video-hero"
import { EventShowcaseSection } from "@/components/event-showcase-section"
import { EventsInspireSection } from "@/components/events-inspire-section"
import { FinalCtaSection } from "@/components/final-cta-section"
import { DEFAULT_FEATURES_SECTION } from "@/lib/site-content-defaults"

export default function Home() {
  const { t, isRtl } = useLanguage()
  const [siteContent, setSiteContent] = useState<any>(null)

  useEffect(() => {
    import("@/lib/platform-api").then(({ platformApi }) => {
      platformApi.getSiteContentSettings().then((data) => {
        if (data) setSiteContent(data)
      })
    })
  }, [])

  const whyUsTitleEn = siteContent?.homepage?.whyUsTitleEn || "Our experience makes your event easier to run"
  const whyUsTitleAr = siteContent?.homepage?.whyUsTitleAr || "خبرتنا تجعل تجربة فعاليتك أسهل وأكثر تنظيما"

  // Default fallback if loading or failing
  const defaultCards = (t("whyUs.cards") as unknown as any[]) || []
  const dynamicCards = siteContent?.whyUsCards?.length ? siteContent.whyUsCards : defaultCards
  const featuresSection = { ...DEFAULT_FEATURES_SECTION, ...(siteContent?.featuresSection || {}) }

  const whyUsCards = dynamicCards.map((c: any, i: number) => ({
    title: isRtl ? c.titleAr || defaultCards[i]?.title : c.titleEn || defaultCards[i]?.title,
    desc: isRtl ? c.descAr || defaultCards[i]?.desc : c.descEn || defaultCards[i]?.desc,
  }))

  const icons = [
    <History className="w-10 h-10" />,
    <Hotel className="w-10 h-10" />,
    <PlaneLanding className="w-10 h-10" />,
    <Palmtree className="w-10 h-10" />,
    <ClipboardCheck className="w-10 h-10" />,
    <ShieldCheck className="w-10 h-10" />
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Stylish Events",
    "url": "https://stylish-events.com",
    "logo": "https://stylish-events.com/logo.png",
    "description": "شريككم الموثوق في تنظيم وحجز المؤتمرات والمعارض الدولية بكل احترافية.",
    "sameAs": [
      "https://twitter.com/stylishevents",
      "https://instagram.com/stylishevents"
    ]
  };

  return (
    <div className="public-site min-h-screen flex flex-col overflow-x-hidden bg-[hsl(var(--primary)/0.07)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Section A: Video Hero Section */}
        <VideoHero />

        {/* Section 1: Features (New - Based on Reference) */}
        {featuresSection.enabled ? (
        <section id="features" className="pt-16 md:pt-24 pb-32 relative overflow-hidden bg-[hsl(var(--primary)/0.05)]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center mb-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="px-4 py-1 mb-6 text-[13px] font-bold rounded-full bg-slate-50 border border-slate-100 text-slate-500"
              >
                {isRtl ? featuresSection.eyebrowAr : featuresSection.eyebrowEn}
              </motion.div>
              <h2 className={`text-2xl md:text-4xl lg:text-5xl ${isRtl ? 'font-bold' : 'font-extrabold'} tracking-tighter text-[#0f172a] mb-6 max-w-4xl leading-[1.1]`}>
                {isRtl ? featuresSection.titleAr : featuresSection.titleEn}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                {isRtl ? featuresSection.descriptionAr : featuresSection.descriptionEn}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Feature Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/70 backdrop-blur-sm animate-mesh rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-md flex flex-col items-start text-start overflow-hidden relative group min-h-[400px]"
              >
                <h3 className="text-2xl font-bold mb-4 text-[#0f172a]">{isRtl ? siteContent?.featuresCards?.[0]?.titleAr || "إدارة وتنظيم المؤتمرات" : siteContent?.featuresCards?.[0]?.titleEn || "Conference Management"}</h3>
                <p className="text-slate-500 font-medium mb-10 text-sm">{isRtl ? siteContent?.featuresCards?.[0]?.descAr || "نظام متكامل لتسجيل الحضور وإدارة الجلسات بكل سهولة واحترافية." : siteContent?.featuresCards?.[0]?.descEn || "Integrated system for attendance registration and session management with ease."}</p>
                <div className="mt-auto w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="space-y-3">
                    {[
                      { icon: "👤", label: isRtl ? "تسجيل دخول جديد" : "New Check-in", status: isRtl ? "مكتمل" : "Success" },
                      { icon: "📄", label: isRtl ? "طباعة خطاب التسجيل" : "Event Letter", status: isRtl ? "جاري" : "Pending" },
                      { icon: "⭐", label: isRtl ? "تقييم الجلسة" : "Session Review", status: isRtl ? "جديد" : "New" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-xs shrink-0">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold text-slate-800 truncate">{item.label}</div>
                        </div>
                        <div className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shrink-0 ${
                          item.status === "Success" || item.status === "مكتمل" ? "bg-green-50 text-green-600" : "bg-brand-blue/10 text-brand-blue"
                        }`}>
                          {item.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Feature Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white/70 backdrop-blur-sm animate-mesh rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-md flex flex-col items-start text-start overflow-hidden relative group min-h-[400px]"
              >
                <h3 className="text-2xl font-bold mb-4 text-[#0f172a]">{isRtl ? siteContent?.featuresCards?.[1]?.titleAr || "استراتيجيات الحجز الذكي" : siteContent?.featuresCards?.[1]?.titleEn || "Smart Booking Strategies"}</h3>
                <p className="text-slate-500 font-medium mb-10 text-sm">{isRtl ? siteContent?.featuresCards?.[1]?.descAr || "حوّل الزوار إلى مشاركين من خلال أنظمة حجز مرنة وسهلة الاستخدام." : siteContent?.featuresCards?.[1]?.descEn || "Convert visitors into participants through flexible and easy-to-use booking systems."}</p>
                <div className="mt-auto w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-40 flex flex-col justify-center items-center">
                  <div className="w-24 h-24">
                    <DotLottieReact src="https://lottie.host/f7c24d79-64e8-4a2c-9098-c9d0f4fe880b/d5sRehuBaY.lottie" loop autoplay className="w-24 h-24" />
                  </div>
                  <div className="mt-2 h-2 w-32 bg-brand-blue/20 rounded-full" />
                </div>
              </motion.div>

              {/* Feature Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white/70 backdrop-blur-sm animate-mesh rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-md flex flex-col items-start text-start overflow-hidden relative group min-h-[400px]"
              >
                <h3 className="text-2xl font-bold mb-4 text-[#0f172a]">{isRtl ? siteContent?.featuresCards?.[2]?.titleAr || "الاستجابة والخدمة الفورية" : siteContent?.featuresCards?.[2]?.titleEn || "Immediate Support & Response"}</h3>
                <p className="text-slate-500 font-medium mb-10 text-sm">{isRtl ? siteContent?.featuresCards?.[2]?.descAr || "فريق دعم متخصص يعمل على مدار الساعة لضمان تجربة مثالية لضيوفك وحل كافة التحديات فوراً." : siteContent?.featuresCards?.[2]?.descEn || "A dedicated support team working around the clock to ensure a perfect guest experience."}</p>
                <div className="mt-auto w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-brand-blue animate-pulse flex items-center justify-center text-white">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                  </div>
                  <div className="text-[10px] font-extrabold text-[#0f172a] uppercase tracking-widest">{isRtl ? "دعم متواصل 24/7" : "24/7 ACTIVE SUPPORT"}</div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-75" />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-150" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        ) : null}

        <EventShowcaseSection />

        {/* Section 2: Benefits (Bento Grid - Redesigned to match Reference perfectly) */}
        <section id="why-us" className="py-32 bg-slate-50/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="px-4 py-1 mb-6 text-[13px] font-bold rounded-full bg-white border border-slate-200 shadow-sm text-slate-600"
              >
                {isRtl ? siteContent?.homepage?.whyUsBadgeAr || "المزايا" : siteContent?.homepage?.whyUsBadgeEn || "Benefits"}
              </motion.div>
              <h2 className={`text-2xl md:text-4xl lg:text-5xl ${isRtl ? 'font-bold' : 'font-extrabold'} tracking-tighter text-[#0f172a] mb-6 leading-[1.4] md:leading-[1.5]`}>
                {isRtl ? whyUsTitleAr : whyUsTitleEn === "Our experience makes your event easier to run" ? (
                  <>
                    Our experience makes
                    <br />
                    your event easier to run
                  </>
                ) : whyUsTitleEn}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                {isRtl ? siteContent?.homepage?.whyUsSubtitleAr || t("whyUs.subtitle") : siteContent?.homepage?.whyUsSubtitleEn || t("whyUs.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
              {/* COLUMN 1 */}
              <div className="flex flex-col gap-6">
                {/* Card 1: Funnel Graphic */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md flex flex-col min-h-[450px] md:h-[500px] relative overflow-hidden group"
                >
                    {/* Premium Subtle Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                    
                    {/* Intense Spotlights */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-purple/[0.08] via-transparent to-brand-blue/[0.08] pointer-events-none" />
                    <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-purple/20 blur-[90px] rounded-full pointer-events-none opacity-80" />
                    <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-brand-blue/20 blur-[90px] rounded-full pointer-events-none opacity-80" />
                    
                    {/* Lighting & Funnel Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-64 bg-gradient-to-b from-brand-blue/15 via-brand-purple/15 to-transparent blur-3xl rounded-full opacity-80 pointer-events-none" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-48 bg-gradient-to-b from-slate-100/40 to-transparent pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 65% 100%, 35% 100%)' }} />

                  <div className="w-full relative flex items-center justify-center flex-1 mb-6">
                    {/* Floating Avatars with subtle glows */}
                    <div className="absolute top-4 left-[20%] w-8 h-8 rounded-full bg-white border-2 border-yellow-100 shadow-[0_0_15px_rgba(252,211,77,0.3)] flex items-center justify-center overflow-hidden z-20">
                      <img src="/icons/avatar Professional Booking (1).svg" alt="Avatar 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-2 left-[50%] w-10 h-10 rounded-full bg-white border-2 border-red-100 shadow-[0_0_15px_rgba(252,165,165,0.3)] flex items-center justify-center z-30 overflow-hidden">
                      <img src="/icons/avatar Professional Booking (2).svg" alt="Avatar 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-8 right-[25%] w-8 h-8 rounded-full bg-white border-2 border-green-100 shadow-[0_0_15px_rgba(110,231,183,0.3)] flex items-center justify-center z-20 overflow-hidden">
                      <img src="/icons/avatar Professional Booking (3).svg" alt="Avatar 3" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-20 left-[35%] w-8 h-8 rounded-full bg-white border-2 border-purple-100 shadow-[0_0_15px_rgba(196,181,253,0.3)] flex items-center justify-center z-30 overflow-hidden">
                      <img src="/icons/avatar Professional Booking (4).svg" alt="Avatar 4" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-16 right-[38%] w-6 h-6 rounded-full bg-white border-2 border-pink-100 shadow-[0_0_12px_rgba(249,168,212,0.3)] flex items-center justify-center z-20 overflow-hidden">
                      <img src="/icons/avatar Professional Booking (5).svg" alt="Avatar 5" className="w-full h-full object-cover" />
                    </div>

                    {/* Central Mascot Lighting */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand-blue/10 blur-3xl rounded-full z-10" />
                    <div className="w-20 h-20 z-20 relative">
                      <DotLottieReact src="https://lottie.host/638d4dd8-7e5c-4e60-9313-7ad6928d848f/2jWx4KmHKg.lottie" loop autoplay className="w-20 h-20" />
                    </div>

                    <div className="absolute bottom-0 w-48 h-9 bg-white border border-slate-100 shadow-lg rounded-full flex items-center justify-center gap-2 text-xs font-bold text-brand-blue z-30">
                      <div className="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-[10px]">👤</div>
                      {isRtl ? "مشارك جديد" : "New Participant"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{whyUsCards[0]?.title}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{whyUsCards[0]?.desc}</p>
                  </div>
                </motion.div>

                {/* Card 2: UI Glow */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md flex flex-col min-h-[350px] md:h-[400px]"
                >
                  <div className="w-full relative flex items-center justify-center flex-1 mb-6">
                    {/* Glow */}
                    <div className="absolute inset-0 bg-brand-purple/20 blur-3xl rounded-full" />
                    {/* UI Card */}
                    <div className="relative z-10 w-full max-w-[220px] bg-white rounded-2xl shadow-xl border border-slate-50 p-5">
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-sm font-bold text-slate-800">{isRtl ? "حجزك الحالي" : "Your Booking"}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{isRtl ? "خدمتين" : "2 items"}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          <img src="/icons/flight-ticket-Hotel Reservations.svg" alt="Flight" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{isRtl ? "تذكرة طيران" : "Flight Ticket"}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{isRtl ? "درجة رجال الأعمال" : "VIP Class"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          <img src="/icons/hotel-Hotel Reservations.svg" alt="Hotel" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{isRtl ? "غرفة فندقية" : "Hotel Room"}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{isRtl ? "5 ليالي" : "5 Nights"}</div>
                        </div>
                      </div>
                      <div className="w-full py-2.5 bg-slate-50 rounded-lg text-center text-[10px] font-bold text-slate-500 border border-slate-100">
                        {isRtl ? "إضافة المزيد +" : "Add more services +"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{whyUsCards[1]?.title}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{whyUsCards[1]?.desc}</p>
                  </div>
                </motion.div>
              </div>

              {/* COLUMN 2 */}
              <div className="flex flex-col gap-6">
                {/* Card 3: Live Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md flex flex-col min-h-[300px] md:h-[350px]"
                >
                  <div className="mb-6 flex flex-col gap-4 flex-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {isRtl ? "مباشر" : "Live"}
                    </div>
                    <div className="flex items-end gap-1.5 h-full w-full justify-between pt-4">
                      {[30, 50, 80, 45, 90, 60, 75, 100, 65, 85, 40, 70].map((h, i) => (
                        <div key={i} className={`w-full rounded-full ${i % 3 === 0 ? 'bg-green-200' : 'bg-green-500'}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{whyUsCards[2]?.title}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{whyUsCards[2]?.desc}</p>
                  </div>
                </motion.div>

                {/* Card 4: Floating Icons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md flex flex-col min-h-[450px] md:h-[550px] relative overflow-hidden"
                >
                  <div className="w-full relative flex items-center justify-center flex-1 mb-6">
                    {/* Concentric Echo Rings - High Visibility Boost */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-brand-purple/40 bg-brand-purple/[0.05] rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-brand-blue/30 bg-brand-blue/[0.04] rounded-full animate-[pulse_6s_ease-in-out_infinite]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[550px] h-[300px] md:h-[550px] border-2 border-slate-300/40 rounded-full" />
                    
                    <div className="absolute inset-0 bg-brand-blue/15 rounded-full blur-3xl opacity-40" />
                    {/* Center circle */}
                    <div className="w-24 h-24 z-10 relative">
                      <DotLottieReact src="https://lottie.host/0586338a-c54d-4c8e-b19c-4570477053a0/YvCHf5kV2P.lottie" loop autoplay className="w-24 h-24" />
                    </div>
                    {/* Floating items */}
                    <div className="absolute top-10 left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center p-2 z-20">
                      <img src="/icons/airplane-svgrepo-com (1).svg" alt="Airplane" className="w-full h-full object-contain" />
                    </div>
                    <div className="absolute bottom-16 right-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center p-2 z-20">
                      <img src="/icons/car-svgrepo-com.svg" alt="Car" className="w-full h-full object-contain" />
                    </div>
                    <div className="absolute top-20 right-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-lg z-20">🧳</div>
                    <div className="absolute bottom-10 left-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-lg z-20">🗺️</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{whyUsCards[3]?.title}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{whyUsCards[3]?.desc}</p>
                  </div>
                </motion.div>
              </div>

              {/* COLUMN 3 */}
              <div className="flex flex-col gap-6">
                {/* Card 5: Purple Band List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md flex flex-col min-h-[400px] md:h-[460px] overflow-hidden"
                >
                  <div className="w-full relative flex-1 flex flex-col justify-center mb-6">
                    {/* Background items */}
                    <div className="space-y-4 px-2 relative z-0">
                      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-[10px]">×</div>
                        <div className="flex-1">
                          <div className="text-[11px] font-bold text-slate-800 mb-1">{isRtl ? "حجز غير مكتمل" : "Booking Incomplete"}</div>
                          <div className="text-[9px] text-slate-400">{isRtl ? "بيانات ناقصة" : "Missing details"}</div>
                        </div>
                      </div>
                      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-[10px]">×</div>
                        <div className="flex-1">
                          <div className="text-[11px] font-bold text-slate-800 mb-1">{isRtl ? "فشل الدفع" : "Payment Failed"}</div>
                          <div className="text-[9px] text-slate-400">{isRtl ? "تم رفض البطاقة" : "Card declined"}</div>
                        </div>
                      </div>
                      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-[10px]">✓</div>
                        <div className="flex-1">
                          <div className="text-[11px] font-bold text-slate-800 mb-1">{isRtl ? "تم تأكيد الحجز" : "Booking Confirmed"}</div>
                          <div className="text-[9px] text-slate-400">{isRtl ? "كل شيء جاهز" : "All set"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Gradient Band */}
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-16 bg-gradient-to-r from-brand-purple to-brand-blue shadow-xl z-10 flex items-center justify-center overflow-hidden" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                      <span className="text-white font-bold text-lg md:text-xl tracking-wide opacity-95 text-center px-4">
                        {t("common.brand")} {t("common.brandSub")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{whyUsCards[4]?.title}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{whyUsCards[4]?.desc}</p>
                  </div>
                </motion.div>

                {/* Card 6: Top Gradient Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-[2rem] p-2 pb-8 border border-slate-200 shadow-md flex flex-col min-h-[400px] md:h-[440px]"
                >
                  <div className="w-full h-48 rounded-[1.5rem] animate-mesh mb-8 relative overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(-45deg, #a78bfa, #38bdf8, #818cf8, #22d3ee)', backgroundSize: '400% 400%', animation: 'mesh 8s ease infinite' }}>
                    <DotLottieReact src="https://lottie.host/1468e726-1b22-4bfb-836b-f673bc08f51c/xuurHOhPSS.lottie" loop autoplay style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div className="px-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-slate-900">{whyUsCards[5]?.title}</h3>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">{whyUsCards[5]?.desc}</p>
                    </div>
                    <div className="mt-8">
                      <AnimatedCtaButton
                        onClick={() => {
                          window.location.href = "/contact/"
                        }}
                      >
                        {isRtl ? "نظم فعاليتك" : "Plan Your Event"}
                      </AnimatedCtaButton>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <EventsInspireSection settings={siteContent?.homepage?.eventsInspireSection} />

        {/* Section D: FAQ (New - Based on Reference) */}
        <FaqSection />
      </main>

      <FinalCtaSection settings={siteContent?.homepageFinalCta} />
      <Footer />
    </div>
  )
}
