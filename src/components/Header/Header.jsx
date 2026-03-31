import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaHeart, FaRegHeart, FaSearch, FaShoppingBag, FaUser } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/new-logo.png';
import HamburgerMenu from './HamburgerMenu';

const Header = () => {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const accountInitial = useMemo(() => {
    return (user?.name || user?.email || '').trim().charAt(0).toUpperCase();
  }, [user]);

  const toggleHamburger = () => {
    setHamburgerOpen(!hamburgerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* PETER ENGLAND STYLE HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Bar */}
          <div className="flex justify-between items-center py-2 text-xs text-gray-600 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <span>FREE SHIPPING</span>
              <span className="border-l border-gray-300 pl-4">RETURN WITHIN 15 DAYS</span>
              <span className="border-l border-gray-300 pl-4">EXPRESS DELIVERY IN STORE MODE</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>NEED HELP?</span>
              <button onClick={() => navigate('/track-order')} className="hover:text-black">Track Order</button>
              <button onClick={() => navigate('/profile')} className="hover:text-black">My Account</button>
              <button onClick={() => navigate('/store-locator')} className="hover:text-black">Find a Store</button>
            </div>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between py-4">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={toggleHamburger}
              className="md:hidden p-2 text-gray-600 hover:text-black"
              aria-label="Open menu"
            >
              <FaBars />
            </button>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="Blacklocust" className="h-8 w-auto" />
                <span className="text-2xl font-bold text-black">
                  BLACK LOCUST
                </span>
              </Link>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex space-x-6">
              <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-black uppercase tracking-wide">
                MEN
              </Link>
              <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-black uppercase tracking-wide">
                KIDS
              </Link>
              <Link to="/new-arrivals" className="text-sm font-medium text-gray-700 hover:text-black uppercase tracking-wide">
                NEW IN
              </Link>
              <Link to="/products" className="text-sm font-medium text-red-600 hover:text-red-700 uppercase tracking-wide">
                SALE
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/search')}
                className="p-2 text-gray-600 hover:text-black"
                aria-label="Search"
              >
                <FaSearch className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => navigate('/wishlist')}
                className="p-2 text-gray-600 hover:text-black"
                aria-label="Wishlist"
              >
                <FaRegHeart className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => navigate('/cart')}
                className="relative p-2 text-gray-600 hover:text-black"
                aria-label="Cart"
              >
                <FaShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Account */}
              <button
                onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                className="p-2 text-gray-600 hover:text-black"
                aria-label="Account"
              >
                {isAuthenticated ? (
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-700">
                    {accountInitial}
                  </span>
                ) : (
                  <FaUser className="w-5 h-5" />
                )}
              </button>

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-black border border-gray-300 rounded-md hover:border-black"
                >
                  LOGOUT
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out collections menu (mobile + desktop) */}
      <HamburgerMenu isOpen={hamburgerOpen} onClose={() => setHamburgerOpen(false)} />
    </>
  );
};

export default Header;
