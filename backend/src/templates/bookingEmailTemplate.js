/**
 * Generates a premium HTML email template for booking notifications
 * @param {Object} data - Booking data
 * @returns {Object} - Email subject, text, and html content
 */
export function generateBookingEmailTemplate(data) {
  const {
    bookingNumber,
    fullName,
    email,
    fullPhone,
    jobTitle,
    organization,
    eventName,
    eventType,
    country,
    location,
    expectedAttendance,
    eventDate,
    services,
    bookingType,
    language = 'ar',
  } = data;

  const isArabic = language === 'ar';
  
  // Format Date
  const formattedDate = new Date(eventDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Services Labels
  const servicesList = services && services.length > 0
    ? services.map(s => {
        if (s === 'hotel') return isArabic ? 'حجز فنادق' : 'Hotel Reservations';
        if (s === 'airport') return isArabic ? 'استقبال مطار' : 'Airport Reception';
        if (s === 'tourism') return isArabic ? 'جولات سياحية' : 'Tourism Trips';
        return s;
      }).join(', ')
    : (isArabic ? 'لا يوجد' : 'None');

  const typeLabel = bookingType === 'annual' 
    ? (isArabic ? 'شراكة سنوية' : 'Annual Partnership')
    : (isArabic ? 'فعالية واحدة' : 'Single Event');

  // WhatsApp Link
  const waPhone = fullPhone.replace(/\+/g, '');
  const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(isArabic ? `أهلاً أستاذ ${fullName}، يسعدنا التواصل معكم بخصوص طلبكم رقم ${bookingNumber}` : `Hello ${fullName}, we are following up on your booking ${bookingNumber}`)}`;
  
  // Direct Call Link
  const callLink = `tel:${fullPhone}`;

  const primaryColor = '#2563eb'; // Professional Blue
  const secondaryColor = '#f8fafc'; // Light Slate
  const textColor = '#1e293b';

  const html = `
<!DOCTYPE html>
<html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: ${textColor}; margin: 0; padding: 0; background-color: #f1f5f9; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background-color: ${primaryColor}; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 30px; }
    .section-title { font-size: 18px; font-weight: 700; color: ${primaryColor}; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
    .info-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 25px; }
    .info-item { background: ${secondaryColor}; padding: 12px 15px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .info-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
    .info-value { font-size: 15px; font-weight: 700; color: #0f172a; }
    .actions { margin-top: 20px; }
    .btn { display: block; width: 100%; box-sizing: border-box; text-align: center; padding: 16px 20px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 15px; color: #ffffff !important; }
    .btn-whatsapp { background-color: #25d366; color: #ffffff !important; border-bottom: 3px solid #128c7e; }
    .btn-call { background-color: #2563eb; color: #ffffff !important; border-bottom: 3px solid #1e40af; }
    .footer { background: ${secondaryColor}; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #dbeafe; color: #1e40af; }
    @media only screen and (max-width: 600px) {
      .container { border-radius: 0; margin: 0; }
      .actions { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://stylish-events.com/${isArabic ? 'stylish-logo-ar.svg' : 'stylish-logo.svg'}" alt="Stylish Events logo" style="max-width: 150px; height: auto; margin-bottom: 15px;">
      <p>${isArabic ? 'إشعار بطلب حجز جديد' : 'New Booking Request Notification'}</p>
    </div>
    
    <div class="content">
      <div style="text-align: center; margin-bottom: 30px;">
        <span class="badge">#${bookingNumber}</span>
        <h2 style="margin: 10px 0 5px; font-size: 20px;">${eventName}</h2>
        <p style="margin: 0; color: #64748b;">${typeLabel}</p>
      </div>

      <div class="section-title">${isArabic ? 'بيانات العميل' : 'Customer Details'}</div>
      <div class="info-grid">
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'الاسم بالكامل' : 'Full Name'}</div>
          <div class="info-value">${fullName}</div>
        </div>
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'المنصب / التخصص' : 'Job Title'}</div>
          <div class="info-value">${jobTitle}</div>
        </div>
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'الشركة / الجهة' : 'Organization'}</div>
          <div class="info-value">${organization || '---'}</div>
        </div>
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'البريد الإلكتروني' : 'Email Address'}</div>
          <div class="info-value">${email}</div>
        </div>
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'رقم الجوال' : 'Phone Number'}</div>
          <div class="info-value">${fullPhone}</div>
        </div>
      </div>

      <div class="section-title">${isArabic ? 'تفاصيل الفعالية' : 'Event Details'}</div>
      <div class="info-grid">
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'نوع الفعالية' : 'Event Type'}</div>
          <div class="info-value">${eventType}</div>
        </div>
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'التاريخ المتوقع' : 'Expected Date'}</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'الموقع المقترح' : 'Location'}</div>
          <div class="info-value">${country}, ${location}</div>
        </div>
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'العدد المتوقع' : 'Expected Attendance'}</div>
          <div class="info-value">${expectedAttendance}</div>
        </div>
        <div class="info-item" style="display: block;">
          <div class="info-label">${isArabic ? 'الخدمات المطلوبة' : 'Required Services'}</div>
          <div class="info-value">${servicesList}</div>
        </div>
      </div>

      <div class="section-title">${isArabic ? 'إجراءات سريعة' : 'Quick Actions'}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="48%" style="padding-${isArabic ? 'left' : 'right'}: 4px;">
            <a href="${waLink}" class="btn btn-whatsapp" style="margin-bottom: 0;">${isArabic ? 'واتساب' : 'WhatsApp'}</a>
          </td>
          <td width="48%" style="padding-${isArabic ? 'right' : 'left'}: 4px;">
            <a href="${callLink}" class="btn btn-call" style="margin-bottom: 0;">${isArabic ? 'اتصال' : 'Call'}</a>
          </td>
        </tr>
      </table>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 Stylish Events. ${isArabic ? 'جميع الحقوق محفوظة' : 'All Rights Reserved.'}</p>
      <p>Stylish Events & Services - International Conferences & Exhibitions</p>
      <p style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
        ${isArabic ? 'هذا إشعار تلقائي من نظام الحجز الخاص بموقع Stylish Events.' : 'This is an automated notification from the Stylish Events booking system.'}<br>
        Stylish Events Powered by <a href="https://dipencil.com/" style="color: inherit; text-decoration: underline;">diPencil Studio</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Fallback plain text for accessibility
  const plainText = `
${isArabic ? 'طلب حجز جديد' : 'New Booking Request'}
# ${bookingNumber}

${isArabic ? 'العميل' : 'Customer'}: ${fullName}
${isArabic ? 'البريد' : 'Email'}: ${email}
${isArabic ? 'الهاتف' : 'Phone'}: ${fullPhone}
${isArabic ? 'نوع الحجز' : 'Booking Type'}: ${typeLabel}

${isArabic ? 'الفعالية' : 'Event'}: ${eventName}
${isArabic ? 'الموقع' : 'Location'}: ${location}
${isArabic ? 'التاريخ' : 'Date'}: ${formattedDate}

${isArabic ? 'الخدمات' : 'Services'}: ${servicesList}
  `;

  return {
    subject: isArabic
      ? `طلب حجز جديد: ${bookingNumber} - ${fullName}`
      : `New Booking: ${bookingNumber} - ${fullName}`,
    text: plainText.trim(),
    html: html.trim(),
  };
}
