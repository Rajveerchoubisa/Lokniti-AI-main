// utils/sendEmail.js

import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

async function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // If user/pass provided, use real SMTP (production/dev)
  if (host && port && user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for STARTTLS ports like 587/2525
      auth: {
        user,
        pass,
      },
      tls: {
        // allow self-signed certs (optional for some providers)
        rejectUnauthorized: false,
      },
    });

    // verify connection (useful during dev)
    try {
      await transporter.verify();
      console.log('SMTP transporter verified (host=%s port=%s user=%s)', host, port, user);
    } catch (err) {
      console.error('Error verifying SMTP transporter:', err.message || err);
      // Still return transporter so calling code can attempt send and catch errors
    }

    return transporter;
  }

  // FALLBACK: Ethereal (dev-only)
  console.warn('No SMTP credentials set — creating Ethereal test account for development.');
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('Ethereal test account created. user=%s', testAccount.user);
  return transporter;
}

export default async function sendEmail({ to, subject, text, html }) {
  const transporter = await createTransporter();
  const from = process.env.FROM_EMAIL || 'Lokniti AI <no-reply@lokniti.ai>';

  const info = await transporter.sendMail({ from, to, subject, text, html });

  // if Ethereal, print preview URL
  if (nodemailer.getTestMessageUrl) {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('Ethereal preview URL: %s', url);
  }
  return info;
};
