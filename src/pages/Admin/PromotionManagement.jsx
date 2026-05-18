import React, { useState } from 'react';
import PromoBannerManagement from './PromoBannerManagement';
import './PromotionManagement.css';

const PromotionManagement = () => {
  const [activeTab, setActiveTab] = useState('banner'); // 'banner' or 'codes'

  return (
    <div className="promotion-management">
      <div className="page-header">
        <h2>Promotions</h2>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'banner' ? 'active' : ''}`}
          onClick={() => setActiveTab('banner')}
        >
          <i className="fas fa-bullhorn"></i>
          Promo Banner
        </button>
        <button
          className={`tab ${activeTab === 'codes' ? 'active' : ''}`}
          onClick={() => setActiveTab('codes')}
        >
          <i className="fas fa-percentage"></i>
          Discount Codes
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'banner' && <PromoBannerManagement />}
        {activeTab === 'codes' && (
          <div className="coming-soon">
            <i className="fas fa-percentage"></i>
            <h3>Discount Codes</h3>
            <p>Discount code management coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionManagement;