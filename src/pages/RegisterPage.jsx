import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/new-logo.png';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [showSocialLogin, setShowSocialLogin] = useState(false);
  const [socialLoginMethod, setSocialLoginMethod] = useState('');

  const { register, loginWithSocial, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }

    if (error) {
      toast.error(error);
      clearError();
    }
  }, [isAuthenticated, error, navigate, clearError]);

  const { name, email, password, confirmPassword, phone } = formData;

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSocialLogin = (provider) => {
    const providerKey = provider.toLowerCase();
    loginWithSocial(providerKey).then((result) => {
      if (result.success) {
        toast.success(`${provider} signup successful`);
        navigate('/');
      } else {
        toast.error(result.error || `${provider} signup failed`);
      }
    });
  };

  const handleOtpRegistration = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      // Simulate OTP verification and registration
      toast.success('OTP verified! Registration successful!');
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
    
    if (!formData.name) {
      toast.error('Please enter your name');
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

  const handleOtpChange = (value) => {
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleOtpKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleOtpRegistration(e);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate terms checkbox
    if (!formData.terms) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register({
      name,
      email,
      password,
      phone
    });
    
    if (result.success) {
      toast.success('Registration successful!');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="register-page">
      {/* Left Side - Registration Form */}
      <div className="register-left">
        <div className="register-container">
          <div className="register-form-wrapper">
            <h1>Create Account</h1>
            <p className="register-subtitle">Join Black Locust and start your fashion journey</p>
            
            <form onSubmit={onSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={onChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    required
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="terms-agreement">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="terms" 
                    checked={formData.terms}
                    onChange={onChange}
                    required 
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className="terms-link">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="terms-link">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="register-btn"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="register-divider">
              <span>OR</span>
            </div>

            {/* Social Login */}
            <div className="social-register">
              <button
                type="button"
                className="social-btn google-btn"
                onClick={() => handleSocialLogin('Google')}
              >
                <FaGoogle />
                <span>Sign up with Google</span>
              </button>
              <button
                type="button"
                className="social-btn facebook-btn"
                onClick={() => handleSocialLogin('Facebook')}
              >
                <FaFacebook />
                <span>Sign up with Facebook</span>
              </button>
            </div>

            {/* OTP Registration */}
            <div className="otp-register">
              <button
                type="button"
                className="otp-btn"
                onClick={sendOtp}
              >
                Register with OTP
              </button>
            </div>

            <div className="login-link">
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Big Logo */}
      <div className="register-right">
        <div className="register-logo-section">
          <img src={logo} alt="Black Locust" className="register-logo" />
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
                  onClick={handleOtpRegistration}
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
    </div>
  );
};

export default RegisterPage;
