import api from '../api/axios';

// Generate or get session ID
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Track user activity
export const trackActivity = async (type, data = {}) => {
  try {
    const sessionId = getSessionId();
    
    await api.post('/analytics/track', {
      sessionId,
      type,
      page: window.location.pathname,
      ...data
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Analytics tracking failed:', error);
  }
};

// Track page view
export const trackPageView = (page) => {
  trackActivity('page_view', { page });
};

// Track search
export const trackSearch = (searchQuery) => {
  trackActivity('search', { searchQuery });
};

// Track product view
export const trackProductView = (productId) => {
  trackActivity('product_view', { productId });
};

// Track add to cart
export const trackAddToCart = (productId) => {
  trackActivity('add_to_cart', { productId });
};

// Track checkout
export const trackCheckout = () => {
  trackActivity('checkout');
};

// Track purchase
export const trackPurchase = (orderId, amount) => {
  trackActivity('purchase', { metadata: { orderId, amount } });
};

// Track login
export const trackLogin = () => {
  trackActivity('login');
};

// Track logout
export const trackLogout = () => {
  trackActivity('logout');
};

// Track signup
export const trackSignup = () => {
  trackActivity('signup');
};
