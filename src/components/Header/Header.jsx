import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaRegHeart, FaSearch, FaShoppingBag, FaTimes, FaUser } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/new-logo.png';
import HamburgerMenu from './HamburgerMenu';
import api from '../../api/axios';

const TOP_SEARCHES = [
  'Jeans',
  'Shirts',
  'Polo',
  'T-Shirt',
  'Formal Wear',
  'Jackets',
  'Sweaters',
  'Overshirts'
];

const Header = () => {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const { totalItems } = useCart();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const accountInitial =
    user?.name && String(user.name).trim()
      ? String(user.name).trim().charAt(0).toUpperCase()
      : '';

  const toggleHamburger = () => {
    setHamburgerOpen(!hamburgerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchLoading(false);
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    if (!searchOpen) return;
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get('/products', { params: { search: q } });
        const list = res.data?.products || [];
        setSearchResults(Array.isArray(list) ? list.slice(0, 8) : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [searchQuery, searchOpen]);

  const goToProduct = (id) => {
    closeSearch();
    navigate(`/product/${id}`);
  };

  const goToSearchResults = (term) => {
    const t = (term ?? searchQuery).trim();
    closeSearch();
    if (t) navigate(`/products?search=${encodeURIComponent(t)}`);
    else navigate('/products');
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 relative z-[60]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <button
              type="button"
              onClick={toggleHamburger}
              className="md:hidden p-2 text-gray-600 hover:text-black"
              aria-label="Open menu"
            >
              <FaBars />
            </button>

            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Black Locust" className="h-10 w-auto" />
              </Link>
            </div>

            <nav className="hidden md:flex space-x-6">
              <Link
                to="/category/men"
                className="text-sm font-medium text-gray-700 hover:text-black uppercase tracking-wide"
              >
                MEN
              </Link>
              <Link
                to="/category/kids"
                className="text-sm font-medium text-gray-700 hover:text-black uppercase tracking-wide"
              >
                KIDS
              </Link>
              <Link
                to="/products"
                className="text-sm font-medium text-gray-700 hover:text-black uppercase tracking-wide"
              >
                SALE
              </Link>
              <Link
                to="/collections"
                className="text-sm font-medium text-gray-700 hover:text-black uppercase tracking-wide"
              >
                SHOP COLLECTION
              </Link>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                type="button"
                onClick={() => (searchOpen ? closeSearch() : openSearch())}
                className="p-2 text-gray-600 hover:text-black"
                aria-label={searchOpen ? 'Close search' : 'Search'}
              >
                {searchOpen ? <FaTimes className="w-5 h-5" /> : <FaSearch className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                className="p-2 text-gray-600 hover:text-black"
                aria-label={isAuthenticated ? 'Account' : 'Sign in'}
              >
                {isAuthenticated && accountInitial ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-800">
                    {accountInitial}
                  </span>
                ) : (
                  <FaUser className="w-5 h-5" />
                )}
              </button>

              <button
                type="button"
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

              <button
                type="button"
                onClick={() => navigate('/wishlist')}
                className="p-2 text-gray-600 hover:text-black"
                aria-label="Wishlist"
              >
                <FaRegHeart className="w-5 h-5" />
              </button>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-black border border-gray-300 rounded-md hover:border-black"
                >
                  LOGOUT
                </button>
              )}
            </div>
          </div>
        </div>

        {searchOpen && (
          <>
            <div
              className="fixed inset-0 z-[70] bg-black/40 md:bg-black/25"
              aria-hidden
              onClick={closeSearch}
            />
            <div className="absolute left-0 right-0 top-full z-[80] border-b border-gray-200 bg-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 focus-within:border-black">
                  <FaSearch className="text-gray-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') goToSearchResults();
                    }}
                    placeholder="Search for products..."
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => goToSearchResults()}
                    className="shrink-0 rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-800"
                  >
                    Search
                  </button>
                </div>

                <div className="mt-6 grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Top searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {TOP_SEARCHES.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSearchQuery(tag);
                            goToSearchResults(tag);
                          }}
                          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:border-black"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Results
                    </h3>
                    {searchLoading && (
                      <p className="text-sm text-gray-500">Searching…</p>
                    )}
                    {!searchLoading && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                      <p className="text-sm text-gray-500">No matches. Try another term.</p>
                    )}
                    {!searchLoading && searchQuery.trim().length < 2 && (
                      <p className="text-sm text-gray-500">Type at least 2 characters to search.</p>
                    )}
                    <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                      {searchResults.map((p) => (
                        <li key={p._id}>
                          <button
                            type="button"
                            onClick={() => goToProduct(p._id)}
                            className="flex w-full items-center gap-3 rounded-md border border-transparent px-2 py-2 text-left hover:border-gray-200 hover:bg-gray-50"
                          >
                            <span className="line-clamp-2 text-sm font-medium text-gray-900">
                              {p.name}
                            </span>
                            <span className="ml-auto shrink-0 text-sm text-gray-600">₹{p.price}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      <HamburgerMenu isOpen={hamburgerOpen} onClose={() => setHamburgerOpen(false)} />
    </>
  );
};

export default Header;
