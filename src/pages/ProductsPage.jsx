import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductCard from '../components/Products/ProductCard';
import AuthModal from '../components/AuthModal/AuthModal';
import GlobalProductFilters from '../components/GlobalProductFilters/GlobalProductFilters';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { filtersToSearchParams, defaultProductFilterState } from '../utils/productFilters';
import './ProductsPage.css';

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [listFilters, setListFilters] = useState({ ...defaultProductFilterState });

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const col = searchParams.get('collection') || '';
    setListFilters((prev) => ({
      ...prev,
      category: cat,
      collection: col,
    }));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = filtersToSearchParams(listFilters);
        const response = await api.get(`/products?${params.toString()}`);
        if (cancelled) return;
        if (response.data?.success) {
          setProducts(response.data.products || []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching products:', err);
          setError('Failed to fetch products');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [listFilters]);

  const getPageTitle = () => {
    const collection = searchParams.get('collection');
    const category = searchParams.get('category');

    if (collection) {
      return collection
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    if (category) {
      return category
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return 'All Products';
  };

  const handleAddToCart = (product) => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    addToCart(product, 1, undefined, undefined);
  };

  const handleQuickView = (product) => {
    navigate(`/product/${product.id || product._id}`);
  };

  const handleAddToWishlist = (product) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find((item) => item.id === (product.id || product._id));

    if (!exists) {
      wishlist.push({
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        category: product.category,
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      toast.success(`${product.name} added to wishlist!`);
    } else {
      const updatedWishlist = wishlist.filter((item) => item.id !== (product.id || product._id));
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      toast.success(`${product.name} removed from wishlist!`);
    }
  };

  const handleCompare = (product) => {
    const compare = JSON.parse(localStorage.getItem('compare') || '[]');
    if (compare.length < 4) {
      const exists = compare.find((item) => item.id === (product.id || product._id));
      if (!exists) {
        compare.push({
          id: product.id || product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          category: product.category,
        });
        localStorage.setItem('compare', JSON.stringify(compare));
        toast.success(`${product.name} added to compare!`);
      } else {
        toast.info('Product already in compare list!');
      }
    } else {
      toast.error('You can compare up to 4 products at a time!');
    }
  };

  const initialFilterSync = {
    category: searchParams.get('category') || '',
    collection: searchParams.get('collection') || '',
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>{getPageTitle()}</h1>
          <p>
            {searchParams.get('collection') || searchParams.get('category')
              ? `Browse our ${getPageTitle().toLowerCase()} collection of premium fashion items`
              : 'Browse our complete collection of premium fashion items'}
          </p>
        </div>

        <GlobalProductFilters
          key={`${initialFilterSync.category}-${initialFilterSync.collection}`}
          initialFilters={initialFilterSync}
          onApply={setListFilters}
        />

        <div className="products-grid">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>Error Loading Products</h3>
              <p>{error}</p>
              <button type="button" onClick={() => setListFilters((f) => ({ ...f }))} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : (
            <>
              {products.length > 0 ? (
                products.map((item) => (
                  <ProductCard
                    key={item._id || item.id}
                    product={item}
                    onAddToCart={handleAddToCart}
                    onQuickView={handleQuickView}
                    onAddToWishlist={handleAddToWishlist}
                    onCompare={handleCompare}
                  />
                ))
              ) : (
                <div className="no-products">
                  <h3>No products found</h3>
                  <p>Try adjusting your filters to see more products.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onLogin={() => navigate('/login')}
          onRegister={() => navigate('/register')}
        />
      )}
    </div>
  );
}

export default ProductsPage;
