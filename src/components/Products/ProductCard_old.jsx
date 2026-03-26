import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaRuler, FaHeart, FaShoppingCart, FaEye, FaBalanceScale } from 'react-icons/fa';
import { formatPrice } from '../../utils/currency';
import { getAvailableSizes, getSizeLabel } from '../../utils/sizes';
import { useStock } from '../../context/StockContext';
import SizeChart from '../SizeChart/SizeChart';
import './Products.css';

const ProductCard = ({ product, onAddToCart, onQuickView, onAddToWishlist, onCompare }) => {
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const { getStock } = useStock();
  const availableSizes = getAvailableSizes(product.category);
  const productSizes = product.sizes || [];

  const renderRatingStars = (rating) => {
    const safeRating = Number(rating) || 0;
    const stars = [];
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="star filled" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star half" />);
    }
    
    const emptyStars = 5 - Math.ceil(safeRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star empty" />);
    }
    
    return stars;
  };

  const getImageUrl = (product) => {
    // Handle different image URL formats
    if (product.images && product.images.length > 0) {
      return product.images[0].url || product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    // Fallback to placeholder without text
    return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop';
  };

  const getAvailableSizesForProduct = () => {
    const availableSizesList = [];
    const productId = product.id || product._id; // Use consistent ID
    
    Object.entries(availableSizes).forEach(([sizeType, sizes]) => {
      sizes.forEach(size => {
        const sizeObj = productSizes.find(s => s.name === size.name && s.type === sizeType);
        if (sizeObj) {
          // Get real-time stock from stock context
          const currentStock = getStock(productId, size.name);
          if (currentStock > 0) {
            availableSizesList.push({
              ...size,
              type: sizeType,
              stock: currentStock,
              price: sizeObj.price || product.price
            });
          }
        }
      });
    });

    return availableSizesList.slice(0, 6); // Show max 6 sizes in card
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size first');
      return;
    }

    const productId = product.id || product._id; // Use consistent ID
    const cartItem = {
      productId: productId,
      name: product.name,
      price: selectedSize.price || product.price,
      image: getImageUrl(product),
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      maxQuantity: selectedSize.stock
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation(); // Prevent card click
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const handleCompare = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onCompare) {
      onCompare(product);
    }
  };

  const handleCardClick = () => {
    // Navigate to product detail page
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const availableSizesList = getAvailableSizesForProduct();

  const discountPercentage = product.originalPrice ? 
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div 
      className="product-card enhanced clickable"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="product-image-container">
        <div className="product-image">
          <img src={getImageUrl(product)} alt={product.name || 'Product'} />
          
          {/* Badges */}
          <div className="product-badges">
            {product.featured && (
              <span className="featured-badge">Featured</span>
            )}
            {product.newArrival && (
              <span className="new-badge">New</span>
            )}
            {discountPercentage > 0 && (
              <span className="discount-badge">-{discountPercentage}%</span>
            )}
            {product.trending && (
              <span className="trending-badge">Trending</span>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className={`quick-actions-overlay ${isHovered ? 'visible' : ''}`}>
            <button 
              className="quick-action-btn quick-view-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickView();
              }}
              title="Quick View"
            >
              <FaEye />
            </button>
            <button 
              className={`quick-action-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlist}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <FaHeart />
            </button>
            <button 
              className="quick-action-btn compare-btn"
              onClick={handleCompare}
              title="Add to Compare"
            >
              <FaBalanceScale />
            </button>
          </div>
        </div>

        {/* Quick Size Selection */}
        {availableSizesList.length > 0 && (
          <div className="quick-size-selection" onClick={(e) => e.stopPropagation()}>
            <div className="quick-sizes-grid">
              {availableSizesList.slice(0, 4).map((size, index) => (
                <button
                  key={`${size.type}-${size.name}-${index}`}
                  className={`quick-size-btn ${
                    selectedSize?.name === size.name && selectedSize?.type === size.type ? 'selected' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSizeSelect(size);
                  }}
                  title={`${size.label || size.name} - ${size.description}`}
                >
                  {size.label || size.name}
                  {size.stock <= 3 && (
                    <span className="low-stock-dot"></span>
                  )}
                </button>
              ))}
            </div>
            <button 
              className="show-all-sizes-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowSizeOptions(true);
              }}
            >
              <FaRuler /> All Sizes
            </button>
          </div>
        )}
      </div>
      
      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-brand">{product.brand}</div>
        </div>
        
        <div className="product-description">{product.description}</div>
        
        <div className="product-meta">
          <div className="product-rating">
            <div className="stars">
              {renderRatingStars(product.rating)}
            </div>
            <span className="rating-text">({Number(product.rating) || 0})</span>
          </div>
          
          <div className="product-price-section">
            <div className="current-price">
              {selectedSize ? formatPrice(selectedSize.price) : formatPrice(product.price)}
            </div>
            {product.originalPrice && (
              <div className="original-price">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>
        </div>

        {/* Full Size Selection Modal */}
        {showSizeOptions && (
          <div className="size-selection-card">
            <div className="size-options-compact">
              <h4>Select Size:</h4>
              <div className="sizes-grid">
                {availableSizesList.map((size, index) => (
                  <button
                    key={`${size.type}-${size.name}-${index}`}
                    className={`size-option-compact ${
                      selectedSize?.name === size.name && selectedSize?.type === size.type ? 'selected' : ''
                    }`}
                    onClick={() => handleSizeSelect(size)}
                    title={`${size.label || size.name} - ${size.description}`}
                  >
                    {size.label || size.name}
                    {size.stock <= 3 && (
                      <span className="low-stock-indicator">!</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 1 && (
              <div className="color-selection-card">
                <h4>Select Color:</h4>
                <div className="colors-grid">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`color-option-compact ${
                        selectedColor === color ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    >
                      <span 
                        className="color-swatch-compact" 
                        style={{ 
                          backgroundColor: color.toLowerCase() === 'black' ? '#000000' :
                                         color.toLowerCase() === 'white' ? '#ffffff' :
                                         color.toLowerCase() === 'navy' ? '#000080' :
                                         color.toLowerCase() === 'gray' ? '#808080' :
                                         color.toLowerCase() === 'forest green' ? '#228b22' : '#cccccc'
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="size-selection-actions">
              <button 
                className="add-to-cart-btn size-selected" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={!selectedSize}
              >
                <FaShoppingCart />
                {selectedSize ? `Add ${selectedSize.name} to Cart` : 'Select Size First'}
              </button>
              <button 
                className="cancel-size-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSizeOptions(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Size Display */}
        {!showSizeOptions && availableSizesList.length > 0 && (
          <div className="quick-sizes">
            <span className="available-sizes-label">
              Available: {availableSizesList.slice(0, 3).map(s => s.name).join(', ')}
              {availableSizesList.length > 3 && ' + more'}
            </span>
          </div>
        )}

        {/* Size Chart Button */}
        <button 
          className="size-chart-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setShowSizeChart(true);
          }}
        >
          <FaRuler /> Size Chart
        </button>
        
        <div className="product-footer">
          <div className="product-category">
            {product.category}
          </div>
          <button 
            className="add-to-cart-quick-btn"
            onClick={(e) => {
              e.stopPropagation();
              selectedSize ? handleAddToCart() : setShowSizeOptions(true);
            }}
          >
            <FaShoppingCart />
            {selectedSize ? 'Add to Cart' : 'Select Size'}
          </button>
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChart 
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        productCategory={product.category}
        productName={product.name}
      />
    </div>
  );
};

export default ProductCard;