import React, { useState, useEffect } from 'react';
import ProductCard from '../components/Products/ProductCard';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from '../components/AuthModal/AuthModal';
import './ShopCollectionPage.css';

const ShopCollectionPage = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchProducts();
    }
  }, [selectedCollection]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collections');
      if (res.data.success) {
        setCollections(res.data.collections || []);
        setSelectedCollection('all');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      let res;
      
      if (selectedCollection === 'all') {
        // Fetch all products
        res = await api.get('/products');
      } else {
        // Fetch products for specific collection
        res = await api.get(`/collections/${selectedCollection}/products`);
      }
      
      if (res.data.success) {
        setProducts(res.data.products || res.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCollectionClick = (collectionSlug) => {
    setSelectedCollection(collectionSlug);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    addToCart(product, 1, undefined, undefined);
  };

  if (loading) {
    return (
      <div className="shop-collection-page">
        <div className="shop-collections-hero">
          <div className="shop-collections-hero__content">
            <div className="shop-collections-hero__icon">👔</div>
            <h1>SHOP COLLECTIONS</h1>
            <p>Curated collections for every style and occasion</p>
          </div>
        </div>
        <div className="shop-collections-container">
          <div className="loading-skeleton">
            <p>Loading collections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-collection-page">
      <div className="shop-collections-hero">
        <div className="shop-collections-hero__content">
          <div className="shop-collections-hero__icon">👔</div>
          <h1>SHOP COLLECTIONS</h1>
          <p>Curated collections for every style and occasion</p>
          <div className="shop-collections-hero__stats">
            <div className="stat">
              <span className="stat-number">{collections.length || 12}</span>
              <span className="stat-label">Collections</span>
            </div>
            <div className="stat">
              <span className="stat-number">{products.length || 7}</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Quality</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shop-collections-container">
        <div className="collection-filters">
          <button 
            className={`filter-btn ${selectedCollection === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCollection('all')}
          >
            All Collections
          </button>
          {collections.map(collection => (
            <button 
              key={collection._id}
              className={`filter-btn ${selectedCollection === collection.slug ? 'active' : ''}`}
              onClick={() => handleCollectionClick(collection.slug)}
            >
              {collection.name}
            </button>
          ))}
        </div>

        <div className="shop-collections-products">
          <div className="shop-collections-products__header">
            <h2>
              {selectedCollection === 'all' 
                ? 'All Products' 
                : collections.find(c => c.slug === selectedCollection)?.name || 'Products'
              }
            </h2>
            <p className="product-count">
              {products.length} products found
            </p>
          </div>

          {productsLoading ? (
            <div className="loading-skeleton">
              <div className="products-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="product-card loading-skeleton">
                    <div className="product-image">
                      <div className="skeleton-loader"></div>
                    </div>
                    <div className="product-info">
                      <h3><div className="skeleton-loader"></div></h3>
                      <p><div className="skeleton-loader"></div></p>
                      <div className="product-price">
                        <span className="current-price">Loading...</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onQuickView={() => navigate(`/product/${product._id || product.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <div className="no-products-icon">🔍</div>
              <h3>No products found</h3>
              <p>
                {selectedCollection === 'all' 
                  ? 'No products available at the moment.' 
                  : 'No products available in this collection.'
                }
              </p>
              <button 
                className="btn-primary"
                onClick={() => setSelectedCollection('all')}
              >
                View All Products
              </button>
            </div>
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
};

export default ShopCollectionPage;
