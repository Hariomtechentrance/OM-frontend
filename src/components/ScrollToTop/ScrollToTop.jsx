import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    // Only scroll to top when pathname actually changes
    if (pathname !== previousPathRef.current) {
      const scrollToTop = () => {
        // Comprehensive scroll reset for all devices
        try {
          // Modern browsers with smooth scrolling
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        } catch (error) {
          // Fallback for older browsers
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
        
        // Additional mobile-specific scroll reset
        if (window.scrollY > 0) {
          window.scrollTo(0, 0);
        }
        if (document.documentElement.scrollTop > 0) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body.scrollTop > 0) {
          document.body.scrollTop = 0;
        }
        
        // Check if this is a mobile device and apply additional fixes
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          // Mobile-specific scroll reset
          document.body.scrollIntoView({ behavior: 'instant', block: 'start' });
          document.documentElement.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      };

      // Immediate scroll reset
      scrollToTop();
      
      // Additional scroll reset after a short delay for mobile
      setTimeout(scrollToTop, 50);
      
      // Another scroll reset after content loads
      setTimeout(scrollToTop, 200);
      
      // Update previous path
      previousPathRef.current = pathname;
    }
  }, [pathname]);

  // Handle browser back/forward navigation - Fix for mobile scroll restoration
  useEffect(() => {
    const handlePopState = (event) => {
      // Force scroll to top on browser back/forward navigation
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Mobile-specific scroll reset
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          document.body.scrollIntoView({ behavior: 'instant', block: 'start' });
          document.documentElement.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null;
};

export default ScrollToTop;
