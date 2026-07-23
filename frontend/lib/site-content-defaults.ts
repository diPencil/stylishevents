export const DEFAULT_INFORMATION_SECTION_UPCOMING = {
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

export const DEFAULT_INFORMATION_SECTION_PREVIOUS = {
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

export function normalizeSiteContentSettings(remote = {}) {
  // Keep a minimal normalization that ensures informationSection exists and defaults are applied in correct order
  const r: any = remote || {}

  const upcoming = { ...(r.upcomingEvents || {}) }
  upcoming.informationSection = { ...DEFAULT_INFORMATION_SECTION_UPCOMING, ...(r.upcomingEvents?.informationSection || {}) }

  const previous = { ...(r.previousEvents || {}) }
  previous.informationSection = { ...DEFAULT_INFORMATION_SECTION_PREVIOUS, ...(r.previousEvents?.informationSection || {}) }

  return {
    ...r,
    upcomingEvents: upcoming,
    previousEvents: previous,
  }
}

export default {
  DEFAULT_INFORMATION_SECTION_UPCOMING,
  DEFAULT_INFORMATION_SECTION_PREVIOUS,
  normalizeSiteContentSettings,
}
