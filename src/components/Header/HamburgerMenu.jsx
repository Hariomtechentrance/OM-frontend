import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const HamburgerMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="hamburger-backdrop" onClick={onClose} />
      
      {/* Slide-out Menu */}
      <div className={`hamburger-menu-slide ${isOpen ? 'open' : ''}`}>
        <div className="hamburger-menu-header">
          <h3>Menu</h3>
          <button className="hamburger-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="hamburger-menu-content">
          <div className="hamburger-nav-links">
            <Link
              to="/products"
              className="hamburger-nav-link"
              onClick={onClose}
            >
              Men
            </Link>
            <Link
              to="/products"
              className="hamburger-nav-link"
              onClick={onClose}
            >
              Kids
            </Link>
            <Link to="/products" className="hamburger-nav-link" onClick={onClose}>
              Sale
            </Link>
          </div>
        </div>
        
        <div className="hamburger-menu-footer">
          <div className="hamburger-auth-actions">
            {isAuthenticated ? (
              <button
                type="button"
                className="hamburger-auth-btn hamburger-auth-btn--outline"
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hamburger-auth-btn hamburger-auth-btn--primary"
                  onClick={onClose}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hamburger-auth-btn hamburger-auth-btn--outline"
                  onClick={onClose}
                >
                  Registration
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
