import express from 'express';
import { sendEmail } from '../services/emailService.js';
import { generateBookingEmailTemplate } from '../templates/bookingEmailTemplate.js';
import { validateBookingData } from '../utils/validation.js';

const router = express.Router();

/**
 * Generate unique booking number
 */
function generateBookingNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `CONF-${timestamp}-${random}`;
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

    // Generate email content using premium template
    const emailData = {
      ...validatedData,
      bookingNumber,
      fullPhone,
    };
    const emailContent = generateBookingEmailTemplate(emailData);

    // Send email to customer
    await sendEmail(validatedData.email, emailContent.subject, emailContent);

    // Send notification to admin (using ADMIN_EMAIL or SMTP_USER)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      await sendEmail(adminEmail, emailContent.subject, emailContent);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Booking request received successfully',
      bookingNumber,
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
