"use client"

import { ArrowRight, Building2, CalendarDays, Mail, MessageSquareText, Phone, Send, UserRound } from "lucide-react"
import { FeatureGrid, PageHero, PublicPageFrame, SectionHeader } from "@/components/public/page-building-blocks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { contactChannels, contactSubjects } from "@/lib/public-pages-content"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

export default function ContactPage() {
  const { isRtl } = useLanguage()

  return (
    <PublicPageFrame>
      <PageHero
        eyebrowEn="Contact"
        eyebrowAr="تواصل معنا"
        titleEn="Tell us about the event you want to build"
        titleAr="احكِ لنا عن الفعالية التي تريد بناءها"
        subtitleEn="Whether you are planning a conference, exhibition, private forum, or customer experience program, our team can help define the operating model before launch."
        subtitleAr="سواء كنت تخطط لمؤتمر أو معرض أو منتدى خاص أو برنامج تجربة عملاء، يستطيع فريقنا مساعدتك في تحديد نموذج التشغيل قبل الإطلاق."
        stats={[
          { value: "24h", labelEn: "Initial response", labelAr: "رد أولي" },
          { value: "4", labelEn: "Request tracks", labelAr: "مسارات طلب" },
          { value: "3", labelEn: "Regional markets", labelAr: "أسواق إقليمية" },
          { value: "Live", labelEn: "Ops support", labelAr: "دعم تشغيل" },
        ]}
      />

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[36px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-10">
              <SectionHeader
                align="start"
                eyebrowEn="Request details"
                eyebrowAr="تفاصيل الطلب"
                titleEn="Send a clear event brief"
                titleAr="أرسل بريف واضح للفعالية"
                subtitleEn="The more precise the brief, the faster we can suggest ticketing, capacity, QR, certificates, and support workflows."
                subtitleAr="كلما كان البريف أوضح، استطعنا اقتراح التذاكر والسعة والـ QR والشهادات ومسارات الدعم بسرعة."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <ContactField icon={UserRound} label={isRtl ? "الاسم الكامل" : "Full name"} placeholder={isRtl ? "اكتب اسمك" : "Your name"} />
                <ContactField icon={Mail} label={isRtl ? "البريد الإلكتروني" : "Email"} placeholder="name@example.com" />
                <ContactField icon={Phone} label={isRtl ? "رقم الهاتف" : "Phone"} placeholder="+20 100 000 0000" />
                <ContactField icon={Building2} label={isRtl ? "الشركة / الجهة" : "Company"} placeholder={isRtl ? "اسم الجهة" : "Organization name"} />
                <ContactField icon={CalendarDays} label={isRtl ? "تاريخ الفعالية المتوقع" : "Expected date"} placeholder={isRtl ? "مثال: سبتمبر 2026" : "Example: Sep 2026"} />
                <div className="space-y-2">
                  <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{isRtl ? "نوع الطلب" : "Request type"}</Label>
                  <select className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-primary">
                    {contactSubjects.map((subject) => (
                      <option key={subject.en}>{isRtl ? subject.ar : subject.en}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{isRtl ? "تفاصيل الفعالية" : "Event details"}</Label>
                  <Textarea
                    className="min-h-[150px] rounded-2xl border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-7"
                    placeholder={isRtl ? "عدد الحضور المتوقع، المدينة، نوع التذاكر، الخدمات المطلوبة..." : "Expected attendees, city, ticket types, required services..."}
                  />
                </div>
              </div>

              <Button className="mt-6 h-12 rounded-2xl px-6 font-extrabold">
                <Send className="h-4 w-4" />
                {isRtl ? "إرسال الطلب" : "Send request"}
                <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="rounded-[36px] bg-[#0f172a] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{isRtl ? "قبل التواصل" : "Before contacting"}</p>
                <h2 className="mt-4 text-3xl font-black leading-tight">{isRtl ? "ما الذي يساعدنا على الرد بدقة؟" : "What helps us respond accurately?"}</h2>
                <div className="mt-6 space-y-3">
                  {[
                    { en: "Expected attendance and ticket categories.", ar: "عدد الحضور المتوقع وفئات التذاكر." },
                    { en: "City, venue status, and preferred event dates.", ar: "المدينة وحالة المكان والتواريخ المفضلة." },
                    { en: "Whether QR check-in, certificates, or event cards are required.", ar: "هل تحتاج QR أو شهادات أو كروت فعالية." },
                    { en: "Any VIP, hotel, reception, or transportation needs.", ar: "أي احتياجات VIP أو فندقة أو استقبال أو انتقالات." },
                  ].map((item) => (
                    <div key={item.en} className="flex gap-3 rounded-2xl bg-white/8 p-4">
                      <MessageSquareText className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm font-bold leading-7 text-white/80">{isRtl ? item.ar : item.en}</p>
                    </div>
                  ))}
                </div>
              </div>

              <FeatureGrid items={contactChannels.map((channel) => ({
                icon: channel.icon,
                titleEn: channel.titleEn,
                titleAr: channel.titleAr,
                textEn: channel.textEn,
                textAr: channel.textAr,
              }))} />
            </div>
          </div>
        </div>
      </section>
    </PublicPageFrame>
  )
}

function ContactField({ icon: Icon, label, placeholder }: { icon: typeof UserRound; label: string; placeholder: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-primary">
        <Icon className="h-4 w-4 text-primary" />
        <Input className="h-10 border-0 bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0" placeholder={placeholder} />
      </div>
    </div>
  )
}
