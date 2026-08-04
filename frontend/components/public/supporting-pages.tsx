"use client"

import Link from "next/link"
import { ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, CircleHelp, ClipboardCheck, DoorOpen, Headphones, MapPin, QrCode, Ticket } from "lucide-react"
import { PublicPageFrame, PublicPageHero } from "@/components/public/page-building-blocks"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Pair = { en: string; ar: string }
type CardItem = Pair & { icon: LucideIcon; textEn: string; textAr: string }
type StepItem = Pair & { textEn: string; textAr: string }
type FaqItem = { questionEn: string; questionAr: string; answerEn: string; answerAr: string }

const heroImages = {
  reception: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop",
  faq: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop",
  account: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop",
  registration: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop",
}

function choose(isRtl: boolean, en: string, ar: string) {
  return isRtl ? ar : en
}

function ArrowIcon({ isRtl }: { isRtl: boolean }) {
  return <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
}

function SectionIntro({ eyebrow, title, description, align = "center" }: { eyebrow: Pair; title: Pair; description?: Pair; align?: "center" | "start" }) {
  const { isRtl } = useLanguage()
  return (
    <div className={cn("mb-10", align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl")}>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{choose(isRtl, eyebrow.en, eyebrow.ar)}</p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-4xl lg:text-5xl">{choose(isRtl, title.en, title.ar)}</h2>
      {description ? <p className="mt-4 text-base font-medium leading-8 text-slate-600">{choose(isRtl, description.en, description.ar)}</p> : null}
    </div>
  )
}

function InfoGrid({ items }: { items: CardItem[] }) {
  const { isRtl } = useLanguage()
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <article key={item.en} className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-slate-950">{choose(isRtl, item.en, item.ar)}</h3>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{choose(isRtl, item.textEn, item.textAr)}</p>
          </article>
        )
      })}
    </div>
  )
}

function StepCards({ steps }: { steps: StepItem[] }) {
  const { isRtl } = useLanguage()
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <article key={step.en} className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white">{index + 1}</span>
          <h3 className="mt-5 text-xl font-black text-slate-950">{choose(isRtl, step.en, step.ar)}</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{choose(isRtl, step.textEn, step.textAr)}</p>
        </article>
      ))}
    </div>
  )
}

function AccountTimeline({ steps }: { steps: StepItem[] }) {
  const { isRtl } = useLanguage()

  return (
    <ol className="relative mx-auto max-w-4xl space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-5 top-5 w-px bg-gradient-to-b from-primary/25 via-primary/55 to-primary/25",
          isRtl ? "right-5" : "left-5",
        )}
      />
      {steps.map((step, index) => (
        <li
          key={step.en}
          className={cn("relative min-h-24", isRtl ? "pr-16 md:pr-20" : "pl-16 md:pl-20")}
        >
          <span
            className={cn(
              "absolute top-2 z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-[0_14px_34px_rgba(15,23,42,0.14)] ring-8 ring-primary/10",
              isRtl ? "right-0" : "left-0",
            )}
            dir="ltr"
          >
            {index + 1}
          </span>
          <article className="w-full rounded-[28px] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-6">
            <h3 className="text-xl font-black text-slate-950">{choose(isRtl, step.en, step.ar)}</h3>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{choose(isRtl, step.textEn, step.textAr)}</p>
          </article>
        </li>
      ))}
    </ol>
  )
}

function CtaPanel({ title, text, primary, secondary }: { title: Pair; text: Pair; primary: Pair & { href: string }; secondary?: Pair & { href: string } }) {
  const { isRtl } = useLanguage()
  return (
    <section className="px-4 py-16 sm:px-6 lg:py-20" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 rounded-[36px] bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-black md:text-4xl lg:text-5xl">{choose(isRtl, title.en, title.ar)}</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-white/70 md:text-base">{choose(isRtl, text.en, text.ar)}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button asChild className="h-12 rounded-full px-6 font-extrabold">
              <Link href={primary.href}>{choose(isRtl, primary.en, primary.ar)} <ArrowIcon isRtl={isRtl} /></Link>
            </Button>
            {secondary ? (
              <Button asChild variant="outline" className="h-12 rounded-full border-white/20 bg-white/10 px-6 font-extrabold text-white hover:bg-white hover:text-slate-950">
                <Link href={secondary.href}>{choose(isRtl, secondary.en, secondary.ar)}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ReceptionAndFarewellPageContent() {
  const { isRtl } = useLanguage()
  const inclusions: CardItem[] = [
    { icon: DoorOpen, en: "Guest reception", ar: "استقبال الضيوف", textEn: "Welcome attendees at arrival points and guide them into the venue flow.", textAr: "استقبال الحضور عند نقاط الوصول وتوجيههم داخل مسار الفعالية." },
    { icon: ClipboardCheck, en: "Registration desk support", ar: "دعم مكتب التسجيل", textEn: "Assist with registration desk organization, queues, lists, badges, and attendee guidance.", textAr: "دعم تنظيم مكتب التسجيل والصفوف والقوائم والبطاقات وإرشاد الحضور." },
    { icon: BadgeCheck, en: "VIP and speaker handling", ar: "استقبال كبار الضيوف والمتحدثين", textEn: "Coordinate a clear arrival experience for speakers, VIP guests, and invited partners.", textAr: "تنسيق تجربة وصول واضحة للمتحدثين وكبار الضيوف والشركاء المدعوين." },
    { icon: MapPin, en: "Venue orientation", ar: "إرشاد داخل الموقع", textEn: "Guide guests to halls, sessions, support points, and departure locations.", textAr: "توجيه الضيوف إلى القاعات والجلسات ونقاط الدعم ومواقع المغادرة." },
  ]

  return (
    <PublicPageFrame>
      <PublicPageHero
        title={choose(isRtl, "Reception and Farewell", "الاستقبال والتوديع")}
        description={choose(isRtl, "A calm, organized hospitality experience from first arrival to final departure.", "تجربة ضيافة منظمة من لحظة الوصول الأولى حتى المغادرة النهائية.")}
        backgroundImage={heroImages.reception}
        imageAlt={choose(isRtl, "Event reception team", "فريق استقبال فعالية")}
      />

      <section className="bg-white px-4 py-16 sm:px-6 lg:py-24" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="overflow-hidden rounded-[32px] bg-slate-100 shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
              <img src={heroImages.reception} alt={choose(isRtl, "Guests arriving at a professional event", "وصول الضيوف إلى فعالية احترافية")} className="h-[360px] w-full object-cover md:h-[460px]" />
            </div>
            <div>
              <SectionIntro
                align="start"
                eyebrow={{ en: "Hospitality operations", ar: "تشغيل الضيافة" }}
                title={{ en: "A smoother guest journey on event day", ar: "رحلة حضور أكثر سلاسة يوم الفعالية" }}
                description={{
                  en: "Stylish Events supports event teams with reception, guidance, and departure coordination so attendees feel welcomed, informed, and looked after throughout the venue experience.",
                  ar: "تدعم Stylish Events فرق الفعاليات في الاستقبال والإرشاد وتنسيق المغادرة حتى يشعر الحضور بالترحيب والوضوح والمتابعة طوال تجربة الموقع.",
                }}
              />
              <div className="grid gap-3">
                {[
                  { en: "Clear arrival and queue handling.", ar: "تنظيم واضح للوصول والصفوف." },
                  { en: "On-site support aligned with registration and check-in needs.", ar: "دعم ميداني متوافق مع احتياجات التسجيل والتحقق." },
                  { en: "Professional farewell arrangements for guests and delegations.", ar: "ترتيبات توديع احترافية للضيوف والوفود." },
                ].map((item) => (
                  <div key={item.en} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-sm font-bold leading-7 text-slate-700">{choose(isRtl, item.en, item.ar)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:py-24" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-7xl">
          <SectionIntro
            eyebrow={{ en: "Service includes", ar: "تشمل الخدمة" }}
            title={{ en: "Reception support built around real event movement", ar: "دعم استقبال مبني حول حركة الفعالية الفعلية" }}
            description={{ en: "The service focuses on practical guest movement, not decorative promises.", ar: "تركز الخدمة على حركة الضيوف العملية وليس وعودا شكلية." }}
          />
          <InfoGrid items={inclusions} />
        </div>
      </section>

      <CtaPanel
        title={{ en: "Need reception support for your next event?", ar: "تحتاج دعما للاستقبال في فعاليتك القادمة؟" }}
        text={{ en: "Send a clear event brief and our team will review the reception, guidance, and departure needs with you.", ar: "أرسل ملخص الفعالية وسيراجع فريقنا احتياجات الاستقبال والإرشاد والمغادرة معك." }}
        primary={{ en: "Contact Us", ar: "تواصل معنا", href: "/contact" }}
        secondary={{ en: "Browse Events", ar: "تصفح الفعاليات", href: "/upcoming-events" }}
      />
    </PublicPageFrame>
  )
}

export function FaqPageContent() {
  const { isRtl } = useLanguage()
  const faqs: FaqItem[] = [
    { questionEn: "How do I create a customer account?", questionAr: "كيف أنشئ حساب عميل؟", answerEn: "Open the account registration page, enter your full name, email, phone, country, profile details, password, and accept the terms before submitting the form.", answerAr: "افتح صفحة إنشاء الحساب، ثم أدخل الاسم بالكامل والبريد الإلكتروني والهاتف والدولة وبيانات الملف وكلمة المرور، ووافق على الشروط قبل إرسال النموذج." },
    { questionEn: "How do I log in?", questionAr: "كيف أسجل الدخول؟", answerEn: "Use the Login page with your email or username and password. After login, the system sends customers to the customer dashboard.", answerAr: "استخدم صفحة تسجيل الدخول بالبريد الإلكتروني أو اسم المستخدم وكلمة المرور. بعد الدخول يتم توجيه العملاء إلى لوحة العميل." },
    { questionEn: "Where can I browse upcoming events?", questionAr: "أين أجد الفعاليات القادمة؟", answerEn: "Use the Upcoming Events page from the main navigation or footer, then open any available event to review details and ticket options.", answerAr: "استخدم صفحة الفعاليات القادمة من القائمة أو الفوتر، ثم افتح أي فعالية متاحة لمراجعة التفاصيل وخيارات التذاكر." },
    { questionEn: "How do I register for an event?", questionAr: "كيف أسجل في فعالية؟", answerEn: "Open the event details page, review the tickets, select the available ticket, complete the registration form, and submit it. Some events may require login first.", answerAr: "افتح صفحة تفاصيل الفعالية، راجع التذاكر، اختر التذكرة المتاحة، أكمل نموذج التسجيل ثم أرسله. بعض الفعاليات قد تتطلب تسجيل الدخول أولا." },
    { questionEn: "When is my QR ticket available?", questionAr: "متى يظهر QR الخاص بالتذكرة؟", answerEn: "QR tickets are available after the registration is approved or immediately for free tickets when the event policy allows it.", answerAr: "تظهر تذاكر QR بعد اعتماد التسجيل أو مباشرة للتذاكر المجانية عندما تسمح سياسة الفعالية بذلك." },
    { questionEn: "Where can I track registrations and tickets?", questionAr: "أين أتابع التسجيلات والتذاكر؟", answerEn: "After logging in, open the customer dashboard to view registrations, approved tickets, QR status, profile information, and support options.", answerAr: "بعد تسجيل الدخول افتح لوحة العميل لعرض التسجيلات والتذاكر المعتمدة وحالة QR وبيانات الملف وخيارات الدعم." },
    { questionEn: "Can I attend with the QR ticket?", questionAr: "هل يمكنني الحضور باستخدام QR؟", answerEn: "Yes, when your ticket is active, event staff can scan the QR at check-in. A QR that has already been checked in cannot be reused.", answerAr: "نعم، عندما تكون تذكرتك نشطة يستطيع فريق الفعالية فحص QR عند الدخول. لا يمكن استخدام QR تم تسجيل حضوره مرة أخرى." },
    { questionEn: "When can I receive certificates?", questionAr: "متى أحصل على الشهادة؟", answerEn: "Certificates are available only for events that support certificates and after the required attendance or approval conditions are met.", answerAr: "تتاح الشهادات فقط للفعاليات التي تدعم الشهادات وبعد تحقق شروط الحضور أو الاعتماد المطلوبة." },
    { questionEn: "Who can submit a review?", questionAr: "من يمكنه إرسال تقييم؟", answerEn: "Review eligibility depends on the event lifecycle and your registration or attendance status. If eligible, the event page or dashboard shows the available review action.", answerAr: "تعتمد أهلية التقييم على دورة الفعالية وحالة تسجيلك أو حضورك. إذا كنت مؤهلا سيظهر إجراء التقييم في صفحة الفعالية أو لوحة العميل." },
    { questionEn: "How do I contact the Stylish Events team?", questionAr: "كيف أتواصل مع فريق Stylish Events؟", answerEn: "Use the Contact page for event planning, technical support, registration questions, partnerships, or existing booking help.", answerAr: "استخدم صفحة تواصل معنا لطلبات تنظيم الفعاليات أو الدعم الفني أو أسئلة التسجيل أو الشراكات أو متابعة حجز قائم." },
    { questionEn: "Can I update my account information?", questionAr: "هل يمكنني تحديث بيانات حسابي؟", answerEn: "Yes, customers can use the profile area in the dashboard for supported account details such as profile and avatar information.", answerAr: "نعم، يمكن للعملاء استخدام قسم الملف الشخصي في لوحة العميل لتحديث البيانات المدعومة مثل بيانات الملف والصورة الشخصية." },
  ]

  return (
    <PublicPageFrame>
      <PublicPageHero
        title={choose(isRtl, "Frequently Asked Questions", "الأسئلة الشائعة")}
        description={choose(isRtl, "Practical answers about accounts, event registration, QR tickets, certificates, and support.", "إجابات عملية حول الحسابات والتسجيل في الفعاليات وتذاكر QR والشهادات والدعم.")}
        backgroundImage={heroImages.faq}
        imageAlt={choose(isRtl, "Support desk discussion", "مناقشة في مكتب الدعم")}
      />
      <section className="px-4 py-16 sm:px-6 lg:py-24" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-4xl">
          <SectionIntro
            eyebrow={{ en: "Support", ar: "الدعم" }}
            title={{ en: "Answers based on the actual platform workflow", ar: "إجابات مبنية على سير عمل المنصة الفعلي" }}
            description={{ en: "These questions cover the public event journey and customer dashboard experience currently available in Stylish Events.", ar: "تغطي هذه الأسئلة رحلة الفعاليات العامة وتجربة لوحة العميل المتاحة حاليا في Stylish Events." }}
          />
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.questionEn} className="group rounded-[24px] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-slate-950">
                  <span>{choose(isRtl, faq.questionEn, faq.questionAr)}</span>
                  <CircleHelp className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">{choose(isRtl, faq.answerEn, faq.answerAr)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PublicPageFrame>
  )
}

export function CreateAccountGuidePageContent() {
  const { isRtl } = useLanguage()
  return (
    <PublicPageFrame>
      <PublicPageHero
        title={choose(isRtl, "How to Create an Account", "كيفية إنشاء حساب")}
        description={choose(isRtl, "Create your customer profile so you can access registrations, tickets, and account updates.", "أنشئ ملف العميل حتى تتمكن من الوصول إلى التسجيلات والتذاكر وتحديثات الحساب.")}
        backgroundImage={heroImages.account}
        imageAlt={choose(isRtl, "Customer account setup", "إعداد حساب العميل")}
      />
      <section className="px-4 py-16 sm:px-6 lg:py-24" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-7xl">
          <SectionIntro
            eyebrow={{ en: "Customer account", ar: "حساب العميل" }}
            title={{ en: "A clear path from signup to dashboard", ar: "مسار واضح من إنشاء الحساب إلى لوحة العميل" }}
            description={{ en: "The registration form collects the account details required by the current platform workflow.", ar: "يجمع نموذج التسجيل بيانات الحساب المطلوبة في سير عمل المنصة الحالي." }}
          />
          <AccountTimeline
            steps={[
              { en: "Open Create Account", ar: "افتح إنشاء الحساب", textEn: "Start from the account registration page linked below.", textAr: "ابدأ من صفحة إنشاء الحساب المرتبطة بالأسفل." },
              { en: "Enter contact details", ar: "أدخل بيانات التواصل", textEn: "Add full name, email, phone, country, and country code.", textAr: "أضف الاسم بالكامل والبريد الإلكتروني والهاتف والدولة وكود الدولة." },
              { en: "Complete profile details", ar: "أكمل بيانات الملف", textEn: "Add username, gender, company, and avatar URL or upload when needed.", textAr: "أضف اسم المستخدم والنوع والشركة ورابط الصورة أو ارفعها عند الحاجة." },
              { en: "Set password and agree", ar: "عيّن كلمة المرور ووافق", textEn: "Enter your password, accept the terms and privacy policy, then submit.", textAr: "أدخل كلمة المرور ووافق على الشروط وسياسة الخصوصية ثم أرسل النموذج." },
              { en: "Log in", ar: "سجل الدخول", textEn: "Use your email or username and password on the Login page.", textAr: "استخدم البريد الإلكتروني أو اسم المستخدم وكلمة المرور في صفحة الدخول." },
              { en: "Open dashboard", ar: "افتح لوحة العميل", textEn: "Access the customer dashboard to view registrations, tickets, profile, and support.", textAr: "ادخل إلى لوحة العميل لعرض التسجيلات والتذاكر والملف الشخصي والدعم." },
            ]}
          />
        </div>
      </section>
      <CtaPanel
        title={{ en: "Ready to create your account?", ar: "جاهز لإنشاء حسابك؟" }}
        text={{ en: "Create a customer account, then log in to manage your event registrations and tickets.", ar: "أنشئ حساب عميل ثم سجل الدخول لإدارة تسجيلاتك وتذاكرك." }}
        primary={{ en: "Create Account", ar: "إنشاء حساب", href: "/signup" }}
        secondary={{ en: "Login", ar: "تسجيل الدخول", href: "/login" }}
      />
    </PublicPageFrame>
  )
}

export function RegisterForEventGuidePageContent() {
  const { isRtl } = useLanguage()
  return (
    <PublicPageFrame>
      <PublicPageHero
        title={choose(isRtl, "How to Register for an Event", "كيفية التسجيل في فعالية")}
        description={choose(isRtl, "Follow the actual public event checkout journey from browsing events to approved tickets.", "اتبع رحلة التسجيل العامة الفعلية من تصفح الفعاليات حتى التذاكر المعتمدة.")}
        backgroundImage={heroImages.registration}
        imageAlt={choose(isRtl, "Event registration desk", "مكتب تسجيل فعالية")}
      />
      <section className="px-4 py-16 sm:px-6 lg:py-24" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-7xl">
          <SectionIntro
            eyebrow={{ en: "Event registration", ar: "التسجيل في الفعاليات" }}
            title={{ en: "From event discovery to QR ticket access", ar: "من اكتشاف الفعالية إلى الوصول لتذكرة QR" }}
            description={{ en: "This guide follows the registration and approval flow currently implemented in the public event pages and customer dashboard.", ar: "يتبع هذا الدليل مسار التسجيل والاعتماد المطبق حاليا في صفحات الفعاليات العامة ولوحة العميل." }}
          />
          <AccountTimeline
            steps={[
              { en: "Create an account or log in", ar: "أنشئ حسابا أو سجل الدخول", textEn: "Some events require login before registration. Use your customer account when required.", textAr: "بعض الفعاليات تتطلب تسجيل الدخول قبل التسجيل. استخدم حساب العميل عند الحاجة." },
              { en: "Browse Upcoming Events", ar: "تصفح الفعاليات القادمة", textEn: "Open Upcoming Events and choose the event you want to attend.", textAr: "افتح الفعاليات القادمة واختر الفعالية التي تريد حضورها." },
              { en: "Open event details", ar: "افتح تفاصيل الفعالية", textEn: "Review the event description, date, location, available tickets, and registration status.", textAr: "راجع وصف الفعالية والتاريخ والموقع والتذاكر المتاحة وحالة التسجيل." },
              { en: "Select a ticket", ar: "اختر التذكرة", textEn: "Choose an available ticket type with an active price period.", textAr: "اختر نوع تذكرة متاحا وله فترة سعر نشطة." },
              { en: "Submit registration", ar: "أرسل التسجيل", textEn: "Complete the registration form and submit it. The server confirms capacity and pricing.", textAr: "أكمل نموذج التسجيل وأرسله. يؤكد الخادم السعة والسعر." },
              { en: "Track status", ar: "تابع الحالة", textEn: "Use the customer dashboard to follow approval, payment status, ticket access, and QR readiness.", textAr: "استخدم لوحة العميل لمتابعة الاعتماد وحالة الدفع والوصول للتذكرة وجاهزية QR." },
            ]}
          />
        </div>
      </section>
      <section className="bg-white px-4 py-16 sm:px-6 lg:py-20" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-7xl">
          <InfoGrid
            items={[
              { icon: CalendarDays, en: "Event status matters", ar: "حالة الفعالية مهمة", textEn: "Registration is available only when the event and ticket policy allow it.", textAr: "يتاح التسجيل فقط عندما تسمح حالة الفعالية وسياسة التذاكر بذلك." },
              { icon: Ticket, en: "Ticket selection", ar: "اختيار التذكرة", textEn: "The selected ticket controls the price, currency, and registration availability.", textAr: "تتحكم التذكرة المختارة في السعر والعملة وإتاحة التسجيل." },
              { icon: QrCode, en: "QR after approval", ar: "QR بعد الاعتماد", textEn: "QR access appears after approval or for free tickets according to event policy.", textAr: "يظهر QR بعد الاعتماد أو للتذاكر المجانية حسب سياسة الفعالية." },
              { icon: Headphones, en: "Support available", ar: "الدعم متاح", textEn: "Use Contact Us if you need help with an existing registration or booking.", textAr: "استخدم تواصل معنا إذا احتجت مساعدة في تسجيل أو حجز قائم." },
            ]}
          />
        </div>
      </section>
      <CtaPanel
        title={{ en: "Start with the event list", ar: "ابدأ من قائمة الفعاليات" }}
        text={{ en: "Browse available events or log in to check registrations and tickets from your dashboard.", ar: "تصفح الفعاليات المتاحة أو سجل الدخول لمتابعة التسجيلات والتذاكر من لوحة العميل." }}
        primary={{ en: "Upcoming Events", ar: "الفعاليات القادمة", href: "/upcoming-events" }}
        secondary={{ en: "Customer Dashboard", ar: "لوحة العميل", href: "/dashboard" }}
      />
    </PublicPageFrame>
  )
}
