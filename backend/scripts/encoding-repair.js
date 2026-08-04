import mysql from 'mysql2/promise';
import { databaseConfig } from '../src/config/database.js';

const apply = process.argv.includes('--apply');
const MARKER_RE = /(?:Ãƒ|Ã‚|Ã˜|Ã™|Ã¢â‚¬|Ã¯Â¿Â½|ï¿½|�)/;
const QUESTION_RUN_RE = /\?{4,}/;
const ARABIC_RE = /[\u0600-\u06ff]/;

const canonicalEventsInspireSection = {
  enabled: true,
  eyebrowEn: 'Community & Growth',
  eyebrowAr: 'مجتمع ونمو',
  titleEn: 'Events that help and inspire',
  titleAr: 'فعاليات تساعدك وتلهمك',
  descriptionEn: 'Connect with like-minded people, gain practical knowledge, and discover experiences designed to create meaningful personal and professional growth.',
  descriptionAr: 'تواصل مع أشخاص يشاركونك الاهتمامات، واكتسب معرفة عملية، واكتشف تجارب مصممة لصناعة نمو شخصي ومهني حقيقي.',
  showAccentLine: true,
  anchorId: 'events-that-inspire',
  timeline: {
    enabled: true,
    items: [
      { id: 'inspire-connect', labelEn: '01', labelAr: '01', titleEn: 'Connect', titleAr: 'تواصل', descriptionEn: 'Meet professionals and communities with shared interests.', descriptionAr: 'قابل محترفين ومجتمعات تشاركك نفس الاهتمامات.' },
      { id: 'inspire-learn', labelEn: '02', labelAr: '02', titleEn: 'Learn', titleAr: 'تعلم', descriptionEn: 'Join practical sessions, workshops, and discussions.', descriptionAr: 'شارك في جلسات عملية وورش ونقاشات مفيدة.' },
      { id: 'inspire-grow', labelEn: '03', labelAr: '03', titleEn: 'Grow', titleAr: 'انطلق', descriptionEn: 'Turn new knowledge into meaningful progress.', descriptionAr: 'حول المعرفة الجديدة إلى تقدم ملموس.' },
    ],
  },
  cta: {
    enabled: true,
    labelEn: 'Explore Upcoming Events',
    labelAr: 'استكشف الفعاليات القادمة',
    url: '/upcoming-events/',
    linkType: 'internal',
    openInNewTab: false,
  },
  gallery: [
    { id: 'inspire-image-1', imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1400&auto=format&fit=crop', altEn: 'Guests networking at a formal event', altAr: 'ضيوف يتواصلون في فعالية رسمية', focalPosition: 'center' },
    { id: 'inspire-image-2', imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1400&auto=format&fit=crop', altEn: 'Conference audience during a live session', altAr: 'حضور مؤتمر أثناء جلسة مباشرة', focalPosition: 'center' },
    { id: 'inspire-image-3', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop', altEn: 'Speaker presenting to an event audience', altAr: 'متحدث يقدم عرضا أمام الحضور', focalPosition: 'top' },
    { id: 'inspire-image-4', imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop', altEn: 'Audience enjoying a live event', altAr: 'حضور يستمتعون بفعالية مباشرة', focalPosition: 'center' },
  ],
};

const canonicalContactPage = {
  hero: {
    enabled: true,
    eyebrowEn: 'Contact Our Team',
    eyebrowAr: 'تواصل مع فريقنا',
    titleEn: "Let's Plan Your Next Event",
    titleAr: 'لنخطط فعاليتك القادمة',
    descriptionEn: 'Send your event brief and our operations team will help shape the setup, registration flow, and attendee experience.',
    descriptionAr: 'أرسل تفاصيل فعاليتك وسيساعدك فريقنا في تجهيز الإعداد والتسجيل وتجربة الحضور.',
    supportingTextEn: 'Fast response, clear next steps, and one coordinator for your request.',
    supportingTextAr: 'رد سريع وخطوات واضحة ومنسق واحد لمتابعة طلبك.',
    primaryCtaEn: 'Send Event Brief',
    primaryCtaAr: 'إرسال تفاصيل الفعالية',
    secondaryCtaEn: 'View Contact Details',
    secondaryCtaAr: 'عرض بيانات التواصل',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop',
    imageAltEn: 'Event planning team discussing a venue setup',
    imageAltAr: 'فريق تنظيم فعاليات يناقش تجهيز القاعة',
  },
  contactCards: [
    { id: 'phone', enabled: true, icon: 'phone', labelEn: 'Phone', labelAr: 'الهاتف', value: '+2 0100 607 1661', supportingTextEn: 'Speak with our team directly.', supportingTextAr: 'تحدث مباشرة مع فريقنا.', linkType: 'phone', linkValue: '+201006071661' },
    { id: 'email', enabled: true, icon: 'mail', labelEn: 'Email', labelAr: 'البريد الإلكتروني', value: 'info@stylish-holidays.com', supportingTextEn: 'Send briefs, files, and questions.', supportingTextAr: 'أرسل التفاصيل والملفات والأسئلة.', linkType: 'email', linkValue: 'info@stylish-holidays.com' },
    { id: 'address', enabled: true, icon: 'mapPin', labelEn: 'Address', labelAr: 'العنوان', value: '26 Tarablous Street, Abbas El Akkad, 2nd floor, Flat 5, Nasr City, Cairo, Egypt', supportingTextEn: 'Available for regional event planning.', supportingTextAr: 'متاحون لتخطيط الفعاليات إقليميا.', linkType: 'map', linkValue: 'https://maps.google.com/?q=26%20Tarablous%20Street%2C%20Abbas%20El%20Akkad%2C%202nd%20floor%2C%20Flat%205%2C%20Nasr%20City%2C%20Cairo%2C%20Egypt' },
    { id: 'support', enabled: true, icon: 'headphones', labelEn: 'Support', labelAr: 'الدعم', value: '24/7', supportingTextEn: 'Ongoing assistance before and during your event.', supportingTextAr: 'مساعدة مستمرة قبل وأثناء الفعالية.', linkType: 'whatsapp', linkValue: '+201006071661' },
  ],
  requestSection: {
    enabled: true,
    eyebrowEn: 'Request details',
    eyebrowAr: 'تفاصيل الطلب',
    titleEn: 'Send a Clear Event Brief',
    titleAr: 'أرسل ملخصا واضحا للفعالية',
    descriptionEn: 'Share the important details once, then our team will review your request and confirm the next steps.',
    descriptionAr: 'شارك التفاصيل المهمة مرة واحدة، وسيقوم فريقنا بمراجعة طلبك وتأكيد الخطوات التالية.',
    supportingTextEn: 'The form adapts for single events, recurring programs, annual partnerships, and general inquiries.',
    supportingTextAr: 'النموذج مناسب للفعاليات الفردية والمتكررة والشراكات السنوية والاستفسارات العامة.',
    stepsEn: ['Contact Information', 'Event Details', 'Review & Submit'],
    stepsAr: ['بيانات التواصل', 'تفاصيل الفعالية', 'المراجعة والإرسال'],
    submitLabelEn: 'Submit Event Brief',
    submitLabelAr: 'إرسال ملخص الفعالية',
    benefits: [
      { id: 'clear-response', icon: 'message', titleEn: 'Clear First Response', titleAr: 'رد أول واضح', textEn: 'We review the brief and reply with practical next steps.', textAr: 'نراجع الملخص ونرد بخطوات عملية واضحة.' },
      { id: 'coordinator', icon: 'userCheck', titleEn: 'Dedicated Coordinator', titleAr: 'منسق مخصص', textEn: 'One point of contact follows your request from start to finish.', textAr: 'نقطة تواصل واحدة تتابع طلبك من البداية للنهاية.' },
      { id: 'flexible', icon: 'calendar', titleEn: 'Flexible Planning', titleAr: 'تخطيط مرن', textEn: 'Tell us if dates or venue details are still flexible.', textAr: 'أخبرنا إذا كانت المواعيد أو القاعة ما زالت قابلة للتغيير.' },
      { id: 'support', icon: 'lifeBuoy', titleEn: 'Ongoing Support', titleAr: 'دعم مستمر', textEn: 'We stay available before launch and during live operations.', textAr: 'نظل متاحين قبل الإطلاق وأثناء التشغيل.' },
    ],
  },
  successState: {
    titleEn: 'Your event brief is received',
    titleAr: 'تم استلام ملخص فعاليتك',
    descriptionEn: 'Our team will review your request and contact you with the next steps shortly.',
    descriptionAr: 'سيراجع فريقنا طلبك ويتواصل معك قريبا بالخطوات التالية.',
  },
};

function hasArabic(value) {
  return ARABIC_RE.test(String(value ?? ''));
}

function isDamaged(value) {
  const text = String(value ?? '');
  return MARKER_RE.test(text) || QUESTION_RUN_RE.test(text);
}

function mergeDamagedOnly(current, canonical) {
  if (Array.isArray(canonical)) {
    return canonical.map((canonicalItem, index) => mergeDamagedOnly(current?.[index], canonicalItem));
  }
  if (canonical && typeof canonical === 'object') {
    const result = { ...(current && typeof current === 'object' ? current : {}) };
    for (const [key, canonicalValue] of Object.entries(canonical)) {
      result[key] = mergeDamagedOnly(result[key], canonicalValue);
    }
    return result;
  }
  if (typeof canonical === 'string' && hasArabic(canonical) && (!current || isDamaged(current))) {
    return canonical;
  }
  return current ?? canonical;
}

function score(value) {
  const text = String(value ?? '');
  return {
    arabic: (text.match(/[\u0600-\u06ff]/g) || []).length,
    markers: (text.match(/Ãƒ|Ã‚|Ã˜|Ã™|Ã¢â‚¬|Ã¯Â¿Â½|ï¿½|�/g) || []).length,
  };
}

function latin1Repair(value) {
  const original = String(value ?? '');
  let best = original;
  let bestScore = score(original);
  for (let i = 0; i < 3; i += 1) {
    const next = Buffer.from(best, 'latin1').toString('utf8');
    const nextScore = score(next);
    if (nextScore.arabic >= bestScore.arabic && nextScore.markers < bestScore.markers) {
      best = next;
      bestScore = nextScore;
    } else {
      break;
    }
  }
  return best;
}

function repairMojibakeStrings(value) {
  if (Array.isArray(value)) return value.map(repairMojibakeStrings);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairMojibakeStrings(item)]));
  }
  if (typeof value === 'string' && MARKER_RE.test(value)) return latin1Repair(value);
  return value;
}

async function main() {
  const connection = await mysql.createConnection(databaseConfig);
  await connection.beginTransaction();
  try {
    const [rows] = await connection.execute('SELECT id, setting_value FROM project_settings WHERE setting_key = ? FOR UPDATE', ['site_content']);
    if (!rows.length) throw new Error('site_content setting is missing');
    const row = rows[0];
    const current = typeof row.setting_value === 'string' ? JSON.parse(row.setting_value) : row.setting_value;
    const before = JSON.stringify(current);

    current.homepage = current.homepage || {};
    current.homepage.eventsInspireSection = mergeDamagedOnly(current.homepage.eventsInspireSection, canonicalEventsInspireSection);
    current.contactPage = mergeDamagedOnly(current.contactPage, canonicalContactPage);
    const repaired = repairMojibakeStrings(current);
    const after = JSON.stringify(repaired);
    const changed = before !== after;

    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', changed }, null, 2));

    if (apply && changed) {
      await connection.execute('UPDATE project_settings SET setting_value = ? WHERE id = ?', [after, row.id]);
      await connection.commit();
      console.log('APPLIED');
    } else {
      await connection.rollback();
      console.log(apply ? 'NO_CHANGES' : 'DRY_RUN_ROLLED_BACK');
    }
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
