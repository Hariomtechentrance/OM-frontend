import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios'; // ✅ FIXED: Use shared axios instance
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SizeSelector from '../components/SizeSelector/SizeSelector';
import SizeChart from '../components/SizeChart/SizeChart';
import { getColorHex } from '../utils/colorUtils';
import '../components/SizeSelector/SizeSelector.css';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80';

  const getImage = (img) => {
    if (!img) return PLACEHOLDER_IMAGE;
    if (img.url) return img.url;
    if (typeof img === 'object') {
      const values = Object.values(img);
      if (values.length > 0 && typeof values[0] === 'string') {
        return values.join('');
      }
    }
    if (typeof img === 'string') return img;
    return PLACEHOLDER_IMAGE;
  };

  const resolveGalleryUrl = (img) => {
    const u = getImage(img);
    if (!u || (typeof u === 'string' && u.includes('imagekit.io/dashboard'))) {
      return PLACEHOLDER_IMAGE;
    }
    return u;
  };

  /** Always 4 gallery slots — duplicate assets when fewer than 4 images exist */
  const galleryImages = useMemo(() => {
    if (!product) {
      return [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE];
    }
    const imgs = (product.images || []).map(resolveGalleryUrl);
    const base = imgs.length ? imgs : [PLACEHOLDER_IMAGE];
    const out = [];
    for (let i = 0; i < 4; i++) out.push(base[i % base.length]);
    return out;
  }, [product]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [currentStock, setCurrentStock] = useState(0);

  const mainImage = galleryImages[activeIndex] || PLACEHOLDER_IMAGE;

  useEffect(() => {
    setActiveIndex(0);
  }, [product?._id]);

  useEffect(() => {
    if (!product) return undefined;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % 4);
    }, 5000);
    return () => clearInterval(id);
  }, [product?._id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`); // ✅ FIXED: Use proxy instead of hardcoded URL
        const productData = response.data.product;
        
        // ✅ STEP 3: USE RAW DATABASE DATA DIRECTLY
        setProduct(productData);
        
        // Debug: Log product images
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ STEP 3: DEFAULT SELECT FIRST AVAILABLE SIZE
  useEffect(() => {
    if (product?.sizes?.length > 0) {
      const firstAvailable = product.sizes.find(s => s.stock > 0);
      if (firstAvailable) {
        setSelectedSize(firstAvailable);
        setCurrentStock(firstAvailable.stock);
      }
    }
  }, [product]);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setCurrentStock(size.stock); // ✅ IMPORTANT: Use raw database stock
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(value, currentStock || 10)));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: selectedSize.price || product.price,
      image: mainImage,
      size: selectedSize.size, // ✅ FIX: Use size field
      color: selectedColor || (product.colors?.[0]?.includes('-') ? product.colors[0].split('-')[0] : product.colors?.[0] || 'Default'),
      quantity: quantity
    };

    addToCart(cartItem);
    // ✅ FIX: Remove duplicate success message (handled in context)
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/shop')} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = selectedSize?.price || product.price;
  // 
  const isInStock = currentStock > 0;
  
  return (
    <div className="page-container">
      <div className="product-detail">
        <div className="product-layout">
          {/* Left Column - Images */}
          <div className="product-images-section">
            <div className="main-image-container">
              <button
                type="button"
                className="gallery-nav gallery-nav--prev"
                aria-label="Previous image"
                onClick={() => setActiveIndex((i) => (i + 3) % 4)}
              >
                ‹
              </button>
              <img
                src={mainImage}
                alt={product.name}
                className="main-product-image"
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
              <button
                type="button"
                className="gallery-nav gallery-nav--next"
                aria-label="Next image"
                onClick={() => setActiveIndex((i) => (i + 1) % 4)}
              >
                ›
              </button>
            </div>

            <div className="thumbnail-gallery" role="tablist" aria-label="Product images">
              {galleryImages.map((imageUrl, index) => (
                <button
                  key={`thumb-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === index}
                  className={`thumbnail-item ${activeIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <img
                    src={imageUrl}
                    alt={`View ${index + 1}`}
                    className="thumbnail-image"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-meta">
                <div className="rating">
                  <span className="stars">{'★'.repeat(Math.floor(product.rating))}</span>
                  <span className="rating-text">({product.numReviews} reviews)</span>
                </div>
                <div className="brand">Brand: {product.brand}</div>
              </div>
            </div>

            <div className="price-section">
              <div className="price-display">
                <span className="current-price">₹{currentPrice.toFixed(2)}</span>
                {selectedSize && selectedSize.price !== product.price && (
                  <span className="original-price">₹{product.price.toFixed(2)}</span>
                )}
              </div>
              {!isInStock && (
                <div className="out-of-stock-badge">Out of Stock</div>
              )}
            </div>

            {/* Product Features */}
            <div className="product-features">
              <h3>Product Features</h3>
              <div className="features-grid">
                {(product.features || []).map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Material & Care */}
            <div className="product-details">
              <div className="detail-item">
                <h4>Material</h4>
                <p>{product.material}</p>
              </div>
              <div className="detail-item">
                <h4>Care Instructions</h4>
                <p>{product.care}</p>
              </div>
            </div>

            {/* Enhanced Product Specifications */}
            {product.productSpecs && (
              <div className="product-specifications">
                {/* Marketing Description */}
                {product.productSpecs.marketingDescription && (
                  <div className="marketing-description">
                    <h3>Product Description</h3>
                    <p>{product.productSpecs.marketingDescription}</p>
                  </div>
                )}

                {/* Fit & Available Sizes */}
                {product.productSpecs.fit && (
                  <div className="fit-sizes-section">
                    <div className="fit-info">
                      <h4>Fit: {product.productSpecs.fit}</h4>
                    </div>
                    {product.productSpecs.availableSizes && product.productSpecs.availableSizes.length > 0 && (
                      <div className="available-sizes">
                        <h4>Available Sizes: {product.productSpecs.availableSizes.map(s => s.size).join(', ')}</h4>
                        <div className="size-options">
                          {product.productSpecs.availableSizes.map((size, index) => (
                            <div key={index} className="size-option">
                              <span className="size-label">{size.size}</span>
                              <span className={`size-stock ${size.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {size.stock > 0 ? `In Stock (${size.stock})` : 'Out of Stock'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Size & Color Selection */}
            <div className="selection-section">
              <div className="size-selector-container">
                <SizeSelector
                  product={product}
                  selectedSize={selectedSize}
                  onSizeChange={handleSizeChange}
                  className="product-size-selector"
                />
              </div>
              
              <div className="color-selector-container">
                <h3>Select Color</h3>
                <div className="color-options">
                  {(product.colors?.[0]?.includes('-') ? product.colors[0].split('-') : product.colors || []).map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => handleColorChange(color)}
                      title={color}
                    >
                      <span 
                        className="color-swatch" 
                        style={{ 
                          backgroundColor: getColorHex(color)
                        }}
                      />
                      <span className="color-name">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="action-section">
              <div className="quantity-container">
                <h3>Quantity</h3>
                <div className="quantity-controls">
                  <input
                    type="number"
                    min="1"
                    max={currentStock || 10}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="quantity-input"
                  />
                  <span className="stock-info">
                    {selectedSize 
                      ? `${currentStock} in stock` 
                      : "Select size first"}
                  </span>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || currentStock === 0}
                >
                  Add to Cart
                </button>
                <button 
                  className="buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={!selectedSize || currentStock === 0}
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Size Chart Button */}
            <div className="size-chart-section">
              <button 
                className="size-chart-trigger"
                onClick={() => setShowSizeChart(true)}
              >
                📏 View Size Chart
              </button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="product-description-section">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChart
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetailPage;
