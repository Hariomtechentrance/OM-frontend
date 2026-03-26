import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/Products/ProductCard';
import SizeSelector from '../components/SizeSelector/SizeSelector';
import SizeChart from '../components/SizeChart/SizeChart';
import '../components/SizeSelector/SizeSelector.css';
import '../components/Products/Products.css';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryType } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, isInWishlist } = useWishlist();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    sizes: [],
    colors: [],
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Category configurations
  const categoryConfig = {
    'party-wear': {
      name: 'Party Wear',
      description: 'Elegant outfits for special occasions',
      icon: '🎉',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Navy', 'Burgundy', 'Gold', 'Silver', 'Red', 'Purple'],
      features: ['Premium Fabric', 'Designer Fit', 'Limited Edition'],
      priceRange: [1999, 8999]
    },
    'casual': {
      name: 'Casual Wear',
      description: 'Comfortable everyday fashion',
      icon: '👕',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Black', 'Gray', 'Navy', 'Blue', 'Green', 'Brown'],
      features: ['Comfort Fit', 'Breathable', 'Easy Care'],
      priceRange: [799, 2999]
    },
    'polo-tshirts': {
      name: 'Polo T-Shirts',
      description: 'Classic polo shirts for all occasions',
      icon: '👔',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Black', 'Navy', 'Red', 'Green', 'Blue', 'Yellow', 'Pink'],
      features: ['Cotton Pique', 'Collar Style', 'Classic Fit'],
      priceRange: [999, 2499]
    },
    'new-collection': {
      name: 'New Collection',
      description: 'Latest arrivals and trends',
      icon: '✨',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['All Colors'],
      features: ['New Arrivals', 'Trending', 'Exclusive'],
      priceRange: [1299, 5999]
    },
    'striped-collection': {
      name: 'Striped Collection',
      description: 'Stylish striped patterns',
      icon: '📊',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Navy/White', 'Black/White', 'Gray/White', 'Multi-color'],
      features: ['Striped Patterns', 'Classic Design', 'Versatile'],
      priceRange: [999, 3499]
    },
    'cargo-collection': {
      name: 'Cargo Collection',
      description: 'Functional and stylish cargo wear',
      icon: '🎒',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Khaki', 'Olive', 'Black', 'Navy', 'Brown'],
      features: ['Multiple Pockets', 'Durable', 'Utility Design'],
      priceRange: [1499, 4499]
    },
    'trousers-collection': {
      name: 'Trousers Collection',
      description: 'Professional and casual trousers',
      icon: '👖',
      sizes: ['28', '30', '32', '34', '36', '38', '40'],
      colors: ['Black', 'Gray', 'Navy', 'Brown', 'Khaki', 'Beige'],
      features: ['Perfect Fit', 'Quality Fabric', 'Versatile'],
      priceRange: [1299, 3999]
    },
    'denim-collection': {
      name: 'Denim Collection',
      description: 'Premium denim wear',
      icon: '💙',
      sizes: ['28', '30', '32', '34', '36', '38'],
      colors: ['Blue', 'Black', 'Gray', 'White', 'Light Blue'],
      features: ['Premium Denim', 'Perfect Fit', 'Durable'],
      priceRange: [1999, 4999]
    },
    'winter-collection': {
      name: 'Winter Collection',
      description: 'Warm and stylish winter wear',
      icon: '❄️',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Gray', 'Navy', 'Brown', 'Burgundy', 'Forest Green'],
      features: ['Warm Fabric', 'Layering', 'Winter Ready'],
      priceRange: [1999, 6999]
    },
    'formal-pants': {
      name: 'Formal Pants',
      description: 'Professional formal wear',
      icon: '🤵',
      sizes: ['28', '30', '32', '34', '36', '38', '40'],
      colors: ['Black', 'Gray', 'Navy', 'Brown', 'Charcoal', 'Khaki'],
      features: ['Professional Fit', 'Office Ready', 'Classic Style'],
      priceRange: [1499, 3499]
    },
    'summer-final': {
      name: 'Summer Collection',
      description: 'Light and breezy summer wear',
      icon: '☀️',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Light Blue', 'Yellow', 'Pink', 'Lime', 'Sky Blue'],
      features: ['Lightweight', 'Breathable', 'Summer Ready'],
      priceRange: [799, 2999]
    },
    'office-collection': {
      name: 'Office Collection',
      description: 'Professional office wear',
      icon: '💼',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Light Blue', 'Pink', 'Yellow', 'Gray', 'Navy'],
      features: ['Office Ready', 'Professional', 'Comfortable'],
      priceRange: [1299, 3999]
    },
    'checked-collection': {
      name: 'Checked Collection',
      description: 'Stylish checked patterns',
      icon: '✅',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black/White', 'Blue/White', 'Red/Black', 'Multi-check'],
      features: ['Checked Patterns', 'Classic Style', 'Versatile'],
      priceRange: [1299, 3999]
    }
  };

  const currentCategory = categoryConfig[categoryType] || {
    name: 'Collection',
    description: 'Explore our collection',
    icon: '🛍️',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Gray', 'Navy'],
    features: ['Quality Fabric', 'Perfect Fit'],
    priceRange: [999, 3999]
  };

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryType, filters]);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products?category=${currentCategory.name}&minPrice=${filters.priceRange[0]}&maxPrice=${filters.priceRange[1]}&sortBy=${filters.sortBy}`);
      setProducts(response.data.products || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch products');
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image,
      size: selectedSize,
      color: selectedColor || 'Default',
      quantity
    };

    const result = await addToCart(cartItem);
    if (result.success) {
      toast.success('Added to cart successfully!');
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (product) => {
    const result = await addToWishlist(product);
    if (result.success) {
      toast.success('Added to wishlist!');
    } else {
      toast.error(result.message || 'Failed to add to wishlist');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      sizes: [],
      colors: [],
      sortBy: 'newest'
    });
  };

  if (loading) {
    return (
      <div className="category-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading {currentCategory.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      {/* Category Header */}
      <div className="category-header">
        <div className="category-hero">
          <div className="category-content">
            <span className="category-icon">{currentCategory.icon}</span>
            <h1>{currentCategory.name}</h1>
            <p>{currentCategory.description}</p>
            <div className="category-features">
              {currentCategory.features.map((feature, index) => (
                <span key={index} className="feature-tag">{feature}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="category-container">
        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="filter-overlay" onClick={() => setShowFilters(false)} />
        )}
        
        {/* Filters Sidebar */}
        <div className={`filters-sidebar ${showFilters ? 'mobile-open' : ''}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="reset-filters" onClick={resetFilters}>Reset</button>
            <button className="close-filters" onClick={() => setShowFilters(false)}>×</button>
          </div>
          
          {/* Price Range */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range">
              <span>₹{filters.priceRange[0]}</span>
              <input
                type="range"
                min="0"
                max="10000"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
              />
              <span>₹{filters.priceRange[1]}</span>
            </div>
          </div>

          {/* Sizes */}
          <div className="filter-section">
            <h4>Sizes</h4>
            <div className="size-filters">
              {currentCategory.sizes.map(size => (
                <label key={size} className="size-filter">
                  <input
                    type="checkbox"
                    checked={filters.sizes.includes(size)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFilterChange('sizes', [...filters.sizes, size]);
                      } else {
                        handleFilterChange('sizes', filters.sizes.filter(s => s !== size));
                      }
                    }}
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="filter-section">
            <h4>Colors</h4>
            <div className="color-filters">
              {currentCategory.colors.map(color => (
                <label key={color} className="color-filter">
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFilterChange('colors', [...filters.colors, color]);
                      } else {
                        handleFilterChange('colors', filters.colors.filter(c => c !== color));
                      }
                    }}
                  />
                  <span className="color-swatch" style={{ backgroundColor: color.toLowerCase().replace('/', '') }}></span>
                  <span>{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="filter-section">
            <h4>Sort By</h4>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-content">
          {/* Mobile Filter Toggle */}
          <div className="mobile-filter-toggle">
            <button onClick={() => setShowFilters(!showFilters)}>
              <span>🔍</span> Filters
            </button>
          </div>

          {/* Products Count */}
          <div className="products-header">
            <h2>{products.length} Products Found</h2>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onQuickView={setSelectedProduct}
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your filters or check back later</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="quick-view-modal" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedProduct(null)}>×</button>
            
            <div className="modal-product">
              <div className="modal-images">
                <img 
                  src={selectedProduct.images?.[0]?.url || selectedProduct.image || 'https://via.placeholder.com/400x500'} 
                  alt={selectedProduct.name}
                />
              </div>
              
              <div className="modal-details">
                <h2>{selectedProduct.name}</h2>
                <p className="product-description">{selectedProduct.description}</p>
                
                <div className="price-section">
                  <span className="current-price">₹{selectedProduct.price}</span>
                  {selectedProduct.originalPrice && (
                    <span className="original-price">₹{selectedProduct.originalPrice}</span>
                  )}
                </div>

                <div className="size-selection">
                  <h4>Select Size</h4>
                  <SizeSelector 
                    sizes={selectedProduct.sizes}
                    selectedSize={selectedSize}
                    onSizeSelect={setSelectedSize}
                  />
                  <button className="size-chart-btn" onClick={() => setShowSizeChart(true)}>
                    📏 Size Chart
                  </button>
                </div>

                <div className="color-selection">
                  <h4>Color</h4>
                  <div className="color-options">
                    {selectedProduct.colors?.map(color => (
                      <button
                        key={color}
                        className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        onClick={() => setSelectedColor(color)}
                      >
                        {selectedColor === color && '✓'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="quantity-selection">
                  <h4>Quantity</h4>
                  <div className="quantity-controls">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(selectedProduct)}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="wishlist-btn"
                    onClick={() => handleAddToWishlist(selectedProduct)}
                  >
                    {isInWishlist(selectedProduct._id) ? '❤️ Saved' : '🤍 Save to Wishlist'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <SizeChart 
          category={currentCategory.name}
          onClose={() => setShowSizeChart(false)}
        />
      )}
    </div>
  );
};

export default CategoryPage;
