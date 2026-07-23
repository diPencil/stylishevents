/**
 * Simple test script for the booking API
 * Usage: node test.js
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/booking';

const testData = {
  bookingType: 'single',
  fullName: 'محمود شعبان الصباغ',
  email: 'elsabbagh@dipencil.com',
  phone: '1001234567',
  countryCode: '+966',
  jobTitle: 'مدير المشاريع',
  eventName: 'مؤتمر التكنولوجيا الدولي 2025',
  eventType: 'conference',
  organization: 'شركة Stylish Events',
  expectedAttendance: '500',
  eventDate: '2025-06-15',
  country: 'SA',
  location: 'الرياض',
  services: ['hotel', 'airport', 'trips'],
  language: 'ar',
};

async function testBookingAPI() {
  console.log('🚀 Testing Booking API...\n');
  console.log('📍 Endpoint:', API_URL);
  console.log('📧 Test Email:', testData.email);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    console.log('📤 Sending request...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log(`\n📩 Response Status: ${response.status}\n`);

    if (response.ok) {
      console.log('✅ SUCCESS!\n');
      console.log('Booking Details:');
      console.log(`  • Booking Number: ${result.bookingNumber}`);
      console.log(`  • Email: ${result.email}`);
      console.log(`  • Message: ${result.message}`);
      console.log('\n✉️  Confirmation email should be received shortly.\n');
    } else {
      console.log('❌ FAILED!\n');
      console.log('Error:', result.message);
      if (result.errors) {
        console.log('Details:');
        result.errors.forEach((err) => {
          console.log(`  • ${err.field}: ${err.message}`);
        });
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n⚠️  Make sure the backend server is running:');
    console.error('   npm start\n');
  }
}

testBookingAPI();
