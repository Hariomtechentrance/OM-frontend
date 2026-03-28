import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/Products/ProductCard';
import ProductFilter from '../components/Products/ProductFilter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import '../components/Products/Products.css';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (searchTerm) {
      performSearch(searchTerm);
    }
  }, [searchTerm]);

  const performSearch = async (term) => {
    setLoading(true);
    setError(null);
    
    try {
      // Connect to backend API
      const response = await api.get(`/products?search=${encodeURIComponent(term)}&limit=50`);
      
      if (response.data && response.data.success) {
        setSearchResults(response.data.products || []);
      } else {
        setError(response.data?.message || 'Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Unable to connect to search service. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Update URL
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`, { replace: true });
    } else {
      navigate('/search', { replace: true });
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      quantity: 1
    });
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Results</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      <div className="search-content">
        {loading ? (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : error ? (
          <div className="search-error">
            <h3>Search Error</h3>
            <p>{error}</p>
            <button onClick={() => performSearch(searchTerm)} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : (
          <>
            {searchTerm && (
              <div className="search-info">
                <p>Found {searchResults.length} results for "{searchTerm}"</p>
              </div>
            )}
            
            {searchResults.length > 0 ? (
              <div className="products-grid">
                {searchResults.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : searchTerm ? (
              <div className="no-results">
                <h3>No results found</h3>
                <p>Try searching with different keywords</p>
              </div>
            ) : (
              <div className="search-prompt">
                <h3>Start searching</h3>
                <p>Enter a product name, category, or brand to find what you're looking for</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="auth-modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowAuth(false)}>×</button>
            <p>Please login to add items to cart</p>
            <div className="auth-buttons">
              <button onClick={() => navigate('/login')}>Login</button>
              <button onClick={() => navigate('/register')}>Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
