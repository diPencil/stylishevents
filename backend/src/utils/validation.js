import { z } from 'zod';

export const bookingFormSchema = z.object({
  bookingType: z.enum(['single', 'annual']),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number is required'),
  countryCode: z.string().default('+966'),
  jobTitle: z.string().min(2, 'Job title is required'),
  eventName: z.string().min(2, 'Event name is required'),
  eventType: z.enum(['conference', 'exhibition', 'both']),
  organization: z.string().optional(),
  expectedAttendance: z.string().min(1, 'Expected attendance is required'),
  eventDate: z.string().min(1, 'Date is required'),
  country: z.string().min(1, 'Country is required'),
  location: z.string().min(2, 'Location is required'),
  services: z.array(z.string()).default([]),
  language: z.enum(['ar', 'en']).default('ar'),
});

export function validateBookingData(data) {
  try {
    const validData = bookingFormSchema.parse(data);
    return {
      valid: true,
      data: validData,
    };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
  }
}
