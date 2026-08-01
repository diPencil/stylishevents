import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import attendeeRoutes from './routes/attendees.js';
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/booking.js';
import certificateRoutes from './routes/certificates.js';
import contactInquiryRoutes from './routes/contactInquiries.js';
import doctorRoutes from './routes/doctors.js';
import eventRoutes from './routes/events.js';
import kioskRoutes from './routes/kiosk.js';
import meRoutes from './routes/me.js';
import platformRoutes from './routes/platform.js';
import publicEventRoutes from './routes/publicEvents.js';
import registrationRoutes from './routes/registrations.js';
import reportRoutes from './routes/reports.js';
import reviewRoutes from './routes/reviews.js';
import ticketRoutes from './routes/tickets.js';
import userRoutes from './routes/users.js';
import { optionalAuth } from './middleware/auth.js';
import { rateLimit, securityHeaders } from './middleware/security.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isMainModule = process.argv[1] && __filename === process.argv[1];
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(securityHeaders);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isLocalhostDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    if (isLocalhostDevOrigin || allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(optionalAuth);

app.get('/', (req, res) => {
  res.json({
    message: 'Stylish Events Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 20 }), authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/contact-inquiries', contactInquiryRoutes);
app.use('/api/admin', platformRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/public/events', publicEventRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/attendees', attendeeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/kiosk', kioskRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/me', meRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

app.use((err, req, res, next) => {
  if (err.message === 'Origin not allowed by CORS') {
    res.status(403).json({
      success: false,
      message: 'Request blocked by CORS policy',
      origin: req.headers.origin,
    });
    return;
  }

  const statusCode = Number(err.statusCode || err.status || 500);
  if (statusCode >= 500) console.error('Server error:', err);
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Internal server error' : err.message || 'Request failed',
    details: err.details,
    error: statusCode >= 500 && process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Stylish Events Backend Started
Server URL: http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
