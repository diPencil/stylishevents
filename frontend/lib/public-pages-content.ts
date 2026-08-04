import {
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Headphones,
  Hotel,
  Mail,
  MapPin,
  PlaneLanding,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Users,
} from "lucide-react"

export const publicNavLinks = [
  { href: "/", labelEn: "Home", labelAr: "الرئيسية" },
  { href: "/upcoming-events", labelEn: "Upcoming Events", labelAr: "الفعاليات القادمة" },
  { href: "/previous-events", labelEn: "Previous Events", labelAr: "فعاليات سابقة" },
  { href: "/about", labelEn: "About", labelAr: "عن الشركة" },
  { href: "/contact", labelEn: "Contact", labelAr: "تواصل معنا" },
]

export const upcomingEvents = [
  {
    titleEn: "Digital Transformation Summit",
    titleAr: "قمة التحول الرقمي",
    typeEn: "Conference",
    typeAr: "مؤتمر",
    cityEn: "Cairo International Convention Centre",
    cityAr: "مركز القاهرة الدولي للمؤتمرات",
    dateEn: "Aug 18-20, 2026",
    dateAr: "18-20 أغسطس 2026",
    seats: "1,200",
    statusEn: "Registration open",
    statusAr: "التسجيل متاح",
    summaryEn: "A three-day executive summit covering AI, digital infrastructure, and enterprise transformation programs.",
    summaryAr: "قمة تنفيذية لمدة ثلاثة أيام عن الذكاء الاصطناعي والبنية الرقمية وبرامج التحول المؤسسي.",
  },
  {
    titleEn: "International Hospitality Expo",
    titleAr: "معرض الضيافة الدولي",
    typeEn: "Exhibition",
    typeAr: "معرض",
    cityEn: "Dubai World Trade Centre",
    cityAr: "مركز دبي التجاري العالمي",
    dateEn: "Sep 04-06, 2026",
    dateAr: "04-06 سبتمبر 2026",
    seats: "2,400",
    statusEn: "Early access",
    statusAr: "حجز مبكر",
    summaryEn: "A focused hospitality marketplace for suppliers, hotel groups, venue operators, and event buyers.",
    summaryAr: "سوق متخصص للضيافة يجمع الموردين ومجموعات الفنادق ومشغلي القاعات ومشتري الفعاليات.",
  },
  {
    titleEn: "Founders Forum",
    titleAr: "منتدى المؤسسين",
    typeEn: "Forum",
    typeAr: "منتدى",
    cityEn: "Riyadh Front Expo",
    cityAr: "واجهة الرياض للمعارض",
    dateEn: "Sep 22, 2026",
    dateAr: "22 سبتمبر 2026",
    seats: "650",
    statusEn: "Limited seats",
    statusAr: "مقاعد محدودة",
    summaryEn: "A compact leadership day for founders, investors, operators, and growth teams building the next market leaders.",
    summaryAr: "يوم قيادي مكثف للمؤسسين والمستثمرين وفرق التشغيل والنمو لبناء رواد السوق القادمين.",
  },
]

export const previousEvents = [
  {
    titleEn: "Healthcare Innovation Day",
    titleAr: "يوم الابتكار الصحي",
    cityEn: "Jeddah",
    cityAr: "جدة",
    dateEn: "May 12, 2026",
    dateAr: "12 مايو 2026",
    attendees: "890",
    satisfaction: "4.8",
    outcomeEn: "Hybrid check-in, certificate delivery, and sponsor reporting delivered within one week.",
    outcomeAr: "تم تنفيذ تسجيل حضور هجين، وإرسال الشهادات، وتسليم تقارير الرعاة خلال أسبوع واحد.",
  },
  {
    titleEn: "Retail Leaders Roundtable",
    titleAr: "ملتقى قادة التجزئة",
    cityEn: "Cairo",
    cityAr: "القاهرة",
    dateEn: "Mar 28, 2026",
    dateAr: "28 مارس 2026",
    attendees: "420",
    satisfaction: "4.6",
    outcomeEn: "Private registration, segmented ticketing, VIP seating, and on-site guest support.",
    outcomeAr: "تسجيل خاص، تذاكر مقسمة، مقاعد لكبار الضيوف، ودعم ميداني للحضور.",
  },
  {
    titleEn: "Smart Cities Briefing",
    titleAr: "جلسة المدن الذكية",
    cityEn: "Riyadh",
    cityAr: "الرياض",
    dateEn: "Feb 18, 2026",
    dateAr: "18 فبراير 2026",
    attendees: "1,150",
    satisfaction: "4.9",
    outcomeEn: "Managed delegate flow, QR access, media registration, and post-event analytics.",
    outcomeAr: "إدارة حركة الوفود، دخول QR، تسجيل إعلامي، وتحليلات ما بعد الفعالية.",
  },
]

export const companyStats = [
  { value: "12+", labelEn: "Event formats managed", labelAr: "نوع فعالية تمت إدارته" },
  { value: "98%", labelEn: "On-site workflow accuracy", labelAr: "دقة التشغيل الميداني" },
  { value: "24/7", labelEn: "Operations support", labelAr: "دعم تشغيلي" },
  { value: "3", labelEn: "Regional delivery hubs", labelAr: "مراكز تشغيل إقليمية" },
]

export const servicePillars = [
  {
    icon: CalendarDays,
    titleEn: "Event planning",
    titleAr: "تخطيط الفعاليات",
    textEn: "Scope, agenda flow, venue readiness, registration rules, and operational milestones.",
    textAr: "تحديد النطاق، مسار الأجندة، جاهزية المكان، قواعد التسجيل، ومراحل التشغيل.",
  },
  {
    icon: Ticket,
    titleEn: "Ticketing & pricing",
    titleAr: "التذاكر والتسعير",
    textEn: "Ticket categories, pricing periods, capacity control, and attendee records.",
    textAr: "فئات التذاكر، فترات الأسعار، التحكم في السعة، وسجلات الحضور.",
  },
  {
    icon: QrCode,
    titleEn: "QR check-in",
    titleAr: "تسجيل دخول QR",
    textEn: "Fast attendee validation, live attendance status, and event-day team workflows.",
    textAr: "تحقق سريع من الحضور، حالة حضور مباشرة، وسير عمل فرق يوم الفعالية.",
  },
  {
    icon: BadgeCheck,
    titleEn: "Certificates & cards",
    titleAr: "الشهادات وكروت الفعالية",
    textEn: "Event-specific certificate templates, customer event cards, and resend workflows.",
    textAr: "قوالب شهادات خاصة بكل فعالية، كروت لكل عميل، ومسارات إعادة الإرسال.",
  },
  {
    icon: Hotel,
    titleEn: "Guest logistics",
    titleAr: "لوجستيات الضيوف",
    textEn: "Hotel coordination, arrival schedules, transport plans, and VIP service desks.",
    textAr: "تنسيق الفنادق، جداول الوصول، خطط الانتقالات، ومكاتب خدمة كبار الضيوف.",
  },
  {
    icon: BarChart3,
    titleEn: "Reports & insight",
    titleAr: "التقارير والتحليلات",
    textEn: "Sales, booking, attendance, review, and certificate delivery reporting.",
    textAr: "تقارير المبيعات والحجوزات والحضور والتقييمات وتسليم الشهادات.",
  },
]

export const whyUsReasons = [
  {
    icon: ShieldCheck,
    titleEn: "Reliable field execution",
    titleAr: "تنفيذ ميداني موثوق",
    textEn: "Every operational step has an owner, a timing window, and a backup path before event day.",
    textAr: "كل خطوة تشغيل لها مسؤول، ووقت تنفيذ، وخطة بديلة قبل يوم الفعالية.",
  },
  {
    icon: Users,
    titleEn: "Built around attendee experience",
    titleAr: "مصمم لتجربة الحضور",
    textEn: "Registration, access, seating, support, and certificates are handled as one connected journey.",
    textAr: "التسجيل والدخول والمقاعد والدعم والشهادات يتم التعامل معها كتجربة واحدة مترابطة.",
  },
  {
    icon: ClipboardCheck,
    titleEn: "Clear organizer control",
    titleAr: "تحكم واضح للمنظم",
    textEn: "Admins can track events, ticket buyers, bookings, check-ins, reviews, and delivery states.",
    textAr: "يستطيع الأدمن متابعة الفعاليات ومشتري التذاكر والحجوزات والحضور والتقييمات وحالات التسليم.",
  },
  {
    icon: Headphones,
    titleEn: "Support that understands events",
    titleAr: "دعم يفهم الفعاليات",
    textEn: "The support model is designed for pressure moments: opening gates, last-minute edits, and live attendance.",
    textAr: "نموذج الدعم مصمم للحظات الضغط: فتح البوابات، التعديلات الأخيرة، والحضور المباشر.",
  },
]

export const processSteps = [
  {
    titleEn: "Discovery",
    titleAr: "فهم المتطلبات",
    textEn: "We collect the event objective, audience profile, ticket strategy, venue needs, and service scope.",
    textAr: "نجمع هدف الفعالية، طبيعة الجمهور، استراتيجية التذاكر، احتياجات المكان، ونطاق الخدمات.",
  },
  {
    titleEn: "Configuration",
    titleAr: "الإعداد",
    textEn: "The event page, ticket types, pricing periods, QR rules, and certificate templates are prepared.",
    textAr: "يتم تجهيز صفحة الفعالية، أنواع التذاكر، فترات الأسعار، قواعد QR، وقوالب الشهادات.",
  },
  {
    titleEn: "Launch",
    titleAr: "الإطلاق",
    textEn: "Bookings open with live monitoring for sales, payments, customer support, and capacity movement.",
    textAr: "يبدأ الحجز مع متابعة مباشرة للمبيعات والمدفوعات ودعم العملاء وحركة السعة.",
  },
  {
    titleEn: "Event day",
    titleAr: "يوم الفعالية",
    textEn: "Teams handle check-in, exceptions, attendee questions, badge/card visibility, and live status updates.",
    textAr: "تتعامل الفرق مع تسجيل الدخول والاستثناءات وأسئلة الحضور وظهور الكروت والتحديثات المباشرة.",
  },
  {
    titleEn: "After event",
    titleAr: "ما بعد الفعالية",
    textEn: "Certificates, review collection, final reports, and improvement recommendations are delivered.",
    textAr: "يتم إرسال الشهادات وجمع التقييمات وتسليم التقارير النهائية وتوصيات التحسين.",
  },
]

export const contactChannels = [
  {
    icon: Mail,
    titleEn: "Sales & partnerships",
    titleAr: "المبيعات والشراكات",
    textEn: "info@stylish-holidays.com",
    textAr: "info@stylish-holidays.com",
  },
  {
    icon: Headphones,
    titleEn: "Event operations",
    titleAr: "تشغيل الفعاليات",
    textEn: "info@stylish-holidays.com",
    textAr: "info@stylish-holidays.com",
  },
  {
    icon: MapPin,
    titleEn: "Regional coverage",
    titleAr: "نطاق التغطية",
    textEn: "Egypt, Saudi Arabia, and UAE",
    textAr: "مصر، السعودية، والإمارات",
  },
]

export const contactSubjects = [
  { en: "New event setup", ar: "إعداد فعالية جديدة" },
  { en: "Ticketing and pricing", ar: "التذاكر والتسعير" },
  { en: "Certificates and event cards", ar: "الشهادات وكروت الفعالية" },
  { en: "Partnership request", ar: "طلب شراكة" },
]

export const trustItems = [
  { icon: Sparkles, labelEn: "Premium guest journey", labelAr: "تجربة ضيوف مميزة" },
  { icon: PlaneLanding, labelEn: "Arrival coordination", labelAr: "تنسيق الوصول" },
  { icon: Star, labelEn: "Review visibility", labelAr: "وضوح التقييمات" },
  { icon: CheckCircle2, labelEn: "Delivery tracking", labelAr: "متابعة التسليم" },
  { icon: Building2, labelEn: "Venue readiness", labelAr: "جاهزية المكان" },
  { icon: Clock3, labelEn: "Live operations", labelAr: "تشغيل مباشر" },
]
