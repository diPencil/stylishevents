import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { databaseConfig } from '../src/config/database.js';
import { hashPassword } from '../src/utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });

const migrations = [
  '001_events_platform_schema.sql',
  '002_phase1_annex_workflows.sql',
  '003_auth_and_operational_hardening.sql',
  '004_users_permissions.sql',
  '005_user_profile_fields.sql',
];

const envAdminPassword = process.env.ADMIN_PASSWORD;
const isProduction = process.env.NODE_ENV === 'production';
let defaultPassword;
if (isProduction && !envAdminPassword) {
  console.error('ERROR: ADMIN_PASSWORD must be set when NODE_ENV=production');
  process.exit(1);
} else {
  defaultPassword = envAdminPassword || 'Admin@123456';
}

function qr(seed) {
  return crypto.createHash('sha256').update(`stylish-events:${seed}`).digest('hex');
}

function json(value) {
  return JSON.stringify(value);
}

function dt(value) {
  return value.replace('T', ' ').slice(0, 19);
}

async function bootstrapSchema() {
  const connection = await mysql.createConnection({
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
    multipleStatements: true,
  });

  try {
    for (const file of migrations) {
      const sql = await fs.readFile(path.join(rootDir, 'database', file), 'utf8');
      await connection.query(sql);
    }
  } finally {
    await connection.end();
  }
}

async function createDb() {
  return mysql.createConnection({
    ...databaseConfig,
    multipleStatements: true,
    namedPlaceholders: true,
  });
}

async function one(db, sql, params = {}) {
  const [rows] = await db.execute(sql, params);
  return rows[0] || null;
}

async function exec(db, sql, params = {}) {
  const [result] = await db.execute(sql, params);
  return result;
}

async function upsertRole(db, role) {
  await exec(db, `
    INSERT INTO roles (code, name_en, name_ar)
    VALUES (:code, :nameEn, :nameAr)
    ON DUPLICATE KEY UPDATE name_en = VALUES(name_en), name_ar = VALUES(name_ar)
  `, role);
  return one(db, 'SELECT id FROM roles WHERE code = :code', { code: role.code });
}

async function upsertUser(db, roles, user, passwordHash) {
  const roleId = roles[user.roleCode].id;
  await exec(db, `
    INSERT INTO users (
      role_id, name, email, phone, country_code, country_name, gender, username,
      password_hash, status, preferred_language, avatar_url, notes, last_login_at
    )
    VALUES (
      :roleId, :name, :email, :phone, :countryCode, :countryName, :gender, :username,
      :passwordHash, :status, :preferredLanguage, :avatarUrl, :notes, :lastLoginAt
    )
    ON DUPLICATE KEY UPDATE
      role_id = VALUES(role_id),
      name = VALUES(name),
      email = VALUES(email),
      phone = VALUES(phone),
      country_code = VALUES(country_code),
      country_name = VALUES(country_name),
      gender = VALUES(gender),
      username = VALUES(username),
      password_hash = VALUES(password_hash),
      status = VALUES(status),
      preferred_language = VALUES(preferred_language),
      avatar_url = VALUES(avatar_url),
      notes = VALUES(notes),
      last_login_at = VALUES(last_login_at)
  `, {
    roleId,
    passwordHash,
    phone: null,
    countryCode: null,
    countryName: null,
    gender: 'not_specified',
    username: null,
    status: 'active',
    preferredLanguage: 'en',
    avatarUrl: null,
    notes: null,
    lastLoginAt: '2026-07-18 11:40:00',
    ...user,
  });

  return one(db, 'SELECT id FROM users WHERE email = :email', { email: user.email });
}

async function upsertVenue(db, venue) {
  const existing = await one(db, 'SELECT id FROM venues WHERE name_en = :nameEn LIMIT 1', venue);
  if (existing) {
    await exec(db, `
      UPDATE venues
      SET name_ar = :nameAr, country_code = :countryCode, city_en = :cityEn, city_ar = :cityAr,
          address_en = :addressEn, address_ar = :addressAr, capacity = :capacity
      WHERE id = :id
    `, { ...venue, id: existing.id });
    return existing;
  }

  const result = await exec(db, `
    INSERT INTO venues (name_en, name_ar, country_code, city_en, city_ar, address_en, address_ar, capacity)
    VALUES (:nameEn, :nameAr, :countryCode, :cityEn, :cityAr, :addressEn, :addressAr, :capacity)
  `, venue);
  return { id: result.insertId };
}

async function upsertEvent(db, event) {
  const existing = await one(db, 'SELECT id FROM events WHERE slug = :slug LIMIT 1', event);
  const params = { ...event, gallery: json(event.gallery || []) };
  if (existing) {
    await exec(db, `
      UPDATE events
      SET organizer_id = :organizerId, venue_id = :venueId, title_en = :titleEn, title_ar = :titleAr,
          summary_en = :summaryEn, summary_ar = :summaryAr, description_en = :descriptionEn,
          description_ar = :descriptionAr, type = :type, status = :status, starts_at = :startsAt,
          ends_at = :endsAt, registration_starts_at = :registrationStartsAt,
          registration_ends_at = :registrationEndsAt, timezone = :timezone, cover_image_url = :coverImageUrl,
          banner_image_url = :bannerImageUrl, gallery_json = :gallery, google_maps_url = :googleMapsUrl,
          max_attendees = :maxAttendees
      WHERE id = :id
    `, { ...params, id: existing.id });
    return existing;
  }

  const result = await exec(db, `
    INSERT INTO events (
      organizer_id, venue_id, slug, title_en, title_ar, summary_en, summary_ar, description_en, description_ar,
      type, status, starts_at, ends_at, registration_starts_at, registration_ends_at, timezone, cover_image_url,
      banner_image_url, gallery_json, google_maps_url, max_attendees
    )
    VALUES (
      :organizerId, :venueId, :slug, :titleEn, :titleAr, :summaryEn, :summaryAr, :descriptionEn, :descriptionAr,
      :type, :status, :startsAt, :endsAt, :registrationStartsAt, :registrationEndsAt, :timezone, :coverImageUrl,
      :bannerImageUrl, :gallery, :googleMapsUrl, :maxAttendees
    )
  `, params);
  return { id: result.insertId };
}

async function upsertSession(db, session) {
  const existing = await one(db, `
    SELECT id FROM event_sessions
    WHERE event_id = :eventId AND title_en = :titleEn AND starts_at = :startsAt
    LIMIT 1
  `, session);
  if (existing) {
    await exec(db, `
      UPDATE event_sessions
      SET title_ar = :titleAr, speaker_name = :speakerName, ends_at = :endsAt, room_name = :roomName
      WHERE id = :id
    `, { ...session, id: existing.id });
    return existing;
  }
  const result = await exec(db, `
    INSERT INTO event_sessions (event_id, title_en, title_ar, speaker_name, starts_at, ends_at, room_name)
    VALUES (:eventId, :titleEn, :titleAr, :speakerName, :startsAt, :endsAt, :roomName)
  `, session);
  return { id: result.insertId };
}

async function upsertTicket(db, ticket) {
  const existing = await one(db, `
    SELECT id FROM ticket_types
    WHERE event_id = :eventId AND name_en = :nameEn
    LIMIT 1
  `, ticket);
  if (existing) {
    await exec(db, `
      UPDATE ticket_types
      SET name_ar = :nameAr, description_en = :descriptionEn, description_ar = :descriptionAr,
          quota = :quota, per_order_limit = :perOrderLimit, is_active = :isActive
      WHERE id = :id
    `, { ...ticket, id: existing.id });
    return existing;
  }
  const result = await exec(db, `
    INSERT INTO ticket_types (event_id, name_en, name_ar, description_en, description_ar, quota, per_order_limit, is_active)
    VALUES (:eventId, :nameEn, :nameAr, :descriptionEn, :descriptionAr, :quota, :perOrderLimit, :isActive)
  `, ticket);
  return { id: result.insertId };
}

async function upsertPeriod(db, period) {
  const existing = await one(db, `
    SELECT id FROM ticket_price_periods
    WHERE ticket_type_id = :ticketTypeId AND label_en = :labelEn AND starts_at = :startsAt
    LIMIT 1
  `, period);
  if (existing) {
    await exec(db, `
      UPDATE ticket_price_periods
      SET label_ar = :labelAr, price = :price, price_egp = :priceEgp, price_usd = :priceUsd,
          ends_at = :endsAt, is_active = :isActive
      WHERE id = :id
    `, { ...period, id: existing.id });
    return existing;
  }
  const result = await exec(db, `
    INSERT INTO ticket_price_periods (ticket_type_id, label_en, label_ar, price, price_egp, price_usd, starts_at, ends_at, is_active)
    VALUES (:ticketTypeId, :labelEn, :labelAr, :price, :priceEgp, :priceUsd, :startsAt, :endsAt, :isActive)
  `, period);
  return { id: result.insertId };
}

async function upsertDoctor(db, doctor) {
  const existing = await one(db, 'SELECT id FROM doctors WHERE email = :email LIMIT 1', doctor);
  if (existing) {
    await exec(db, `
      UPDATE doctors
      SET user_id = :userId, full_name = :fullName, mobile = :mobile, address = :address,
          country_code = :countryCode, country_name = :countryName, city = :city, specialty = :specialty,
          nationality = :nationality, preferred_language = :preferredLanguage, status = :status
      WHERE id = :id
    `, { ...doctor, id: existing.id });
    return existing;
  }
  const result = await exec(db, `
    INSERT INTO doctors (
      user_id, full_name, mobile, email, address, country_code, country_name, city,
      specialty, nationality, preferred_language, status
    )
    VALUES (
      :userId, :fullName, :mobile, :email, :address, :countryCode, :countryName, :city,
      :specialty, :nationality, :preferredLanguage, :status
    )
  `, doctor);
  return { id: result.insertId };
}

async function upsertOrder(db, order) {
  const existing = await one(db, 'SELECT id FROM orders WHERE order_number = :orderNumber LIMIT 1', order);
  if (existing) {
    await exec(db, `
      UPDATE orders
      SET customer_id = :customerId, event_id = :eventId, status = :status, subtotal = :subtotal,
          discount_total = :discountTotal, tax_total = :taxTotal, grand_total = :grandTotal,
          currency = :currency, customer_name = :customerName, customer_email = :customerEmail,
          customer_phone = :customerPhone, created_at = :createdAt
      WHERE id = :id
    `, { ...order, id: existing.id });
    return existing;
  }
  const result = await exec(db, `
    INSERT INTO orders (
      customer_id, event_id, order_number, status, subtotal, discount_total, tax_total,
      grand_total, currency, customer_name, customer_email, customer_phone, created_at
    )
    VALUES (
      :customerId, :eventId, :orderNumber, :status, :subtotal, :discountTotal, :taxTotal,
      :grandTotal, :currency, :customerName, :customerEmail, :customerPhone, :createdAt
    )
  `, order);
  return { id: result.insertId };
}

async function upsertRegistration(db, registration) {
  const existing = await one(db, 'SELECT id FROM registrations WHERE registration_number = :registrationNumber LIMIT 1', registration);
  if (existing) {
    await exec(db, `
      UPDATE registrations
      SET doctor_id = :doctorId, event_id = :eventId, ticket_type_id = :ticketTypeId, order_id = :orderId,
          source = :source, registration_status = :registrationStatus, payment_status = :paymentStatus,
          selected_currency = :selectedCurrency, selected_price = :selectedPrice,
          selected_price_period_id = :selectedPricePeriodId, payment_reference = :paymentReference,
          payment_proof_url = :paymentProofUrl, payment_reviewed_by_user_id = :paymentReviewedByUserId,
          payment_reviewed_at = :paymentReviewedAt, payment_rejection_reason = :paymentRejectionReason,
          created_at = :createdAt
      WHERE id = :id
    `, { ...registration, id: existing.id });
    return existing;
  }
  const result = await exec(db, `
    INSERT INTO registrations (
      registration_number, doctor_id, event_id, ticket_type_id, order_id, source, registration_status,
      payment_status, selected_currency, selected_price, selected_price_period_id, payment_reference,
      payment_proof_url, payment_reviewed_by_user_id, payment_reviewed_at, payment_rejection_reason, created_at
    )
    VALUES (
      :registrationNumber, :doctorId, :eventId, :ticketTypeId, :orderId, :source, :registrationStatus,
      :paymentStatus, :selectedCurrency, :selectedPrice, :selectedPricePeriodId, :paymentReference,
      :paymentProofUrl, :paymentReviewedByUserId, :paymentReviewedAt, :paymentRejectionReason, :createdAt
    )
  `, registration);
  return { id: result.insertId };
}

async function upsertAttendee(db, attendee) {
  const existing = await one(db, 'SELECT id FROM attendees WHERE attendee_number = :attendeeNumber LIMIT 1', attendee);
  if (existing) {
    await exec(db, `
      UPDATE attendees
      SET order_id = :orderId, event_id = :eventId, ticket_type_id = :ticketTypeId, full_name = :fullName,
          email = :email, phone = :phone, job_title = :jobTitle, organization = :organization,
          qr_token = :qrToken, qr_status = :qrStatus, checked_in_at = :checkedInAt,
          certificate_issued_at = :certificateIssuedAt, created_at = :createdAt
      WHERE id = :id
    `, { ...attendee, id: existing.id });
    return existing;
  }
  const result = await exec(db, `
    INSERT INTO attendees (
      order_id, event_id, ticket_type_id, attendee_number, full_name, email, phone, job_title,
      organization, qr_token, qr_status, checked_in_at, certificate_issued_at, created_at
    )
    VALUES (
      :orderId, :eventId, :ticketTypeId, :attendeeNumber, :fullName, :email, :phone, :jobTitle,
      :organization, :qrToken, :qrStatus, :checkedInAt, :certificateIssuedAt, :createdAt
    )
  `, attendee);
  return { id: result.insertId };
}

async function upsertGeneratedTicket(db, ticket) {
  await exec(db, `
    INSERT INTO generated_tickets (registration_id, attendee_id, ticket_number, qr_token, pdf_url, generated_at, printed_at)
    VALUES (:registrationId, :attendeeId, :ticketNumber, :qrToken, :pdfUrl, :generatedAt, :printedAt)
    ON DUPLICATE KEY UPDATE
      ticket_number = VALUES(ticket_number),
      qr_token = VALUES(qr_token),
      pdf_url = VALUES(pdf_url),
      generated_at = VALUES(generated_at),
      printed_at = VALUES(printed_at)
  `, ticket);
}

async function upsertCertificate(db, certificate) {
  await exec(db, `
    INSERT INTO certificates (attendee_id, certificate_number, template_key, file_url, status, issued_at)
    VALUES (:attendeeId, :certificateNumber, :templateKey, :fileUrl, :status, :issuedAt)
    ON DUPLICATE KEY UPDATE
      certificate_number = VALUES(certificate_number),
      template_key = VALUES(template_key),
      file_url = VALUES(file_url),
      status = VALUES(status),
      issued_at = VALUES(issued_at)
  `, certificate);
}

async function upsertEventCard(db, card) {
  await exec(db, `
    INSERT INTO event_cards (attendee_id, card_number, template_key, file_url, created_at)
    VALUES (:attendeeId, :cardNumber, :templateKey, :fileUrl, :createdAt)
    ON DUPLICATE KEY UPDATE
      card_number = VALUES(card_number),
      template_key = VALUES(template_key),
      file_url = VALUES(file_url),
      created_at = VALUES(created_at)
  `, card);
}

async function upsertReview(db, review) {
  const existing = await one(db, `
    SELECT id FROM reviews
    WHERE event_id = :eventId AND customer_id = :customerId AND title = :title
    LIMIT 1
  `, review);
  if (existing) {
    await exec(db, `
      UPDATE reviews
      SET attendee_id = :attendeeId, rating = :rating, comment = :comment, status = :status, created_at = :createdAt
      WHERE id = :id
    `, { ...review, id: existing.id });
    return existing;
  }
  const result = await exec(db, `
    INSERT INTO reviews (event_id, attendee_id, customer_id, rating, title, comment, status, created_at)
    VALUES (:eventId, :attendeeId, :customerId, :rating, :title, :comment, :status, :createdAt)
  `, review);
  return { id: result.insertId };
}

async function seed() {
  await bootstrapSchema();
  const db = await createDb();
  const passwordHash = await hashPassword(defaultPassword);

  try {
    const roleRows = {};
    for (const role of [
      { code: 'admin', nameEn: 'Admin', nameAr: 'مدير النظام' },
      { code: 'organizer', nameEn: 'Organizer', nameAr: 'منظم' },
      { code: 'back_office', nameEn: 'Back Office', nameAr: 'الدعم التشغيلي' },
      { code: 'employee', nameEn: 'Employee', nameAr: 'موظف' },
      { code: 'doctor', nameEn: 'Doctor', nameAr: 'طبيب' },
      { code: 'customer', nameEn: 'Customer', nameAr: 'عميل' },
    ]) {
      roleRows[role.code] = await upsertRole(db, role);
    }

    const users = {};
    for (const user of [
      {
        roleCode: 'admin',
        name: 'Super Admin',
        email: 'admin@stylish-events.com',
        phone: '+20 100 000 0000',
        countryCode: 'EG',
        countryName: 'Egypt',
        gender: 'not_specified',
        username: 'superadmin',
        avatarUrl: '/stylish-favicon.svg',
        notes: 'Full access to platform operations.',
      },
      {
        roleCode: 'organizer',
        name: 'Operations Manager',
        email: 'operations@stylish-events.com',
        phone: '+20 111 222 3333',
        countryCode: 'EG',
        countryName: 'Egypt',
        gender: 'male',
        username: 'operations.manager',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=80',
      },
      {
        roleCode: 'back_office',
        name: 'Finance Reviewer',
        email: 'finance@stylish-events.com',
        phone: '+20 122 555 8888',
        countryCode: 'EG',
        countryName: 'Egypt',
        gender: 'female',
        username: 'finance.reviewer',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
      },
      {
        roleCode: 'employee',
        name: 'Check-in Officer',
        email: 'checkin@stylish-events.com',
        phone: '+20 101 333 4444',
        countryCode: 'EG',
        countryName: 'Egypt',
        gender: 'male',
        username: 'checkin.officer',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
      },
    ]) {
      users[user.email] = await upsertUser(db, roleRows, user, passwordHash);
    }

    const venues = {};
    for (const venue of [
      {
        key: 'cicc',
        nameEn: 'Cairo International Convention Center',
        nameAr: 'مركز القاهرة الدولي للمؤتمرات',
        countryCode: 'EG',
        cityEn: 'Cairo',
        cityAr: 'القاهرة',
        addressEn: 'Nasr City, Cairo, Egypt',
        addressAr: 'مدينة نصر، القاهرة، مصر',
        capacity: 1800,
      },
      {
        key: 'dwtc',
        nameEn: 'Dubai World Trade Centre',
        nameAr: 'مركز دبي التجاري العالمي',
        countryCode: 'AE',
        cityEn: 'Dubai',
        cityAr: 'دبي',
        addressEn: 'Sheikh Zayed Road, Dubai',
        addressAr: 'شارع الشيخ زايد، دبي',
        capacity: 2400,
      },
      {
        key: 'riyadh',
        nameEn: 'Riyadh Front Expo',
        nameAr: 'واجهة الرياض للمعارض',
        countryCode: 'SA',
        cityEn: 'Riyadh',
        cityAr: 'الرياض',
        addressEn: 'Riyadh Front, Saudi Arabia',
        addressAr: 'واجهة الرياض، السعودية',
        capacity: 1200,
      },
      {
        key: 'alex',
        nameEn: 'Bibliotheca Alexandrina Conference Center',
        nameAr: 'مركز مؤتمرات مكتبة الإسكندرية',
        countryCode: 'EG',
        cityEn: 'Alexandria',
        cityAr: 'الإسكندرية',
        addressEn: 'Corniche, Alexandria, Egypt',
        addressAr: 'الكورنيش، الإسكندرية، مصر',
        capacity: 700,
      },
    ]) {
      venues[venue.key] = await upsertVenue(db, venue);
    }

    const events = {};
    const eventSeeds = [
      {
        slug: 'digital-transformation-summit',
        venueKey: 'cicc',
        titleEn: 'Digital Transformation Summit',
        titleAr: 'قمة التحول الرقمي',
        summaryEn: 'A two-day summit for enterprise technology, AI operations, and customer experience leaders.',
        summaryAr: 'قمة لمدة يومين لقادة التقنية المؤسسية والذكاء الاصطناعي وتجربة العملاء.',
        descriptionEn: 'Digital Transformation Summit brings together executives, IT leaders, product teams, and operations managers to explore practical technology adoption. The event includes keynote sessions, workshops, QR ticketing, certificate delivery, and dedicated networking tracks.',
        descriptionAr: 'تجمع قمة التحول الرقمي المديرين وقادة التقنية وفرق المنتجات والتشغيل لاستكشاف تطبيقات التحول الرقمي بشكل عملي. تشمل الفعالية محاضرات رئيسية وورش عمل وتذاكر QR وتسليم شهادات ومسارات للتواصل المهني.',
        type: 'conference',
        status: 'published',
        startsAt: '2026-08-18 10:00:00',
        endsAt: '2026-08-20 18:00:00',
        registrationStartsAt: '2026-07-01 09:00:00',
        registrationEndsAt: '2026-08-17 23:59:00',
        maxAttendees: 1200,
        coverImageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80',
        bannerImageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80',
        ],
      },
      {
        slug: 'international-hospitality-expo',
        venueKey: 'dwtc',
        titleEn: 'International Hospitality Expo',
        titleAr: 'المعرض الدولي للضيافة',
        summaryEn: 'A regional exhibition for hospitality operators, suppliers, reservation teams, and guest experience brands.',
        summaryAr: 'معرض إقليمي لمشغلي الضيافة والموردين وفرق الحجز وتجربة الضيوف.',
        descriptionEn: 'The expo is built for hotel groups, travel suppliers, F&B teams, and reservation departments. Visitors can register online, select ticket periods, receive QR tickets, and collect certificates after attendance.',
        descriptionAr: 'المعرض مصمم لمجموعات الفنادق وموردي السفر وفرق الأغذية والمشروبات وإدارات الحجز. يستطيع الزوار التسجيل واختيار فترات التذاكر واستلام تذاكر QR والشهادات بعد الحضور.',
        type: 'exhibition',
        status: 'published',
        startsAt: '2026-09-04 09:00:00',
        endsAt: '2026-09-06 20:00:00',
        registrationStartsAt: '2026-07-05 09:00:00',
        registrationEndsAt: '2026-09-03 23:59:00',
        maxAttendees: 2400,
        coverImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80',
        bannerImageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
        ],
      },
      {
        slug: 'founders-forum',
        venueKey: 'riyadh',
        titleEn: 'Founders Forum',
        titleAr: 'منتدى المؤسسين',
        summaryEn: 'A focused forum for startup founders, investors, mentors, and growth teams.',
        summaryAr: 'منتدى متخصص للمؤسسين والمستثمرين والمرشدين وفرق النمو.',
        descriptionEn: 'Founders Forum connects founders with mentors, capital partners, and operators through talks, clinics, private meetings, and post-event reporting.',
        descriptionAr: 'يربط منتدى المؤسسين رواد الأعمال بالمرشدين وشركاء الاستثمار والمشغلين من خلال محاضرات وعيادات أعمال واجتماعات خاصة وتقارير بعد الفعالية.',
        type: 'workshop',
        status: 'draft',
        startsAt: '2026-09-22 11:00:00',
        endsAt: '2026-09-22 19:30:00',
        registrationStartsAt: '2026-08-01 09:00:00',
        registrationEndsAt: '2026-09-21 20:00:00',
        maxAttendees: 650,
        coverImageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=80',
        bannerImageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
        gallery: ['https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=900&q=80'],
      },
      {
        slug: 'smoke-medical-conference',
        venueKey: 'alex',
        titleEn: 'Smoke Medical Conference',
        titleAr: 'المؤتمر الطبي للتدخين والصحة',
        summaryEn: 'A medical conference for doctors and healthcare teams covering smoking cessation, public health, and clinical updates.',
        summaryAr: 'مؤتمر طبي للأطباء وفرق الرعاية الصحية حول الإقلاع عن التدخين والصحة العامة والتحديثات السريرية.',
        descriptionEn: 'This medical program supports doctor registration, country-based pricing, bank-transfer verification, QR ticket generation, and certificate issuance after verified attendance.',
        descriptionAr: 'يدعم هذا البرنامج الطبي تسجيل الأطباء والتسعير حسب الدولة ومراجعة التحويل البنكي وتوليد تذاكر QR وإصدار الشهادات بعد الحضور المؤكد.',
        type: 'conference',
        status: 'published',
        startsAt: '2026-08-20 09:00:00',
        endsAt: '2026-08-21 17:00:00',
        registrationStartsAt: '2026-07-01 09:00:00',
        registrationEndsAt: '2026-08-19 23:59:00',
        maxAttendees: 300,
        coverImageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80',
        bannerImageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1600&q=80',
        gallery: ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80'],
      },
      {
        slug: 'customer-experience-lab',
        venueKey: 'cicc',
        titleEn: 'Customer Experience Lab',
        titleAr: 'مختبر تجربة العملاء',
        summaryEn: 'A compact training day for service teams, CX leaders, and frontline operations.',
        summaryAr: 'يوم تدريبي مكثف لفرق الخدمة وقادة تجربة العملاء والتشغيل الأمامي.',
        descriptionEn: 'Hands-on CX sessions with check-in analytics, journey mapping, and customer communication labs.',
        descriptionAr: 'جلسات تطبيقية لتجربة العملاء تشمل تحليلات الحضور ورسم رحلات العملاء ومختبرات التواصل.',
        type: 'workshop',
        status: 'disabled',
        startsAt: '2026-10-12 09:30:00',
        endsAt: '2026-10-12 16:30:00',
        registrationStartsAt: '2026-08-10 09:00:00',
        registrationEndsAt: '2026-10-10 18:00:00',
        maxAttendees: 180,
        coverImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80',
        bannerImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80',
        gallery: [],
      },
      {
        slug: 'retail-innovation-day',
        venueKey: 'dwtc',
        titleEn: 'Retail Innovation Day',
        titleAr: 'يوم ابتكار التجزئة',
        summaryEn: 'A previous event record for retail teams, ticket performance, reviews, and final reports.',
        summaryAr: 'سجل فعالية سابقة لفرق التجزئة وأداء التذاكر والمراجعات والتقارير النهائية.',
        descriptionEn: 'A completed one-day event used for previous-event pages and analytics comparison.',
        descriptionAr: 'فعالية مكتملة ليوم واحد تستخدم في صفحات الفعاليات السابقة ومقارنة التحليلات.',
        type: 'other',
        status: 'completed',
        startsAt: '2026-05-14 10:00:00',
        endsAt: '2026-05-14 18:00:00',
        registrationStartsAt: '2026-03-01 09:00:00',
        registrationEndsAt: '2026-05-13 18:00:00',
        maxAttendees: 420,
        coverImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80',
        bannerImageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=80',
        gallery: [],
      },
      {
        slug: 'archived-ops-bootcamp',
        venueKey: 'cicc',
        titleEn: 'Archived Operations Bootcamp',
        titleAr: 'معسكر تشغيلي مؤرشف',
        summaryEn: 'Deleted sample record used to test restore and deleted tabs.',
        summaryAr: 'سجل محذوف لاختبار التابات الخاصة بالاستعادة والمحذوفات.',
        descriptionEn: 'This record is intentionally marked deleted for admin workflow testing.',
        descriptionAr: 'هذا السجل محدد كمحذوف عمداً لاختبار سير عمل الأدمن.',
        type: 'workshop',
        status: 'deleted',
        startsAt: '2026-11-01 09:00:00',
        endsAt: '2026-11-01 15:00:00',
        registrationStartsAt: '2026-09-01 09:00:00',
        registrationEndsAt: '2026-10-30 18:00:00',
        maxAttendees: 120,
        coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
        bannerImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
        gallery: [],
      },
    ];

    for (const seedEvent of eventSeeds) {
      const event = await upsertEvent(db, {
        ...seedEvent,
        organizerId: users['operations@stylish-events.com'].id,
        venueId: venues[seedEvent.venueKey].id,
        timezone: 'Africa/Cairo',
        googleMapsUrl: 'https://maps.google.com',
      });
      events[seedEvent.slug] = event;
    }

    const sessionSeeds = [
      ['digital-transformation-summit', 'Opening Keynote: Operating Digital Events', 'الكلمة الافتتاحية: تشغيل الفعاليات الرقمية', 'Mariam Fathy', '2026-08-18 10:30:00', '2026-08-18 11:15:00', 'Main Hall'],
      ['digital-transformation-summit', 'AI in Customer Operations', 'الذكاء الاصطناعي في تشغيل العملاء', 'Omar Nabil', '2026-08-18 12:00:00', '2026-08-18 13:00:00', 'Room A'],
      ['international-hospitality-expo', 'Hospitality Revenue Systems', 'أنظمة إيرادات الضيافة', 'Laila Hassan', '2026-09-04 11:00:00', '2026-09-04 12:00:00', 'Expo Stage'],
      ['smoke-medical-conference', 'Clinical Updates in Smoking Cessation', 'تحديثات سريرية في الإقلاع عن التدخين', 'Dr Kareem Adel', '2026-08-20 10:00:00', '2026-08-20 11:30:00', 'Medical Hall'],
    ];
    for (const [slug, titleEn, titleAr, speakerName, startsAt, endsAt, roomName] of sessionSeeds) {
      await upsertSession(db, { eventId: events[slug].id, titleEn, titleAr, speakerName, startsAt, endsAt, roomName });
    }

    const ticketMap = {};
    const ticketSeeds = [
      ['digital-transformation-summit', 'VIP Pass', 'تذكرة VIP', 150, 4, 'Front-row seating, executive lounge, certificate, and priority check-in.'],
      ['digital-transformation-summit', 'Regular Pass', 'تذكرة عادية', 900, 6, 'Main hall access, QR ticket, coffee breaks, and attendance certificate.'],
      ['international-hospitality-expo', 'Business Pass', 'تذكرة أعمال', 700, 5, 'Expo access, networking lounge, and certificate after check-in.'],
      ['international-hospitality-expo', 'Visitor Pass', 'تذكرة زائر', 1500, 8, 'Visitor access to exhibition floor and public sessions.'],
      ['founders-forum', 'Founder Seat', 'مقعد مؤسس', 250, 2, 'Forum access, investor matching, and private clinic registration.'],
      ['smoke-medical-conference', 'Doctor Pass', 'تذكرة طبيب', 100, 2, 'Medical sessions, CME-style certificate, and QR access.'],
      ['smoke-medical-conference', 'Resident Pass', 'تذكرة طبيب مقيم', 200, 2, 'Doctor registration, QR ticket, and certificate after attendance.'],
      ['retail-innovation-day', 'Standard Pass', 'تذكرة قياسية', 420, 4, 'Completed-event ticket record for reports and previous events.'],
    ];

    for (const [slug, nameEn, nameAr, quota, perOrderLimit, descriptionEn] of ticketSeeds) {
      const ticket = await upsertTicket(db, {
        eventId: events[slug].id,
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr: 'تذكرة مرتبطة بالفعالية مع QR وشهادة بعد الحضور.',
        quota,
        perOrderLimit,
        isActive: true,
      });
      ticketMap[`${slug}:${nameEn}`] = ticket;
    }

    const periodMap = {};
    for (const [key, egpBase, usdBase] of [
      ['digital-transformation-summit:VIP Pass', 12500, 250],
      ['digital-transformation-summit:Regular Pass', 4000, 80],
      ['international-hospitality-expo:Business Pass', 9000, 180],
      ['international-hospitality-expo:Visitor Pass', 2500, 50],
      ['founders-forum:Founder Seat', 15000, 300],
      ['smoke-medical-conference:Doctor Pass', 2500, 50],
      ['smoke-medical-conference:Resident Pass', 1500, 30],
      ['retail-innovation-day:Standard Pass', 1800, 35],
    ]) {
      const ticketTypeId = ticketMap[key].id;
      const periods = [
        ['Early Bird', 'الحجز المبكر', egpBase, usdBase, '2026-07-01 09:00:00', '2026-07-31 23:59:00'],
        ['Regular', 'السعر العادي', Math.round(egpBase * 1.25), Math.round(usdBase * 1.25), '2026-08-01 00:00:00', '2026-08-31 23:59:00'],
        ['Last Call', 'الفرصة الأخيرة', Math.round(egpBase * 1.55), Math.round(usdBase * 1.55), '2026-09-01 00:00:00', '2026-09-30 23:59:00'],
      ];
      for (const [labelEn, labelAr, priceEgp, priceUsd, startsAt, endsAt] of periods) {
        const period = await upsertPeriod(db, {
          ticketTypeId,
          labelEn,
          labelAr,
          price: priceUsd,
          priceEgp,
          priceUsd,
          startsAt,
          endsAt,
          isActive: true,
        });
        periodMap[`${key}:${labelEn}`] = period;
      }
    }

    const registrationSeeds = [
      ['REG-DTS-1001', 'ORD-2401', 'TKT-DTS-1001', 'digital-transformation-summit', 'VIP Pass', 'Dr Ahmed Samir', 'ahmed.samir@example.com', '+20 100 222 1100', 'EG', 'Egypt', 'Cairo', 'Cardiology', 'Egyptian', 'approved', 'approved', 'paid', 12500, 'EGP', true, true, true, '2026-07-18 10:22:00'],
      ['REG-DTS-1002', 'ORD-2402', 'TKT-DTS-1002', 'digital-transformation-summit', 'Regular Pass', 'Dr Mona Hassan', 'mona.hassan@example.com', '+20 111 333 2200', 'EG', 'Egypt', 'Giza', 'Pulmonology', 'Egyptian', 'approved', 'approved', 'paid', 4000, 'EGP', false, false, true, '2026-07-18 11:05:00'],
      ['REG-HSP-1003', 'ORD-2403', 'TKT-HSP-1003', 'international-hospitality-expo', 'Business Pass', 'Karim Adel', 'karim.adel@example.com', '+971 50 555 3311', 'AE', 'United Arab Emirates', 'Dubai', 'Hospitality Operations', 'Emirati', 'approved', 'approved', 'paid', 180, 'USD', true, false, false, '2026-07-17 15:20:00'],
      ['REG-FND-1004', 'ORD-2404', 'TKT-FND-1004', 'founders-forum', 'Sara Nabil', 'Sara Nabil', 'sara.nabil@example.com', '+966 55 441 2200', 'SA', 'Saudi Arabia', 'Riyadh', 'Startup Founder', 'Saudi', 'pending_verification', 'pending', 'pending_payment', 300, 'USD', false, false, false, '2026-07-16 09:45:00'],
      ['REG-MED-1005', 'ORD-2405', 'TKT-MED-1005', 'smoke-medical-conference', 'Doctor Pass', 'Dr Omar Fathy', 'omar.fathy@example.com', '+20 122 909 3300', 'EG', 'Egypt', 'Alexandria', 'Chest Diseases', 'Egyptian', 'approved', 'approved', 'paid', 2500, 'EGP', true, true, true, '2026-07-15 14:10:00'],
      ['REG-MED-1006', 'ORD-2406', 'TKT-MED-1006', 'smoke-medical-conference', 'Resident Pass', 'Dr Laila Mansour', 'laila.mansour@example.com', '+965 600 11223', 'KW', 'Kuwait', 'Kuwait City', 'Internal Medicine', 'Kuwaiti', 'pending_payment', 'pending', 'pending_payment', 30, 'USD', false, false, false, '2026-07-15 16:30:00'],
      ['REG-DTS-1007', 'ORD-2407', 'TKT-DTS-1007', 'digital-transformation-summit', 'Regular Pass', 'Daniel Brooks', 'daniel.brooks@example.com', '+1 202 555 0188', 'US', 'United States', 'New York', 'Product Operations', 'American', 'cancelled', 'rejected', 'cancelled', 80, 'USD', false, false, false, '2026-07-14 12:30:00'],
      ['REG-HSP-1008', 'ORD-2408', 'TKT-HSP-1008', 'international-hospitality-expo', 'Visitor Pass', 'Nour Adel', 'nour.adel@example.com', '+20 100 777 9090', 'EG', 'Egypt', 'Cairo', 'Reservations', 'Egyptian', 'approved', 'approved', 'paid', 2500, 'EGP', false, false, true, '2026-07-13 13:12:00'],
      ['REG-RTL-1009', 'ORD-2409', 'TKT-RTL-1009', 'retail-innovation-day', 'Standard Pass', 'Emily Kraus', 'emily.kraus@example.com', '+49 170 555 1200', 'DE', 'Germany', 'Berlin', 'Retail Strategy', 'German', 'approved', 'approved', 'refunded', 35, 'USD', true, true, true, '2026-05-02 10:00:00'],
    ];

    for (const [registrationNumber, orderNumber, ticketNumberSeed, slug, ticketName, fullName, email, mobile, countryCode, countryName, city, specialty, nationality, registrationStatus, paymentStatus, orderStatus, selectedPrice, selectedCurrency, checkedIn, certificateIssued, cardIssued, createdAt] of registrationSeeds) {
      const user = await upsertUser(db, roleRows, {
        roleCode: 'doctor',
        name: fullName,
        email,
        phone: mobile,
        countryCode,
        countryName,
        gender: fullName.includes('Mona') || fullName.includes('Sara') || fullName.includes('Laila') || fullName.includes('Emily') ? 'female' : 'male',
        username: email.split('@')[0].replace('.', '.'),
        status: registrationStatus === 'cancelled' ? 'inactive' : 'active',
        preferredLanguage: countryCode === 'EG' ? 'ar' : 'en',
        avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      }, passwordHash);
      const doctor = await upsertDoctor(db, {
        userId: user.id,
        fullName,
        mobile,
        email,
        address: `${city} business district`,
        countryCode,
        countryName,
        city,
        specialty,
        nationality,
        preferredLanguage: countryCode === 'EG' ? 'ar' : 'en',
        status: registrationStatus === 'cancelled' ? 'inactive' : 'active',
      });

      const eventId = events[slug].id;
      const ticketTypeId = ticketMap[`${slug}:${ticketName}`]?.id || ticketMap[`${slug}:Founder Seat`]?.id;
      const pricePeriodId = periodMap[`${slug}:${ticketName}:Early Bird`]?.id || null;
      const order = await upsertOrder(db, {
        customerId: user.id,
        eventId,
        orderNumber,
        status: orderStatus,
        subtotal: selectedPrice,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: selectedPrice,
        currency: selectedCurrency,
        customerName: fullName,
        customerEmail: email,
        customerPhone: mobile,
        createdAt,
      });
      const registration = await upsertRegistration(db, {
        registrationNumber,
        doctorId: doctor.id,
        eventId,
        ticketTypeId,
        orderId: order.id,
        source: 'online',
        registrationStatus,
        paymentStatus,
        selectedCurrency,
        selectedPrice,
        selectedPricePeriodId: pricePeriodId,
        paymentReference: paymentStatus === 'approved' ? `BANK-${orderNumber}` : null,
        paymentProofUrl: paymentStatus === 'approved' ? `https://stylish-events.com/proofs/${orderNumber}.pdf` : null,
        paymentReviewedByUserId: paymentStatus === 'pending' ? null : users['finance@stylish-events.com'].id,
        paymentReviewedAt: paymentStatus === 'pending' ? null : '2026-07-18 12:00:00',
        paymentRejectionReason: paymentStatus === 'rejected' ? 'Payment proof did not match bank transfer.' : null,
        createdAt,
      });

      if (paymentStatus === 'approved') {
        const attendee = await upsertAttendee(db, {
          orderId: order.id,
          eventId,
          ticketTypeId,
          attendeeNumber: `ATT-${ticketNumberSeed.replace('TKT-', '')}`,
          fullName,
          email,
          phone: mobile,
          jobTitle: specialty,
          organization: countryCode === 'EG' ? 'Stylish Events Medical Network' : 'International Partner',
          qrToken: qr(ticketNumberSeed),
          qrStatus: checkedIn ? 'used' : 'active',
          checkedInAt: checkedIn ? '2026-07-18 14:24:00' : null,
          certificateIssuedAt: certificateIssued ? '2026-07-18 14:35:00' : null,
          createdAt,
        });
        await upsertGeneratedTicket(db, {
          registrationId: registration.id,
          attendeeId: attendee.id,
          ticketNumber: ticketNumberSeed,
          qrToken: qr(ticketNumberSeed),
          pdfUrl: `https://stylish-events.com/tickets/${ticketNumberSeed}.pdf`,
          generatedAt: createdAt,
          printedAt: checkedIn ? '2026-07-18 14:20:00' : null,
        });
        if (certificateIssued) {
          await upsertCertificate(db, {
            attendeeId: attendee.id,
            certificateNumber: `CERT-${ticketNumberSeed.replace('TKT-', '')}`,
            templateKey: 'default',
            fileUrl: `https://stylish-events.com/certificates/CERT-${ticketNumberSeed.replace('TKT-', '')}.pdf`,
            status: 'issued',
            issuedAt: '2026-07-18 14:35:00',
          });
        }
        if (cardIssued) {
          await upsertEventCard(db, {
            attendeeId: attendee.id,
            cardNumber: `CARD-${ticketNumberSeed.replace('TKT-', '')}`,
            templateKey: 'default',
            fileUrl: `https://stylish-events.com/cards/CARD-${ticketNumberSeed.replace('TKT-', '')}.png`,
            createdAt: '2026-07-18 14:18:00',
          });
        }
      }
    }

    for (const slug of Object.keys(events)) {
      await exec(db, `
        INSERT INTO certificate_templates (event_id, name, template_type, template_url, field_positions_json, is_default, is_active)
        SELECT :eventId, :name, 'image', :templateUrl, :fieldPositions, 1, 1
        WHERE NOT EXISTS (
          SELECT 1 FROM certificate_templates WHERE event_id = :eventId AND name = :name
        )
      `, {
        eventId: events[slug].id,
        name: `${slug} Certificate Template`,
        templateUrl: 'https://stylish-events.com/templates/certificate-default.png',
        fieldPositions: json({
          attendeeName: { x: 50, y: 48, align: 'center' },
          eventTitle: { x: 50, y: 60, align: 'center' },
          date: { x: 50, y: 72, align: 'center' },
          certificateNumber: { x: 82, y: 88, align: 'right' },
        }),
      });
    }

    const reviewUsers = await Promise.all([
      one(db, 'SELECT id FROM users WHERE email = :email', { email: 'ahmed.samir@example.com' }),
      one(db, 'SELECT id FROM users WHERE email = :email', { email: 'mona.hassan@example.com' }),
      one(db, 'SELECT id FROM users WHERE email = :email', { email: 'karim.adel@example.com' }),
      one(db, 'SELECT id FROM users WHERE email = :email', { email: 'nour.adel@example.com' }),
    ]);
    const attendeesByEmail = {};
    for (const email of ['ahmed.samir@example.com', 'mona.hassan@example.com', 'karim.adel@example.com', 'nour.adel@example.com']) {
      attendeesByEmail[email] = await one(db, 'SELECT id FROM attendees WHERE email = :email LIMIT 1', { email });
    }
    const reviews = [
      [events['digital-transformation-summit'].id, attendeesByEmail['ahmed.samir@example.com']?.id || null, reviewUsers[0]?.id || null, 5, 'Professional event flow', 'Registration, QR check-in, and certificate delivery were clear and fast.', 'approved', '2026-07-18 15:00:00'],
      [events['digital-transformation-summit'].id, attendeesByEmail['mona.hassan@example.com']?.id || null, reviewUsers[1]?.id || null, 4, 'Smooth registration', 'The ticket email and event information were easy to follow.', 'pending', '2026-07-18 15:15:00'],
      [events['international-hospitality-expo'].id, attendeesByEmail['karim.adel@example.com']?.id || null, reviewUsers[2]?.id || null, 5, 'Useful expo operations', 'The visitor flow and badge process were well managed.', 'approved', '2026-07-17 18:00:00'],
      [events['international-hospitality-expo'].id, attendeesByEmail['nour.adel@example.com']?.id || null, reviewUsers[3]?.id || null, 2, 'Needs better queue signage', 'Entry signs should be clearer during peak arrival time.', 'rejected', '2026-07-17 19:00:00'],
    ];
    for (const [eventId, attendeeId, customerId, rating, title, comment, status, createdAt] of reviews) {
      await upsertReview(db, { eventId, attendeeId, customerId, rating, title, comment, status, createdAt });
    }

    for (const notification of [
      ['New payment proof pending', 'Dr Laila Mansour uploaded a bank-transfer proof for Smoke Medical Conference.', 'payment', 'warning', '/admin/orders'],
      ['Certificate delivery completed', 'Two certificates were issued after confirmed check-in.', 'certificate', 'success', '/admin/certificates'],
      ['Draft event needs review', 'Founders Forum is ready for content review before publishing.', 'system', 'info', '/admin/events'],
      ['Rejected payment requires follow-up', 'Daniel Brooks registration was cancelled after payment rejection.', 'registration', 'danger', '/admin/tickets'],
    ]) {
      const [title, body, type, severity, targetUrl] = notification;
      const exists = await one(db, 'SELECT id FROM admin_notifications WHERE title = :title LIMIT 1', { title });
      if (!exists) {
        await exec(db, `
          INSERT INTO admin_notifications (title, body, type, severity, target_url, read_at, created_at)
          VALUES (:title, :body, :type, :severity, :targetUrl, NULL, NOW())
        `, { title, body, type, severity, targetUrl });
      }
    }

    await exec(db, `
      INSERT INTO project_settings (setting_key, setting_value)
      VALUES
        ('currency', :currency),
        ('site_content', :siteContent),
        ('theme', :theme)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `, {
      currency: json({
        baseCurrency: 'EGP',
        internationalCurrency: 'USD',
        egyptCurrency: 'EGP',
        autoDetectByCountry: true,
        rates: [
          { code: 'EGP', symbol: 'EGP', rate: 1, enabled: true },
          { code: 'USD', symbol: '$', rate: 50, enabled: true },
          { code: 'EUR', symbol: 'EUR', rate: 58, enabled: true },
          { code: 'GBP', symbol: 'GBP', rate: 67, enabled: true },
          { code: 'SAR', symbol: 'SAR', rate: 13.3, enabled: true },
          { code: 'AED', symbol: 'AED', rate: 13.6, enabled: true },
        ],
      }),
      siteContent: json({
        homepage: {
          eyebrowEn: 'Stylish Events Platform',
          eyebrowAr: 'منصة دايركت إيفنتس',
          titleEn: 'Professional event booking, tickets, and attendance operations',
          titleAr: 'نظام احترافي لإدارة حجوزات وتذاكر وحضور الفعاليات',
          subtitleEn: 'Create event pages, sell tickets by pricing periods, scan QR codes, and deliver certificates from one connected system.',
          subtitleAr: 'أنشئ صفحات الفعاليات، بع التذاكر حسب الفترات السعرية، افحص رموز QR، وأرسل الشهادات من نظام واحد متكامل.',
          primaryCtaEn: 'Explore upcoming events',
          primaryCtaAr: 'استكشف الفعاليات القادمة',
          secondaryCtaEn: 'Contact operations',
          secondaryCtaAr: 'تواصل مع التشغيل',
          heroMediaUrl: '/eventsvideo-hero-section.mp4',
        },
        seo: {
          metaTitleEn: 'Stylish Events - Events, Tickets, QR Check-in and Certificates',
          metaTitleAr: 'دايركت إيفنتس - فعاليات وتذاكر وحضور وشهادات',
          metaDescriptionEn: 'A bilingual event booking platform with ticket pricing periods, payments, QR attendance, certificates, reviews, and analytics.',
          metaDescriptionAr: 'منصة فعاليات ثنائية اللغة للحجوزات والتذاكر والمدفوعات وحضور QR والشهادات والمراجعات والتحليلات.',
          canonicalUrl: 'https://stylish-events.com',
        },
      }),
      theme: json({
        primaryColor: '#0C6CE9',
        secondaryColor: '#0F172A',
        accentColor: '#D11F73',
        radius: 18,
        fontFamily: 'Rubik',
        buttonStyle: 'solid',
        density: 'comfortable',
        logoEnUrl: '/stylish-logo.svg',
        logoArUrl: '/stylish-logo-ar.svg',
        faviconUrl: '/stylish-favicon.svg',
      }),
    });

    const counts = {};
    for (const table of ['users', 'venues', 'events', 'ticket_types', 'ticket_price_periods', 'doctors', 'orders', 'registrations', 'attendees', 'generated_tickets', 'certificates', 'event_cards', 'reviews', 'admin_notifications']) {
      const row = await one(db, `SELECT COUNT(*) AS count FROM ${table}`);
      counts[table] = Number(row.count || 0);
    }

    console.log('Stylish Events production-like seed completed.');
    console.table(counts);
    console.log('Default admin login: admin@stylish-events.com (password not shown). Set ADMIN_PASSWORD to override in production.');
  } finally {
    await db.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
