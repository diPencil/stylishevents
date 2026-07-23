"use client"

import { Activity, DatabaseZap, FileCheck2, Gauge, Handshake, Route, ShieldCheck, TicketCheck } from "lucide-react"
import { FeatureGrid, PageHero, PublicPageFrame, SectionHeader, SplitPanel, Timeline } from "@/components/public/page-building-blocks"
import { processSteps, servicePillars, trustItems, whyUsReasons } from "@/lib/public-pages-content"
import { useLanguage } from "@/contexts/language-context"

export default function WhyUsPage() {
  const { isRtl } = useLanguage()

  return (
    <PublicPageFrame>
      <PageHero
        eyebrowEn="Why Stylish Events?"
        eyebrowAr="لماذا Stylish Events؟"
        titleEn="Because event success depends on details guests never see"
        titleAr="لأن نجاح الفعالية يعتمد على تفاصيل لا يراها الحضور"
        subtitleEn="Stylish Events combines event operations, booking logic, attendee experience, QR validation, certificates, reviews, and reporting in one practical workflow."
        subtitleAr="Stylish Events تجمع تشغيل الفعاليات ومنطق الحجز وتجربة الحضور والتحقق بالـ QR والشهادات والتقييمات والتقارير في مسار عملي واحد."
        stats={[
          { value: "1", labelEn: "Connected workflow", labelAr: "مسار مترابط" },
          { value: "5", labelEn: "Delivery stages", labelAr: "مراحل تسليم" },
          { value: "100%", labelEn: "Operational visibility", labelAr: "وضوح تشغيلي" },
          { value: "Live", labelEn: "Attendance tracking", labelAr: "متابعة حضور" },
        ]}
      />

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader
            eyebrowEn="Decision reasons"
            eyebrowAr="أسباب الاختيار"
            titleEn="A system and team built for event pressure"
            titleAr="نظام وفريق مصممان لضغط الفعاليات"
            subtitleEn="The difference appears when bookings increase, doors open, customers ask questions, and organizers need clear numbers."
            subtitleAr="الفرق يظهر وقت زيادة الحجوزات وفتح الأبواب وأسئلة العملاء واحتياج المنظم لأرقام واضحة."
          />
          <FeatureGrid items={whyUsReasons} />
        </div>
      </section>

      <SplitPanel
        titleEn="A practical platform, not a disconnected set of pages"
        titleAr="منصة عملية وليست صفحات منفصلة"
        textEn="The public website, booking forms, admin dashboard, customer records, QR console, and certificate builder should speak the same language."
        textAr="الموقع العام ونماذج الحجز والداشبورد وسجلات العملاء وكونسول QR وبيلدر الشهادات لازم يتكلموا نفس اللغة."
        bullets={[
          { en: "Customers discover events through clean public pages.", ar: "العملاء يكتشفون الفعاليات من صفحات عامة واضحة." },
          { en: "Bookings become trackable orders, tickets, and attendee records.", ar: "الحجوزات تتحول إلى طلبات وتذاكر وسجلات حضور قابلة للمتابعة." },
          { en: "Event-day staff use QR and check-in status instead of manual lists.", ar: "فريق يوم الفعالية يستخدم QR وحالة الدخول بدل القوائم اليدوية." },
          { en: "After the event, certificates, cards, reviews, and reports close the loop.", ar: "بعد الفعالية تغلق الشهادات والكروت والتقييمات والتقارير الدائرة." },
        ]}
      />

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader
            eyebrowEn="Delivery flow"
            eyebrowAr="مسار التسليم"
            titleEn="From first brief to final report"
            titleAr="من أول بريف حتى التقرير النهائي"
          />
          <Timeline steps={processSteps} />
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHeader
                align="start"
                eyebrowEn="Coverage"
                eyebrowAr="التغطية"
                titleEn="The operational scope is wider than ticket sales"
                titleAr="النطاق التشغيلي أوسع من بيع التذاكر"
                subtitleEn="A successful event needs structured content, reliable registration, live access control, and post-event delivery."
                subtitleAr="الفعالية الناجحة تحتاج محتوى منظم وتسجيل موثوق وتحكم مباشر في الدخول وتسليم ما بعد الحدث."
              />
              <p className="text-sm font-bold leading-7 text-slate-500">
                {isRtl ? "عشان كده الصفحات والداشبورد لازم يبقوا مبنيين حول نفس رحلة العميل والمنظم." : "That is why the website and dashboard are designed around the same customer and organizer journey."}
              </p>
            </div>
            <FeatureGrid
              items={[
                { icon: Route, titleEn: "Journey mapping", titleAr: "رسم رحلة العميل", textEn: "Every step is designed from discovery to certificate delivery.", textAr: "كل خطوة مصممة من اكتشاف الفعالية حتى تسليم الشهادة." },
                { icon: Gauge, titleEn: "Live visibility", titleAr: "وضوح مباشر", textEn: "Operations teams can see capacity, payment, and check-in status quickly.", textAr: "فرق التشغيل ترى السعة والدفع والدخول بسرعة." },
                { icon: DatabaseZap, titleEn: "Structured data", titleAr: "بيانات منظمة", textEn: "Event, ticket, booking, attendee, review, and certificate data stay connected.", textAr: "بيانات الفعالية والتذكرة والحجز والحضور والتقييم والشهادة تبقى مترابطة." },
                { icon: FileCheck2, titleEn: "Delivery proof", titleAr: "إثبات التسليم", textEn: "Certificates and cards have clear states and action history.", textAr: "الشهادات والكروت لها حالات واضحة وسجل إجراءات." },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="container mx-auto max-w-7xl rounded-[36px] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-12">
          <SectionHeader
            eyebrowEn="What clients feel"
            eyebrowAr="ما يشعر به العملاء"
            titleEn="Organized, calm, and controlled"
            titleAr="تنظيم وهدوء وتحكم"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.labelEn} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-extrabold text-slate-700">{isRtl ? item.labelAr : item.labelEn}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </PublicPageFrame>
  )
}
