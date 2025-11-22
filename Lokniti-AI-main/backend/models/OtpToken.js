import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  otp: { type: String, required: true }, // store hashed OTP
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 } // TTL (1 hour) as fallback
});

export default mongoose.model('OtpToken', otpSchema);