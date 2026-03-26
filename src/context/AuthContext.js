import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import api from '../utils/axios';

// Create context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  loading: false, // ✅ FIXED: Start with false to prevent loading screen
  isAuthenticated: !!localStorage.getItem('token'), // ✅ FIXED: Proper boolean check
  error: null,
  tokenExpiry: localStorage.getItem('tokenExpiry')
};

// Action types
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAIL = 'AUTH_FAIL';
const LOGOUT = 'LOGOUT';
const LOAD_USER = 'LOAD_USER';
const CLEAR_ERROR = 'CLEAR_ERROR';
const SET_LOADING = 'SET_LOADING';
const REFRESH_TOKEN = 'REFRESH_TOKEN';
const OTP_SENT = 'OTP_SENT';
const OTP_VERIFIED = 'OTP_VERIFIED';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case LOAD_USER:
    case AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: action.payload.tokenExpiry,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_FAIL:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiry: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiry: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        tokenExpiry: action.payload.tokenExpiry,
        loading: false
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Set auth token header
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Check if token is expired
const isTokenExpired = (tokenExpiry) => {
  if (!tokenExpiry) return true;
  return new Date() > new Date(tokenExpiry);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Refresh token function
  const refreshAuthToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const res = await api.post('/api/users/refresh-token', { refreshToken }); // ✅ FIXED: Use proxy instead of hardcoded URL
      
      const { token, tokenExpiry } = res.data;
      
      setAuthToken(token);
      localStorage.setItem('tokenExpiry', tokenExpiry);
      
      dispatch({
        type: REFRESH_TOKEN,
        payload: { token, tokenExpiry }
      });
      
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  // Setup axios interceptor for automatic token refresh
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        // 🚨 Skip refresh logic for refresh-token API
        if (config.url.includes('/users/refresh-token')) {
          return config;
        }

        // Check if token is about to expire (within 5 minutes)
        if (state.tokenExpiry && isTokenExpired(state.tokenExpiry)) {
          const refreshed = await refreshAuthToken();
          if (!refreshed) {
            return Promise.reject(new Error('Token refresh failed'));
          }
          // Update the request header with new token
          config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshed = await refreshAuthToken();
          if (refreshed) {
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
            return api(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [state.tokenExpiry]);

  // Load user from token
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const user = localStorage.getItem('user');
    
    // Check for regular token authentication
    if (token && typeof token === 'string' && token.trim().length > 0) {
      // Check if token is expired
      if (tokenExpiry && isTokenExpired(tokenExpiry)) {
        const refreshed = await refreshAuthToken();
        if (!refreshed) {
          dispatch({ type: SET_LOADING, payload: false }); // ✅ add this
          return;
        }
      }
      
      setAuthToken(token);
      try {
        const res = await api.get('/api/users/profile'); // ✅ FIXED: Added /api prefix
        dispatch({
          type: AUTH_SUCCESS,
          payload: {
            user: res.data.user,
            token,
            refreshToken: localStorage.getItem('refreshToken'),
            tokenExpiry: localStorage.getItem('tokenExpiry')
          }
        });
      } catch (error) {
        setAuthToken(null);
        dispatch({
          type: AUTH_FAIL,
          payload: error.response?.data?.message || 'Failed to load user'
        });
        dispatch({ type: SET_LOADING, payload: false }); // ✅ MUST have this
      }
    } 
    // Check for OTP authentication
    else if (isAuthenticated === 'true' && user) {
      try {
        const userData = JSON.parse(user);
        dispatch({
          type: AUTH_SUCCESS,
          payload: {
            user: userData,
            token: 'otp-token-' + Date.now(),
            refreshToken: 'otp-refresh-' + Date.now(),
            tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        });
      } catch (error) {
        dispatch({
          type: AUTH_FAIL,
          payload: 'Failed to load user session'
        });
        dispatch({ type: SET_LOADING, payload: false }); // ✅ add this
      }
    }
    else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Auto logout when token expires
  useEffect(() => {
    if (state.tokenExpiry && state.isAuthenticated) {
      const timeUntilExpiry = new Date(state.tokenExpiry) - new Date();
      
      if (timeUntilExpiry > 0) {
        const timeout = setTimeout(() => {
          logout();
        }, timeUntilExpiry);
        
        return () => clearTimeout(timeout);
      } else {
        logout();
      }
    }
  }, [state.tokenExpiry, state.isAuthenticated]);

  // Register user
  const register = async (formData) => {
    try {
      const res = await api.post('/users/register', formData); // ✅ FIXED: Use API_BASE
      
      const { token, refreshToken, tokenExpiry, user } = res.data;
      
      // Store tokens
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiry', tokenExpiry);
      setAuthToken(token);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user,
          token,
          refreshToken,
          tokenExpiry
        }
      });

      return { success: true, user, token };
    } catch (error) {
      dispatch({
        type: AUTH_FAIL,
        payload: error.response?.data?.message || 'Registration failed'
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      console.log("MAKING API CALL TO: /users/login");
      const res = await api.post('/users/login', formData); // ✅ FIXED: Use API_BASE
      
      console.log("FULL RESPONSE:", res.data); // ✅ Add this to see exact structure

      // ✅ Handle both response shapes
      const token = res.data.token || res.data.data?.token;
      const user = res.data.user || res.data.data?.user;

      if (!token || !user) {
        return { success: false, error: 'Invalid response from server' };
      }

      // ✅ STORE DATA
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // ✅ SET AUTH HEADER
      setAuthToken(token);

      // ✅ UPDATE STATE (IMPORTANT)
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user,
          token,
          refreshToken: null,
          tokenExpiry: null
        }
      });

      return { success: true, user };

    } catch (error) {
      console.error("❌ LOGIN ERROR:", error.response?.data || error.message);

      dispatch({
        type: AUTH_FAIL,
        payload: error.response?.data?.message || 'Login failed'
      });

      return {
        success: false,
        error: error.response?.data?.message || 'Unable to login'
      };
    }
  };

// Logout user
  const logout = () => {
    // Clear all tokens and authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('blacklocust_cart');
    // Clear session cart data
    sessionStorage.removeItem('sessionCart');
    localStorage.removeItem('currentOTP');
    localStorage.removeItem('otpValue');
    localStorage.removeItem('otpMethod');
    setAuthToken(null);
    dispatch({ type: LOGOUT });
    
    // FORCE REDIRECT TO LOGIN
    // ✅ FORCE REDIRECT TO LOGIN
    window.location.href = '/login';
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CLEAR_ERROR });
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  // Get time until token expires
  const getTimeUntilExpiry = () => {
    if (!state.tokenExpiry) return null;
    const timeUntilExpiry = new Date(state.tokenExpiry) - new Date();
    return timeUntilExpiry > 0 ? timeUntilExpiry : null;
  };

  // Send OTP
  const sendOTP = async (method, value) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate demo OTP (remove in production)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Demo OTP for ${method}: ${value} is ${otp}`);
      
      // Store OTP for demo (in production, this would be server-side)
      localStorage.setItem('currentOTP', otp);
      localStorage.setItem('otpValue', value);
      localStorage.setItem('otpMethod', method);
      
      dispatch({ type: SET_LOADING, payload: false });
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      dispatch({ type: SET_LOADING, payload: false });
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  // Verify OTP
  const verifyOTP = async (otp) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedOTP = localStorage.getItem('currentOTP');
      const otpValue = localStorage.getItem('otpValue');
      const otpMethod = localStorage.getItem('otpMethod');
      
      if (otp === storedOTP) {
        // Create user session
        const user = {
          id: Date.now().toString(),
          name: otpMethod === 'email' ? otpValue.split('@')[0] : `User ${otpValue.slice(-4)}`,
          email: otpMethod === 'email' ? otpValue : '',
          mobile: otpMethod === 'mobile' ? otpValue : '',
          loginMethod: otpMethod,
          loginTime: new Date().toISOString()
        };
        
        // Clean up OTP data
        localStorage.removeItem('currentOTP');
        localStorage.removeItem('otpValue');
        localStorage.removeItem('otpMethod');
        
        // Store user session
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        
        dispatch({
          type: AUTH_SUCCESS,
          payload: {
            user,
            token: 'otp-token-' + Date.now(),
            refreshToken: 'otp-refresh-' + Date.now(),
            tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          }
        });
        
        dispatch({ type: SET_LOADING, payload: false });
        return { success: true, user };
      } else {
        dispatch({ type: SET_LOADING, payload: false });
        return { success: false, message: 'Invalid OTP' };
      }
    } catch (error) {
      dispatch({ type: SET_LOADING, payload: false });
      return { success: false, message: 'OTP verification failed' };
    }
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    loadUser,
    clearError,
    isAdmin,
    refreshAuthToken,
    getTimeUntilExpiry,
    sendOTP,
    verifyOTP
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
