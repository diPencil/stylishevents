import type { ContactPageSettings, EventInformationSectionSettings, HomepageInspireSectionSettings } from "@/types/platform"

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
      value: "+20 110 665 3177",
      supportingTextEn: "Speak directly with our team.",
      supportingTextAr: "تحدث مباشرة مع فريقنا.",
      linkType: "phone",
      linkValue: "+201106653177",
    },
    {
      id: "contact-email",
      enabled: true,
      icon: "mail",
      labelEn: "Email Us",
      labelAr: "راسلنا",
      value: "info@directevents.click",
      supportingTextEn: "Send your questions or event brief.",
      supportingTextAr: "أرسل أسئلتك أو ملخص فعاليتك.",
      linkType: "email",
      linkValue: "info@directevents.click",
    },
    {
      id: "contact-address",
      enabled: true,
      icon: "mapPin",
      labelEn: "Visit Us",
      labelAr: "زورنا",
      value: "Cairo, Egypt",
      supportingTextEn: "Meet our team by appointment.",
      supportingTextAr: "قابل فريقنا بموعد مسبق.",
      linkType: "map",
      linkValue: "https://maps.google.com/?q=Cairo%2C%20Egypt",
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
      linkValue: "201106653177",
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
    stepsEn: ["Contact Information", "Event Details", "Review & Submit"],
    stepsAr: ["بيانات التواصل", "تفاصيل الفعالية", "المراجعة والإرسال"],
    submitLabelEn: "Submit Event Brief",
    submitLabelAr: "إرسال تفاصيل الفعالية",
  },
  successState: {
    titleEn: "Your Event Brief Has Been Received",
    titleAr: "تم استلام تفاصيل فعاليتك",
    descriptionEn: "Our team will review the request and contact you using your preferred communication method.",
    descriptionAr: "سيقوم فريقنا بمراجعة الطلب والتواصل معك من خلال وسيلة الاتصال التي حددتها.",
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

export function normalizeContactPageSettings(savedContactPage: any = {}): ContactPageSettings {
  const saved = savedContactPage || {}
  const savedRequest = saved.requestSection || {}
  const defaultCardsById = new Map(DEFAULT_CONTACT_PAGE_SETTINGS.contactCards.map((card) => [card.id, card]))
  const defaultBenefitsById = new Map(DEFAULT_CONTACT_PAGE_SETTINGS.requestSection.benefits.map((benefit) => [benefit.id, benefit]))

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
      ...DEFAULT_CONTACT_PAGE_SETTINGS.requestSection,
      ...savedRequest,
      benefits: Array.isArray(savedRequest.benefits)
        ? savedRequest.benefits.slice(0, 4).map((benefit: any, index: number) => ({
            ...(defaultBenefitsById.get(benefit?.id) || DEFAULT_CONTACT_PAGE_SETTINGS.requestSection.benefits[index] || DEFAULT_CONTACT_PAGE_SETTINGS.requestSection.benefits[0]),
            ...(benefit || {}),
            id: benefit?.id || `contact-benefit-${index + 1}`,
          }))
        : DEFAULT_CONTACT_PAGE_SETTINGS.requestSection.benefits,
      stepsEn: Array.isArray(savedRequest.stepsEn) && savedRequest.stepsEn.length === 3 ? savedRequest.stepsEn : DEFAULT_CONTACT_PAGE_SETTINGS.requestSection.stepsEn,
      stepsAr: Array.isArray(savedRequest.stepsAr) && savedRequest.stepsAr.length === 3 ? savedRequest.stepsAr : DEFAULT_CONTACT_PAGE_SETTINGS.requestSection.stepsAr,
    },
    successState: {
      ...DEFAULT_CONTACT_PAGE_SETTINGS.successState,
      ...(saved.successState || {}),
    },
  }
}

export function normalizeSiteContentSettings(remote = {}) {
  // Keep a minimal normalization that ensures informationSection exists and defaults are applied in correct order
  const r: any = remote || {}

  const homepage = { ...(r.homepage || {}) }
  homepage.eventsInspireSection = normalizeEventsInspireSection(r.homepage?.eventsInspireSection)
  const contactPage = normalizeContactPageSettings(r.contactPage)

  const upcoming = { ...(r.upcomingEvents || {}) }
  upcoming.informationSection = { ...DEFAULT_INFORMATION_SECTION_UPCOMING, ...(r.upcomingEvents?.informationSection || {}) }

  const previous = { ...(r.previousEvents || {}) }
  previous.informationSection = { ...DEFAULT_INFORMATION_SECTION_PREVIOUS, ...(r.previousEvents?.informationSection || {}) }

  return {
    ...r,
    homepage,
    contactPage,
    upcomingEvents: upcoming,
    previousEvents: previous,
  }
}

export default {
  DEFAULT_INFORMATION_SECTION_UPCOMING,
  DEFAULT_INFORMATION_SECTION_PREVIOUS,
  DEFAULT_EVENTS_INSPIRE_SECTION,
  DEFAULT_CONTACT_PAGE_SETTINGS,
  normalizeContactPageSettings,
  normalizeSiteContentSettings,
}
