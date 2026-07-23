"use client"

import { Building2, CheckCircle2, Compass, FileText, HeartHandshake, Landmark, Target, UsersRound } from "lucide-react"
import { FeatureGrid, PageHero, PublicPageFrame, SectionHeader, SplitPanel, Timeline } from "@/components/public/page-building-blocks"
import { companyStats, processSteps, servicePillars } from "@/lib/public-pages-content"
import { useLanguage } from "@/contexts/language-context"

export default function AboutPage() {
  const { isRtl } = useLanguage()

  return (
    <PublicPageFrame>
      <PageHero
        eyebrowEn="About Stylish Events"
        eyebrowAr="عن Stylish Events"
        titleEn="We help organizers turn complex event operations into a controlled experience"
        titleAr="نساعد المنظمين على تحويل تشغيل الفعاليات المعقد إلى تجربة منضبطة"
        subtitleEn="Stylish Events is built for teams that need more than a booking form: event setup, ticketing, attendee handling, QR access, certificates, reviews, and reporting."
        subtitleAr="Stylish Events مصممة للفرق التي تحتاج أكثر من نموذج حجز: إعداد فعاليات، تذاكر، إدارة حضور، دخول QR، شهادات، تقييمات، وتقارير."
        stats={companyStats}
      />

      <SplitPanel
        titleEn="Our role is to connect the commercial and operational sides of every event"
        titleAr="دورنا هو ربط الجانب التجاري والتشغيلي لكل فعالية"
        textEn="A strong event experience is not created by design alone. It needs a clear operating model, accurate data, reliable customer communication, and a dashboard that shows the truth."
        textAr="تجربة الفعالية القوية لا يصنعها التصميم وحده. تحتاج نموذج تشغيل واضح وبيانات دقيقة وتواصل موثوق مع العملاء وداشبورد يعرض الحقيقة."
        bullets={[
          { en: "We design event journeys around attendees, organizers, and on-site teams.", ar: "نصمم رحلة الفعالية حول الحضور والمنظمين وفرق الموقع." },
          { en: "We treat bookings, tickets, QR tokens, and certificates as one connected chain.", ar: "نتعامل مع الحجوزات والتذاكر ورموز QR والشهادات كسلسلة واحدة مترابطة." },
          { en: "We keep operational states visible so teams can act without guessing.", ar: "نجعل حالات التشغيل واضحة حتى تتصرف الفرق بدون تخمين." },
          { en: "We prepare pages and dashboards for desktop, tablet, and mobile usage.", ar: "نجهز الصفحات والداشبورد لاستخدام الديسكتوب والتابلت والموبايل." },
        ]}
      />

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader
            eyebrowEn="Company focus"
            eyebrowAr="تركيز الشركة"
            titleEn="What we manage for organizers"
            titleAr="ما الذي نديره للمنظمين"
            subtitleEn="Our platform and operations are shaped around the details that decide whether an event feels smooth or stressful."
            subtitleAr="منصتنا وتشغيلنا مبنيان حول التفاصيل التي تحدد هل تبدو الفعالية سلسة أم مرهقة."
          />
          <FeatureGrid items={servicePillars} />
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { icon: Target, titleEn: "Mission", titleAr: "المهمة", textEn: "Make event operations measurable, manageable, and easier to improve.", textAr: "جعل تشغيل الفعاليات قابلًا للقياس والإدارة والتحسين." },
              { icon: Compass, titleEn: "Vision", titleAr: "الرؤية", textEn: "Become the regional operating layer for professional event booking and attendance.", textAr: "أن نصبح طبقة التشغيل الإقليمية لحجوزات وحضور الفعاليات الاحترافية." },
              { icon: HeartHandshake, titleEn: "Promise", titleAr: "الوعد", textEn: "Give organizers clear control without making customers feel the complexity.", textAr: "منح المنظمين تحكمًا واضحًا دون أن يشعر العملاء بالتعقيد." },
            ].map((item) => {
              const Icon = item.icon
              return (
                <article key={item.titleEn} className="rounded-[32px] bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-6 text-2xl font-black text-[#0f172a]">{isRtl ? item.titleAr : item.titleEn}</h3>
                  <p className="mt-4 text-sm font-medium leading-7 text-slate-500">{isRtl ? item.textAr : item.textEn}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader
            eyebrowEn="How we work"
            eyebrowAr="كيف نعمل"
            titleEn="A repeatable process for different event sizes"
            titleAr="عملية قابلة للتكرار لمختلف أحجام الفعاليات"
          />
          <Timeline steps={processSteps} />
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="container mx-auto max-w-7xl rounded-[36px] bg-[#0f172a] p-8 text-white md:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Stylish Events standard</p>
              <h2 className="mt-4 text-3xl font-black md:text-5xl">{isRtl ? "التفاصيل الصغيرة هي التي تصنع الثقة" : "Small details create trust"}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Building2, en: "Venue readiness", ar: "جاهزية المكان" },
                { icon: UsersRound, en: "Guest support", ar: "دعم الضيوف" },
                { icon: Landmark, en: "Partner coordination", ar: "تنسيق الشركاء" },
                { icon: FileText, en: "Clear documentation", ar: "توثيق واضح" },
                { icon: CheckCircle2, en: "Post-event closure", ar: "إغلاق ما بعد الفعالية" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.en} className="flex items-center gap-3 rounded-2xl bg-white/8 p-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-extrabold">{isRtl ? item.ar : item.en}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </PublicPageFrame>
  )
}
