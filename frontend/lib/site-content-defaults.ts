import type { AboutPageSettings, ContactPageSettings, EventInformationSectionSettings, FeaturesSectionHeaderSettings, HomepageFinalCtaSettings, HomepageInspireSectionSettings, HomepageRequestSetupSettings } from "@/types/platform"
export { DEFAULT_LEGAL_PAGES_SETTINGS, DEFAULT_PRIVACY_PAGE_SETTINGS, DEFAULT_TERMS_PAGE_SETTINGS, normalizeLegalPageSettings, normalizeLegalPagesSettings } from "@/lib/legal-pages-defaults"
import { DEFAULT_LEGAL_PAGES_SETTINGS, normalizeLegalPagesSettings } from "@/lib/legal-pages-defaults"

export type FooterNavigationLink = {
  id: string
  col: "services" | "support"
  labelEn: string
  labelAr: string
  href: string
}

export type FooterLegalLink = {
  id: "privacy" | "terms"
  labelEn: string
  labelAr: string
  href: string
}

export const DEFAULT_FOOTER_LINKS: FooterNavigationLink[] = [
  { id: "upcoming-events", col: "services", labelEn: "Upcoming Events", labelAr: "الفعاليات القادمة", href: "/upcoming-events" },
  { id: "previous-events", col: "services", labelEn: "Previous Events", labelAr: "الفعاليات السابقة", href: "/previous-events" },
  { id: "reception-and-farewell", col: "services", labelEn: "Reception and Farewell", labelAr: "الاستقبال والتوديع", href: "/reception-and-farewell" },
  { id: "faq", col: "services", labelEn: "Frequently Asked Questions", labelAr: "الأسئلة الشائعة", href: "/faq" },
  { id: "about", col: "support", labelEn: "About Company", labelAr: "عن الشركة", href: "/about" },
  { id: "contact", col: "support", labelEn: "Contact Us", labelAr: "تواصل معنا", href: "/contact" },
  { id: "how-to-create-account", col: "support", labelEn: "How to Create an Account", labelAr: "كيفية إنشاء حساب", href: "/how-to-create-account" },
  { id: "how-to-register-for-event", col: "support", labelEn: "How to Register for an Event", labelAr: "كيفية التسجيل في فعالية", href: "/how-to-register-for-event" },
]

export const DEFAULT_FOOTER_LEGAL_LINKS: FooterLegalLink[] = [
  { id: "terms", labelEn: "Terms and Conditions", labelAr: "الشروط والأحكام", href: "/terms" },
  { id: "privacy", labelEn: "Privacy Policy", labelAr: "سياسة الخصوصية", href: "/privacy" },
]

function footerRouteId(href = "", label = "") {
  const key = `${href} ${label}`.toLowerCase()
  if (key.includes("upcoming")) return "upcoming-events"
  if (key.includes("previous")) return "previous-events"
  if (key.includes("reception")) return "reception-and-farewell"
  if (key.includes("faq") || key.includes("frequently")) return "faq"
  if (key.includes("privacy")) return "privacy"
  if (key.includes("terms")) return "terms"
  if (key.includes("about")) return "about"
  if (key.includes("contact")) return "contact"
  if (key.includes("create-account") || key.includes("create an account")) return "how-to-create-account"
  if (key.includes("register-for-event") || key.includes("register for an event")) return "how-to-register-for-event"
  return ""
}

export function normalizeFooterLinks(savedLinks: any[] = []): FooterNavigationLink[] {
  const source = Array.isArray(savedLinks) ? savedLinks : []
  const savedById = new Map<string, any>()
  source.forEach((link) => {
    const id = footerRouteId(link?.href, `${link?.labelEn || ""} ${link?.labelAr || ""}`) || link?.id
    if (id) savedById.set(id, link)
  })

  return DEFAULT_FOOTER_LINKS.map((fallback) => {
    const saved = savedById.get(fallback.id)
    return {
      ...fallback,
      ...(saved || {}),
      id: fallback.id,
      col: fallback.col,
      href: saved?.href && saved.href !== "#" ? saved.href : fallback.href,
    }
  })
}

export function normalizeFooterLegalLinks(savedLegalLinks: any[] = [], savedFooterLinks: any[] = []): FooterLegalLink[] {
  const source = [...(Array.isArray(savedLegalLinks) ? savedLegalLinks : []), ...(Array.isArray(savedFooterLinks) ? savedFooterLinks : [])]
  const savedById = new Map<string, any>()
  source.forEach((link) => {
    const id = footerRouteId(link?.href, `${link?.labelEn || ""} ${link?.labelAr || ""}`)
    if (id === "privacy" || id === "terms") savedById.set(id, link)
  })

  return DEFAULT_FOOTER_LEGAL_LINKS.map((fallback) => {
    const saved = savedById.get(fallback.id)
    return {
      ...fallback,
      ...(saved || {}),
      id: fallback.id,
      href: saved?.href && saved.href !== "#" ? saved.href : fallback.href,
    }
  })
}

export const DEFAULT_INFORMATION_SECTION_UPCOMING: EventInformationSectionSettings = {
  enabled: true,
  badgeEn: "",
  badgeAr: "",
  titleEn: "Built for registration, not just promotion",
  titleAr: "مصمم للتسجيل وليس العرض فقط",
  descriptionEn: "Upcoming event pages should help customers understand the event, choose the right ticket, and complete the booking without confusion.",
  descriptionAr: "صفحات الفعاليات القادمة مصممة لمساعدة العميل على فهم الفعالية، واختيار التذكرة المناسبة، وإتمام الحجز بكل سهولة.",
  imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop",
  imageAltEn: "About Upcoming Events",
  imageAltAr: "حول الفعاليات القادمة",
  imagePosition: 'left',
  bullets: [
    { id: 'b-1', textEn: 'Ticket types separated by access and benefits.', textAr: 'فصل أنواع التذاكر حسب الدخول والمزايا.' },
    { id: 'b-2', textEn: 'Pricing periods support early bird and VIP.', textAr: 'فترات الأسعار تدعم الحجز المبكر والـ VIP.' },
    { id: 'b-3', textEn: 'Every customer receives a QR ticket.', textAr: 'كل عميل يستلم تذكرة بـ QR code.' },
  ],
}

export const DEFAULT_INFORMATION_SECTION_PREVIOUS: EventInformationSectionSettings = {
  enabled: true,
  badgeEn: "",
  badgeAr: "",
  titleEn: "What makes a finished event valuable",
  titleAr: "ما الذي يجعل الفعالية المنتهية ذات قيمة",
  descriptionEn: "A previous event is not just a photo gallery. It is a source of data: attendance, buying behavior, reviews, and check-in issues.",
  descriptionAr: "الفعالية السابقة ليست معرض صور فقط. هي مصدر بيانات: حضور، سلوك شراء، تقييمات، ومشاكل الدخول.",
  imageUrl: "https://images.unsplash.com/photo-1475721028070-205bc1ad2cca?q=80&w=2000&auto=format&fit=crop",
  imageAltEn: "About Previous Events",
  imageAltAr: "حول الفعاليات السابقة",
  imagePosition: 'right',
  bullets: [
    { id: 'p-1', textEn: 'Final reports compare tickets sold and attendees.', textAr: 'التقارير النهائية تقارن التذاكر المباعة والحضور الفعلي.' },
    { id: 'p-2', textEn: 'Review analysis shows what guests valued.', textAr: 'تحليل التقييمات يوضح ما الذي أعجب الضيوف.' },
    { id: 'p-3', textEn: 'Certificate and event-card delivery logs.', textAr: 'سجلات تسليم الشهادات والكروت.' },
  ],
}

export const DEFAULT_EVENTS_INSPIRE_SECTION: HomepageInspireSectionSettings = {
  enabled: true,
  eyebrowEn: "Community & Growth",
  eyebrowAr: "مجتمع ونمو",
  titleEn: "Events that help and inspire",
  titleAr: "فعاليات تساعدك وتلهمك",
  descriptionEn:
    "Connect with like-minded people, gain practical knowledge, and discover experiences designed to create meaningful personal and professional growth.",
  descriptionAr:
    "تواصل مع أشخاص يشاركونك الاهتمامات، واكتسب معرفة عملية، واكتشف تجارب مصممة لصناعة نمو شخصي ومهني حقيقي.",
  showAccentLine: true,
  anchorId: "events-that-inspire",
  timeline: {
    enabled: true,
    items: [
      {
        id: "inspire-connect",
        labelEn: "01",
        labelAr: "01",
        titleEn: "Connect",
        titleAr: "تواصل",
        descriptionEn: "Meet professionals and communities with shared interests.",
        descriptionAr: "قابل محترفين ومجتمعات تشاركك نفس الاهتمامات.",
      },
      {
        id: "inspire-learn",
        labelEn: "02",
        labelAr: "02",
        titleEn: "Learn",
        titleAr: "تعلّم",
        descriptionEn: "Join practical sessions, workshops, and discussions.",
        descriptionAr: "شارك في جلسات عملية وورش ونقاشات مفيدة.",
      },
      {
        id: "inspire-grow",
        labelEn: "03",
        labelAr: "03",
        titleEn: "Grow",
        titleAr: "انطلق",
        descriptionEn: "Turn new knowledge into meaningful progress.",
        descriptionAr: "حوّل المعرفة الجديدة إلى تقدم ملموس.",
      },
    ],
  },
  cta: {
    enabled: true,
    labelEn: "Explore Upcoming Events",
    labelAr: "استكشف الفعاليات القادمة",
    url: "/upcoming-events/",
    linkType: "internal",
    openInNewTab: false,
  },
  gallery: [
    {
      id: "inspire-image-1",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1400&auto=format&fit=crop",
      altEn: "Guests networking at a formal event",
      altAr: "ضيوف يتواصلون في فعالية رسمية",
      focalPosition: "center",
    },
    {
      id: "inspire-image-2",
      imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1400&auto=format&fit=crop",
      altEn: "Conference audience during a live session",
      altAr: "حضور مؤتمر أثناء جلسة مباشرة",
      focalPosition: "center",
    },
    {
      id: "inspire-image-3",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop",
      altEn: "Speaker presenting to an event audience",
      altAr: "متحدث يقدم عرضا أمام الحضور",
      focalPosition: "top",
    },
    {
      id: "inspire-image-4",
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop",
      altEn: "Audience enjoying a live event",
      altAr: "حضور يستمتعون بفعالية مباشرة",
      focalPosition: "center",
    },
  ],
}

export const DEFAULT_FEATURES_SECTION: FeaturesSectionHeaderSettings = {
  enabled: true,
  eyebrowEn: "Features",
  eyebrowAr: "المميزات",
  titleEn: "Transform Your Next Event into a Powerhouse",
  titleAr: "حوّل فعاليتك القادمة إلى تجربة متكاملة وقوية",
  descriptionEn: "Everything you need to organize and manage major events in one integrated platform.",
  descriptionAr: "كل ما تحتاجه لتنظيم وإدارة الفعاليات الكبرى من خلال منصة واحدة متكاملة.",
}

export const DEFAULT_HOMEPAGE_REQUEST_SETUP: HomepageRequestSetupSettings = {
  enabled: true,
  eyebrowEn: "Booking",
  eyebrowAr: "طلب حجز",
  titleEn: "Request Your Event Setup",
  titleAr: "اطلب تجهيز فعاليتك",
  descriptionEn: "Fill in the key details and our team will review your request and confirm the next steps.",
  descriptionAr: "املأ التفاصيل الأساسية وسيراجع فريقنا طلبك ويؤكد الخطوات التالية.",
  supportingTextEn: "Share what you know now. We will help you complete the planning details.",
  supportingTextAr: "شاركنا المتاح من التفاصيل الآن، وسنساعدك في استكمال خطة الفعالية.",
  statCards: [
    { id: "setup-stat-events", value: "500+", labelEn: "Successful Events", labelAr: "فعالية ناجحة" },
    { id: "setup-stat-satisfaction", value: "98%", labelEn: "Client Satisfaction", labelAr: "رضا العملاء" },
    { id: "setup-stat-countries", value: "50+", labelEn: "Countries Worldwide", labelAr: "دولة حول العالم" },
    { id: "setup-stat-years", value: "15+", labelEn: "Years Experience", labelAr: "سنة خبرة" },
  ],
  stepsEn: ["Contact Info", "Event Specs", "Location & Services"],
  stepsAr: ["بيانات التواصل", "تفاصيل الفعالية", "الموقع والخدمات"],
  nextLabelEn: "Next",
  nextLabelAr: "التالي",
  backLabelEn: "Back",
  backLabelAr: "السابق",
  submitLabelEn: "Confirm Booking",
  submitLabelAr: "تأكيد الحجز",
  sendingLabelEn: "Sending...",
  sendingLabelAr: "جاري الإرسال...",
  successTitleEn: "Your booking request has been received",
  successTitleAr: "تم استلام طلب حجزك",
  successDescriptionEn: "Our team will review your request and contact you with the next steps.",
  successDescriptionAr: "سيراجع فريقنا طلبك ويتواصل معك لتأكيد الخطوات التالية.",
}

export const DEFAULT_HOMEPAGE_FINAL_CTA: HomepageFinalCtaSettings = {
  enabled: true,
  eyebrowEn: "Contact Our Team",
  eyebrowAr: "تواصل مع فريقنا",
  titleEn: "Tell Us About Your Next Event",
  titleAr: "حدثنا عن فعاليتك القادمة",
  descriptionEn: "Send us your event brief and our team will help you choose the right setup, tickets, and attendee flow.",
  descriptionAr: "أرسل لنا تفاصيل فعاليتك وسيساعدك فريقنا في اختيار الإعداد المناسب والتذاكر ومسار الحضور.",
  primaryButtonEnabled: true,
  primaryButtonLabelEn: "Contact Us",
  primaryButtonLabelAr: "تواصل معنا",
  primaryButtonUrl: "/contact/",
  primaryButtonOpenInNewTab: false,
}

export const DEFAULT_CONTACT_PAGE_SETTINGS: ContactPageSettings = {
  hero: {
    enabled: true,
    eyebrowEn: "CONTACT OUR TEAM",
    eyebrowAr: "تواصل مع فريقنا",
    titleEn: "Let's Plan Your Next Event",
    titleAr: "لنخطط لفعاليتك القادمة",
    descriptionEn:
      "Tell us what you are planning, and our team will help you shape the event, define the requirements, and move forward with clear next steps.",
    descriptionAr:
      "شاركنا فكرتك ومتطلباتك، وسيساعدك فريقنا في تحديد تفاصيل الفعالية وترتيب الخطوات القادمة بكل وضوح.",
    supportingTextEn: "From a single event to a long-term partnership, we are ready to understand your goals.",
    supportingTextAr: "سواء كنت تخطط لفعالية واحدة أو شراكة طويلة المدى، نحن جاهزون لفهم أهدافك.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop",
    imageAltEn: "Event planning team reviewing a venue brief",
    imageAltAr: "فريق تخطيط فعاليات يراجع تفاصيل فعالية",
    primaryCtaEn: "Send Your Event Brief",
    primaryCtaAr: "أرسل تفاصيل فعاليتك",
    secondaryCtaEn: "Contact Our Team",
    secondaryCtaAr: "تواصل مع فريقنا",
  },
  contactCards: [
    {
      id: "contact-phone",
      enabled: true,
      icon: "phone",
      labelEn: "Call Us",
      labelAr: "اتصل بنا",
      value: "+2 0100 607 1661",
      supportingTextEn: "Speak directly with our team.",
      supportingTextAr: "تحدث مباشرة مع فريقنا.",
      linkType: "phone",
      linkValue: "+201006071661",
    },
    {
      id: "contact-email",
      enabled: true,
      icon: "mail",
      labelEn: "Email Us",
      labelAr: "راسلنا",
      value: "info@stylish-holidays.com",
      supportingTextEn: "Send your questions or event brief.",
      supportingTextAr: "أرسل أسئلتك أو ملخص فعاليتك.",
      linkType: "email",
      linkValue: "info@stylish-holidays.com",
    },
    {
      id: "contact-address",
      enabled: true,
      icon: "mapPin",
      labelEn: "Visit Us",
      labelAr: "زورنا",
      value: "26 Tarablous Street, Abbas El Akkad, 2nd floor, Flat 5, Nasr City, Cairo, Egypt",
      supportingTextEn: "Meet our team by appointment.",
      supportingTextAr: "قابل فريقنا بموعد مسبق.",
      linkType: "map",
      linkValue: "https://maps.google.com/?q=26%20Tarablous%20Street%2C%20Abbas%20El%20Akkad%2C%202nd%20floor%2C%20Flat%205%2C%20Nasr%20City%2C%20Cairo%2C%20Egypt",
    },
    {
      id: "contact-support",
      enabled: true,
      icon: "headphones",
      labelEn: "24/7 Support",
      labelAr: "دعم 24/7",
      value: "Always Available",
      supportingTextEn: "Get assistance before, during, and after your event.",
      supportingTextAr: "احصل على المساعدة قبل الفعالية وأثناءها وبعدها.",
      linkType: "whatsapp",
      linkValue: "201006071661",
    },
  ],
  requestSection: {
    enabled: true,
    eyebrowEn: "REQUEST DETAILS",
    eyebrowAr: "تفاصيل الطلب",
    titleEn: "Send a Clear Event Brief",
    titleAr: "أرسل لنا ملخصا واضحا عن فعاليتك",
    descriptionEn:
      "Share the essential details of your event and our team will review your request, understand your objectives, and contact you with the recommended next steps.",
    descriptionAr:
      "شاركنا التفاصيل الأساسية لفعاليتك، وسيقوم فريقنا بمراجعة طلبك وفهم أهدافك والتواصل معك لتحديد الخطوات المناسبة.",
    supportingTextEn:
      "You do not need to have every detail finalized. Start with what you know, and we will help you complete the plan.",
    supportingTextAr: "لا يشترط أن تكون جميع التفاصيل مكتملة؛ ابدأ بالمعلومات المتاحة وسنساعدك في استكمال الخطة.",
    benefits: [
      {
        id: "benefit-response",
        icon: "message",
        titleEn: "Clear First Response",
        titleAr: "رد أولي واضح",
        textEn: "Receive a clear initial review of your request and the next required steps.",
        textAr: "احصل على مراجعة أولية واضحة لطلبك والخطوات المطلوبة بعد ذلك.",
      },
      {
        id: "benefit-coordinator",
        icon: "userCheck",
        titleEn: "Dedicated Coordinator",
        titleAr: "منسق مخصص",
        textEn: "A team member will follow your request from the first brief to execution.",
        textAr: "يتابع أحد أعضاء الفريق طلبك من أول ملخص حتى التنفيذ.",
      },
      {
        id: "benefit-planning",
        icon: "calendar",
        titleEn: "Flexible Planning",
        titleAr: "تخطيط مرن",
        textEn: "We support single events, recurring programs, and annual partnerships.",
        textAr: "ندعم الفعاليات الفردية والبرامج المتكررة والشراكات السنوية.",
      },
      {
        id: "benefit-support",
        icon: "lifeBuoy",
        titleEn: "Ongoing Support",
        titleAr: "دعم مستمر",
        textEn: "Our team remains available before, during, and after the event.",
        textAr: "يبقى فريقنا متاحا قبل الفعالية وأثناءها وبعدها.",
      },
    ],
    submitLabelEn: "Submit Event Brief",
    submitLabelAr: "إرسال تفاصيل الفعالية",
    clearLabelEn: "Clear Form",
    clearLabelAr: "مسح النموذج",
    sendingLabelEn: "Sending...",
    sendingLabelAr: "جاري الإرسال...",
    errorTitleEn: "Could not send inquiry",
    errorTitleAr: "تعذر إرسال الاستفسار",
    consentLabelEn: "I agree that Stylish Events may use the information provided to respond to this inquiry.",
    consentLabelAr: "أوافق على استخدام Stylish Events للمعلومات المقدمة للرد على هذا الاستفسار.",
    inquiryTypes: [
      { id: "type-general", value: "general", enabled: true, labelEn: "General Inquiry", labelAr: "استفسار عام", order: 1 },
      { id: "type-event-planning", value: "event_planning", enabled: true, labelEn: "Event Planning", labelAr: "تنظيم فعالية", order: 2 },
      { id: "type-technical-support", value: "technical_support", enabled: true, labelEn: "Technical Support", labelAr: "الدعم الفني", order: 3 },
      { id: "type-partnership", value: "partnership", enabled: true, labelEn: "Partnership", labelAr: "شراكة", order: 4 },
      { id: "type-existing-booking", value: "existing_booking", enabled: true, labelEn: "Existing Registration or Booking", labelAr: "تسجيل أو حجز قائم", order: 5 },
      { id: "type-other", value: "other", enabled: true, labelEn: "Other", labelAr: "أخرى", order: 6 },
    ],
    fieldLabels: {
      fullNameEn: "Full name",
      fullNameAr: "الاسم الكامل",
      emailEn: "Email address",
      emailAr: "البريد الإلكتروني",
      phoneEn: "Phone",
      phoneAr: "الهاتف",
      companyEn: "Company / organization",
      companyAr: "الشركة / الجهة",
      inquiryTypeEn: "Inquiry type",
      inquiryTypeAr: "نوع الاستفسار",
      preferredContactEn: "Preferred contact",
      preferredContactAr: "وسيلة التواصل المفضلة",
      subjectEn: "Subject",
      subjectAr: "الموضوع",
      messageEn: "How can we help?",
      messageAr: "كيف يمكننا مساعدتك؟",
      eventDateEn: "Approximate event date",
      eventDateAr: "التاريخ التقريبي للفعالية",
      eventCityEn: "City / location",
      eventCityAr: "المدينة / الموقع",
      expectedAttendeesEn: "Expected attendees",
      expectedAttendeesAr: "عدد الحضور المتوقع",
    },
    placeholders: {
      fullNameEn: "Your full name",
      fullNameAr: "اكتب اسمك الكامل",
      emailEn: "name@example.com",
      emailAr: "name@example.com",
      phoneEn: "Phone number",
      phoneAr: "رقم الهاتف",
      companyEn: "Company name, if any",
      companyAr: "اسم الجهة إن وجد",
      subjectEn: "What is your inquiry about?",
      subjectAr: "ما موضوع استفسارك؟",
      messageEn: "Write your question or briefly describe what you need.",
      messageAr: "اكتب استفسارك أو وضح باختصار ما تحتاج إليه.",
      eventCityEn: "City or venue name",
      eventCityAr: "المدينة أو اسم المكان",
      expectedAttendeesEn: "Example: 250",
      expectedAttendeesAr: "مثال: 250",
    },
  },
  successState: {
    titleEn: "Your Event Brief Has Been Received",
    titleAr: "تم استلام تفاصيل فعاليتك",
    descriptionEn: "Our team will review the request and contact you using your preferred communication method.",
    descriptionAr: "سيقوم فريقنا بمراجعة الطلب والتواصل معك من خلال وسيلة الاتصال التي حددتها.",
  },
}

const CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS = {
  enabled: true,
  eyebrowEn: "CONTACT REQUEST",
  eyebrowAr: "طلب تواصل",
  titleEn: "How Can We Help?",
  titleAr: "كيف يمكننا مساعدتك؟",
  descriptionEn:
    "Send us your question or tell us briefly what you are planning. Our team will review your inquiry and contact you with the appropriate next step.",
  descriptionAr:
    "أرسل استفسارك أو شاركنا نبذة مختصرة عما تخطط له، وسيقوم فريقنا بمراجعة رسالتك والتواصل معك بالخطوة المناسبة.",
  supportingTextEn:
    "General questions, event planning, partnerships, technical support, and existing booking help all start here.",
  supportingTextAr: "الأسئلة العامة، تخطيط الفعاليات، الشراكات، الدعم الفني، ومتابعة الحجوزات القائمة تبدأ من هنا.",
  benefits: [
    {
      id: "benefit-response",
      icon: "message",
      titleEn: "Quick Review",
      titleAr: "مراجعة سريعة",
      textEn: "We review every inquiry and direct it to the right team.",
      textAr: "نراجع كل استفسار ونوجهه للفريق المناسب.",
    },
    {
      id: "benefit-follow-up",
      icon: "userCheck",
      titleEn: "Clear Follow-Up",
      titleAr: "متابعة واضحة",
      textEn: "You receive a practical response based on your request.",
      textAr: "يصلك رد عملي بناء على تفاصيل طلبك.",
    },
    {
      id: "benefit-assistance",
      icon: "lifeBuoy",
      titleEn: "Ongoing Assistance",
      titleAr: "مساعدة مستمرة",
      textEn: "Our team remains available until your question is resolved.",
      textAr: "يبقى فريقنا متاحا حتى يتم حل استفسارك.",
    },
  ],
  submitLabelEn: "Send Inquiry",
  submitLabelAr: "إرسال الاستفسار",
  clearLabelEn: "Clear Form",
  clearLabelAr: "مسح النموذج",
  sendingLabelEn: "Sending...",
  sendingLabelAr: "جاري الإرسال...",
  errorTitleEn: "Could not send inquiry",
  errorTitleAr: "تعذر إرسال الاستفسار",
  consentLabelEn: "I agree that Stylish Events may use the information provided to respond to this inquiry.",
  consentLabelAr: "أوافق على استخدام Stylish Events للمعلومات المقدمة للرد على هذا الاستفسار.",
  inquiryTypes: [
    { id: "type-general", value: "general", enabled: true, labelEn: "General Inquiry", labelAr: "استفسار عام", order: 1 },
    { id: "type-event-planning", value: "event_planning", enabled: true, labelEn: "Event Planning", labelAr: "تنظيم فعالية", order: 2 },
    { id: "type-technical-support", value: "technical_support", enabled: true, labelEn: "Technical Support", labelAr: "الدعم الفني", order: 3 },
    { id: "type-partnership", value: "partnership", enabled: true, labelEn: "Partnership", labelAr: "شراكة", order: 4 },
    { id: "type-existing-booking", value: "existing_booking", enabled: true, labelEn: "Existing Registration or Booking", labelAr: "تسجيل أو حجز قائم", order: 5 },
    { id: "type-other", value: "other", enabled: true, labelEn: "Other", labelAr: "أخرى", order: 6 },
  ],
  fieldLabels: {
    fullNameEn: "Full name",
    fullNameAr: "الاسم الكامل",
    emailEn: "Email address",
    emailAr: "البريد الإلكتروني",
    phoneEn: "Phone",
    phoneAr: "الهاتف",
    companyEn: "Company / organization",
    companyAr: "الشركة / الجهة",
    inquiryTypeEn: "Inquiry type",
    inquiryTypeAr: "نوع الاستفسار",
    preferredContactEn: "Preferred contact",
    preferredContactAr: "وسيلة التواصل المفضلة",
    subjectEn: "Subject",
    subjectAr: "الموضوع",
    messageEn: "How can we help?",
    messageAr: "كيف يمكننا مساعدتك؟",
    eventDateEn: "Approximate event date",
    eventDateAr: "التاريخ التقريبي للفعالية",
    eventCityEn: "City / location",
    eventCityAr: "المدينة / الموقع",
    expectedAttendeesEn: "Expected attendees",
    expectedAttendeesAr: "عدد الحضور المتوقع",
  },
  placeholders: {
    fullNameEn: "Your full name",
    fullNameAr: "اكتب اسمك الكامل",
    emailEn: "name@example.com",
    emailAr: "name@example.com",
    phoneEn: "Phone number",
    phoneAr: "رقم الهاتف",
    companyEn: "Company name, if any",
    companyAr: "اسم الجهة إن وجد",
    subjectEn: "What is your inquiry about?",
    subjectAr: "ما موضوع استفسارك؟",
    messageEn: "Write your question or briefly describe what you need.",
    messageAr: "اكتب استفسارك أو وضح باختصار ما تحتاج إليه.",
    eventCityEn: "City or venue name",
    eventCityAr: "المدينة أو اسم المكان",
    expectedAttendeesEn: "Example: 250",
    expectedAttendeesAr: "مثال: 250",
  },
} satisfies ContactPageSettings["requestSection"]

const CONTACT_INQUIRY_SUCCESS_DEFAULTS = {
  titleEn: "Your Inquiry Has Been Sent",
  titleAr: "تم إرسال استفسارك",
  descriptionEn: "Our team will review your message and contact you using the details you provided.",
  descriptionAr: "سيقوم فريقنا بمراجعة رسالتك والتواصل معك من خلال البيانات التي قدمتها.",
} satisfies ContactPageSettings["successState"]

export const DEFAULT_ABOUT_PAGE_SETTINGS: AboutPageSettings = {
  hero: {
    enabled: true,
    eyebrowEn: "ABOUT STYLISH EVENTS",
    eyebrowAr: "عن منصة Stylish Events",
    titleEn: "One Platform for Smarter Event Operations",
    titleAr: "منصة واحدة لإدارة الفعاليات بذكاء",
    descriptionEn:
      "Stylish Events brings event planning, registration, ticketing, attendance, communication, and post-event services into one connected platform.",
    descriptionAr:
      "تجمع منصة Stylish Events بين تخطيط الفعاليات والتسجيل والتذاكر والحضور والتواصل وخدمات ما بعد الفعالية ضمن نظام واحد متكامل.",
    supportingTextEn: "Built to help event teams manage every stage with more clarity, control, and consistency.",
    supportingTextAr: "صممت لمساعدة فرق العمل على إدارة كل مرحلة بوضوح وتحكم واستمرارية أكبر.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop",
    imageAltEn: "Event operations team reviewing a conference setup",
    imageAltAr: "فريق تشغيل فعاليات يراجع تجهيز مؤتمر",
    breadcrumbEn: "About",
    breadcrumbAr: "عن المنصة",
  },
  overview: {
    enabled: true,
    eyebrowEn: "PLATFORM OVERVIEW",
    eyebrowAr: "نظرة على المنصة",
    headingEn: "Built Around the Complete Event Journey",
    headingAr: "مصممة لتغطية رحلة الفعالية بالكامل",
    descriptionEn:
      "Stylish Events connects the tools required before, during, and after an event. Teams can publish event pages, manage tickets, organize registrations, track attendance, communicate with participants, and review results without moving between disconnected systems.",
    descriptionAr:
      "تربط Stylish Events الأدوات المطلوبة قبل الفعالية وأثناءها وبعدها، بداية من نشر صفحات الفعاليات وإدارة التذاكر والتسجيلات، وحتى متابعة الحضور والتواصل مع المشاركين ومراجعة النتائج من خلال نظام واحد.",
    valuePoints: [
      { id: "about-value-unified", textEn: "Unified Event Management", textAr: "إدارة فعاليات موحدة" },
      { id: "about-value-visibility", textEn: "Real-Time Operational Visibility", textAr: "وضوح تشغيلي لحظي" },
      { id: "about-value-attendee", textEn: "Consistent Attendee Experience", textAr: "تجربة حضور متسقة" },
    ],
    images: [
      {
        id: "about-overview-image-1",
        imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop",
        altEn: "Conference audience during a live session",
        altAr: "حضور مؤتمر أثناء جلسة مباشرة",
      },
      {
        id: "about-overview-image-2",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
        altEn: "Speaker presenting to an event audience",
        altAr: "متحدث يقدم عرضا أمام حضور فعالية",
      },
      {
        id: "about-overview-image-3",
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop",
        altEn: "Guests networking at a professional event",
        altAr: "ضيوف يتواصلون في فعالية مهنية",
      },
    ],
    ctaEnabled: true,
    ctaLabelEn: "Explore Upcoming Events",
    ctaLabelAr: "استعرض الفعاليات القادمة",
    ctaUrl: "/upcoming-events",
  },
  ecosystem: {
    enabled: true,
    eyebrowEn: "COMPLETE EVENT ECOSYSTEM",
    eyebrowAr: "منظومة فعاليات متكاملة",
    headingEn: "Everything Connected in One Operational Flow",
    headingAr: "كل ما تحتاجه الفعالية في مسار تشغيلي واحد",
    descriptionEn:
      "From publishing an event to validating entry and sending post-event updates, the platform keeps every step connected to the same operational record.",
    descriptionAr:
      "من نشر الفعالية إلى التحقق من الدخول وإرسال تحديثات ما بعد الحدث، تبقي المنصة كل خطوة مرتبطة بنفس السجل التشغيلي.",
    cards: [
      {
        id: "about-capability-publishing",
        enabled: true,
        icon: "calendar",
        titleEn: "Event Creation & Publishing",
        titleAr: "إنشاء ونشر الفعاليات",
        descriptionEn: "Create professional event pages and manage schedules, speakers, venues, and event information.",
        descriptionAr: "أنشئ صفحات فعاليات احترافية وأدر الجداول والمتحدثين والمواقع ومعلومات الفعالية.",
      },
      {
        id: "about-capability-ticketing",
        enabled: true,
        icon: "ticket",
        titleEn: "Registration & Ticketing",
        titleAr: "التسجيل والتذاكر",
        descriptionEn: "Configure ticket types, pricing periods, registration requirements, and booking workflows.",
        descriptionAr: "اضبط أنواع التذاكر وفترات الأسعار ومتطلبات التسجيل ومسارات الحجز.",
      },
      {
        id: "about-capability-checkin",
        enabled: true,
        icon: "qrCode",
        titleEn: "Attendance & Check-in",
        titleAr: "الحضور وتسجيل الدخول",
        descriptionEn: "Manage attendees, scan QR codes, track entry, and monitor attendance in real time.",
        descriptionAr: "أدر الحضور وامسح رموز QR وتابع الدخول والحضور بشكل لحظي.",
      },
      {
        id: "about-capability-communication",
        enabled: true,
        icon: "mail",
        titleEn: "Communication & Post-Event Services",
        titleAr: "التواصل وخدمات ما بعد الفعالية",
        descriptionEn: "Send confirmations, certificates, updates, and collect reviews after the event.",
        descriptionAr: "أرسل التأكيدات والشهادات والتحديثات واجمع التقييمات بعد الفعالية.",
      },
    ],
  },
  team: {
    enabled: false,
    eyebrowEn: "TEAM",
    eyebrowAr: "الفريق",
    headingEn: "The People Behind Stylish Events",
    headingAr: "الفريق خلف Stylish Events",
    descriptionEn: "Add real team members here when you are ready to publish them on the About page.",
    descriptionAr: "أضف أعضاء الفريق الحقيقيين هنا عندما تكون جاهزا لنشرهم في صفحة About.",
    members: [],
  },
  vision: {
    enabled: true,
    eyebrowEn: "OUR DIRECTION",
    eyebrowAr: "اتجاهنا",
    headingEn: "Making Every Event Easier to Manage",
    headingAr: "نجعل إدارة كل فعالية أكثر سهولة",
    descriptionEn:
      "Our goal is to reduce operational complexity and give event teams one reliable environment for planning, execution, communication, and reporting.",
    descriptionAr:
      "هدفنا هو تقليل التعقيد التشغيلي وتوفير بيئة موحدة وموثوقة تساعد فرق الفعاليات في التخطيط والتنفيذ والتواصل وإعداد التقارير.",
    principles: [
      { id: "about-principle-workflows", textEn: "Clear Workflows", textAr: "مسارات عمل واضحة" },
      { id: "about-principle-data", textEn: "Reliable Event Data", textAr: "بيانات فعاليات موثوقة" },
      { id: "about-principle-flexible", textEn: "Flexible Operations", textAr: "تشغيل مرن" },
      { id: "about-principle-experience", textEn: "Better Participant Experience", textAr: "تجربة أفضل للمشاركين" },
    ],
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop",
    imageAltEn: "Audience watching a live event production",
    imageAltAr: "حضور يتابعون إنتاج فعالية مباشرة",
    ctaEnabled: true,
    ctaLabelEn: "Explore Upcoming Events",
    ctaLabelAr: "استعرض الفعاليات القادمة",
    ctaUrl: "/upcoming-events",
  },
}

function normalizeEventsInspireSection(savedSection: any = {}) {
  const savedTimeline = savedSection?.timeline || {}
  const savedCta = savedSection?.cta || {}
  const defaultGalleryById = new Map(DEFAULT_EVENTS_INSPIRE_SECTION.gallery.map((image) => [image.id, image]))
  const gallery = Array.isArray(savedSection?.gallery)
    ? savedSection.gallery.slice(0, 4).map((image: any, index: number) => ({
        ...(defaultGalleryById.get(image?.id) || DEFAULT_EVENTS_INSPIRE_SECTION.gallery[index] || DEFAULT_EVENTS_INSPIRE_SECTION.gallery[0]),
        ...(image || {}),
        id: image?.id || `inspire-image-${index + 1}`,
      }))
    : DEFAULT_EVENTS_INSPIRE_SECTION.gallery

  return {
    ...DEFAULT_EVENTS_INSPIRE_SECTION,
    ...(savedSection || {}),
    timeline: {
      ...DEFAULT_EVENTS_INSPIRE_SECTION.timeline,
      ...savedTimeline,
      items: Array.isArray(savedTimeline.items)
        ? savedTimeline.items.slice(0, 6).map((item: any, index: number) => ({
            id: item?.id || `inspire-item-${index + 1}`,
            labelEn: item?.labelEn || "",
            labelAr: item?.labelAr || item?.labelEn || "",
            titleEn: item?.titleEn || "",
            titleAr: item?.titleAr || "",
            descriptionEn: item?.descriptionEn || "",
            descriptionAr: item?.descriptionAr || "",
          }))
        : DEFAULT_EVENTS_INSPIRE_SECTION.timeline.items,
    },
    cta: {
      ...DEFAULT_EVENTS_INSPIRE_SECTION.cta,
      ...savedCta,
    },
    gallery,
  }
}

export function normalizeAboutPageSettings(savedAboutPage: any = {}): AboutPageSettings {
  const saved = savedAboutPage || {}
  const defaultOverviewValuesById = new Map(DEFAULT_ABOUT_PAGE_SETTINGS.overview.valuePoints.map((item) => [item.id, item]))
  const defaultOverviewImagesById = new Map(DEFAULT_ABOUT_PAGE_SETTINGS.overview.images.map((item) => [item.id, item]))
  const defaultCardsById = new Map(DEFAULT_ABOUT_PAGE_SETTINGS.ecosystem.cards.map((item) => [item.id, item]))
  const defaultPrinciplesById = new Map(DEFAULT_ABOUT_PAGE_SETTINGS.vision.principles.map((item) => [item.id, item]))

  return {
    ...DEFAULT_ABOUT_PAGE_SETTINGS,
    ...saved,
    hero: {
      ...DEFAULT_ABOUT_PAGE_SETTINGS.hero,
      ...(saved.hero || {}),
    },
    overview: {
      ...DEFAULT_ABOUT_PAGE_SETTINGS.overview,
      ...(saved.overview || {}),
      valuePoints: Array.isArray(saved.overview?.valuePoints)
        ? saved.overview.valuePoints.slice(0, 3).map((item: any, index: number) => ({
            ...(defaultOverviewValuesById.get(item?.id) || DEFAULT_ABOUT_PAGE_SETTINGS.overview.valuePoints[index] || DEFAULT_ABOUT_PAGE_SETTINGS.overview.valuePoints[0]),
            ...(item || {}),
            id: item?.id || `about-value-${index + 1}`,
          }))
        : DEFAULT_ABOUT_PAGE_SETTINGS.overview.valuePoints,
      images: Array.isArray(saved.overview?.images)
        ? saved.overview.images.slice(0, 3).map((item: any, index: number) => ({
            ...(defaultOverviewImagesById.get(item?.id) || DEFAULT_ABOUT_PAGE_SETTINGS.overview.images[index] || DEFAULT_ABOUT_PAGE_SETTINGS.overview.images[0]),
            ...(item || {}),
            id: item?.id || `about-overview-image-${index + 1}`,
          }))
        : DEFAULT_ABOUT_PAGE_SETTINGS.overview.images,
    },
    ecosystem: {
      ...DEFAULT_ABOUT_PAGE_SETTINGS.ecosystem,
      ...(saved.ecosystem || {}),
      cards: Array.isArray(saved.ecosystem?.cards)
        ? saved.ecosystem.cards.slice(0, 6).map((item: any, index: number) => ({
            ...(defaultCardsById.get(item?.id) || DEFAULT_ABOUT_PAGE_SETTINGS.ecosystem.cards[index] || DEFAULT_ABOUT_PAGE_SETTINGS.ecosystem.cards[0]),
            ...(item || {}),
            id: item?.id || `about-capability-${index + 1}`,
          }))
        : DEFAULT_ABOUT_PAGE_SETTINGS.ecosystem.cards,
    },
    team: {
      ...DEFAULT_ABOUT_PAGE_SETTINGS.team,
      ...(saved.team || {}),
      members: Array.isArray(saved.team?.members)
        ? saved.team.members.slice(0, 12).map((item: any, index: number) => ({
            id: item?.id || `about-team-${index + 1}`,
            enabled: item?.enabled !== false,
            imageUrl: item?.imageUrl || "",
            imageAltEn: item?.imageAltEn || item?.nameEn || "",
            imageAltAr: item?.imageAltAr || item?.nameAr || "",
            nameEn: item?.nameEn || "",
            nameAr: item?.nameAr || "",
            jobTitleEn: item?.jobTitleEn || "",
            jobTitleAr: item?.jobTitleAr || "",
            bioEn: item?.bioEn || "",
            bioAr: item?.bioAr || "",
            linkedinUrl: item?.linkedinUrl || "",
            email: item?.email || "",
          }))
        : [],
    },
    vision: {
      ...DEFAULT_ABOUT_PAGE_SETTINGS.vision,
      ...(saved.vision || {}),
      principles: Array.isArray(saved.vision?.principles)
        ? saved.vision.principles.slice(0, 6).map((item: any, index: number) => ({
            ...(defaultPrinciplesById.get(item?.id) || DEFAULT_ABOUT_PAGE_SETTINGS.vision.principles[index] || DEFAULT_ABOUT_PAGE_SETTINGS.vision.principles[0]),
            ...(item || {}),
            id: item?.id || `about-principle-${index + 1}`,
          }))
        : DEFAULT_ABOUT_PAGE_SETTINGS.vision.principles,
    },
  }
}

export function normalizeContactPageSettings(savedContactPage: any = {}): ContactPageSettings {
  const saved = savedContactPage || {}
  const savedRequest = saved.requestSection || {}
  const defaultCardsById = new Map(DEFAULT_CONTACT_PAGE_SETTINGS.contactCards.map((card) => [card.id, card]))
  const defaultBenefitsById = new Map(CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.benefits.map((benefit) => [benefit.id, benefit]))
  const defaultInquiryTypesByValue = new Map(CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.inquiryTypes.map((option) => [option.value, option]))
  const looksLikeLegacyBrief =
    /event brief|request details|booking|annual partner/i.test(`${savedRequest.titleEn || ""} ${savedRequest.eyebrowEn || ""} ${savedRequest.submitLabelEn || ""}`) ||
    Array.isArray(savedRequest.stepsEn)
  const requestSource = looksLikeLegacyBrief ? {} : savedRequest

  return {
    ...DEFAULT_CONTACT_PAGE_SETTINGS,
    ...saved,
    hero: {
      ...DEFAULT_CONTACT_PAGE_SETTINGS.hero,
      ...(saved.hero || {}),
    },
    contactCards: Array.isArray(saved.contactCards)
      ? saved.contactCards.slice(0, 4).map((card: any, index: number) => ({
          ...(defaultCardsById.get(card?.id) || DEFAULT_CONTACT_PAGE_SETTINGS.contactCards[index] || DEFAULT_CONTACT_PAGE_SETTINGS.contactCards[0]),
          ...(card || {}),
          id: card?.id || `contact-card-${index + 1}`,
        }))
      : DEFAULT_CONTACT_PAGE_SETTINGS.contactCards,
    requestSection: {
      ...CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS,
      ...requestSource,
      benefits: Array.isArray(requestSource.benefits)
        ? requestSource.benefits.slice(0, 3).map((benefit: any, index: number) => ({
            ...(defaultBenefitsById.get(benefit?.id) || CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.benefits[index] || CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.benefits[0]),
            ...(benefit || {}),
            id: benefit?.id || `contact-benefit-${index + 1}`,
          }))
        : CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.benefits,
      inquiryTypes: Array.isArray(requestSource.inquiryTypes)
        ? requestSource.inquiryTypes.slice(0, 10).map((option: any, index: number) => ({
            ...(defaultInquiryTypesByValue.get(option?.value) || CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.inquiryTypes[index] || CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.inquiryTypes[0]),
            ...(option || {}),
            id: option?.id || `contact-inquiry-type-${index + 1}`,
            value: String(option?.value || "").replace(/[^a-z0-9_]/gi, "_").toLowerCase(),
            order: Number(option?.order || index + 1),
          }))
        : CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.inquiryTypes,
      fieldLabels: {
        ...CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.fieldLabels,
        ...(requestSource.fieldLabels || {}),
      },
      placeholders: {
        ...CONTACT_INQUIRY_REQUEST_SECTION_DEFAULTS.placeholders,
        ...(requestSource.placeholders || {}),
      },
    },
    successState: {
      ...CONTACT_INQUIRY_SUCCESS_DEFAULTS,
      ...(looksLikeLegacyBrief ? {} : saved.successState || {}),
    },
  }
}

export function normalizeHomepageRequestSetupSettings(savedRequestSetup: any = {}): HomepageRequestSetupSettings {
  const saved = savedRequestSetup || {}
  const defaultStatsById = new Map(DEFAULT_HOMEPAGE_REQUEST_SETUP.statCards.map((card) => [card.id, card]))

  return {
    ...DEFAULT_HOMEPAGE_REQUEST_SETUP,
    ...saved,
    statCards: Array.isArray(saved.statCards)
      ? saved.statCards.slice(0, 4).map((card: any, index: number) => ({
          ...(defaultStatsById.get(card?.id) || DEFAULT_HOMEPAGE_REQUEST_SETUP.statCards[index] || DEFAULT_HOMEPAGE_REQUEST_SETUP.statCards[0]),
          ...(card || {}),
          id: card?.id || `setup-stat-${index + 1}`,
        }))
      : DEFAULT_HOMEPAGE_REQUEST_SETUP.statCards,
    stepsEn: Array.isArray(saved.stepsEn) && saved.stepsEn.length === 3 ? saved.stepsEn : DEFAULT_HOMEPAGE_REQUEST_SETUP.stepsEn,
    stepsAr: Array.isArray(saved.stepsAr) && saved.stepsAr.length === 3 ? saved.stepsAr : DEFAULT_HOMEPAGE_REQUEST_SETUP.stepsAr,
  }
}

export function normalizeFeaturesSectionSettings(savedFeaturesSection: any = {}, savedHomepage: any = {}): FeaturesSectionHeaderSettings {
  return {
    ...DEFAULT_FEATURES_SECTION,
    eyebrowEn: savedHomepage?.featuresBadgeEn || DEFAULT_FEATURES_SECTION.eyebrowEn,
    eyebrowAr: savedHomepage?.featuresBadgeAr || DEFAULT_FEATURES_SECTION.eyebrowAr,
    titleEn: savedHomepage?.featuresTitleEn || DEFAULT_FEATURES_SECTION.titleEn,
    titleAr: savedHomepage?.featuresTitleAr || DEFAULT_FEATURES_SECTION.titleAr,
    descriptionEn: savedHomepage?.featuresSubtitleEn || DEFAULT_FEATURES_SECTION.descriptionEn,
    descriptionAr: savedHomepage?.featuresSubtitleAr || DEFAULT_FEATURES_SECTION.descriptionAr,
    ...(savedFeaturesSection || {}),
  }
}

export function normalizeHomepageFinalCtaSettings(savedFinalCta: any = {}, savedHomepage: any = {}): HomepageFinalCtaSettings {
  const legacyTitleEn = [savedHomepage?.footerTitle1En, "Stylish Events", savedHomepage?.footerTitle2En].filter(Boolean).join(" ")
  const legacyTitleAr = [savedHomepage?.footerTitle1Ar, "Stylish Events", savedHomepage?.footerTitle2Ar].filter(Boolean).join(" ")
  const oldTitleEn = "Unlock the Power of Stylish Events for Your Next Event"
  const oldTitleAr = "أطلق العنان لقوة Stylish Events في فعاليتك القادمة"

  const normalized = {
    ...DEFAULT_HOMEPAGE_FINAL_CTA,
    eyebrowEn: savedHomepage?.footerEyebrowEn || DEFAULT_HOMEPAGE_FINAL_CTA.eyebrowEn,
    eyebrowAr: savedHomepage?.footerEyebrowAr || DEFAULT_HOMEPAGE_FINAL_CTA.eyebrowAr,
    titleEn: legacyTitleEn || DEFAULT_HOMEPAGE_FINAL_CTA.titleEn,
    titleAr: legacyTitleAr || DEFAULT_HOMEPAGE_FINAL_CTA.titleAr,
    descriptionEn: savedHomepage?.footerDescEn || DEFAULT_HOMEPAGE_FINAL_CTA.descriptionEn,
    descriptionAr: savedHomepage?.footerDescAr || DEFAULT_HOMEPAGE_FINAL_CTA.descriptionAr,
    primaryButtonLabelEn: savedHomepage?.footerCtaEn || DEFAULT_HOMEPAGE_FINAL_CTA.primaryButtonLabelEn,
    primaryButtonLabelAr: savedHomepage?.footerCtaAr || DEFAULT_HOMEPAGE_FINAL_CTA.primaryButtonLabelAr,
    ...(savedFinalCta || {}),
  }

  if (normalized.eyebrowEn === "Partner for Your Success") normalized.eyebrowEn = DEFAULT_HOMEPAGE_FINAL_CTA.eyebrowEn
  if (normalized.eyebrowAr === "شريك في النجاح") normalized.eyebrowAr = DEFAULT_HOMEPAGE_FINAL_CTA.eyebrowAr
  if (normalized.titleEn === oldTitleEn) normalized.titleEn = DEFAULT_HOMEPAGE_FINAL_CTA.titleEn
  if (normalized.titleAr === oldTitleAr) normalized.titleAr = DEFAULT_HOMEPAGE_FINAL_CTA.titleAr
  if (normalized.descriptionEn === "Join over 500 organizations that trust our platform to organize and manage their most important events.") normalized.descriptionEn = DEFAULT_HOMEPAGE_FINAL_CTA.descriptionEn
  if (normalized.descriptionAr === "انضم إلى أكثر من 500 مؤسسة تثق بمنصتنا لتنظيم وإدارة أهم فعالياتها.") normalized.descriptionAr = DEFAULT_HOMEPAGE_FINAL_CTA.descriptionAr
  if (normalized.primaryButtonLabelEn === "Start Organizing Your Event") normalized.primaryButtonLabelEn = DEFAULT_HOMEPAGE_FINAL_CTA.primaryButtonLabelEn
  if (normalized.primaryButtonLabelAr === "ابدأ تنظيم فعاليتك") normalized.primaryButtonLabelAr = DEFAULT_HOMEPAGE_FINAL_CTA.primaryButtonLabelAr
  if (!normalized.primaryButtonUrl || normalized.primaryButtonUrl === "#booking-form") normalized.primaryButtonUrl = DEFAULT_HOMEPAGE_FINAL_CTA.primaryButtonUrl

  return normalized
}

export function normalizeSiteContentSettings(remote = {}) {
  // Keep a minimal normalization that ensures informationSection exists and defaults are applied in correct order
  const r: any = remote || {}

  const homepage = { ...(r.homepage || {}) }
  homepage.eventsInspireSection = normalizeEventsInspireSection(r.homepage?.eventsInspireSection)
  const featuresSection = normalizeFeaturesSectionSettings(r.featuresSection, r.homepage)
  const homepageRequestSetup = normalizeHomepageRequestSetupSettings(r.homepageRequestSetup)
  const homepageFinalCta = normalizeHomepageFinalCtaSettings(r.homepageFinalCta, r.homepage)
  const contactPage = normalizeContactPageSettings(r.contactPage)
  const aboutPage = normalizeAboutPageSettings(r.aboutPage)
  const legalPages = normalizeLegalPagesSettings(r.legalPages)
  const footerLinks = normalizeFooterLinks(r.footerLinks)
  const footerLegalLinks = normalizeFooterLegalLinks(r.footerLegalLinks, r.footerLinks)

  const upcoming = { ...(r.upcomingEvents || {}) }
  upcoming.informationSection = { ...DEFAULT_INFORMATION_SECTION_UPCOMING, ...(r.upcomingEvents?.informationSection || {}) }

  const previous = { ...(r.previousEvents || {}) }
  previous.informationSection = { ...DEFAULT_INFORMATION_SECTION_PREVIOUS, ...(r.previousEvents?.informationSection || {}) }

  return {
    ...r,
    homepage,
    featuresSection,
    homepageRequestSetup,
    homepageFinalCta,
    contactPage,
    aboutPage,
    legalPages,
    footerLinks,
    footerLegalLinks,
    upcomingEvents: upcoming,
    previousEvents: previous,
  }
}

export default {
  DEFAULT_INFORMATION_SECTION_UPCOMING,
  DEFAULT_INFORMATION_SECTION_PREVIOUS,
  DEFAULT_EVENTS_INSPIRE_SECTION,
  DEFAULT_FEATURES_SECTION,
  DEFAULT_HOMEPAGE_REQUEST_SETUP,
  DEFAULT_HOMEPAGE_FINAL_CTA,
  DEFAULT_CONTACT_PAGE_SETTINGS,
  DEFAULT_ABOUT_PAGE_SETTINGS,
  DEFAULT_LEGAL_PAGES_SETTINGS,
  normalizeAboutPageSettings,
  normalizeLegalPagesSettings,
  normalizeFeaturesSectionSettings,
  normalizeHomepageRequestSetupSettings,
  normalizeHomepageFinalCtaSettings,
  normalizeContactPageSettings,
  normalizeSiteContentSettings,
}
