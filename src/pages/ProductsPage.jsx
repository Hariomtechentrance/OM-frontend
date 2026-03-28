import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductCard from '../components/Products/ProductCard';
import AuthModal from '../components/AuthModal/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import './ProductsPage.css';

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, [searchParams]); // Re-fetch when URL params change

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get collection and category from URL parameters
      const collection = searchParams.get('collection');
      const category = searchParams.get('category');
      
      // Build API query parameters
      let queryParams = [];
      if (category) queryParams.push(`category=${category}`);
      if (collection) queryParams.push(`collection=${collection}`);
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      const response = await api.get(`/products${queryString}`);
      
      if (response.data && response.data.success) {
        setProducts(response.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    const collection = searchParams.get('collection');
    const category = searchParams.get('category');
    
    if (collection) {
      // Convert slug to readable name
      return collection.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    } else if (category) {
      // Convert slug to readable name
      return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    
    return 'All Products';
  };

  const handleAddToCart = (product) => {
    console.log('Add to cart clicked', product);
    console.log('Auth loading:', authLoading);
    console.log('Is authenticated:', isAuthenticated);
    
    if (authLoading) {
      console.log('Auth loading, returning');
      return;
    }
    if (!isAuthenticated) {
      console.log('Not authenticated, showing auth modal');
      setShowAuth(true);
      return;
    }

    console.log('Proceeding to add to cart');
    // Ensure product has productId for CartContext
    const productForCart = {
      ...product,
      productId: product._id || product.id,
      quantity: 1
    };

    console.log('Product for cart:', productForCart);
    addToCart(productForCart);
  };

  const handleQuickView = (product) => {
    // Navigate to product detail page
    navigate(`/product/${product.id || product._id}`);
  };

  const handleAddToWishlist = (product) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    // Add to wishlist functionality - save to localStorage or state
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find(item => item.id === (product.id || product._id));
    
    if (!exists) {
      wishlist.push({
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        category: product.category,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      toast.success(`${product.name} added to wishlist!`);
    } else {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item.id !== (product.id || product._id));
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      toast.success(`${product.name} removed from wishlist!`);
    }
  };

  const handleCompare = (product) => {
    // Add to compare functionality
    const compare = JSON.parse(localStorage.getItem('compare') || '[]');
    if (compare.length < 4) {
      const exists = compare.find(item => item.id === (product.id || product._id));
      if (!exists) {
        compare.push({
          id: product.id || product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          category: product.category
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

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>{getPageTitle()}</h1>
          <p>
            {searchParams.get('collection') || searchParams.get('category')
              ? `Browse our ${getPageTitle().toLowerCase()} collection of premium fashion items`
              : 'Browse our complete collection of premium fashion items'
            }
          </p>
        </div>

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
              <button onClick={fetchProducts} className="retry-btn">
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

      {/* Auth Modal */}
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
