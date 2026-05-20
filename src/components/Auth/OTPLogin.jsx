import React, { useState, useRef, useEffect } from 'react';
import { FaEnvelope, FaMobileAlt, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  createRecaptchaVerifier,
  sendPhoneOTP,
  verifyPhoneOTP
} from '../../services/firebaseAuth';
import './OTPLogin.css';

const OTPLogin = ({ onBack, onClose, onOTPLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [errors, setErrors] = useState({});

  // Firebase phone auth state
  const recaptchaVerifierRef = useRef(null);
  const confirmationResultRef = useRef(null);

  const { sendOTP: sendOTPAuth, verifyOTP: verifyOTPAuth, loginWithPhoneFirebase } = useAuth();

  // Countdown timer
  useEffect(() => {
    if (!otpSent || timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [otpSent, timer]);

  useEffect(() => {
    if (timer === 0) setResendDisabled(false);
  }, [timer]);

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = null;
      }
      recaptchaVerifierRef.current = null;
    };
  }, []);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validateMobile = (v) => /^[6-9]\d{9}$/.test(v);

  // ── Send OTP ──────────────────────────────────────────────────────────────

  const handleSendOTP = async () => {
    const newErrors = {};

    if (loginMethod === 'email') {
      if (!email) newErrors.email = 'Email is required';
      else if (!validateEmail(email)) newErrors.email = 'Enter a valid email address';
    } else {
      if (!mobile) newErrors.mobile = 'Mobile number is required';
      else if (!validateMobile(mobile)) newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});

    try {
      if (loginMethod === 'mobile') {
        // ── Firebase phone auth ──────────────────────────────────────────
        // Clear any previous verifier
        if (recaptchaVerifierRef.current) {
          try { recaptchaVerifierRef.current.clear(); } catch {}
          recaptchaVerifierRef.current = null;
        }

        recaptchaVerifierRef.current = createRecaptchaVerifier('recaptcha-container');
        await recaptchaVerifierRef.current.render();

        confirmationResultRef.current = await sendPhoneOTP(mobile, recaptchaVerifierRef.current);

        setOtpSent(true);
        setTimer(60);
        setResendDisabled(true);
        toast.success(`OTP sent to +91 ${mobile}`);
      } else {
        // ── Email OTP via backend ────────────────────────────────────────
        const response = await sendOTPAuth('email', email);
        if (response.success) {
          setOtpSent(true);
          setTimer(60);
          setResendDisabled(true);
          if (response.demo) {
            toast.info(`Demo Mode: OTP is ${response.otp || 'check console'}`);
          } else {
            toast.success('OTP sent to your email!');
          }
        } else {
          setErrors({ general: response.message });
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      const msg = error.code === 'auth/invalid-phone-number'
        ? 'Invalid phone number. Use 10-digit Indian mobile number.'
        : error.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : error.message || 'Failed to send OTP';
      setErrors({ general: msg });
      toast.error(msg);

      // Reset recaptcha on error
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────

  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join('');
    if (enteredOTP.length !== 6) {
      setErrors({ otp: 'Enter the complete 6-digit OTP' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (loginMethod === 'mobile') {
        // ── Firebase verify ──────────────────────────────────────────────
        if (!confirmationResultRef.current) {
          setErrors({ general: 'Session expired. Please resend OTP.' });
          setLoading(false);
          return;
        }

        const { idToken } = await verifyPhoneOTP(confirmationResultRef.current, enteredOTP);
        const response = await loginWithPhoneFirebase(idToken, mobile);

        if (response.success) {
          toast.success('Mobile login successful!');
          onOTPLoginSuccess(response.user);
        } else {
          setErrors({ general: response.error });
          toast.error(response.error);
        }
      } else {
        // ── Backend email verify ─────────────────────────────────────────
        const response = await verifyOTPAuth(email, enteredOTP);
        if (response.success) {
          toast.success('Login successful!');
          onOTPLoginSuccess(response.user);
        } else {
          setErrors({ otp: response.message });
          const extra = response.attemptsRemaining ? ` ${response.attemptsRemaining} attempts remaining.` : '';
          toast.error(response.message + extra);
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      const msg = error.code === 'auth/invalid-verification-code'
        ? 'Incorrect OTP. Please try again.'
        : error.code === 'auth/code-expired'
        ? 'OTP expired. Please resend.'
        : error.message || 'OTP verification failed';
      setErrors({ otp: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    setOtpSent(false);
    confirmationResultRef.current = null;
    // Re-triggers send from scratch
    setTimeout(handleSendOTP, 0);
  };

  // ── OTP input helpers ─────────────────────────────────────────────────────

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOTPKeyPress = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    setResendDisabled(true);
    setErrors({});
    confirmationResultRef.current = null;
  };

  const handleMethodSwitch = (method) => {
    setLoginMethod(method);
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    confirmationResultRef.current = null;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="otp-login-overlay">
      <div className="otp-login-modal">
        <div className="otp-login-header">
          <button className="back-btn" onClick={onBack}>
            <FaArrowLeft />
          </button>
          <h2>Login with OTP</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {!otpSent ? (
          <div className="otp-login-form">
            <div className="login-method-selector">
              <button
                className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={() => handleMethodSwitch('email')}
              >
                <FaEnvelope />
                <span>Email</span>
              </button>
              <button
                className={`method-btn ${loginMethod === 'mobile' ? 'active' : ''}`}
                onClick={() => handleMethodSwitch('mobile')}
              >
                <FaMobileAlt />
                <span>Mobile</span>
              </button>
            </div>

            {loginMethod === 'mobile' && (
              <p className="method-note">Free SMS OTP via Firebase · No charges</p>
            )}

            <div className="input-group">
              {loginMethod === 'email' ? (
                <>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </>
              ) : (
                <>
                  <label>Mobile Number</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className={errors.mobile ? 'error' : ''}
                    />
                  </div>
                  {errors.mobile && <span className="error-message">{errors.mobile}</span>}
                </>
              )}
            </div>

            {errors.general && <div className="error-message general">{errors.general}</div>}

            <button className="send-otp-btn" onClick={handleSendOTP} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="otp-verification-form">
            <div className="otp-info">
              <p>We sent a 6-digit OTP to</p>
              <p className="otp-value">
                {loginMethod === 'email' ? email : `+91 ${mobile}`}
              </p>
              {loginMethod === 'mobile' && (
                <p className="otp-sub">Delivered via Firebase — check your SMS</p>
              )}
            </div>

            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyPress(e, index)}
                  className={errors.otp ? 'error' : ''}
                />
              ))}
            </div>

            {errors.otp && <span className="error-message">{errors.otp}</span>}
            {errors.general && <div className="error-message general">{errors.general}</div>}

            <div className="otp-actions">
              <button
                className="verify-otp-btn"
                onClick={handleVerifyOTP}
                disabled={loading || otp.join('').length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="resend-section">
                <span>Didn't receive OTP?</span>
                <button
                  className="resend-otp-btn"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || loading}
                >
                  {resendDisabled ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </div>

              <button className="change-number-btn" onClick={handleBack}>
                Change {loginMethod === 'email' ? 'Email' : 'Mobile Number'}
              </button>
            </div>
          </div>
        )}

        {/* Invisible reCAPTCHA container required by Firebase Phone Auth */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
};

export default OTPLogin;
