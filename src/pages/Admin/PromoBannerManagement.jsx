import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './PromoBannerManagement.css';

const PromoBannerManagement = () => {
  const [banner, setBanner] = useState({
    text: '',
    isActive: false,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    link: '',
    animationSpeed: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      console.error('Error fetching banner:', error);
      toast.error('Failed to load promo banner');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBanner(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!banner.text.trim()) {
      toast.error('Banner text is required');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/promo-banner', banner);
      if (response.data.success) {
        setBanner(response.data.banner);
        toast.success('Promo banner updated successfully');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error(error.response?.data?.message || 'Failed to save promo banner');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    try {
      const response = await api.put('/promo-banner/toggle');
      if (response.data.success) {
        setBanner(response.data.banner);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('Failed to toggle promo banner');
    }
  };

  if (loading) {
    return (
      <div className="promo-banner-management">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="promo-banner-management">
      <div className="page-header">
        <h2>Promo Banner Management</h2>
        <div className="header-actions">
          <button
            type="button"
            className={`btn ${banner.isActive ? 'btn-warning' : 'btn-success'}`}
            onClick={handleToggle}
          >
            <i className={`fas fa-${banner.isActive ? 'eye-slash' : 'eye'}`}></i>
            {banner.isActive ? 'Disable Banner' : 'Enable Banner'}
          </button>
        </div>
      </div>

      <div className="banner-status">
        <div className={`status-indicator ${banner.isActive ? 'active' : 'inactive'}`}>
          <i className={`fas fa-circle`}></i>
          <span>{banner.isActive ? 'Banner is Active' : 'Banner is Disabled'}</span>
        </div>
      </div>

      {/* Live Preview */}
      <div className="banner-preview-section">
        <h3>Live Preview</h3>
        <div className="preview-container">
          <div 
            className="preview-banner"
            style={{
              backgroundColor: banner.backgroundColor,
              color: banner.textColor
            }}
          >
            <div 
              className="preview-content"
              style={{
                animationDuration: `${banner.animationSpeed}s`
              }}
            >
              <span className="preview-text">{banner.text || 'Your banner text will appear here...'}</span>
              <span className="preview-text">{banner.text || 'Your banner text will appear here...'}</span>
              <span className="preview-text">{banner.text || 'Your banner text will appear here...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Settings Form */}
      <form onSubmit={handleSave} className="banner-form">
        <div className="form-section">
          <h3>Banner Content</h3>
          
          <div className="form-group">
            <label htmlFor="text">
              Banner Text <span className="required">*</span>
            </label>
            <input
              type="text"
              id="text"
              name="text"
              value={banner.text}
              onChange={handleInputChange}
              placeholder="e.g., Grab a discount up to 30% off! Limited time offer!"
              maxLength={200}
              required
            />
            <small className="form-hint">
              {banner.text.length}/200 characters
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="link">
              Link (Optional)
            </label>
            <input
              type="text"
              id="link"
              name="link"
              value={banner.link}
              onChange={handleInputChange}
              placeholder="e.g., /products or https://example.com"
            />
            <small className="form-hint">
              Leave empty for no link. Use relative path (/products) or full URL (https://...)
            </small>
          </div>
        </div>

        <div className="form-section">
          <h3>Appearance</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="backgroundColor">
                Background Color
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="backgroundColor"
                  name="backgroundColor"
                  value={banner.backgroundColor}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  value={banner.backgroundColor}
                  onChange={(e) => setBanner(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  placeholder="#000000"
                  className="color-text-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="textColor">
                Text Color
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="textColor"
                  name="textColor"
                  value={banner.textColor}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  value={banner.textColor}
                  onChange={(e) => setBanner(prev => ({ ...prev, textColor: e.target.value }))}
                  placeholder="#ffffff"
                  className="color-text-input"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="animationSpeed">
              Animation Speed: {banner.animationSpeed}s
            </label>
            <input
              type="range"
              id="animationSpeed"
              name="animationSpeed"
              min="10"
              max="60"
              step="5"
              value={banner.animationSpeed}
              onChange={handleInputChange}
            />
            <small className="form-hint">
              Lower = Faster, Higher = Slower (10-60 seconds)
            </small>
          </div>
        </div>

        <div className="form-section">
          <h3>Quick Presets</h3>
          <div className="preset-buttons">
            <button
              type="button"
              className="preset-btn"
              onClick={() => setBanner(prev => ({
                ...prev,
                backgroundColor: '#000000',
                textColor: '#ffffff'
              }))}
            >
              Black & White
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => setBanner(prev => ({
                ...prev,
                backgroundColor: '#dc2626',
                textColor: '#ffffff'
              }))}
            >
              Red Alert
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => setBanner(prev => ({
                ...prev,
                backgroundColor: '#16a34a',
                textColor: '#ffffff'
              }))}
            >
              Green Success
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => setBanner(prev => ({
                ...prev,
                backgroundColor: '#f59e0b',
                textColor: '#000000'
              }))}
            >
              Orange Warning
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => setBanner(prev => ({
                ...prev,
                backgroundColor: '#3b82f6',
                textColor: '#ffffff'
              }))}
            >
              Blue Info
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromoBannerManagement;
