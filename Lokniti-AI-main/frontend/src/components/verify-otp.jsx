import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';



export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  // try to get email from location.state, query param, or saved value
  const queryEmail = new URLSearchParams(location.search).get('email');
  const initialEmail = (location.state && location.state.email) || queryEmail || localStorage.getItem('lokniti_pending_email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (initialEmail) localStorage.setItem('lokniti_pending_email', initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    let t;
    if (secondsLeft > 0) {
      t = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [secondsLeft]);

  // refs for inputs
  const inputs = [];

  function focusInput(idx) {
    const el = inputs[idx];
    if (el) el.focus();
  }

  function handleOtpChange(e, idx) {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val && otp[idx] === '') return; // nothing

    const next = [...otp];
    // if user pasted multiple digits, spread them
    if (val.length > 1) {
      const digits = val.split('').slice(0, 6 - idx);
      for (let i = 0; i < digits.length; i++) next[idx + i] = digits[i];
      setOtp(next);
      const nextIdx = Math.min(5, idx + val.length);
      focusInput(nextIdx);
      return;
    }

    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) focusInput(idx + 1);
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      focusInput(idx - 1);
    }
    if (e.key === 'ArrowLeft' && idx > 0) focusInput(idx - 1);
    if (e.key === 'ArrowRight' && idx < 5) focusInput(idx + 1);
  }

  async function handleSubmit(e) {
    e && e.preventDefault();
    const code = otp.join('');
    if (!email) return toast.error('Please provide your email.');
    if (code.length !== 6) return toast.error('Please enter the 6-digit OTP.');

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp: code }, { headers: { 'Content-Type': 'application/json' } });
      // expected { token, user }
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('lokniti_token', token);
        localStorage.setItem('lokniti_user', JSON.stringify(user || {}));
        localStorage.removeItem('lokniti_pending_email');
        toast.success('Account verified — logged in');
        navigate('/dashboard');
      } else {
        toast.success(res.data.message || 'Verified');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return toast.error('Email required to resend OTP');
    setResendLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', { email }, { headers: { 'Content-Type': 'application/json' } });
      toast.info('OTP resent — check your email');
      setSecondsLeft(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-[#041024] to-[#001429] rounded-2xl shadow-2xl p-8 border border-blue-800/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-white"><path fill="currentColor" d="M12 2L2 7v6c0 5 6 9 10 9s10-4 10-9V7l-10-5z"/></svg>
            </div>
            <div>
              <h1 className="text-white text-2xl font-semibold">Verify OTP</h1>
              <p className="text-blue-200 text-sm">Enter the 6-digit code sent to your email</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 block w-full rounded-lg bg-black/60 border border-blue-800/40 px-3 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">One-time code</label>
              <div className="flex gap-2 justify-center">
                {Array(6).fill(0).map((_, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputs[idx] = el)}
                    value={otp[idx]}
                    onChange={(e) => handleOtpChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="w-12 h-12 text-center rounded-lg bg-black/60 border border-blue-800/40 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow hover:opacity-95 disabled:opacity-60">
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>

            <div className="text-center text-sm text-blue-200">
              Didn\'t get the code? 
              <button type="button" onClick={handleResend} disabled={secondsLeft > 0 || resendLoading} className="ml-2 font-semibold text-white hover:underline">
                {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : (resendLoading ? 'Sending...' : 'Resend OTP')}
              </button>
            </div>

            <div className="text-center text-sm text-blue-300">
              <button type="button" onClick={() => navigate('/login')} className="hover:underline">Back to sign in</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
