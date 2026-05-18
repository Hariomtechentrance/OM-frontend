import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './PromoBanner.css';

const PromoBanner = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await api.get('/promo-banner');
      if (response.data.success && response.data.banner) {
        setBanner(response.data.banner);
      }
    } catch (error) {
      console.error('Error fetching promo banner:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !banner || !banner.isActive) {
    return null;
  }

  const bannerContent = (
    <div 
      className="promo-banner"
      style={{
        backgroundColor: banner.backgroundColor,
        color: banner.textColor
      }}
    >
      <div className="promo-banner-track">
        <div 
          className="promo-banner-content"
          style={{
            animationDuration: `${banner.animationSpeed}s`
          }}
        >
          {/* First set of text */}
          {Array(10).fill(null).map((_, index) => (
            <span key={`text-${index}`} className="promo-text">{banner.text}</span>
          ))}
        </div>
        <div 
          className="promo-banner-content"
          style={{
            animationDuration: `${banner.animationSpeed}s`
          }}
          aria-hidden="true"
        >
          {/* Duplicate set for seamless loop */}
          {Array(10).fill(null).map((_, index) => (
            <span key={`text-duplicate-${index}`} className="promo-text">{banner.text}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // If there's a link, wrap in Link component
  if (banner.link && banner.link.trim()) {
    const isExternal = banner.link.startsWith('http');
    
    if (isExternal) {
      return (
        <a 
          href={banner.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="promo-banner-link"
        >
          {bannerContent}
        </a>
      );
    } else {
      return (
        <Link to={banner.link} className="promo-banner-link">
          {bannerContent}
        </Link>
      );
    }
  }

  return bannerContent;
};

export default PromoBanner;
