import express from 'express';
import { sendEmail } from '../services/emailService.js';
import { generateBookingEmailTemplate } from '../templates/bookingEmailTemplate.js';
import { validateBookingData } from '../utils/validation.js';
import { query } from '../db/mysql.js';

const router = express.Router();

/**
 * Generate unique booking number
 */
function generateBookingNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `CONF-${timestamp}-${random}`;
}

async function ensureEventBriefRequestsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS event_brief_requests (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      reference_number VARCHAR(80) NOT NULL UNIQUE,
      request_type ENUM('single', 'recurring', 'annual', 'general') NOT NULL DEFAULT 'single',
      full_name VARCHAR(180) NOT NULL,
      email VARCHAR(180) NOT NULL,
      country_code VARCHAR(12) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      preferred_contact_method ENUM('phone', 'email', 'whatsapp') NOT NULL DEFAULT 'email',
      job_title VARCHAR(180) NOT NULL,
      organization VARCHAR(180) NULL,
      event_name VARCHAR(220) NULL,
      event_type VARCHAR(80) NULL,
      event_date VARCHAR(80) NULL,
      is_date_flexible BOOLEAN NOT NULL DEFAULT FALSE,
      country VARCHAR(120) NULL,
      location VARCHAR(220) NULL,
      venue_status ENUM('known', 'not_decided') NOT NULL DEFAULT 'not_decided',
      expected_attendance VARCHAR(80) NULL,
      budget_range VARCHAR(120) NULL,
      services_json JSON NULL,
      objectives TEXT NULL,
      event_brief TEXT NOT NULL,
      additional_requirements TEXT NULL,
      privacy_consent BOOLEAN NOT NULL DEFAULT TRUE,
      communication_consent BOOLEAN NOT NULL DEFAULT FALSE,
      language ENUM('ar', 'en') NOT NULL DEFAULT 'en',
      status ENUM('new', 'reviewing', 'contacted', 'closed') NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

/**
 * POST /api/booking
 * Handle booking form submission and send confirmation email
 */
router.post('/', async (req, res) => {
  try {
    const formData = req.body;

    // Validate data
    const validationResult = validateBookingData(formData);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.errors,
      });
    }

    // Get validated data
    const validatedData = validationResult.data;

    // Generate booking number
    const bookingNumber = generateBookingNumber();
    const createdAt = new Date().toISOString();

    // Combine phone and country code
    const fullPhone = `${validatedData.countryCode}${validatedData.phone}`;

    await ensureEventBriefRequestsTable();

    await query(`
      INSERT INTO event_brief_requests (
        reference_number,
        request_type,
        full_name,
        email,
        country_code,
        phone,
        preferred_contact_method,
        job_title,
        organization,
        event_name,
        event_type,
        event_date,
        is_date_flexible,
        country,
        location,
        venue_status,
        expected_attendance,
        budget_range,
        services_json,
        objectives,
        event_brief,
        additional_requirements,
        privacy_consent,
        communication_consent,
        language
      ) VALUES (
        :bookingNumber,
        :bookingType,
        :fullName,
        :email,
        :countryCode,
        :phone,
        :preferredContactMethod,
        :jobTitle,
        :organization,
        :eventName,
        :eventType,
        :eventDate,
        :isDateFlexible,
        :country,
        :location,
        :venueStatus,
        :expectedAttendance,
        :budgetRange,
        :services,
        :objectives,
        :eventBrief,
        :additionalRequirements,
        :privacyConsent,
        :communicationConsent,
        :language
      )
    `, {
      ...validatedData,
      bookingNumber,
      organization: validatedData.organization || null,
      eventName: validatedData.eventName || null,
      eventType: validatedData.eventType || null,
      eventDate: validatedData.eventDate || null,
      country: validatedData.country || null,
      location: validatedData.location || null,
      expectedAttendance: validatedData.expectedAttendance || null,
      budgetRange: validatedData.budgetRange || null,
      services: JSON.stringify(validatedData.services || []),
      objectives: validatedData.objectives || null,
      additionalRequirements: validatedData.additionalRequirements || null,
    });

    await query(`
      INSERT INTO admin_notifications (title, body, type, severity, target_url, read_at, created_at)
      VALUES (:title, :body, 'system', 'info', '/admin/settings', NULL, NOW())
    `, {
      title: `New event brief ${bookingNumber}`,
      body: `${validatedData.fullName} submitted a ${validatedData.bookingType} event brief.`,
    }).catch(() => undefined);

    // Generate email content using premium template
    const emailData = {
      ...validatedData,
      bookingNumber,
      fullPhone,
    };
    const emailContent = generateBookingEmailTemplate(emailData);

    // Send email to customer
    await sendEmail(validatedData.email, emailContent.subject, emailContent).catch((error) => {
      console.warn('Customer email failed:', error.message);
    });

    // Send notification to admin (using ADMIN_EMAIL or SMTP_USER)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      await sendEmail(adminEmail, emailContent.subject, emailContent).catch((error) => {
        console.warn('Admin email failed:', error.message);
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Event brief received successfully',
      bookingNumber,
      referenceNumber: bookingNumber,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Booking endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process booking request: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
