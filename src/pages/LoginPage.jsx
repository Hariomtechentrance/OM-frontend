import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaTimes, FaCheck, FaMobileAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import OTPLogin from '../components/Auth/OTPLogin';
import logo from '../assets/images/new-logo.png';
import { API_BASE } from '../config/api';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [showSocialLogin, setShowSocialLogin] = useState(false);
  const [socialLoginMethod, setSocialLoginMethod] = useState('');
  const [showOTPLogin, setShowOTPLogin] = useState(false);
  const [localLoading, setLocalLoading] = useState(false); // ✅ FIX: Add local loading state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const { login, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔥 useEffect - loading:", loading, "isAuthenticated:", isAuthenticated, "user:", user);
    if (loading) {
      console.log("🔥 useEffect - returning early due to loading");
      return;
    }
    if (!isAuthenticated) {
      console.log("🔥 useEffect - user not authenticated");
      return;
    }

    const role = user?.role;
    if (role === 'admin') {
      console.log("🔥 useEffect - navigating to admin");
      navigate('/admin');
    } else {
      console.log("🔥 useEffect - navigating to home");
      navigate('/');
    }
  }, [loading, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Facebook') {
      toast.info('Facebook login is temporarily unavailable. Please use email login or Google.');
      return;
    }
    
    setSocialLoginMethod(provider);
    setShowSocialLogin(true);
    
    // Simulate social login for Google
    setTimeout(() => {
      toast.success(`${provider} login successful!`);
      setShowSocialLogin(false);
      navigate('/');
    }, 2000);
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      // Simulate OTP verification
      toast.success('OTP verified successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const sendOtp = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      // Simulate sending OTP
      toast.success('OTP sent to your email!');
      setShowOtp(true);
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // 🔥 MUST
    
    try {
      console.log("🔥 FORM SUBMITTED", e);
      console.log("🔥 formData:", formData);
      
      const res = await axios.post(`${API_BASE}/users/login`, {
        email: formData.email,
        password: formData.password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      // ✅ REDIRECT
      navigate("/");
    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);
    }
  };

  const handleOtpLoginSuccess = (userData) => {
    toast.success('OTP Login successful!');
    const role = userData?.role;
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleOtpChange = (value) => {
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleOtpKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleOtpLogin(e);
    }
  };

  return (
    <div className="login-page">
      {/* Left Side - Login Form */}
      <div className="login-left">
        <div className="login-form-container">
          <div className="login-logo">
            <img src={logo} alt="Black Locust" className="login-logo-img" />
            <h2>Welcome Back</h2>
            <p>Login to your account</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-btn" disabled={localLoading}>
              {localLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Social Login */}
          <div className="social-login">
            <div className="divider">
              <span>OR</span>
            </div>
            <div className="social-buttons">
              <button
                type="button"
                className="social-btn google-btn"
                onClick={() => handleSocialLogin('Google')}
              >
                <FaGoogle />
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                className="social-btn facebook-btn"
                onClick={() => handleSocialLogin('Facebook')}
              >
                <FaFacebook />
                <span>Continue with Facebook</span>
              </button>
            </div>
          </div>

          {/* OTP Login */}
          <div className="otp-login">
            <button
              type="button"
              className="otp-btn"
              onClick={() => setShowOTPLogin(true)}
            >
              <FaMobileAlt />
              Login with OTP
            </button>
          </div>

          <div className="signup-link">
            <p>
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Big Logo */}
      <div className="login-right">
        <div className="login-logo-section">
          <img src={logo} alt="Black Locust" className="login-logo" />
        </div>
      </div>

      {/* OTP Modal */}
      {showOtp && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <div className="otp-modal-header">
              <h3>Enter OTP</h3>
              <button
                className="close-btn"
                onClick={() => setShowOtp(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="otp-modal-body">
              <p>Enter the 6-digit OTP sent to your email</p>
              <div className="otp-input-container">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otp[index] || ''}
                    onChange={(e) => handleOtpChange(otp.slice(0, index) + e.target.value + otp.slice(index + 1))}
                    onKeyPress={handleOtpKeyPress}
                    className="otp-input"
                  />
                ))}
              </div>
              <div className="otp-actions">
                <button
                  type="button"
                  className="resend-otp-btn"
                  onClick={sendOtp}
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  className="verify-otp-btn"
                  onClick={handleOtpLogin}
                >
                  Verify OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Login Modal */}
      {showSocialLogin && (
        <div className="social-login-modal">
          <div className="social-login-content">
            <div className="social-login-header">
              <h3>Connecting to {socialLoginMethod}</h3>
              <div className="loading-spinner"></div>
              <p>Please wait while we connect your {socialLoginMethod} account...</p>
            </div>
          </div>
        </div>
      )}

      {/* OTP Login Modal */}
      {showOTPLogin && (
        <OTPLogin
          onBack={() => setShowOTPLogin(false)}
          onClose={() => setShowOTPLogin(false)}
          onOTPLoginSuccess={handleOtpLoginSuccess}
        />
      )}
    </div>
  );
};

export default LoginPage;
