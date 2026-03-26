import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFilter, FaSort, FaHeart, FaShoppingBag, FaStar, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/Products/ProductCard';
import AuthModal from '../components/AuthModal/AuthModal';
import './NewArrivalsPage.css';
import '../components/Products/Products.css';

// Professional new arrivals data with complete product information
const professionalNewArrivals = [
  {
    id: 'na1',
    name: 'Premium Oxford Shirt',
    price: 3499,
    originalPrice: 4999,
    category: 'Men\'s Shirts',
    subcategory: 'Formal',
    brand: 'Black Locust',
    images: [
      '/images/arrivals/11.jpg',
      '/images/arrivals/12.jpg'
    ],
    description: 'Elevate your wardrobe with our premium Oxford shirt, crafted from the finest cotton with meticulous attention to detail.',
    features: ['100% Premium Cotton', 'Classic Fit', 'Machine Washable', 'Imported'],
    rating: 4.8,
    reviews: 127,
    newArrival: true,
    trending: true,
    badge: 'NEW',
    discount: 30,
    colors: ['White', 'Blue', 'Black', 'Gray'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    fastShipping: true
  },
  {
    id: 'na2',
    name: 'Executive Wool Blazer',
    price: 8999,
    originalPrice: 12999,
    category: 'Men\'s Outerwear',
    subcategory: 'Blazers',
    brand: 'Black Locust',
    images: [
      '/images/arrivals/13.jpg',
      '/images/arrivals/14.jpg'
    ],
    description: 'Command attention with our executive wool blazer, designed for the modern professional who values style and sophistication.',
    features: ['Premium Wool Blend', 'Slim Fit', 'Fully Lined', 'Dry Clean Only'],
    rating: 4.9,
    reviews: 89,
    newArrival: true,
    trending: true,
    badge: 'EXCLUSIVE',
    discount: 31,
    colors: ['Navy', 'Charcoal', 'Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    fastShipping: true
  },
  {
    id: 'na3',
    name: 'Designer Denim Jacket',
    price: 4299,
    originalPrice: 5999,
    category: 'Men\'s Outerwear',
    subcategory: 'Jackets',
    brand: 'Black Locust',
    images: [
      '/images/arrivals/32.jpg',
      '/images/arrivals/11.jpg'
    ],
    description: 'Make a statement with our designer denim jacket, combining classic style with contemporary design elements.',
    features: ['Premium Denim', 'Classic Fit', 'Multiple Pockets', 'Machine Washable'],
    rating: 4.7,
    reviews: 156,
    newArrival: true,
    trending: false,
    badge: 'TRENDING',
    discount: 28,
    colors: ['Classic Blue', 'Black', 'Light Wash'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    fastShipping: false
  },
  {
    id: 'na4',
    name: 'Luxury Cotton Polo',
    price: 2499,
    originalPrice: 3499,
    category: 'Men\'s Shirts',
    subcategory: 'Casual',
    brand: 'Black Locust',
    images: [
      '/images/arrivals/12.jpg',
      '/images/arrivals/13.jpg'
    ],
    description: 'Experience comfort and style with our luxury cotton polo, perfect for both casual and semi-formal occasions.',
    features: ['Pima Cotton', 'Classic Fit', 'Ribbed Collar', 'Machine Washable'],
    rating: 4.6,
    reviews: 203,
    newArrival: true,
    trending: false,
    badge: 'BESTSELLER',
    discount: 29,
    colors: ['White', 'Navy', 'Black', 'Red', 'Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    fastShipping: true
  },
  {
    id: 'na5',
    name: 'Tailored Chino Pants',
    price: 3799,
    originalPrice: 5299,
    category: 'Men\'s Bottoms',
    subcategory: 'Pants',
    brand: 'Black Locust',
    images: [
      '/images/arrivals/14.jpg',
      '/images/arrivals/32.jpg'
    ],
    description: 'Achieve the perfect balance of comfort and style with our tailored chino pants, designed for the modern gentleman.',
    features: ['Premium Cotton Twill', 'Slim Fit', 'Stretch Comfort', 'Machine Washable'],
    rating: 4.8,
    reviews: 178,
    newArrival: true,
    trending: true,
    badge: 'NEW',
    discount: 28,
    colors: ['Khaki', 'Navy', 'Black', 'Gray', 'Olive'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    inStock: true,
    fastShipping: true
  },
  {
    id: 'na6',
    name: 'Explorer Kids Jacket',
    price: 1999,
    originalPrice: 2999,
    category: 'Kids\' Outerwear',
    subcategory: 'Jackets',
    brand: 'Black Locust Junior',
    images: [
      '/images/arrivals/11.jpg',
      '/images/arrivals/14.jpg'
    ],
    description: 'Adventure-ready jacket designed for young explorers, combining durability with style for everyday adventures.',
    features: ['Water-Resistant', 'Lightweight', 'Multiple Pockets', 'Easy Clean'],
    rating: 4.9,
    reviews: 92,
    newArrival: true,
    trending: false,
    badge: 'KIDS FAVORITE',
    discount: 33,
    colors: ['Blue', 'Red', 'Green', 'Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    fastShipping: true
  },
  {
    id: 'na7',
    name: 'Premium Leather Belt',
    price: 1299,
    originalPrice: 1899,
    category: 'Men\'s Accessories',
    subcategory: 'Belts',
    brand: 'Black Locust',
    images: [
      '/images/arrivals/13.jpg',
      '/images/arrivals/12.jpg'
    ],
    description: 'Complete your look with our premium leather belt, crafted from genuine leather with attention to detail.',
    features: ['Genuine Leather', 'Classic Buckle', 'Adjustable Length', 'Durable'],
    rating: 4.7,
    reviews: 145,
    newArrival: true,
    trending: false,
    badge: 'ESSENTIAL',
    discount: 32,
    colors: ['Black', 'Brown', 'Tan'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    fastShipping: true
  },
  {
    id: 'na8',
    name: 'Summer Linen Shirt',
    price: 2799,
    originalPrice: 3999,
    category: 'Men\'s Shirts',
    subcategory: 'Casual',
    brand: 'Black Locust',
    images: [
      '/images/arrivals/14.jpg',
      '/images/arrivals/11.jpg'
    ],
    description: 'Stay cool and stylish with our summer linen shirt, perfect for warm weather and casual occasions.',
    features: ['Premium Linen', 'Breathable', 'Classic Fit', 'Machine Washable'],
    rating: 4.6,
    reviews: 167,
    newArrival: true,
    trending: true,
    badge: 'SUMMER ESSENTIAL',
    discount: 30,
    colors: ['White', 'Beige', 'Light Blue', 'Pink'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    fastShipping: false
  }
];

const NewArrivalsPage = () => {
  const [products, setProducts] = useState(professionalNewArrivals);
  const [filteredProducts, setFilteredProducts] = useState(professionalNewArrivals);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [wishlist, setWishlist] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { addToCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Sort products
  useEffect(() => {
    let sorted = [...products];

    // Sort products
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        // featured - keep original order
        break;
    }

    setFilteredProducts(sorted);
  }, [products, sortBy]);

  const handleAddToCart = (product) => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    
    addToCart({ ...product, quantity: 1 });
    // Show success message
    alert(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = (product) => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    
    if (wishlist.includes(product.id)) {
      setWishlist(wishlist.filter(id => id !== product.id));
    } else {
      setWishlist([...wishlist, product.id]);
    }
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="new-arrivals-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">NEW COLLECTION</div>
          <h1>Discover Our Latest Arrivals</h1>
          <p>Experience the pinnacle of style with our newest collection, crafted for the modern individual who demands excellence.</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{products.length}</span>
              <span className="stat-label">New Items</span>
            </div>
            <div className="stat">
              <span className="stat-number">30%</span>
              <span className="stat-label">Avg. Savings</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.8★</span>
              <span className="stat-label">Avg. Rating</span>
            </div>
          </div>
        </div>
        <div className="hero-image-overlay"></div>
      </section>

      {/* Features Bar */}
      <section className="features-bar">
        <div className="feature">
          <FaTruck className="feature-icon" />
          <span>Free Shipping</span>
        </div>
        <div className="feature">
          <FaShieldAlt className="feature-icon" />
          <span>Secure Payment</span>
        </div>
        <div className="feature">
          <FaUndo className="feature-icon" />
          <span>7-Day Returns</span>
        </div>
        <div className="feature">
          <FaHeart className="feature-icon" />
          <span>Premium Quality</span>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        {/* Products Section */}
        <main className="products-section">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <span className="results-count">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>
            <div className="toolbar-right">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onQuickView={handleQuickView}
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>

          {/* Load More */}
          {filteredProducts.length > 0 && (
            <div className="load-more-container">
              <button className="load-more-btn">Load More Products</button>
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="quick-view-modal" onClick={() => setSelectedProduct(null)}>
          <div className="quick-view-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-quick-view" onClick={() => setSelectedProduct(null)}>×</button>
            <div className="quick-view-grid">
              <div className="quick-view-images">
                <img src={selectedProduct.images?.[0]?.url} alt={selectedProduct.name} />
              </div>
              <div className="quick-view-details">
                <h2>{selectedProduct.name}</h2>
                <div className="quick-view-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < Math.floor(selectedProduct.rating) ? 'filled' : ''} />
                    ))}
                  </div>
                  <span>{selectedProduct.rating} ({selectedProduct.reviews} reviews)</span>
                </div>
                <div className="quick-view-price">
                  <span className="current-price">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                  {selectedProduct.originalPrice && (
                    <span className="original-price">₹{selectedProduct.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <p className="quick-view-description">{selectedProduct.description}</p>
                <div className="quick-view-features">
                  <h4>Features:</h4>
                  <ul>
                    {selectedProduct.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="quick-view-actions">
                  <button 
                    className="quick-view-add-to-cart"
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    <FaShoppingBag />
                    Add to Cart
                  </button>
                  <Link to={`/product/${selectedProduct.id}`} className="view-full-details">
                    View Full Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
      />
    </div>
  );
};

export default NewArrivalsPage;
