import { z } from 'zod';

export const bookingFormSchema = z.object({
  bookingType: z.enum(['single', 'recurring', 'annual', 'general']).default('single'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9\s().-]{7,30}$/, 'Phone number is invalid'),
  countryCode: z.string().default('+966'),
  jobTitle: z.string().min(2, 'Job title is required'),
  preferredContactMethod: z.enum(['phone', 'email', 'whatsapp']).default('email'),
  eventName: z.string().optional(),
  eventType: z.enum(['conference', 'exhibition', 'workshop', 'corporate', 'medical', 'other']).optional(),
  organization: z.string().optional(),
  expectedAttendance: z.string().optional(),
  eventDate: z.string().optional(),
  isDateFlexible: z.boolean().default(false),
  country: z.string().optional(),
  location: z.string().optional(),
  venueStatus: z.enum(['known', 'not_decided']).default('not_decided'),
  budgetRange: z.string().optional(),
  objectives: z.string().optional(),
  additionalRequirements: z.string().optional(),
  eventBrief: z.string().min(20, 'Event brief is required').max(1200, 'Event brief is too long'),
  services: z.array(z.string()).default([]),
  privacyConsent: z.boolean().refine((value) => value === true, 'Privacy consent is required'),
  communicationConsent: z.boolean().default(false),
  language: z.enum(['ar', 'en']).default('ar'),
}).superRefine((data, ctx) => {
  if (data.bookingType === 'general') return;
  if (!data.eventName || data.eventName.trim().length < 2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['eventName'], message: 'Event name is required' });
  }
  if (!data.eventType) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['eventType'], message: 'Event type is required' });
  }
  if (!data.isDateFlexible && (!data.eventDate || data.eventDate.trim().length < 1)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['eventDate'], message: 'Event date is required' });
  }
  if (!data.location || data.location.trim().length < 2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['location'], message: 'City or location is required' });
  }
  if (!data.expectedAttendance || data.expectedAttendance.trim().length < 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expectedAttendance'], message: 'Expected attendance is required' });
  }
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
