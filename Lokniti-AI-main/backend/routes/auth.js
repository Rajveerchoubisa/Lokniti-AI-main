
import express from 'express';
const router = express.Router();

import { body,validationResult } from 'express-validator';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User.js';
import OtpToken from '../models/OtpToken.js';
import sendEmail from '../utils/sendEmail.js';


const OTP_EXPIRY_MIN = Number(process.env.OTP_EXPIRY_MIN) || 10;

// --- helper to generate numeric OTP ---
function generateOtp(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10);
  return otp;
}

// --- register route ---
router.post(
  '/register',
  [
    body('fullName').isLength({ min: 2 }).withMessage('Full name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { fullName, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'Email already in use' });

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      user = new User({ fullName, email, password: hashed, isVerified: false });
      await user.save();

      // generate OTP and hash it before storing
      const otp = generateOtp(6);
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

      await OtpToken.create({ userId: user._id, otp: otpHash, createdAt: new Date() });

      // send email (you can customize HTML)
      await sendEmail({
        to: email,
        subject: 'Your Lokniti AI OTP',
        text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MIN} minutes.`,
        html: `<p>Your OTP is <strong>${otp}</strong>. It expires in ${OTP_EXPIRY_MIN} minutes.</p>`
      });

      return res.status(201).json({ message: 'OTP sent', userId: user._id, email });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// --- verify otp route ---
router.post('/verify-otp', [
  body('email').isEmail(),
  body('otp').isLength({ min: 4 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid input' });

  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const record = await OtpToken.findOne({ userId: user._id });
    if (!record) return res.status(400).json({ message: 'OTP not found or expired' });

    // check expiry manually (createdAt + OTP_EXPIRY_MIN)
    const created = record.createdAt;
    const diffMinutes = (Date.now() - created.getTime()) / (1000 * 60);
    if (diffMinutes > OTP_EXPIRY_MIN) {
      await OtpToken.deleteMany({ userId: user._id });
      return res.status(400).json({ message: 'OTP expired' });
    }

    // compare hashed OTP
    const otpHash = crypto.createHash('sha256').update(String(otp)).digest('hex');
    if (otpHash !== record.otp) return res.status(400).json({ message: 'Invalid OTP' });

    user.isVerified = true;
    await user.save();

    // remove OTP records
    await OtpToken.deleteMany({ userId: user._id });

    // create JWT
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return res.json({
      message: 'Account verified',
      token,
      user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// --- login route ---
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(403).json({ message: 'Email not verified. Please verify OTP.' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return res.json({
      message: 'Login successful',
      token,
      user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// --- resend OTP ---
router.post('/resend-otp', [body('email').isEmail()], async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // remove old otps
    await OtpToken.deleteMany({ userId: user._id });

    // generate new
    const otp = generateOtp(6);
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    await OtpToken.create({ userId: user._id, otp: otpHash });

    await sendEmail({
      to: email,
      subject: 'Your new Lokniti AI OTP',
      text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MIN} minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in ${OTP_EXPIRY_MIN} minutes.</p>`
    });

    return res.json({ message: 'OTP resent' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
