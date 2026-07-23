"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Eye, Globe2, ImageIcon, Menu, Plus, Save, Search, Trash2, Video } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { ImageUrlDropzone } from "@/components/admin/image-url-dropzone"
import { cn } from "@/lib/utils"
import { publicNavLinks } from "@/lib/public-pages-content"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { normalizeSiteContentSettings, DEFAULT_INFORMATION_SECTION_UPCOMING, DEFAULT_INFORMATION_SECTION_PREVIOUS } from "@/lib/site-content-defaults"
import type { EventInformationSectionSettings as TS_EventInformationSectionSettings, EventPageSettingsWithInfo as TS_EventPageSettings } from "@/types/platform"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"

type MenuItemSettings = {
  id: string
  labelEn: string
  labelAr: string
  href: string
  visible: boolean
}

export type WhyUsCard = {
  id: string
  titleEn: string
  titleAr: string
  descEn: string
  descAr: string
}

export type FaqItem = {
  id: string
  qEn: string
  qAr: string
  aEn: string
  aAr: string
}

export type FeatureCard = {
  id: string
  titleEn: string
  titleAr: string
  descEn: string
  descAr: string
}

// Use canonical types from frontend/types/platform.ts
type EventPageSettings = TS_EventPageSettings

type EventInformationSectionSettings = TS_EventInformationSectionSettings

export type FooterLink = {
  id: string
  col: "services" | "support" | "company"
  labelEn: string
  labelAr: string
  href: string
}

export type SocialLink = {
  id: string
  platform: "twitter" | "instagram" | "linkedin" | "facebook" | "youtube" | "tiktok"
  url: string
}

type SiteContentSettings = {
  homepage: {
    eyebrowEn: string
    eyebrowAr: string
    titleEn: string
    titleAr: string
    subtitleEn: string
    subtitleAr: string
    primaryCtaEn: string
    primaryCtaAr: string
    secondaryCtaEn: string
    secondaryCtaAr: string
    heroMediaType: "video" | "image"
    heroMediaUrl: string
    whyUsTitleEn: string
    whyUsTitleAr: string
    whyUsSubtitleEn: string
    whyUsSubtitleAr: string
    showcaseTitleEn: string
    showcaseTitleAr: string
    showcaseDescEn: string
    showcaseDescAr: string
    showcaseCtaEn: string
    showcaseCtaAr: string
    showcaseSortOrder: "latest" | "upcoming" | "default"
    faqEyebrowEn: string
    faqEyebrowAr: string
    faqTitleEn: string
    faqTitleAr: string
    faqSubtitleEn: string
    faqSubtitleAr: string
    faqWhatsappTextEn: string
    faqWhatsappTextAr: string
    faqWhatsappNumber: string
    faqWhatsappUrl?: string
    footerEyebrowEn: string
    footerEyebrowAr: string
    footerTitle1En: string
    footerTitle1Ar: string
    footerTitle2En: string
    footerTitle2Ar: string
    footerDescEn: string
    footerDescAr: string
    footerCtaEn: string
    footerCtaAr: string
    footerLogoDescEn: string
    footerLogoDescAr: string
    footerServicesTitleEn: string
    footerServicesTitleAr: string
    footerSupportTitleEn: string
    footerSupportTitleAr: string
    footerCompanyTitleEn: string
    footerCompanyTitleAr: string
    footerCopyrightEn: string
    footerCopyrightAr: string
  }
  whyUsCards: WhyUsCard[]
  faqs: FaqItem[]
  footerLinks: FooterLink[]
  socialLinks: SocialLink[]
  menu: MenuItemSettings[]
  seo: {
    metaTitle: string
    metaDescription: string
    canonicalUrl: string
    keywords: string
    ogImage: string
    robotsIndex: boolean
    robotsFollow: boolean
  }
  featuresCards: FeatureCard[]
  upcomingEvents?: EventPageSettings
  previousEvents?: EventPageSettings
}

const storageKey = "stylish-events-site-content-settings"

const defaultSettings: SiteContentSettings = {
  homepage: {
    eyebrowEn: "Stylish Events Platform",
    eyebrowAr: "منصة Stylish Events",
    titleEn: "Professional event booking, tickets, and attendance operations",
    titleAr: "نظام احترافي لإدارة حجوزات وتذاكر وحضور الفعاليات",
    subtitleEn: "Create event pages, sell tickets by pricing periods, scan QR codes, and deliver certificates from one connected system.",
    subtitleAr: "أنشئ صفحات الفعاليات، بع التذاكر حسب الفترات السعرية، افحص رموز QR، وأرسل الشهادات من نظام واحد متكامل.",
    primaryCtaEn: "Book your event",
    primaryCtaAr: "احجز فعاليتك",
    secondaryCtaEn: "Explore services",
    secondaryCtaAr: "استكشف الخدمات",
    heroMediaType: "video",
    heroMediaUrl: "/eventsvideo-hero-section.mp4",
    whyUsTitleEn: "Our experience makes your event easier to run",
    whyUsTitleAr: "خبرتنا تجعل تجربة فعاليتك أسهل وأكثر تنظيما",
    whyUsSubtitleEn: "We help teams manage the full event journey from registration to post-event certificates.",
    whyUsSubtitleAr: "لا نكتفي بإدارة الحجز فقط، بل نوفر تجربة تشغيل كاملة من لحظة التسجيل وحتى إصدار الشهادات بعد الحضور.",
    showcaseTitleEn: "Upcoming Events",
    showcaseTitleAr: "الفعاليات القادمة",
    showcaseDescEn: "Browse and book our upcoming conferences and exhibitions",
    showcaseDescAr: "تصفح واحجز في مؤتمراتنا ومعارضنا القادمة",
    showcaseCtaEn: "View All Events",
    showcaseCtaAr: "عرض جميع الفعاليات",
    showcaseSortOrder: "default",
    faqEyebrowEn: "Frequently Asked Questions",
    faqEyebrowAr: "الأسئلة الشائعة",
    faqTitleEn: "Have questions? We have answers",
    faqTitleAr: "لديك استفسار؟ لدينا الإجابة",
    faqSubtitleEn: "Everything you need to know about booking and managing events on our platform.",
    faqSubtitleAr: "كل ما تحتاج معرفته عن استخدام منصتنا",
    faqWhatsappTextEn: "Chat with us on WhatsApp",
    faqWhatsappTextAr: "تواصل معنا عبر واتساب",
    faqWhatsappNumber: "201012345678",
    footerEyebrowEn: "Partner for Your Success",
    footerEyebrowAr: "شريك في النجاح",
    footerTitle1En: "Unlock the Power of",
    footerTitle1Ar: "أطلق العنان لقوة",
    footerTitle2En: "for Your Next Event",
    footerTitle2Ar: "في فعاليتك القادمة",
    footerDescEn: "Join over 500 organizations that trust our platform to organize and manage their most important events.",
    footerDescAr: "انضم إلى أكثر من 500 مؤسسة تثق بمنصتنا لتنظيم وإدارة أهم فعالياتها.",
    footerCtaEn: "Start Organizing Your Event",
    footerCtaAr: "ابدأ تنظيم فعاليتك",
    footerLogoDescEn: "Your professional partner for conferences, exhibitions, tickets, attendance, and certificates.",
    footerLogoDescAr: "شريكك الاحترافي في تنظيم وإدارة المؤتمرات والمعارض والتذاكر والحضور والشهادات.",
    footerServicesTitleEn: "Services",
    footerServicesTitleAr: "خدماتنا",
    footerSupportTitleEn: "Support",
    footerSupportTitleAr: "الدعم",
    footerCompanyTitleEn: "Company",
    footerCompanyTitleAr: "الشركة",
    footerCopyrightEn: "© 2026 Stylish Events. All rights reserved.",
    footerCopyrightAr: "© 2026 Stylish Events. جميع الحقوق محفوظة.",
  },
  upcomingEvents: {
    enabled: true,
    eyebrowEn: "",
    eyebrowAr: "",
    titleEn: "Upcoming Events",
    titleAr: "الفعاليات القادمة",
    descriptionEn: "Discover upcoming events ready for registration.",
    descriptionAr: "اكتشف الفعاليات القادمة المتاحة للتسجيل.",
    emptyTitleEn: "No upcoming events",
    emptyTitleAr: "لا توجد فعاليات قادمة",
    emptyDescriptionEn: "There are no upcoming events at the moment.",
    emptyDescriptionAr: "لا توجد فعاليات قادمة في الوقت الحالي.",
    sortMode: 'default',
    itemsPerPage: 24,
    informationSection: DEFAULT_INFORMATION_SECTION_UPCOMING,
  },
  previousEvents: {
    enabled: true,
    eyebrowEn: "",
    eyebrowAr: "",
    titleEn: "Previous Events",
    titleAr: "الفعاليات السابقة",
    descriptionEn: "Browse past events and archives.",
    descriptionAr: "تصفح الفعاليات السابقة والأرشيف.",
    emptyTitleEn: "No previous events",
    emptyTitleAr: "لا توجد فعاليات سابقة",
    emptyDescriptionEn: "There are no previous events available.",
    emptyDescriptionAr: "لا توجد فعاليات سابقة متاحة.",
    sortMode: 'nearest',
    itemsPerPage: 24,
    informationSection: DEFAULT_INFORMATION_SECTION_PREVIOUS,
  },
  whyUsCards: [
    {
      id: "card-1",
      titleEn: "Complete Event Operations",
      titleAr: "إدارة فعالية متكاملة",
      descEn: "Create event pages, manage tickets, pricing windows, and registrations from one workspace.",
      descAr: "إنشاء صفحات الفعاليات، تحديد التذاكر، إدارة الأسعار، ومتابعة التسجيلات من لوحة واحدة.",
    },
    {
      id: "card-2",
      titleEn: "Digital Tickets and QR",
      titleAr: "تذاكر وQR جاهزة",
      descEn: "Every confirmed booking can generate a ticket and QR code for event-day validation.",
      descAr: "كل حجز مؤكد ينتج عنه تذكرة رقمية ورمز QR قابل للتحقق يوم الفعالية.",
    },
    {
      id: "card-3",
      titleEn: "Live Attendance Tracking",
      titleAr: "متابعة حضور مباشرة",
      descEn: "Check attendees in, prevent duplicate scans, and monitor event-day flow in real time.",
      descAr: "تسجيل دخول الحضور لحظيا ومنع التكرار أو استخدام QR غير صالح.",
    },
  ],
  featuresCards: [
    { id: 'f-1', titleEn: 'Conference Management', titleAr: 'إدارة وتنظيم المؤتمرات', descEn: 'Integrated system for attendance registration and session management with ease.', descAr: 'نظام متكامل لتسجيل الحضور وإدارة الجلسات بكل سهولة واحترافية.' },
    { id: 'f-2', titleEn: 'Smart Booking Strategies', titleAr: 'استراتيجيات الحجز الذكي', descEn: 'Convert visitors into participants through flexible and easy-to-use booking systems.', descAr: 'حوّل الزوار إلى مشاركين من خلال أنظمة حجز مرنة وسهلة الاستخدام.' },
    { id: 'f-3', titleEn: 'Immediate Support', titleAr: 'الاستجابة الفورية', descEn: 'A dedicated support team working around the clock to ensure a perfect guest experience.', descAr: 'فريق دعم متخصص يعمل على مدار الساعة لضمان تجربة مثالية لضيوفك.' },
  ],
  faqs: [
    { id: "faq-1", qEn: "How do I sign up?", qAr: "كيف يمكنني التسجيل؟", aEn: "You can easily sign up by clicking the Book Now button and filling in the required information.", aAr: "يمكنك التسجيل بسهولة من خلال الضغط على زر اطلب حجزك وملء البيانات المطلوبة." },
    { id: "faq-2", qEn: "What makes us different?", qAr: "ما الذي يميزنا عن الآخرين؟", aEn: "We provide an integrated solution for event management with a focus on user experience and high professionalism.", aAr: "نحن نقدم حلاً متكاملاً لإدارة الفعاليات مع التركيز على تجربة المستخدم والاحترافية العالية." },
    { id: "faq-3", qEn: "How much does it cost?", qAr: "ما هي تكلفة الخدمات؟", aEn: "Cost varies based on the type of event and services required. You can request a custom quote.", aAr: "تختلف التكلفة بناءً على نوع الفعالية والخدمات المطلوبة. يمكنك طلب عرض سعر مخصص." },
    { id: "faq-4", qEn: "How long does it take to design a website?", qAr: "كم يستغرق تنظيم المعرض؟", aEn: "Time depends on the size and requirements of the exhibition, usually taking two weeks to a month.", aAr: "يعتمد الوقت على حجم المعرض ومتطلباته، وعادة ما يستغرق من أسبوعين إلى شهر." },
    { id: "faq-5", qEn: "What verticals/niches are supported?", qAr: "هل ندعم الفعاليات الدولية؟", aEn: "Yes, we support organizing events and conferences on both international and local levels.", aAr: "نعم، نحن ندعم تنظيم الفعاليات والمؤتمرات على مستوى دولي ومحلي." },
    { id: "faq-6", qEn: "Is it compliant and secure?", qAr: "هل النظام آمن ومتوافق؟", aEn: "Yes, we use the latest security standards to protect your data and participant data.", aAr: "نعم، نستخدم أحدث معايير الأمان لحماية بياناتك وبيانات المشاركين." },
    { id: "faq-7", qEn: "How does it work with my business?", qAr: "كيف يعمل النظام مع نشاطي؟", aEn: "Our system is flexible and can be customized to fit the needs of any business sector or event type.", aAr: "نظامنا مرن ويمكن تخصيصه ليتناسب مع احتياجات أي قطاع أعمال أو نوع فعالية." },
    { id: "faq-8", qEn: "What if my competitor is using us?", qAr: "ماذا لو لم يعجبني التصميم؟", aEn: "We work with you step-by-step to ensure your complete satisfaction with all aspects of organization and design.", aAr: "نعمل معك خطوة بخطوة لضمان رضاك التام عن جميع جوانب التنظيم والتصميم." },
    { id: "faq-9", qEn: "What if I don't like the designs or strategies?", qAr: "هل يمكنني اختيار استراتيجية معينة؟", aEn: "Certainly, our consulting team will help you choose the best strategies for your event.", aAr: "بالتأكيد، فريقنا الاستشاري سيساعدك في اختيار أفضل الاستراتيجيات لفعاليتك." },
    { id: "faq-10", qEn: "I can do this myself, why do I need you?", qAr: "لماذا أحتاج إلى خدماتكم؟", aEn: "We save you time and effort and guarantee high professionalism and tangible results for your event.", aAr: "نحن نوفر عليك الوقت والجهد ونضمن لك احترافية عالية ونتائج ملموسة لفعاليتك." },
    { id: "faq-11", qEn: "How do we start working with you?", qAr: "كيف نبدأ العمل معكم؟", aEn: "You can start by filling out the booking request form, and our team will contact you within 24 hours to discuss all details and needs.", aAr: "يمكنك البدء بملء نموذج طلب الحجز، وسيقوم فريقنا بالتواصل معك خلال 24 ساعة لمناقشة كافة التفاصيل والاحتياجات." },
  ],
  socialLinks: [
    { id: "s1", platform: "twitter", url: "https://twitter.com" },
    { id: "s2", platform: "instagram", url: "https://instagram.com" },
    { id: "s3", platform: "linkedin", url: "https://linkedin.com" },
  ],
  footerLinks: [
    { id: "1", col: "services", labelEn: "Conference Booking", labelAr: "حجز المؤتمرات", href: "#" },
    { id: "2", col: "services", labelEn: "Exhibition Management", labelAr: "تنظيم المعارض", href: "#" },
    { id: "3", col: "services", labelEn: "Hotel Reservations", labelAr: "حجوزات الفنادق", href: "#" },
    { id: "4", col: "services", labelEn: "Reception and Farewell", labelAr: "الاستقبال والتوديع", href: "#" },
    { id: "5", col: "support", labelEn: "FAQ", labelAr: "الأسئلة الشائعة", href: "#" },
    { id: "6", col: "support", labelEn: "Privacy Policy", labelAr: "سياسة الخصوصية", href: "#" },
    { id: "7", col: "support", labelEn: "Terms and Conditions", labelAr: "الشروط والأحكام", href: "#" },
    { id: "8", col: "support", labelEn: "Contact Us", labelAr: "تواصل معنا", href: "#" },
    { id: "9", col: "company", labelEn: "About Company", labelAr: "عن الشركة", href: "#" },
    { id: "10", col: "company", labelEn: "Partners", labelAr: "شركاء النجاح", href: "#" },
    { id: "11", col: "company", labelEn: "Media Center", labelAr: "المركز الإعلامي", href: "#" },
    { id: "12", col: "company", labelEn: "Careers", labelAr: "وظائف", href: "#" },
  ],
  menu: publicNavLinks.map((item, index) => ({ id: `page-${index + 1}`, ...item, visible: true })),
  seo: {
    metaTitle: "Stylish Events | Event Booking & Management Platform",
    metaDescription: "Stylish Events provides event booking, ticketing, QR check-in, certificates, and event operations for conferences and exhibitions.",
    canonicalUrl: "https://stylish-events.com",
    keywords: "event booking, ticketing, conference management, QR check-in, certificates, Stylish Events",
    ogImage: "/og-image.jpg",
    robotsIndex: true,
    robotsFollow: true,
  },
}

function readSettings() {
  if (typeof window === "undefined") return defaultSettings

  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return defaultSettings
    const parsed = JSON.parse(saved) as Partial<SiteContentSettings>
    const savedMenu = parsed.menu?.length ? parsed.menu : defaultSettings.menu
    const hasPageLinks = savedMenu.some((item) => ["/upcoming-events", "/previous-events", "/why-us", "/about", "/contact"].includes(item.href))
    return {
      ...defaultSettings,
        ...parsed,
      homepage: { ...defaultSettings.homepage, ...(parsed.homepage || {}) },
      seo: { ...defaultSettings.seo, ...(parsed.seo || {}) },
      menu: hasPageLinks ? savedMenu : defaultSettings.menu,
      featuresCards: parsed.featuresCards?.length ? parsed.featuresCards : defaultSettings.featuresCards,
      faqs: (parsed.faqs?.length ?? 0) > 1 ? parsed.faqs : defaultSettings.faqs,
      whyUsCards: parsed.whyUsCards?.length ? parsed.whyUsCards : defaultSettings.whyUsCards,
        upcomingEvents: { ...defaultSettings.upcomingEvents, ...(parsed.upcomingEvents || {}) },
        previousEvents: { ...defaultSettings.previousEvents, ...(parsed.previousEvents || {}) },
    }
  } catch {
    return defaultSettings
  }
}

export function SiteContentSettingsPanel() {
  const { language } = useLanguage()
  const isAr = language === "ar"
  const [settings, setSettings] = useState<SiteContentSettings>(defaultSettings)
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle")

  useEffect(() => {
    const localSettings = readSettings()
    setSettings(localSettings as SiteContentSettings)
    platformApi.getSiteContentSettings()
      .then((remote) => {
        if (!remote || !Object.keys(remote).length) return
        const next = normalizeSiteContentSettings(remote)
        setSettings(next as SiteContentSettings)
        localStorage.setItem(storageKey, JSON.stringify(next))
      })
      .catch(() => undefined)
  }, [])

  const visibleMenu = useMemo(() => settings.menu.filter((item) => item.visible), [settings.menu])

  const updateHomepage = <K extends keyof SiteContentSettings["homepage"]>(key: K, value: SiteContentSettings["homepage"][K]) => {
    setSettings((current) => ({ ...current, homepage: { ...current.homepage, [key]: value } }))
    setSaveState("idle")
  }

  const updateSeo = <K extends keyof SiteContentSettings["seo"]>(key: K, value: SiteContentSettings["seo"][K]) => {
    setSettings((current) => ({ ...current, seo: { ...current.seo, [key]: value } }))
    setSaveState("idle")
  }

  const updateMenuItem = <K extends keyof MenuItemSettings>(id: string, key: K, value: MenuItemSettings[K]) => {
    setSettings((current) => ({
      ...current,
      menu: current.menu.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }))
    setSaveState("idle")
  }

  const updateUpcoming = (patch: Partial<EventPageSettings>) => {
    setSettings(s => ({ ...s, upcomingEvents: { ...defaultSettings.upcomingEvents, ...(s.upcomingEvents || {}), ...patch } } as SiteContentSettings))
    setSaveState("idle")
  }

  const updatePrevious = (patch: Partial<EventPageSettings>) => {
    setSettings(s => ({ ...s, previousEvents: { ...defaultSettings.previousEvents, ...(s.previousEvents || {}), ...patch } } as SiteContentSettings))
    setSaveState("idle")
  }

  const updateUpcomingInfo = (patch: Partial<EventInformationSectionSettings>) => {
    setSettings(s => ({ ...s, upcomingEvents: { ...defaultSettings.upcomingEvents!, ...(s.upcomingEvents || {}), informationSection: { ...defaultSettings.upcomingEvents!.informationSection, ...(s.upcomingEvents?.informationSection || {}), ...patch } } } as SiteContentSettings))
    setSaveState("idle")
  }

  const updatePreviousInfo = (patch: Partial<EventInformationSectionSettings>) => {
    setSettings(s => ({ ...s, previousEvents: { ...defaultSettings.previousEvents!, ...(s.previousEvents || {}), informationSection: { ...defaultSettings.previousEvents!.informationSection, ...(s.previousEvents?.informationSection || {}), ...patch } } } as SiteContentSettings))
    setSaveState("idle")
  }

  const moveMenuItem = (id: string, direction: -1 | 1) => {
    setSettings((current) => {
      const menu = [...current.menu]
      const index = menu.findIndex((item) => item.id === id)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= menu.length) return current
      const [item] = menu.splice(index, 1)
      menu.splice(nextIndex, 0, item)
      return { ...current, menu }
    })
    setSaveState("idle")
  }

  const addMenuItem = () => {
    setSettings((current) => ({
      ...current,
      menu: [
        ...current.menu,
        {
          id: `menu-${Date.now()}`,
          labelEn: "New link",
          labelAr: "رابط جديد",
          href: "#",
          visible: true,
        },
      ],
    }))
    setSaveState("idle")
  }

  const deleteMenuItem = (id: string) => {
    setSettings((current) => ({ ...current, menu: current.menu.filter((item) => item.id !== id) }))
    setSaveState("idle")
  }

  const saveSettings = async () => {
    try {
      const saved = await platformApi.updateSiteContentSettings(settings)
      const normalized = normalizeSiteContentSettings(saved || settings)
      setSettings(normalized as SiteContentSettings)
      localStorage.setItem(storageKey, JSON.stringify(normalized))
      window.dispatchEvent(new Event("stylish-events-site-content-settings-updated"))
      setSaveState("saved")
      toast.success(isAr ? "تم حفظ إعدادات الموقع" : "Website settings saved", { description: isAr ? "تم حفظ المحتوى والقائمة والسيو في MySQL." : "Content, menu, and SEO are stored in MySQL." })
    } catch (error) {
      // Do NOT persist failed server updates locally as successful saves.
      setSaveState("idle")
      const status = (error as any)?.status
      if (status === 401) {
        toast.error(isAr ? 'انتهت الجلسة. الرجاء تسجيل الدخول مجدداً.' : 'Your session has expired. Please sign in again.')
        return
      }
      if (status === 403) {
        toast.error(isAr ? 'ليس لديك صلاحية لحفظ هذه الإعدادات.' : 'You do not have permission to save these settings.')
        return
      }
      const message = error instanceof Error ? error.message : (isAr ? "واجهة إعدادات الباك إند غير متاحة حاليا." : "Backend settings API is not reachable.")
      toast.error(isAr ? `فشل الحفظ: ${message}` : `Save failed: ${message}`)
    }
  }

  type FieldProps = {
    label: string
    value: string
    onChange: (value: string) => void
    className?: string
  }

  const Field = ({ label, value, onChange, className }: FieldProps) => (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-bold text-slate-500">{label}</Label>
      <Input value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} className="h-11 rounded-xl bg-slate-50/50" />
    </div>
  )

  const TextAreaField = ({ label, value, onChange }: FieldProps) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-slate-500">{label}</Label>
      <Textarea value={value} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)} className="rounded-xl bg-slate-50/50" />
    </div>
  )

  const IconButton = ({ icon: Icon, onClick, label, disabled, tone }: any) => (
    <Button variant="ghost" size="icon" onClick={onClick} disabled={disabled} className={cn("h-8 w-8", tone === "danger" ? "text-rose-500 hover:text-rose-600" : "text-slate-400 hover:text-slate-600")}>
      <Icon className="h-4 w-4" />
    </Button>
  )

  return (
    <Card className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-[#17172f]">
              <Globe2 className="h-5 w-5 text-[hsl(var(--primary))]" />
              {isAr ? "محتوى الموقع والقائمة والسيو" : "Website Content, Menu & SEO"}
            </CardTitle>
            <CardDescription className="mt-2 text-sm font-medium text-slate-500">
              {isAr ? "تحكم في محتوى الصفحة الرئيسية، روابط القائمة، وبيانات محركات البحث من مكان واحد." : "Control the public homepage copy, navigation links, and search engine metadata from one workspace."}
            </CardDescription>
          </div>
          <ConfirmAction
            title={isAr ? "تأكيد حفظ إعدادات الموقع" : "Confirm website settings save"}
            description={isAr ? "سيتم حفظ محتوى الصفحة الرئيسية وروابط القائمة وإعدادات السيو للموقع." : "Homepage content, menu links, and SEO settings will be saved for the website configuration."}
            confirmLabel={isAr ? "حفظ إعدادات الموقع" : "Save website settings"}
            onConfirm={saveSettings}
            tone="success"
          >
            <Button className="h-11 rounded-2xl px-5 font-extrabold">
              <Save className="h-4 w-4" />
              {saveState === "saved" ? adminT(language, "common.saved") : adminT(language, "common.save")}
            </Button>
          </ConfirmAction>
        </div>
      </CardHeader>

      <CardContent className="border-t border-slate-100 bg-white p-5">
        <Tabs defaultValue="homepage" className="space-y-5 w-full">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="inline-flex h-auto min-w-max items-center justify-start rounded-2xl bg-slate-100 p-1 shadow-inner">
              <TabsTrigger value="homepage" className="rounded-xl px-5 py-2.5 font-extrabold">{adminT(language, "settings.homepage")}</TabsTrigger>
              <TabsTrigger value="features" className="rounded-xl px-5 py-2.5 font-extrabold">{isAr ? "المميزات" : "Features"}</TabsTrigger>
              <TabsTrigger value="whyUs" className="rounded-xl px-5 py-2.5 font-extrabold">{isAr ? "المزايا (لماذا نحن)" : "Benefits (Why Us)"}</TabsTrigger>
              <TabsTrigger value="showcase" className="rounded-xl px-5 py-2.5 font-extrabold">{isAr ? "الفعاليات المتاحة" : "Available Events"}</TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-xl px-5 py-2.5 font-extrabold">{isAr ? "الفعاليات القادمة" : "Upcoming Events"}</TabsTrigger>
              <TabsTrigger value="previous" className="rounded-xl px-5 py-2.5 font-extrabold">{isAr ? "الفعاليات السابقة" : "Previous Events"}</TabsTrigger>
              <TabsTrigger value="faq" className="rounded-xl px-5 py-2.5 font-extrabold">{isAr ? "الأسئلة الشائعة" : "FAQ"}</TabsTrigger>
              <TabsTrigger value="footer" className="rounded-xl px-5 py-2.5 font-extrabold">{isAr ? "الفوتر" : "Footer"}</TabsTrigger>
              <TabsTrigger value="menu" className="rounded-xl px-5 py-2.5 font-extrabold">{adminT(language, "settings.menu")}</TabsTrigger>
              <TabsTrigger value="seo" className="rounded-xl px-5 py-2.5 font-extrabold">{adminT(language, "settings.seo")}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="homepage" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "العبارة التمهيدية بالإنجليزية" : "English eyebrow"} value={settings.homepage.eyebrowEn} onChange={(value) => updateHomepage("eyebrowEn", value)} />
                <Field label={isAr ? "العبارة التمهيدية بالعربية" : "Arabic eyebrow"} value={settings.homepage.eyebrowAr} onChange={(value) => updateHomepage("eyebrowAr", value)} />
                <Field label={isAr ? "العنوان الإنجليزي" : "English title"} value={settings.homepage.titleEn} onChange={(value) => updateHomepage("titleEn", value)} />
                <Field label={isAr ? "العنوان العربي" : "Arabic title"} value={settings.homepage.titleAr} onChange={(value) => updateHomepage("titleAr", value)} />
                <TextAreaField label={isAr ? "الوصف الإنجليزي" : "English subtitle"} value={settings.homepage.subtitleEn} onChange={(value) => updateHomepage("subtitleEn", value)} />
                <TextAreaField label={isAr ? "الوصف العربي" : "Arabic subtitle"} value={settings.homepage.subtitleAr} onChange={(value) => updateHomepage("subtitleAr", value)} />
                <Field label={isAr ? "زر رئيسي إنجليزي" : "Primary CTA English"} value={settings.homepage.primaryCtaEn} onChange={(value) => updateHomepage("primaryCtaEn", value)} />
                <Field label={isAr ? "زر رئيسي عربي" : "Primary CTA Arabic"} value={settings.homepage.primaryCtaAr} onChange={(value) => updateHomepage("primaryCtaAr", value)} />
                <Field label={isAr ? "زر ثانوي إنجليزي" : "Secondary CTA English"} value={settings.homepage.secondaryCtaEn} onChange={(value) => updateHomepage("secondaryCtaEn", value)} />
                <Field label={isAr ? "زر ثانوي عربي" : "Secondary CTA Arabic"} value={settings.homepage.secondaryCtaAr} onChange={(value) => updateHomepage("secondaryCtaAr", value)} />
                <div className="space-y-2">
                  <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                    {isAr ? "نوع ميديا الهيرو" : "Hero media type"}
                  </Label>
                  <Select value={settings.homepage.heroMediaType} onValueChange={(value) => updateHomepage("heroMediaType", value as "video" | "image")}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <span className="inline-flex items-center gap-2"><Video className="h-4 w-4" /> {isAr ? "فيديو" : "Video"}</span>
                      </SelectItem>
                      <SelectItem value="image">
                        <span className="inline-flex items-center gap-2"><ImageIcon className="h-4 w-4" /> {isAr ? "صورة" : "Image"}</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ImageUrlDropzone
                  label={isAr ? "رابط أو رفع ميديا الهيرو" : "Hero media URL or upload"}
                  value={settings.homepage.heroMediaUrl}
                  onChange={(value) => updateHomepage("heroMediaUrl", value)}
                  helperText={isAr ? "اختر فيديو أو صورة من النوع بالأعلى، ثم أضف الرابط أو ارفع الملف." : "Choose video or image above, then paste a URL or upload a file."}
                  accept="media"
                />
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="overflow-hidden rounded-[22px] bg-white shadow-sm">
                  <div className="relative h-36 bg-slate-100">
                    {settings.homepage.heroMediaType === "video" ? (
                      <video src={apiAssetUrl(settings.homepage.heroMediaUrl)} className="h-full w-full object-cover" muted playsInline loop />
                    ) : (
                      <img src={apiAssetUrl(settings.homepage.heroMediaUrl || "/og-image.jpg")} alt={isAr ? "معاينة ميديا الهيرو" : "Hero media preview"} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.10),rgba(15,23,42,0.42))]" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase text-slate-600">
                      {settings.homepage.heroMediaType}
                    </span>
                  </div>
                  <div className="p-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">{settings.homepage.eyebrowEn}</p>
                  <h3 className="mt-3 text-2xl font-extrabold leading-tight text-[#17172f]">{settings.homepage.titleEn}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{settings.homepage.subtitleEn}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-2xl bg-[hsl(var(--primary))] px-4 py-2 text-xs font-extrabold text-white">{settings.homepage.primaryCtaEn}</span>
                    <span className="rounded-2xl bg-slate-50 px-4 py-2 text-xs font-extrabold text-slate-500">{settings.homepage.secondaryCtaEn}</span>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <ToggleCard label={isAr ? "تمكين قسم الفعاليات القادمة" : "Enable Upcoming Events"} checked={!!settings.upcomingEvents?.enabled} onChange={(v) => updateUpcoming({ enabled: v })} />
                <Field label={isAr ? "العبارة التمهيدية (إنجليزي)" : "Eyebrow (English)"} value={settings.upcomingEvents?.eyebrowEn || ''} onChange={(value) => updateUpcoming({ eyebrowEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "العبارة التمهيدية (عربي)" : "Eyebrow (Arabic)"}</Label>
                  <Input value={settings.upcomingEvents?.eyebrowAr || ''} onChange={(e) => updateUpcoming({ eyebrowAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <Field label={isAr ? "العنوان (إنجليزي)" : "Title (English)"} value={settings.upcomingEvents?.titleEn || ''} onChange={(value) => updateUpcoming({ titleEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
                  <Input value={settings.upcomingEvents?.titleAr || ''} onChange={(e) => updateUpcoming({ titleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <TextAreaField label={isAr ? "الوصف (إنجليزي)" : "Description (English)"} value={settings.upcomingEvents?.descriptionEn || ''} onChange={(value) => updateUpcoming({ descriptionEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                  <Textarea value={settings.upcomingEvents?.descriptionAr || ''} onChange={(e) => updateUpcoming({ descriptionAr: e.target.value })} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                </div>
                <Field label={isAr ? "نص إذا كانت القائمة فارغة (إنجليزي)" : "Empty title (English)"} value={settings.upcomingEvents?.emptyTitleEn || ''} onChange={(value) => updateUpcoming({ emptyTitleEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "نص إذا كانت القائمة فارغة (عربي)" : "Empty title (Arabic)"}</Label>
                  <Input value={settings.upcomingEvents?.emptyTitleAr || ''} onChange={(e) => updateUpcoming({ emptyTitleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "ترتيب العرض" : "Sort Mode"}</Label>
                  <Select value={settings.upcomingEvents?.sortMode || 'default'} onValueChange={(value) => updateUpcoming({ sortMode: value as any })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{isAr ? "الافتراضي" : "Default"}</SelectItem>
                      <SelectItem value="nearest">{isAr ? "الأقرب" : "Nearest"}</SelectItem>
                      <SelectItem value="latest">{isAr ? "الأحدث" : "Latest"}</SelectItem>
                      <SelectItem value="oldest">{isAr ? "الأقدم" : "Oldest"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label={isAr ? "العناصر في الصفحة" : "Items per page"} value={String(settings.upcomingEvents?.itemsPerPage || 24)} onChange={(value) => updateUpcoming({ itemsPerPage: Number(value) })} />
              </div>
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm">
                <h4 className="font-extrabold text-[#17172f]">{isAr ? "القسم المعلوماتي" : "Informational Section"}</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <ToggleCard label={isAr ? "تمكين القسم المعلوماتي" : "Enable informational section"} checked={!!settings.upcomingEvents?.informationSection?.enabled} onChange={(v) => updateUpcomingInfo({ enabled: v })} />
                  <Field label={isAr ? "العبارة التمهيدية (إنجليزي)" : "Badge / Eyebrow (English)"} value={settings.upcomingEvents?.informationSection?.badgeEn || ''} onChange={(v) => updateUpcomingInfo({ badgeEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "العبارة التمهيدية (عربي)" : "Badge / Eyebrow (Arabic)"}</Label>
                    <Input value={settings.upcomingEvents?.informationSection?.badgeAr || ''} onChange={(e) => updateUpcomingInfo({ badgeAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <Field label={isAr ? "العنوان (إنجليزي)" : "Heading (English)"} value={settings.upcomingEvents?.informationSection?.titleEn || ''} onChange={(v) => updateUpcomingInfo({ titleEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "العنوان (عربي)" : "Heading (Arabic)"}</Label>
                    <Input value={settings.upcomingEvents?.informationSection?.titleAr || ''} onChange={(e) => updateUpcomingInfo({ titleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <TextAreaField label={isAr ? "الوصف (إنجليزي)" : "Description (English)"} value={settings.upcomingEvents?.informationSection?.descriptionEn || ''} onChange={(v) => updateUpcomingInfo({ descriptionEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                    <Textarea value={settings.upcomingEvents?.informationSection?.descriptionAr || ''} onChange={(e) => updateUpcomingInfo({ descriptionAr: e.target.value })} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <ImageUrlDropzone label={isAr ? "صورة القسم" : "Section image"} value={settings.upcomingEvents?.informationSection?.imageUrl || ''} onChange={(v) => updateUpcomingInfo({ imageUrl: v })} />
                  <Field label={isAr ? "Alt نص (إنجليزي)" : "Image alt (English)"} value={settings.upcomingEvents?.informationSection?.imageAltEn || ''} onChange={(v) => updateUpcomingInfo({ imageAltEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Alt نص (عربي)" : "Image alt (Arabic)"}</Label>
                    <Input value={settings.upcomingEvents?.informationSection?.imageAltAr || ''} onChange={(e) => updateUpcomingInfo({ imageAltAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "موضع الصورة" : "Image position"}</Label>
                    <Select value={settings.upcomingEvents?.informationSection?.imagePosition || 'left'} onValueChange={(value) => updateUpcomingInfo({ imagePosition: value as any })}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">{isAr ? "يسار" : "Left"}</SelectItem>
                        <SelectItem value="right">{isAr ? "يمين" : "Right"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-extrabold">{isAr ? "النقاط" : "Bullet items"}</h5>
                  <div className="space-y-3 mt-3">
                    {(settings.upcomingEvents?.informationSection?.bullets || []).map((b, i) => (
                      <div key={b.id} className="grid gap-2 md:grid-cols-[1fr_auto] items-start">
                        <div className="grid gap-2">
                          <Field label={isAr ? `النقطة (إنجليزي) #${i+1}` : `Bullet (English) #${i+1}`} value={b.textEn} onChange={(v) => setSettings(s => ({ ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: (s.upcomingEvents?.informationSection?.bullets||[]).map(x => x.id === b.id ? { ...x, textEn: v } : x) } } } as SiteContentSettings))} />
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500">{isAr ? `النقطة (عربي) #${i+1}` : `Bullet (Arabic) #${i+1}`}</Label>
                            <Input value={b.textAr} onChange={(e) => setSettings(s => ({ ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: (s.upcomingEvents?.informationSection?.bullets||[]).map(x => x.id === b.id ? { ...x, textAr: e.target.value } : x) } } } as SiteContentSettings))} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            <IconButton label={isAr ? "تحريك لأعلى" : "Move up"} onClick={() => setSettings(s => {
                              const arr = (s.upcomingEvents?.informationSection?.bullets || []).slice();
                              const idx = arr.findIndex(x => x.id === b.id);
                              if (idx <= 0) return s;
                              const [it] = arr.splice(idx,1);
                              arr.splice(idx-1,0,it);
                              return { ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: arr } } } as SiteContentSettings;
                            })} icon={ArrowUp} />
                            <IconButton label={isAr ? "تحريك لأسفل" : "Move down"} onClick={() => setSettings(s => {
                              const arr = (s.upcomingEvents?.informationSection?.bullets || []).slice();
                              const idx = arr.findIndex(x => x.id === b.id);
                              if (idx < 0 || idx === arr.length-1) return s;
                              const [it] = arr.splice(idx,1);
                              arr.splice(idx+1,0,it);
                              return { ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: arr } } } as SiteContentSettings;
                            })} icon={ArrowDown} />
                          </div>
                          <IconButton label={adminT(language, "common.delete")} onClick={() => setSettings(s => ({ ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: (s.upcomingEvents?.informationSection?.bullets||[]).filter(x => x.id !== b.id) } } } as SiteContentSettings))} icon={Trash2} tone="danger" />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => setSettings(s => ({ ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: [...(s.upcomingEvents?.informationSection?.bullets||[]), { id: `b-${Date.now()}`, textEn: 'New bullet', textAr: 'نقطة جديدة' }] } } } as SiteContentSettings))} className="h-11 rounded-2xl font-extrabold w-full">
                      <Plus className="h-4 w-4" />
                      {isAr ? 'إضافة نقطة' : 'Add bullet'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="previous" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <ToggleCard label={isAr ? "تمكين قسم الفعاليات السابقة" : "Enable Previous Events"} checked={!!settings.previousEvents?.enabled} onChange={(v) => updatePrevious({ enabled: v })} />
                <Field label={isAr ? "العبارة التمهيدية (إنجليزي)" : "Eyebrow (English)"} value={settings.previousEvents?.eyebrowEn || ''} onChange={(value) => updatePrevious({ eyebrowEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "العبارة التمهيدية (عربي)" : "Eyebrow (Arabic)"}</Label>
                  <Input value={settings.previousEvents?.eyebrowAr || ''} onChange={(e) => updatePrevious({ eyebrowAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <Field label={isAr ? "العنوان (إنجليزي)" : "Title (English)"} value={settings.previousEvents?.titleEn || ''} onChange={(value) => updatePrevious({ titleEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
                  <Input value={settings.previousEvents?.titleAr || ''} onChange={(e) => updatePrevious({ titleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <TextAreaField label={isAr ? "الوصف (إنجليزي)" : "Description (English)"} value={settings.previousEvents?.descriptionEn || ''} onChange={(value) => updatePrevious({ descriptionEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                  <Textarea value={settings.previousEvents?.descriptionAr || ''} onChange={(e) => updatePrevious({ descriptionAr: e.target.value })} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                </div>
                <Field label={isAr ? "نص إذا كانت القائمة فارغة (إنجليزي)" : "Empty title (English)"} value={settings.previousEvents?.emptyTitleEn || ''} onChange={(value) => updatePrevious({ emptyTitleEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "نص إذا كانت القائمة فارغة (عربي)" : "Empty title (Arabic)"}</Label>
                  <Input value={settings.previousEvents?.emptyTitleAr || ''} onChange={(e) => updatePrevious({ emptyTitleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "ترتيب العرض" : "Sort Mode"}</Label>
                  <Select value={settings.previousEvents?.sortMode || 'nearest'} onValueChange={(value) => updatePrevious({ sortMode: value as any })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{isAr ? "الافتراضي" : "Default"}</SelectItem>
                      <SelectItem value="nearest">{isAr ? "الأقرب" : "Nearest"}</SelectItem>
                      <SelectItem value="latest">{isAr ? "الأحدث" : "Latest"}</SelectItem>
                      <SelectItem value="oldest">{isAr ? "الأقدم" : "Oldest"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label={isAr ? "العناصر في الصفحة" : "Items per page"} value={String(settings.previousEvents?.itemsPerPage || 24)} onChange={(value) => updatePrevious({ itemsPerPage: Number(value) })} />
              </div>
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm mt-4">
                <h4 className="font-extrabold text-[#17172f]">{isAr ? "القسم المعلوماتي" : "Informational Section"}</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <ToggleCard label={isAr ? "تمكين القسم المعلوماتي" : "Enable informational section"} checked={!!settings.previousEvents?.informationSection?.enabled} onChange={(v) => updatePreviousInfo({ enabled: v })} />
                  <Field label={isAr ? "العبارة التمهيدية (إنجليزي)" : "Badge / Eyebrow (English)"} value={settings.previousEvents?.informationSection?.badgeEn || ''} onChange={(v) => updatePreviousInfo({ badgeEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "العبارة التمهيدية (عربي)" : "Badge / Eyebrow (Arabic)"}</Label>
                    <Input value={settings.previousEvents?.informationSection?.badgeAr || ''} onChange={(e) => updatePreviousInfo({ badgeAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <Field label={isAr ? "العنوان (إنجليزي)" : "Heading (English)"} value={settings.previousEvents?.informationSection?.titleEn || ''} onChange={(v) => updatePreviousInfo({ titleEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "العنوان (عربي)" : "Heading (Arabic)"}</Label>
                    <Input value={settings.previousEvents?.informationSection?.titleAr || ''} onChange={(e) => updatePreviousInfo({ titleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <TextAreaField label={isAr ? "الوصف (إنجليزي)" : "Description (English)"} value={settings.previousEvents?.informationSection?.descriptionEn || ''} onChange={(v) => updatePreviousInfo({ descriptionEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                    <Textarea value={settings.previousEvents?.informationSection?.descriptionAr || ''} onChange={(e) => updatePreviousInfo({ descriptionAr: e.target.value })} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <ImageUrlDropzone label={isAr ? "صورة القسم" : "Section image"} value={settings.previousEvents?.informationSection?.imageUrl || ''} onChange={(v) => updatePreviousInfo({ imageUrl: v })} />
                  <Field label={isAr ? "Alt نص (إنجليزي)" : "Image alt (English)"} value={settings.previousEvents?.informationSection?.imageAltEn || ''} onChange={(v) => updatePreviousInfo({ imageAltEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Alt نص (عربي)" : "Image alt (Arabic)"}</Label>
                    <Input value={settings.previousEvents?.informationSection?.imageAltAr || ''} onChange={(e) => updatePreviousInfo({ imageAltAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "موضع الصورة" : "Image position"}</Label>
                    <Select value={settings.previousEvents?.informationSection?.imagePosition || 'right'} onValueChange={(value) => updatePreviousInfo({ imagePosition: value as any })}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">{isAr ? "يسار" : "Left"}</SelectItem>
                        <SelectItem value="right">{isAr ? "يمين" : "Right"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-extrabold">{isAr ? "النقاط" : "Bullet items"}</h5>
                  <div className="space-y-3 mt-3">
                    {(settings.previousEvents?.informationSection?.bullets || []).map((b, i) => (
                      <div key={b.id} className="grid gap-2 md:grid-cols-[1fr_auto] items-start">
                        <div className="grid gap-2">
                          <Field label={isAr ? `النقطة (إنجليزي) #${i+1}` : `Bullet (English) #${i+1}`} value={b.textEn} onChange={(v) => setSettings(s => ({ ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: (s.previousEvents?.informationSection?.bullets||[]).map(x => x.id === b.id ? { ...x, textEn: v } : x) } } } as SiteContentSettings))} />
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500">{isAr ? `النقطة (عربي) #${i+1}` : `Bullet (Arabic) #${i+1}`}</Label>
                            <Input value={b.textAr} onChange={(e) => setSettings(s => ({ ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: (s.previousEvents?.informationSection?.bullets||[]).map(x => x.id === b.id ? { ...x, textAr: e.target.value } : x) } } } as SiteContentSettings))} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            <IconButton label={isAr ? "تحريك لأعلى" : "Move up"} onClick={() => setSettings(s => {
                              const arr = (s.previousEvents?.informationSection?.bullets || []).slice();
                              const idx = arr.findIndex(x => x.id === b.id);
                              if (idx <= 0) return s;
                              const [it] = arr.splice(idx,1);
                              arr.splice(idx-1,0,it);
                              return { ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: arr } } } as SiteContentSettings;
                            })} icon={ArrowUp} />
                            <IconButton label={isAr ? "تحريك لأسفل" : "Move down"} onClick={() => setSettings(s => {
                              const arr = (s.previousEvents?.informationSection?.bullets || []).slice();
                              const idx = arr.findIndex(x => x.id === b.id);
                              if (idx < 0 || idx === arr.length-1) return s;
                              const [it] = arr.splice(idx,1);
                              arr.splice(idx+1,0,it);
                              return { ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: arr } } } as SiteContentSettings;
                            })} icon={ArrowDown} />
                          </div>
                          <IconButton label={adminT(language, "common.delete")} onClick={() => setSettings(s => ({ ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: (s.previousEvents?.informationSection?.bullets||[]).filter(x => x.id !== b.id) } } } as SiteContentSettings))} icon={Trash2} tone="danger" />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => setSettings(s => ({ ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: [...(s.previousEvents?.informationSection?.bullets||[]), { id: `p-${Date.now()}`, textEn: 'New bullet', textAr: 'نقطة جديدة' }] } } } as SiteContentSettings))} className="h-11 rounded-2xl font-extrabold w-full">
                      <Plus className="h-4 w-4" />
                      {isAr ? 'إضافة نقطة' : 'Add bullet'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="whyUs" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "عنوان (إنجليزي)" : "Title (English)"} value={settings.homepage.whyUsTitleEn} onChange={(value) => updateHomepage("whyUsTitleEn", value)} />
                <Field label={isAr ? "عنوان (عربي)" : "Title (Arabic)"} value={settings.homepage.whyUsTitleAr} onChange={(value) => updateHomepage("whyUsTitleAr", value)} />
                <TextAreaField label={isAr ? "وصف (إنجليزي)" : "Subtitle (English)"} value={settings.homepage.whyUsSubtitleEn} onChange={(value) => updateHomepage("whyUsSubtitleEn", value)} />
                <TextAreaField label={isAr ? "وصف (عربي)" : "Subtitle (Arabic)"} value={settings.homepage.whyUsSubtitleAr} onChange={(value) => updateHomepage("whyUsSubtitleAr", value)} />
              </div>
              <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                <h4 className="font-extrabold text-[#17172f]">{isAr ? "البطاقات" : "Cards"}</h4>
                {settings.whyUsCards.map((card, index) => (
                  <div key={card.id} className="grid gap-3 rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2 relative group">
                    <Field label={isAr ? "عنوان البطاقة (إنجليزي)" : "Card Title (English)"} value={card.titleEn} onChange={(value) => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.map(c => c.id === card.id ? { ...c, titleEn: value } : c) }))} />
                    <Field label={isAr ? "عنوان البطاقة (عربي)" : "Card Title (Arabic)"} value={card.titleAr} onChange={(value) => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.map(c => c.id === card.id ? { ...c, titleAr: value } : c) }))} />
                    <TextAreaField label={isAr ? "وصف البطاقة (إنجليزي)" : "Card Desc (English)"} value={card.descEn} onChange={(value) => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.map(c => c.id === card.id ? { ...c, descEn: value } : c) }))} />
                    <TextAreaField label={isAr ? "وصف البطاقة (عربي)" : "Card Desc (Arabic)"} value={card.descAr} onChange={(value) => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.map(c => c.id === card.id ? { ...c, descAr: value } : c) }))} />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                      <IconButton label={isAr ? "تحريك لأعلى" : "Move up"} disabled={index === 0} onClick={() => {
                        setSettings(s => {
                          const newCards = [...s.whyUsCards];
                          const [item] = newCards.splice(index, 1);
                          newCards.splice(index - 1, 0, item);
                          return { ...s, whyUsCards: newCards };
                        });
                      }} icon={ArrowUp} />
                      <IconButton label={isAr ? "تحريك لأسفل" : "Move down"} disabled={index === settings.whyUsCards.length - 1} onClick={() => {
                        setSettings(s => {
                          const newCards = [...s.whyUsCards];
                          const [item] = newCards.splice(index, 1);
                          newCards.splice(index + 1, 0, item);
                          return { ...s, whyUsCards: newCards };
                        });
                      }} icon={ArrowDown} />
                      <IconButton label={adminT(language, "common.delete")} onClick={() => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.filter(c => c.id !== card.id) }))} icon={Trash2} tone="danger" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setSettings(s => ({ ...s, whyUsCards: [...s.whyUsCards, { id: `card-${Date.now()}`, titleEn: "New Card", titleAr: "بطاقة جديدة", descEn: "", descAr: "" }] }))} className="h-11 rounded-2xl font-extrabold w-full">
                  <Plus className="h-4 w-4" />
                  {isAr ? "إضافة بطاقة جديدة" : "Add new card"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="showcase" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "عنوان (إنجليزي)" : "Title (English)"} value={settings.homepage.showcaseTitleEn} onChange={(value) => updateHomepage("showcaseTitleEn", value)} />
                <Field label={isAr ? "عنوان (عربي)" : "Title (Arabic)"} value={settings.homepage.showcaseTitleAr} onChange={(value) => updateHomepage("showcaseTitleAr", value)} />
                <TextAreaField label={isAr ? "وصف (إنجليزي)" : "Subtitle (English)"} value={settings.homepage.showcaseDescEn} onChange={(value) => updateHomepage("showcaseDescEn", value)} />
                <TextAreaField label={isAr ? "وصف (عربي)" : "Subtitle (Arabic)"} value={settings.homepage.showcaseDescAr} onChange={(value) => updateHomepage("showcaseDescAr", value)} />
                <Field label={isAr ? "زر العرض (إنجليزي)" : "CTA (English)"} value={settings.homepage.showcaseCtaEn} onChange={(value) => updateHomepage("showcaseCtaEn", value)} />
                <Field label={isAr ? "زر العرض (عربي)" : "CTA (Arabic)"} value={settings.homepage.showcaseCtaAr} onChange={(value) => updateHomepage("showcaseCtaAr", value)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "العبارة التمهيدية (إنجليزي)" : "Eyebrow (English)"} value={settings.homepage.faqEyebrowEn} onChange={(value) => updateHomepage("faqEyebrowEn", value)} />
                <Field label={isAr ? "العبارة التمهيدية (عربي)" : "Eyebrow (Arabic)"} value={settings.homepage.faqEyebrowAr} onChange={(value) => updateHomepage("faqEyebrowAr", value)} />
                <Field label={isAr ? "عنوان (إنجليزي)" : "Title (English)"} value={settings.homepage.faqTitleEn} onChange={(value) => updateHomepage("faqTitleEn", value)} />
                <Field label={isAr ? "عنوان (عربي)" : "Title (Arabic)"} value={settings.homepage.faqTitleAr} onChange={(value) => updateHomepage("faqTitleAr", value)} />
                <TextAreaField label={isAr ? "وصف (إنجليزي)" : "Subtitle (English)"} value={settings.homepage.faqSubtitleEn} onChange={(value) => updateHomepage("faqSubtitleEn", value)} />
                <TextAreaField label={isAr ? "وصف (عربي)" : "Subtitle (Arabic)"} value={settings.homepage.faqSubtitleAr} onChange={(value) => updateHomepage("faqSubtitleAr", value)} />
              </div>
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "نص واتساب (إنجليزي)" : "WhatsApp Text (English)"} value={settings.homepage.faqWhatsappTextEn} onChange={(value) => updateHomepage("faqWhatsappTextEn", value)} />
                <Field label={isAr ? "نص واتساب (عربي)" : "WhatsApp Text (Arabic)"} value={settings.homepage.faqWhatsappTextAr} onChange={(value) => updateHomepage("faqWhatsappTextAr", value)} />
                <Field label={isAr ? "رابط واتساب" : "WhatsApp URL"} value={settings.homepage.faqWhatsappUrl || ''} onChange={(value) => updateHomepage("faqWhatsappUrl", value)} className="md:col-span-2" />
              </div>
              <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                <h4 className="font-extrabold text-[#17172f]">{isAr ? "الأسئلة والإجابات" : "Questions & Answers"}</h4>
                {settings.faqs.map((faq, index) => (
                  <div key={faq.id} className="grid gap-3 rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2 relative group">
                    <Field label={isAr ? "السؤال (إنجليزي)" : "Question (English)"} value={faq.qEn} onChange={(value) => setSettings(s => ({ ...s, faqs: s.faqs.map(f => f.id === faq.id ? { ...f, qEn: value } : f) }))} />
                    <Field label={isAr ? "السؤال (عربي)" : "Question (Arabic)"} value={faq.qAr} onChange={(value) => setSettings(s => ({ ...s, faqs: s.faqs.map(f => f.id === faq.id ? { ...f, qAr: value } : f) }))} />
                    <TextAreaField label={isAr ? "الإجابة (إنجليزي)" : "Answer (English)"} value={faq.aEn} onChange={(value) => setSettings(s => ({ ...s, faqs: s.faqs.map(f => f.id === faq.id ? { ...f, aEn: value } : f) }))} />
                    <TextAreaField label={isAr ? "الإجابة (عربي)" : "Answer (Arabic)"} value={faq.aAr} onChange={(value) => setSettings(s => ({ ...s, faqs: s.faqs.map(f => f.id === faq.id ? { ...f, aAr: value } : f) }))} />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                      <IconButton label={isAr ? "تحريك لأعلى" : "Move up"} disabled={index === 0} onClick={() => {
                        setSettings(s => {
                          const newFaqs = [...s.faqs];
                          const [item] = newFaqs.splice(index, 1);
                          newFaqs.splice(index - 1, 0, item);
                          return { ...s, faqs: newFaqs };
                        });
                      }} icon={ArrowUp} />
                      <IconButton label={isAr ? "تحريك لأسفل" : "Move down"} disabled={index === settings.faqs.length - 1} onClick={() => {
                        setSettings(s => {
                          const newFaqs = [...s.faqs];
                          const [item] = newFaqs.splice(index, 1);
                          newFaqs.splice(index + 1, 0, item);
                          return { ...s, faqs: newFaqs };
                        });
                      }} icon={ArrowDown} />
                      <IconButton label={adminT(language, "common.delete")} onClick={() => setSettings(s => ({ ...s, faqs: s.faqs.filter(f => f.id !== faq.id) }))} icon={Trash2} tone="danger" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setSettings(s => ({ ...s, faqs: [...s.faqs, { id: `faq-${Date.now()}`, qEn: "New Question", qAr: "سؤال جديد", aEn: "", aAr: "" }] }))} className="h-11 rounded-2xl font-extrabold w-full">
                  <Plus className="h-4 w-4" />
                  {isAr ? "إضافة سؤال جديد" : "Add new question"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="footer" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "العبارة التمهيدية (إنجليزي)" : "Eyebrow (English)"} value={settings.homepage.footerEyebrowEn} onChange={(value) => updateHomepage("footerEyebrowEn", value)} />
                <Field label={isAr ? "العبارة التمهيدية (عربي)" : "Eyebrow (Arabic)"} value={settings.homepage.footerEyebrowAr} onChange={(value) => updateHomepage("footerEyebrowAr", value)} />
                
                <Field label={isAr ? "العنوان الأول (إنجليزي)" : "Title Part 1 (English)"} value={settings.homepage.footerTitle1En} onChange={(value) => updateHomepage("footerTitle1En", value)} />
                <Field label={isAr ? "العنوان الأول (عربي)" : "Title Part 1 (Arabic)"} value={settings.homepage.footerTitle1Ar} onChange={(value) => updateHomepage("footerTitle1Ar", value)} />
                
                <Field label={isAr ? "العنوان الثاني (إنجليزي)" : "Title Part 2 (English)"} value={settings.homepage.footerTitle2En} onChange={(value) => updateHomepage("footerTitle2En", value)} />
                <Field label={isAr ? "العنوان الثاني (عربي)" : "Title Part 2 (Arabic)"} value={settings.homepage.footerTitle2Ar} onChange={(value) => updateHomepage("footerTitle2Ar", value)} />

                <TextAreaField label={isAr ? "الوصف (إنجليزي)" : "Description (English)"} value={settings.homepage.footerDescEn} onChange={(value) => updateHomepage("footerDescEn", value)} />
                <TextAreaField label={isAr ? "الوصف (عربي)" : "Description (Arabic)"} value={settings.homepage.footerDescAr} onChange={(value) => updateHomepage("footerDescAr", value)} />
                
                <Field label={isAr ? "نص الزر (إنجليزي)" : "CTA (English)"} value={settings.homepage.footerCtaEn} onChange={(value) => updateHomepage("footerCtaEn", value)} />
                <Field label={isAr ? "نص الزر (عربي)" : "CTA (Arabic)"} value={settings.homepage.footerCtaAr} onChange={(value) => updateHomepage("footerCtaAr", value)} />
              </div>
            </div>

            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 mt-5">
              <h3 className="text-lg font-bold">{isAr ? "نصوص الفوتر السفلية (Logo & Columns)" : "Footer Bottom Texts (Logo & Columns)"}</h3>
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <TextAreaField label={isAr ? "وصف أسفل اللوجو (إنجليزي)" : "Logo Description (English)"} value={settings.homepage.footerLogoDescEn} onChange={(value) => updateHomepage("footerLogoDescEn", value)} />
                <TextAreaField label={isAr ? "وصف أسفل اللوجو (عربي)" : "Logo Description (Arabic)"} value={settings.homepage.footerLogoDescAr} onChange={(value) => updateHomepage("footerLogoDescAr", value)} />

                <Field label={isAr ? "عنوان عمود الخدمات (إنجليزي)" : "Services Column Title (English)"} value={settings.homepage.footerServicesTitleEn} onChange={(value) => updateHomepage("footerServicesTitleEn", value)} />
                <Field label={isAr ? "عنوان عمود الخدمات (عربي)" : "Services Column Title (Arabic)"} value={settings.homepage.footerServicesTitleAr} onChange={(value) => updateHomepage("footerServicesTitleAr", value)} />

                <Field label={isAr ? "عنوان عمود الدعم (إنجليزي)" : "Support Column Title (English)"} value={settings.homepage.footerSupportTitleEn} onChange={(value) => updateHomepage("footerSupportTitleEn", value)} />
                <Field label={isAr ? "عنوان عمود الدعم (عربي)" : "Support Column Title (Arabic)"} value={settings.homepage.footerSupportTitleAr} onChange={(value) => updateHomepage("footerSupportTitleAr", value)} />

                <Field label={isAr ? "عنوان عمود الشركة (إنجليزي)" : "Company Column Title (English)"} value={settings.homepage.footerCompanyTitleEn} onChange={(value) => updateHomepage("footerCompanyTitleEn", value)} />
                <Field label={isAr ? "عنوان عمود الشركة (عربي)" : "Company Column Title (Arabic)"} value={settings.homepage.footerCompanyTitleAr} onChange={(value) => updateHomepage("footerCompanyTitleAr", value)} />
                
                <Field label={isAr ? "نص الحقوق (إنجليزي)" : "Copyright Text (English)"} value={settings.homepage.footerCopyrightEn} onChange={(value) => updateHomepage("footerCopyrightEn", value)} />
                <Field label={isAr ? "نص الحقوق (عربي)" : "Copyright Text (Arabic)"} value={settings.homepage.footerCopyrightAr} onChange={(value) => updateHomepage("footerCopyrightAr", value)} />
              </div>
            </div>

            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 mt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{isAr ? "روابط التواصل الاجتماعي" : "Social Media Links"}</h3>
                <Button onClick={() => setSettings({ ...settings, socialLinks: [...(settings.socialLinks || []), { id: Date.now().toString(), platform: "twitter", url: "#" }] })} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> {isAr ? "إضافة رابط" : "Add Link"}
                </Button>
              </div>
              <div className="space-y-3">
                {settings.socialLinks?.map((link, index) => (
                  <div key={link.id} className="grid gap-3 rounded-[16px] bg-white p-4 shadow-sm md:grid-cols-[1.5fr_2fr_auto] items-center">
                    <Select value={link.platform} onValueChange={(val: any) => {
                      const newLinks = [...settings.socialLinks]
                      newLinks[index].platform = val
                      setSettings({ ...settings, socialLinks: newLinks })
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">X / Twitter</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="URL (e.g. https://...)" value={link.url} onChange={(e) => {
                      const newLinks = [...settings.socialLinks]
                      newLinks[index].url = e.target.value
                      setSettings({ ...settings, socialLinks: newLinks })
                    }} />
                    <Button variant="ghost" size="icon" className="text-rose-500 shrink-0 h-10 w-10" onClick={() => {
                      const newLinks = settings.socialLinks.filter((_, i) => i !== index)
                      setSettings({ ...settings, socialLinks: newLinks })
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 mt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{isAr ? "روابط الفوتر" : "Footer Links"}</h3>
                <Button onClick={() => setSettings({ ...settings, footerLinks: [...(settings.footerLinks || []), { id: Date.now().toString(), col: "services", labelEn: "New Link", labelAr: "رابط جديد", href: "#" }] })} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> {isAr ? "إضافة رابط" : "Add Link"}
                </Button>
              </div>
              <div className="space-y-3">
                {settings.footerLinks?.map((link, index) => (
                  <div key={link.id} className="grid gap-3 rounded-[16px] bg-white p-4 shadow-sm md:grid-cols-[1fr_1.5fr_1.5fr_1fr_auto] items-center">
                    <Select value={link.col} onValueChange={(val: any) => {
                      const newLinks = [...settings.footerLinks]
                      newLinks[index].col = val
                      setSettings({ ...settings, footerLinks: newLinks })
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="services">{isAr ? "الخدمات" : "Services"}</SelectItem>
                        <SelectItem value="support">{isAr ? "الدعم" : "Support"}</SelectItem>
                        <SelectItem value="company">{isAr ? "الشركة" : "Company"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder={isAr ? "الاسم (إنجليزي)" : "Label (English)"} value={link.labelEn} onChange={(e) => {
                      const newLinks = [...settings.footerLinks]
                      newLinks[index].labelEn = e.target.value
                      setSettings({ ...settings, footerLinks: newLinks })
                    }} />
                    <Input placeholder={isAr ? "الاسم (عربي)" : "Label (Arabic)"} value={link.labelAr} onChange={(e) => {
                      const newLinks = [...settings.footerLinks]
                      newLinks[index].labelAr = e.target.value
                      setSettings({ ...settings, footerLinks: newLinks })
                    }} />
                    <Input placeholder="URL" value={link.href} onChange={(e) => {
                      const newLinks = [...settings.footerLinks]
                      newLinks[index].href = e.target.value
                      setSettings({ ...settings, footerLinks: newLinks })
                    }} />
                    <Button variant="ghost" size="icon" className="text-rose-500 shrink-0 h-10 w-10" onClick={() => {
                      const newLinks = settings.footerLinks.filter((_, i) => i !== index)
                      setSettings({ ...settings, footerLinks: newLinks })
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
              <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                {settings.menu.map((item, index) => (
                  <div key={item.id} className="grid gap-3 rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_auto]">
                    <Field label={isAr ? "اسم الرابط بالإنجليزية" : "English label"} value={item.labelEn} onChange={(value) => updateMenuItem(item.id, "labelEn", value)} />
                    <Field label={isAr ? "اسم الرابط بالعربية" : "Arabic label"} value={item.labelAr} onChange={(value) => updateMenuItem(item.id, "labelAr", value)} />
                    <Field label={isAr ? "الرابط / القسم" : "URL / Anchor"} value={item.href} onChange={(value) => updateMenuItem(item.id, "href", value)} />
                    <div className="flex items-end gap-2">
                      <IconButton label={isAr ? "تحريك لأعلى" : "Move up"} disabled={index === 0} onClick={() => moveMenuItem(item.id, -1)} icon={ArrowUp} />
                      <IconButton label={isAr ? "تحريك لأسفل" : "Move down"} disabled={index === settings.menu.length - 1} onClick={() => moveMenuItem(item.id, 1)} icon={ArrowDown} />
                      <div className="flex h-11 items-center gap-2 rounded-2xl bg-[#f8f5fb] px-3">
                        <Switch checked={item.visible} onCheckedChange={(value) => updateMenuItem(item.id, "visible", value)} />
                        <span className="text-xs font-extrabold text-slate-500">{adminT(language, "settings.show")}</span>
                      </div>
                      <IconButton label={adminT(language, "common.delete")} onClick={() => deleteMenuItem(item.id)} icon={Trash2} tone="danger" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addMenuItem} className="h-11 rounded-2xl font-extrabold">
                  <Plus className="h-4 w-4" />
                  {isAr ? "إضافة رابط للقائمة" : "Add menu item"}
                </Button>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="rounded-[22px] bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#17172f]">
                    <Menu className="h-4 w-4 text-[hsl(var(--primary))]" />
                    {isAr ? "معاينة قائمة الموقع" : "Public navigation preview"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {visibleMenu.map((item) => (
                      <span key={item.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-600">
                        {item.labelEn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_420px]">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm">
                <Field label={isAr ? "عنوان الميتا" : "Meta title"} value={settings.seo.metaTitle} onChange={(value) => updateSeo("metaTitle", value)} />
                <TextAreaField label={isAr ? "وصف الميتا" : "Meta description"} value={settings.seo.metaDescription} onChange={(value) => updateSeo("metaDescription", value)} />
                <Field label={isAr ? "الرابط الأساسي Canonical" : "Canonical URL"} value={settings.seo.canonicalUrl} onChange={(value) => updateSeo("canonicalUrl", value)} />
                <Field label={isAr ? "الكلمات المفتاحية" : "Keywords"} value={settings.seo.keywords} onChange={(value) => updateSeo("keywords", value)} />
                <ImageUrlDropzone label={isAr ? "صورة المشاركة Open Graph" : "Open Graph image"} value={settings.seo.ogImage} onChange={(value) => updateSeo("ogImage", value)} />
                <div className="flex flex-wrap gap-3">
                  <ToggleCard label={isAr ? "السماح بالأرشفة" : "Allow indexing"} checked={settings.seo.robotsIndex} onChange={(value) => updateSeo("robotsIndex", value)} />
                  <ToggleCard label={isAr ? "تتبع الروابط" : "Follow links"} checked={settings.seo.robotsFollow} onChange={(value) => updateSeo("robotsFollow", value)} />
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="rounded-[22px] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#17172f]">
                    <Search className="h-4 w-4 text-[hsl(var(--primary))]" />
                    {isAr ? "معاينة نتيجة البحث" : "Search result preview"}
                  </div>
                  <p className="truncate text-xs font-medium text-emerald-700">{settings.seo.canonicalUrl}</p>
                  <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-[#1a0dab]">{settings.seo.metaTitle}</h3>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{settings.seo.metaDescription}</p>
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-extrabold text-slate-400">{adminT(language, "settings.robots")}</p>
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {settings.seo.robotsIndex ? "index" : "noindex"}, {settings.seo.robotsFollow ? "follow" : "nofollow"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function Field({ label, value, onChange, className }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-2xl border-slate-200 bg-white font-semibold shadow-sm" />
    </div>
  )
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[112px] rounded-2xl border-slate-200 bg-white font-semibold leading-6 shadow-sm" />
    </div>
  )
}

function IconButton({ label, icon: Icon, onClick, disabled, tone = "default" }: { label: string; icon: typeof Eye; onClick: () => void; disabled?: boolean; tone?: "default" | "danger" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8f5fb] text-slate-500 transition hover:bg-white hover:text-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-40",
        tone === "danger" && "text-red-500 hover:text-red-600"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function ToggleCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex h-12 min-w-[180px] cursor-pointer items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

