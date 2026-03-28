import React, { useState, useEffect } from 'react';
import ProductCard from '../components/Products/ProductCard';
import { formatPrice } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './ShopCollectionPage.css';

const ShopCollectionPage = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const navigate = useNavigate();

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
    // This will be handled by ProductCard component
    console.log('Add to cart:', product.name);
  };

  if (loading) {
    return (
      <div className="shop-collection-page">
        <div className="hero-section">
          <div className="hero-content">
            <div className="collection-icon">👔</div>
            <h1>SHOP COLLECTIONS</h1>
            <p>Curated collections for every style and occasion</p>
          </div>
        </div>
        <div className="container">
          <div className="loading-skeleton">
            <p>Loading collections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-collection-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="collection-icon">👔</div>
          <h1>SHOP COLLECTIONS</h1>
          <p>Curated collections for every style and occasion</p>
          <div className="collection-stats">
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

      <div className="container">
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

        <div className="products-section">
          <div className="section-header">
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
              {products.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
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

        <div className="collection-highlights">
          <h2>Collection Highlights</h2>
          <div className="highlights-grid">
            <div className="highlight-card">
              <div className="highlight-icon">🏆</div>
              <h3>Premium Quality</h3>
              <p>Only the finest materials and craftsmanship</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">🌍</div>
              <h3>Sustainable Fashion</h3>
              <p>Eco-friendly options for conscious consumers</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">🎨</div>
              <h3>Unique Designs</h3>
              <p>Exclusive patterns and modern aesthetics</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">👔</div>
              <h3>Perfect Fit</h3>
              <p>Tailored for comfort and style</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCollectionPage;
