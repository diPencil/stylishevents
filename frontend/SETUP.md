# Stylish Events - Setup & Running Guide

## Project Structure

```
directevents/
â”œâ”€â”€ app/               # Next.js app (Frontend)
â”œâ”€â”€ components/        # React components
â”œâ”€â”€ backend/          # Express.js server
â””â”€â”€ ...other files
```

## Setup Instructions

### 1. Frontend Setup (Next.js)

```bash
# From root directory
npm install
```

### 2. Backend Setup (Express.js)

```bash
cd backend
npm install
```

#### Backend Configuration

Create `.env.local` in the `backend/` directory:

```env
# SMTP Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@stylish-holidays.comSMTP_PASS=>oHwxDKC|9aL

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=development
```

> âš ï¸ **IMPORTANT**: Never commit `.env.local` to git. It's listed in `.gitignore`.

---

## Running the Application

### Option 1: Run Both Servers in Separate Terminals

**Terminal 1 - Frontend:**
```bash
# From root directory
npm run dev
```
Frontend will run on: `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```
Backend will run on: `http://localhost:5000`

### Option 2: Run Backend Only (for testing)

```bash
cd backend
npm start
```

Server output:
```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸš€ Stylish Events Backend Started
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“ Server URL: http://localhost:5000
ðŸ“§ Email: info@stylish-holidays.comðŸ”§ Environment: development
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

âœ… SMTP Server Ready. Messages can be sent.
```

---

## Testing the Booking API

### Quick Test with curl

```bash
curl -X POST http://localhost:5000/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "bookingType": "single",
    "fullName": "Test User",
    "email": "your-email@example.com",
    "phone": "1234567890",
    "countryCode": "+966",
    "jobTitle": "Manager",
    "eventName": "Tech Conference",
    "eventType": "conference",
    "organization": "Test Company",
    "expectedAttendance": "100",
    "eventDate": "2025-06-15",
    "country": "SA",
    "location": "Riyadh",
    "services": ["hotel", "airport"],
    "language": "en"
  }'
```

### Expected Response (Success)

```json
{
  "success": true,
  "message": "Booking request received successfully",
  "bookingNumber": "CONF-XXXXXXXX-XXXXX",
  "email": "your-email@example.com"
}
```

### Health Check

```bash
curl http://localhost:5000/health
```

---

## How It Works

### 1. User Fills Booking Form

The form is located at `components/booking-form.tsx` with multilingual support (Arabic/English).

### 2. Form Submission

When user clicks "Confirm Booking", the form data is sent to:

```
POST http://localhost:5000/api/booking
```

### 3. Backend Processing

1. **Validation**: Data is validated using Zod schema
2. **Booking Number Generation**: A unique booking ID is created
3. **Email Template**: Email is generated with all booking details
4. **Email Sending**: Email is sent via SMTP (Hostinger)
5. **Response**: Booking number is returned to frontend

### 4. User Confirmation

Frontend displays success modal showing:
- Booking number
- Confirmation message
- Option to contact via WhatsApp

---

## Email Configuration Details

### SMTP Server

- **Provider**: Hostinger
- **Host**: smtp.hostinger.com
- **Port**: 465 (SSL/TLS)
- **Username**: info@stylish-holidays.com- **Authentication**: Password-based

### Email Content

The confirmation email includes:

- âœ… Unique booking reference number
- âœ… User contact information
- âœ… Event details (name, type, location, date)
- âœ… Expected attendance
- âœ… Selected services
- âœ… Multilingual support (Arabic & English)
- âœ… Professional branding and footer

Example email sections:
```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ØªØ£ÙƒÙŠØ¯ Ø·Ù„Ø¨ Ø­Ø¬Ø² Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ©
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

ðŸ” Ø±Ù‚Ù… Ø§Ù„Ø­Ø¬Ø²: CONF-XXXXXXXX-XXXXX
ðŸ‘¤ Ø§Ù„Ø§Ø³Ù…: Ù…Ø­Ù…ÙˆØ¯ Ø´Ø¹Ø¨Ø§Ù†
ðŸ“§ Ø§Ù„Ø¨Ø±ÙŠØ¯: user@example.com
...
```

---

## Troubleshooting

### Issue: "Route not found" error

**Solution**: Make sure backend server is running on port 5000:
```bash
cd backend
npm start
```

### Issue: "Failed to send email"

**Solutions**:
1. Check SMTP credentials in `.env.local`
2. Verify internet connection
3. Check Hostinger email account is active
4. Check server logs for detailed error messages

### Issue: Port already in use

**If port 5000 is in use:**
```bash
# Change PORT in backend/.env.local
PORT=5001
```

**If port 3000 is in use:**
```bash
# Run frontend on different port
PORT=3001 npm run dev
```

### Enable Development Logs

Set in backend `.env.local`:
```env
NODE_ENV=development
```

Full error messages will be returned in API responses.

---

## Deployment

### Creating Production Build

**Frontend:**
```bash
npm run build
npm start
```

**Backend:**
1. Update `FRONTEND_URL` in `.env` to your production domain
2. Set `NODE_ENV=production`
3. Deploy using your hosting platform (Vercel, Heroku, etc.)

### Important for Production

- âœ… Use strong SMTP password
- âœ… Keep `.env.local` **secure** and never commit
- âœ… Configure proper CORS origins
- âœ… Use HTTPS only
- âœ… Enable error logging and monitoring

---

## Support & Contact

For issues or questions:

- Email: info@stylish-holidays.com
- Website: https://stylish-events.com
- WhatsApp: https://wa.me/201006071661

---

## Quick Reference

| Task | Command | Port |
|------|---------|------|
| Start Frontend | `npm run dev` | 3000 |
| Start Backend | `cd backend && npm start` | 5000 |
| Test Email | `curl -X POST http://localhost:5000/api/booking ...` | - |
| Health Check | `curl http://localhost:5000/health` | - |
| Build Frontend | `npm run build` | - |

---

**Last Updated**: April 2, 2026  
**Version**: 1.0.0
