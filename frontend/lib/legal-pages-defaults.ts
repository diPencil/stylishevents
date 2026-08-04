import type { LegalContentSection, LegalPageSettings, LegalPagesSettings } from "@/types/platform"

const TERMS_HERO_IMAGE = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2000&auto=format&fit=crop"
const PRIVACY_HERO_IMAGE = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000&auto=format&fit=crop"

const today = "2026-07-26"

const ar = {
  termsTitle: "الشروط والأحكام",
  termsDescription: "اقرأ القواعد التي تنظم استخدام منصة Stylish Events لإدارة الفعاليات والتسجيل والتذاكر والحضور.",
  privacyTitle: "سياسة الخصوصية",
  privacyDescription: "تعرف على البيانات التي تجمعها منصة Stylish Events وكيف يتم استخدامها لحجز الفعاليات وإدارة الحضور والتواصل.",
  lastUpdated: "آخر تحديث",
  legalImage: "مستندات قانونية للمنصة",
  privacyImage: "حماية بيانات المستخدمين",
}

function section(id: string, titleEn: string, titleAr: string, contentEn: string, contentAr: string): LegalContentSection {
  return { id, enabled: true, anchor: id, titleEn, titleAr, contentEn, contentAr }
}

export const DEFAULT_TERMS_PAGE_SETTINGS: LegalPageSettings = {
  enabled: true,
  hero: {
    titleEn: "Terms & Conditions",
    titleAr: ar.termsTitle,
    descriptionEn: "Review the rules that govern the use of Stylish Events for event publishing, registrations, ticketing, check-in, and certificates.",
    descriptionAr: ar.termsDescription,
    imageUrl: TERMS_HERO_IMAGE,
    imageAltEn: "Legal documents for the Stylish Events platform",
    imageAltAr: ar.legalImage,
    focalPosition: "center",
  },
  lastUpdated: today,
  lastUpdatedLabelEn: "Last updated",
  lastUpdatedLabelAr: ar.lastUpdated,
  contact: {
    email: "info@stylish-holidays.com",
    phone: "+2 0100 607 1661",
    addressEn: "26 Tarablous Street, Abbas El Akkad, 2nd floor, Flat 5, Nasr City, Cairo, Egypt",
    addressAr: "\u0662\u0666 \u0634\u0627\u0631\u0639 \u0637\u0631\u0627\u0628\u0644\u0633\u060c \u0639\u0628\u0627\u0633 \u0627\u0644\u0639\u0642\u0627\u062f\u060c \u0627\u0644\u062f\u0648\u0631 \u0627\u0644\u062b\u0627\u0646\u064a\u060c \u0634\u0642\u0629 \u0665\u060c \u0645\u062f\u064a\u0646\u0629 \u0646\u0635\u0631\u060c \u0627\u0644\u0642\u0627\u0647\u0631\u0629\u060c \u0645\u0635\u0631",
  },
  seo: {
    titleEn: "Terms & Conditions | Stylish Events",
    titleAr: "الشروط والأحكام | Stylish Events",
    descriptionEn: "Terms for using the Stylish Events platform and its event management services.",
    descriptionAr: "شروط استخدام منصة Stylish Events وخدمات إدارة الفعاليات.",
    canonicalPath: "/terms/",
    ogImage: TERMS_HERO_IMAGE,
    robotsIndex: true,
    robotsFollow: true,
  },
  sections: [
    section(
      "introduction",
      "Introduction",
      "مقدمة",
      "These Terms explain how Stylish Events may be used by visitors, registered users, event attendees, organizers, and administrators. By using the platform, you agree to follow these Terms and any event-specific rules shown during registration or booking.",
      "توضح هذه الشروط كيفية استخدام منصة Stylish Events من الزوار والمستخدمين المسجلين والحضور والمنظمين ومديري النظام. باستخدامك للمنصة فإنك توافق على الالتزام بهذه الشروط وأي قواعد خاصة بالفعالية تظهر أثناء التسجيل أو الحجز."
    ),
    section(
      "platform-services",
      "Platform Services",
      "خدمات المنصة",
      "Stylish Events provides tools for publishing event pages, managing registrations, configuring ticket types and pricing periods, issuing QR tickets, recording check-in activity, sending certificates where enabled, collecting reviews, and viewing operational reports.",
      "توفر Stylish Events أدوات لنشر صفحات الفعاليات وإدارة التسجيلات وضبط أنواع التذاكر وفترات التسعير وإصدار تذاكر QR وتسجيل الدخول للفعالية وإرسال الشهادات عند تفعيلها وجمع التقييمات وعرض التقارير التشغيلية."
    ),
    section(
      "accounts",
      "Accounts and Responsibilities",
      "الحسابات والمسؤوليات",
      "- You are responsible for keeping your login details secure.\n- Information submitted through the platform should be accurate and current.\n- Admin users must only access data needed for their authorized role.\n- You must not attempt to bypass platform permissions or interfere with service availability.",
      "- أنت مسؤول عن الحفاظ على سرية بيانات الدخول الخاصة بك.\n- يجب أن تكون المعلومات المرسلة عبر المنصة دقيقة ومحدثة.\n- يجب على مستخدمي الإدارة الوصول فقط إلى البيانات اللازمة لدورهم المصرح به.\n- لا يجوز محاولة تجاوز الصلاحيات أو التأثير على توفر الخدمة."
    ),
    section(
      "event-information",
      "Event Information and Organizer Responsibilities",
      "معلومات الفعاليات ومسؤوليات المنظم",
      "Event organizers and administrators are responsible for the accuracy of event titles, descriptions, dates, venues, capacity, prices, cancellation terms, and any instructions shown to attendees. Stylish Events may display this information as provided or configured by authorized users.",
      "يتحمل منظمو الفعاليات ومديرو النظام مسؤولية دقة عناوين الفعاليات والأوصاف والتواريخ والمواقع والسعة والأسعار وشروط الإلغاء وأي تعليمات تظهر للحضور. قد تعرض Stylish Events هذه المعلومات كما تم إدخالها أو ضبطها من المستخدمين المصرح لهم."
    ),
    section(
      "registrations-bookings",
      "Registrations and Bookings",
      "التسجيلات والحجوزات",
      "Registrations and bookings are subject to event availability, ticket rules, approval workflows, payment status where applicable, and any event-specific conditions. A booking record does not guarantee entry unless the event rules and payment or approval requirements have been satisfied.",
      "تخضع التسجيلات والحجوزات لتوفر الفعالية وقواعد التذاكر ومسارات الموافقة وحالة الدفع عند التطبيق وأي شروط خاصة بالفعالية. لا يضمن سجل الحجز الدخول إلا بعد استيفاء قواعد الفعالية ومتطلبات الدفع أو الموافقة."
    ),
    section(
      "tickets-checkin",
      "Tickets, QR Codes, and Check-in",
      "التذاكر ورموز QR وتسجيل الدخول",
      "QR tickets and attendee records are intended for the person or registration they were issued for. The platform may mark tickets as active, used, revoked, or otherwise updated according to admin actions and check-in activity.",
      "تُخصص تذاكر QR وسجلات الحضور للشخص أو التسجيل الذي صدرت له. قد تقوم المنصة بتحديث حالة التذاكر كفعالة أو مستخدمة أو ملغاة أو غير ذلك بناء على إجراءات الإدارة ونشاط تسجيل الدخول."
    ),
    section(
      "payments-refunds",
      "Payments, Pricing, and Refunds",
      "المدفوعات والأسعار والاسترداد",
      "Prices, payment requirements, order status, and refund conditions are controlled by the event configuration and any payment process connected to the event. If a payment provider is used, its own terms may also apply.",
      "تخضع الأسعار ومتطلبات الدفع وحالة الطلب وشروط الاسترداد لإعدادات الفعالية وأي عملية دفع مرتبطة بها. عند استخدام مزود دفع خارجي قد تنطبق شروطه الخاصة أيضا."
    ),
    section(
      "changes-availability",
      "Changes and Service Availability",
      "التغييرات وتوفر الخدمة",
      "Events, schedules, platform features, and operational workflows may change when required for technical, administrative, or event-management reasons. We aim to keep public pages and booking flows available, but uninterrupted access is not guaranteed.",
      "قد تتغير الفعاليات والجداول وخصائص المنصة ومسارات التشغيل عند الحاجة لأسباب تقنية أو إدارية أو متعلقة بإدارة الفعالية. نسعى لتوفير الصفحات العامة ومسارات الحجز، لكن لا نضمن الوصول دون انقطاع."
    ),
    section(
      "contact",
      "Contact Information",
      "بيانات التواصل",
      "For questions about these Terms, contact the Stylish Events team using the contact information shown on this page or through the public Contact page.",
      "لأي استفسار حول هذه الشروط، تواصل مع فريق Stylish Events من خلال بيانات التواصل المعروضة في هذه الصفحة أو من خلال صفحة التواصل العامة."
    ),
  ],
}

export const DEFAULT_PRIVACY_PAGE_SETTINGS: LegalPageSettings = {
  enabled: true,
  hero: {
    titleEn: "Privacy Policy",
    titleAr: ar.privacyTitle,
    descriptionEn: "Understand what information Stylish Events collects, how it is used, and how it supports event registrations, tickets, check-in, and communication.",
    descriptionAr: ar.privacyDescription,
    imageUrl: PRIVACY_HERO_IMAGE,
    imageAltEn: "Privacy and user data protection",
    imageAltAr: ar.privacyImage,
    focalPosition: "center",
  },
  lastUpdated: today,
  lastUpdatedLabelEn: "Last updated",
  lastUpdatedLabelAr: ar.lastUpdated,
  contact: {
    email: "info@stylish-holidays.com",
    phone: "+2 0100 607 1661",
    addressEn: "26 Tarablous Street, Abbas El Akkad, 2nd floor, Flat 5, Nasr City, Cairo, Egypt",
    addressAr: "\u0662\u0666 \u0634\u0627\u0631\u0639 \u0637\u0631\u0627\u0628\u0644\u0633\u060c \u0639\u0628\u0627\u0633 \u0627\u0644\u0639\u0642\u0627\u062f\u060c \u0627\u0644\u062f\u0648\u0631 \u0627\u0644\u062b\u0627\u0646\u064a\u060c \u0634\u0642\u0629 \u0665\u060c \u0645\u062f\u064a\u0646\u0629 \u0646\u0635\u0631\u060c \u0627\u0644\u0642\u0627\u0647\u0631\u0629\u060c \u0645\u0635\u0631",
  },
  seo: {
    titleEn: "Privacy Policy | Stylish Events",
    titleAr: "سياسة الخصوصية | Stylish Events",
    descriptionEn: "How Stylish Events collects and uses data for event registrations, tickets, check-in, certificates, reviews, and support.",
    descriptionAr: "كيف تجمع Stylish Events البيانات وتستخدمها للتسجيل والتذاكر وتسجيل الحضور والشهادات والتقييمات والدعم.",
    canonicalPath: "/privacy/",
    ogImage: PRIVACY_HERO_IMAGE,
    robotsIndex: true,
    robotsFollow: true,
  },
  sections: [
    section(
      "introduction",
      "Introduction",
      "مقدمة",
      "This Privacy Policy explains how Stylish Events handles information connected to public pages, accounts, event registrations, bookings, QR tickets, check-in, certificates, reviews, and support requests.",
      "توضح سياسة الخصوصية هذه كيفية تعامل Stylish Events مع المعلومات المرتبطة بالصفحات العامة والحسابات وتسجيلات الفعاليات والحجوزات وتذاكر QR وتسجيل الحضور والشهادات والتقييمات وطلبات الدعم."
    ),
    section(
      "information-collected",
      "Information We Collect",
      "المعلومات التي نجمعها",
      "We may collect account details, contact details, profile information, booking and registration details, event preferences, ticket records, QR/check-in activity, certificate records where enabled, reviews, support messages, and technical usage data.",
      "قد نجمع بيانات الحساب والتواصل والملف الشخصي وتفاصيل الحجز والتسجيل وتفضيلات الفعالية وسجلات التذاكر ونشاط QR وتسجيل الحضور وسجلات الشهادات عند تفعيلها والتقييمات ورسائل الدعم وبيانات الاستخدام التقنية."
    ),
    section(
      "booking-data",
      "Event Registration and Booking Data",
      "بيانات التسجيل والحجز",
      "Booking forms may request name, email, phone number, organization, job title or specialization, event details, location, expected attendance, budget range, services requested, and consent choices. This information is used to review the request and manage event operations.",
      "قد تطلب نماذج الحجز الاسم والبريد الإلكتروني ورقم الهاتف والجهة والمسمى الوظيفي أو التخصص وتفاصيل الفعالية والموقع وعدد الحضور المتوقع ونطاق الميزانية والخدمات المطلوبة وخيارات الموافقة. تستخدم هذه المعلومات لمراجعة الطلب وإدارة التشغيل."
    ),
    section(
      "ticket-attendance",
      "Ticket and Attendance Data",
      "بيانات التذاكر والحضور",
      "The platform may store ticket type, price period, booking status, QR token status, attendee records, check-in time, and related operational notes so that authorized staff can manage entry and reporting.",
      "قد تخزن المنصة نوع التذكرة وفترة السعر وحالة الحجز وحالة رمز QR وسجلات الحضور ووقت تسجيل الدخول والملاحظات التشغيلية المرتبطة حتى يتمكن الموظفون المصرح لهم من إدارة الدخول والتقارير."
    ),
    section(
      "payment-related",
      "Payment-Related Information",
      "المعلومات المتعلقة بالدفع",
      "Where payment workflows are configured, we may store order status, pricing, payment review status, and related booking references. Full payment card details, when required, should be handled by the connected payment provider rather than stored as ordinary platform content.",
      "عند ضبط مسارات الدفع، قد نخزن حالة الطلب والأسعار وحالة مراجعة الدفع ومراجع الحجز المرتبطة. بيانات بطاقات الدفع الكاملة، عند الحاجة، يجب أن تتم معالجتها عبر مزود الدفع المتصل بدلا من تخزينها كمحتوى عادي داخل المنصة."
    ),
    section(
      "use-of-information",
      "How Information Is Used",
      "كيف نستخدم المعلومات",
      "- Create and manage accounts.\n- Process event requests, registrations, bookings, and tickets.\n- Support QR check-in and attendance reporting.\n- Send operational messages, confirmations, certificates, and support replies.\n- Improve platform reliability, security, and administration.",
      "- إنشاء الحسابات وإدارتها.\n- معالجة طلبات الفعاليات والتسجيلات والحجوزات والتذاكر.\n- دعم تسجيل الدخول عبر QR وتقارير الحضور.\n- إرسال الرسائل التشغيلية والتأكيدات والشهادات وردود الدعم.\n- تحسين موثوقية المنصة وأمانها وإدارتها."
    ),
    section(
      "sharing-access",
      "Sharing and Admin Access",
      "المشاركة ووصول الإدارة",
      "Authorized administrators, organizers, and operational staff may access information needed to run the event or support the platform. Information may also be shared with connected service providers when necessary for hosting, communication, payment processing, or event operations.",
      "قد يصل مديرو النظام والمنظمون وفرق التشغيل المصرح لهم إلى المعلومات اللازمة لتشغيل الفعالية أو دعم المنصة. وقد تتم مشاركة المعلومات مع مزودي خدمات متصلين عند الحاجة للاستضافة أو التواصل أو معالجة الدفع أو تشغيل الفعالية."
    ),
    section(
      "security-retention",
      "Security and Retention",
      "الأمان والاحتفاظ",
      "We use reasonable administrative and technical measures to protect platform information. Data may be retained while needed for event operations, accounting, support, security, reporting, and legal or administrative requirements.",
      "نستخدم إجراءات إدارية وتقنية معقولة لحماية معلومات المنصة. قد يتم الاحتفاظ بالبيانات ما دامت مطلوبة للتشغيل والمحاسبة والدعم والأمان والتقارير والمتطلبات القانونية أو الإدارية."
    ),
    section(
      "cookies-storage",
      "Cookies and Local Storage",
      "ملفات الارتباط والتخزين المحلي",
      "The platform may use cookies or browser local storage for authentication, language preferences, admin sessions, interface settings, and similar operational needs.",
      "قد تستخدم المنصة ملفات الارتباط أو التخزين المحلي في المتصفح للمصادقة وتفضيلات اللغة وجلسات الإدارة وإعدادات الواجهة واحتياجات تشغيلية مشابهة."
    ),
    section(
      "choices-contact",
      "Choices and Contact",
      "الاختيارات والتواصل",
      "You may contact us to ask about your information or request correction where appropriate. Some records may need to be retained for event operations, security, accounting, or administrative reasons.",
      "يمكنك التواصل معنا للسؤال عن معلوماتك أو طلب تصحيحها عند الاقتضاء. قد نحتاج للاحتفاظ ببعض السجلات لأسباب تشغيلية أو أمنية أو محاسبية أو إدارية."
    ),
  ],
}

export const DEFAULT_LEGAL_PAGES_SETTINGS: LegalPagesSettings = {
  terms: DEFAULT_TERMS_PAGE_SETTINGS,
  privacy: DEFAULT_PRIVACY_PAGE_SETTINGS,
}

const allowedFocalPositions = new Set(["center", "top", "bottom", "left", "right"])

function normalizeAnchor(value: unknown, fallback: string) {
  const anchor = String(value || fallback).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "")
  return anchor || fallback
}

function normalizeLegalSection(sectionValue: any, index: number, fallback: LegalContentSection): LegalContentSection {
  const merged = { ...fallback, ...(sectionValue || {}) }
  return {
    id: String(merged.id || `legal-section-${index + 1}`),
    enabled: merged.enabled !== false,
    anchor: normalizeAnchor(merged.anchor, fallback.anchor || `section-${index + 1}`),
    titleEn: String(merged.titleEn || ""),
    titleAr: String(merged.titleAr || ""),
    contentEn: String(merged.contentEn || ""),
    contentAr: String(merged.contentAr || ""),
  }
}

export function normalizeLegalPageSettings(savedPage: any = {}, defaultPage: LegalPageSettings): LegalPageSettings {
  const saved = savedPage || {}
  const fallbackSections = defaultPage.sections
  const sections = Array.isArray(saved.sections)
    ? saved.sections.slice(0, 20).map((item: any, index: number) => normalizeLegalSection(item, index, fallbackSections[index] || fallbackSections[0]))
    : fallbackSections

  return {
    ...defaultPage,
    ...saved,
    enabled: saved.enabled !== false,
    hero: {
      ...defaultPage.hero,
      ...(saved.hero || {}),
      focalPosition: allowedFocalPositions.has(saved.hero?.focalPosition) ? saved.hero.focalPosition : defaultPage.hero.focalPosition,
    },
    lastUpdated: saved.lastUpdated || defaultPage.lastUpdated,
    lastUpdatedLabelEn: saved.lastUpdatedLabelEn || defaultPage.lastUpdatedLabelEn,
    lastUpdatedLabelAr: saved.lastUpdatedLabelAr || defaultPage.lastUpdatedLabelAr,
    sections,
    contact: {
      ...defaultPage.contact,
      ...(saved.contact || {}),
    },
    seo: {
      ...defaultPage.seo,
      ...(saved.seo || {}),
      canonicalPath: saved.seo?.canonicalPath || defaultPage.seo.canonicalPath,
      robotsIndex: saved.seo?.robotsIndex !== false,
      robotsFollow: saved.seo?.robotsFollow !== false,
    },
  }
}

export function normalizeLegalPagesSettings(savedLegalPages: any = {}): LegalPagesSettings {
  return {
    terms: normalizeLegalPageSettings(savedLegalPages?.terms, DEFAULT_TERMS_PAGE_SETTINGS),
    privacy: normalizeLegalPageSettings(savedLegalPages?.privacy, DEFAULT_PRIVACY_PAGE_SETTINGS),
  }
}
