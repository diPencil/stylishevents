import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: '.env.local' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
  tls: {
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true',
  },
});

if (process.env.SMTP_VERIFY_ON_START === 'true') {
  transporter.verify((error) => {
    if (error) {
      console.error('SMTP connection error:', error.message);
      return;
    }
    console.log('SMTP server ready.');
  });
}

export async function sendEmail(to, subject, content) {
  const isObject = typeof content === 'object';
  const text = isObject ? content.text : content;
  const html = isObject ? content.html : undefined;

  try {
    const info = await transporter.sendMail({
      from: `"Stylish Events" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
      replyTo: process.env.SMTP_USER,
    });

    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export default transporter;
