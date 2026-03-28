import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import logo from '../../assets/images/new-logo.png';
import HamburgerMenu from './HamburgerMenu';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const accountInitial = (user?.name || user?.email || '')
    .trim()
    .charAt(0)
    .toUpperCase();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleNavbar = () => {
    console.log("🔥 toggleNavbar called");
    setNavbarOpen(prev => {
      console.log("🔥 Previous state:", prev);
      console.log("🔥 New state:", !prev);
      return !prev;
    });
  };

  const toggleHamburger = () => {
    setHamburgerOpen(!hamburgerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close side menu
      if (!event.target.closest('.side-nav') && !event.target.closest('.hamburger-menu')) {
        if (menuOpen) {
          setMenuOpen(false);
        }
      }
      // Close dropdown navbar
      if (!event.target.closest('.dropdown-navbar') && !event.target.closest('.navbar-toggle')) {
        if (navbarOpen) {
          setNavbarOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen, navbarOpen]);

  useEffect(() => {
    fetchNavigationData();
  }, []);

  const fetchNavigationData = async () => {
    try {
      console.log("🔥 Fetching collections from: /collections?showInNavbar=true&isActive=true&sortBy=order&sortOrder=asc");
      
      // Fetch collections from API (using your actual blacklocust database)
      const collectionsResponse = await api.get('/collections?showInNavbar=true&isActive=true&sortBy=order&sortOrder=asc');
      console.log("🔥 Collections response:", collectionsResponse.data);
      
      let navbarCollections = collectionsResponse.data.collections || [];
      console.log("🔥 Navbar collections found:", navbarCollections.length);
      
      // Use your actual collections from database
      setCollections(navbarCollections);
      
      // Fetch categories from API (if you have categories endpoint)
      try {
        console.log("🔥 Fetching categories from: /categories/navbar");
        const categoriesResponse = await api.get('/categories/navbar');
        const navbarCategories = categoriesResponse.data.categories || [];
        console.log("🔥 Categories found:", navbarCategories.length);
        setCategories(navbarCategories);
      } catch (catError) {
        console.log('Categories endpoint not available, using empty array');
        setCategories([]);
      }
      
      console.log('🔥 Final Navigation Data:', {
        categories: categories.length,
        collections: navbarCollections.length
      });
    } catch (error) {
      console.error('🔥 Failed to fetch navigation data:', error);
      
      // Add your actual collections as fallback
      console.log("🔥 API failed, adding actual collections as fallback");
      const actualCollections = [
        { name: 'Checked Collection', slug: 'checked-collection', _id: 'fallback-1', order: 1 },
        { name: 'Office Collection', slug: 'office-collection', _id: 'fallback-2', order: 2 },
        { name: 'Party Wear Collection', slug: 'party-wear-collection', _id: 'fallback-3', order: 3 },
        { name: 'Casual Collection', slug: 'casual-collection', _id: 'fallback-4', order: 4 },
        { name: 'New Collection', slug: 'new-collection', _id: 'fallback-5', order: 5 },
        { name: 'Winter Collection', slug: 'winter-collection', _id: 'fallback-6', order: 6 },
        { name: 'Polos', slug: 'polos', _id: 'fallback-7', order: 7 },
        { name: 'Trousers', slug: 'trousers', _id: 'fallback-8', order: 8 },
        { name: 'Denim', slug: 'denim', _id: 'fallback-9', order: 9 },
        { name: 'Formal Pants', slug: 'formal-pants', _id: 'fallback-10', order: 10 },
        { name: 'Summer Collection', slug: 'summer-collection', _id: 'fallback-11', order: 11 },
        { name: 'Printed Collection', slug: 'printed-collection', _id: 'fallback-12', order: 12 },
        { name: 'Cargo Collection', slug: 'cargo-collection', _id: 'fallback-13', order: 13 }
      ];
      setCollections(actualCollections);
      setCategories([]);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <nav className="nav-container">
          {/* Left - Hamburger Menu */}
          <div className="nav-left">
            <button className="hamburger-menu" onClick={toggleHamburger}>
              <FaBars className="text-xl" />
            </button>
          </div>

          {/* Center - Logo */}
          <div className="nav-center">
            <Link to="/" className="logo">
              <img src={logo} alt="Black Locust Logo" />
            </Link>
          </div>

          {/* Right - Navigation Icons */}
          <div className="nav-right">
            <div className="nav-icons">
              <button aria-label="Search" onClick={() => navigate('/search')}>🔍</button>
              <button 
                aria-label="Account" 
                onClick={() => isAuthenticated ? navigate('/profile') : navigate('/login')}
              >
                {isAuthenticated ? (
                  <span className="account-initial">{accountInitial}</span>
                ) : (
                  <span>👤</span>
                )}
              </button>
              <button 
                aria-label="Cart" 
                onClick={() => navigate('/cart')}
              >
                🛒
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Side Navigation */}
      <nav className={`side-nav ${menuOpen ? 'active' : ''}`} id="sideNav">
        <div className="side-nav-content">
          <div className="side-nav-header">
            <button className="close-menu" onClick={toggleMenu}>
              <FaTimes />
            </button>
          </div>

          {/* Mobile Collections */}
          <div className="nav-section">
            <h3 className="nav-section-title">Collections</h3>
            <div className="nav-items">
              {collections.map((collection, index) => {
                const collectionName = collection.name.toLowerCase();
                const shouldRedirectToProducts = 
                  collectionName.includes('kids') || 
                  collectionName.includes('kids collection') ||
                  collectionName.includes('mens') || 
                  collectionName.includes('men') ||
                  collectionName.includes('mens collection') ||
                  collectionName.includes('men collection');
                
                return (
                  <Link 
                    key={collection._id || index}
                    to={shouldRedirectToProducts ? '/products' : `/collection/${collection.slug}`} 
                    className="nav-item" 
                    onClick={toggleMenu}
                  >
                    {collection.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Account Actions */}
          {isAuthenticated && (
            <div className="nav-section">
              <h3 className="nav-section-title">Account</h3>
              <div className="nav-items">
                {/* Admin Dashboard Link - Only for admin users */}
                {isAuthenticated && user?.role === 'admin' && (
                  <Link to="/admin" className="nav-item" onClick={toggleMenu}>
                    🛠️ Admin Dashboard
                  </Link>
                )}
                <Link to="/profile" className="nav-item" onClick={toggleMenu}>
                  My Profile
                </Link>
                <Link to="/orders" className="nav-item" onClick={toggleMenu}>
                  My Orders
                </Link>
                <Link to="/wishlist" className="nav-item" onClick={toggleMenu}>
                  Wishlist
                </Link>
                <button className="nav-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Auth Links */}
          {!isAuthenticated && (
            <div className="nav-section">
              <h3 className="nav-section-title">Account</h3>
              <div className="nav-items">
                <Link to="/login" className="nav-item" onClick={toggleMenu}>
                  Login
                </Link>
                <Link to="/register" className="nav-item" onClick={toggleMenu}>
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hamburger Menu Component */}
      <HamburgerMenu isOpen={hamburgerOpen} onClose={() => setHamburgerOpen(false)} />
    </>
  );
};

export default Header;
