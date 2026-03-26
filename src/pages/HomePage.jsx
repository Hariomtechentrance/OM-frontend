import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Hero from '../components/Hero/Hero';
import ProductCard from '../components/Products/ProductCard';
import AuthModal from '../components/AuthModal/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import './HomePage.css';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // Initialize products and categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      const data = response.data;

      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Set default categories (removed API call to avoid 404 error)
  const fetchCategories = async () => {
    setCategories([
      {
        _id: '1',
        name: 'Men\'s Collection',
        slug: 'mens-collection',
        description: 'Refined elegance meets contemporary style',
        image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80',
        order: 0,
        isActive: true,
        featured: true,
        type: 'category'
      },
      {
        _id: '2',
        name: 'Kids Collection',
        slug: 'kids-collection',
        description: 'Adventure-ready style for young minds',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80',
        order: 1,
        isActive: true,
        featured: true,
        type: 'category'
      }
    ]);
  };

  // Handle add to cart with auth check
  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  // Handle wishlist
  const handleToggleWishlist = (product) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    
    const isInWishlist = wishlist.some(item => item._id === product._id);
    
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item._id !== product._id));
      toast.success('Removed from wishlist');
    } else {
      setWishlist([...wishlist, product]);
      toast.success('Added to wishlist');
    }
  };

  // Filter products for different sections
  const featured = products.filter(p => p.isFeatured);
  const newArrivals = products.filter(p => p.isNewArrival);
  const trending = products.filter(p => p.isTrending);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <section className="categories" id="categories">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Explore our curated collections</p>
          </div>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link key={category._id} to={`/category/${category.slug}`} className="category-card reveal">
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
                </div>
                <div className="category-overlay">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span className="shop-now">Shop Now →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featured.length > 0 && (
        <section className="featured-products" id="featured">
          <div className="container">
            <div className="section-header">
              <h2>Featured Products</h2>
              <p>Handpicked favorites just for you</p>
            </div>
            <div className="products-grid">
              {featured.map((item) => (
                <ProductCard 
                  key={item._id} 
                  product={item}
                  onAddToCart={() => handleAddToCart(item)}
                  onToggleWishlist={() => handleToggleWishlist(item)}
                  onQuickView={() => navigate(`/product/${item._id}`)}
                  isInWishlist={wishlist.some(w => w._id === item._id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="new-arrivals" id="new-arrivals">
          <div className="container">
            <div className="section-header">
              <h2>New Arrivals</h2>
              <p>Fresh styles for the season</p>
            </div>
            <div className="products-grid">
              {newArrivals.map((item) => (
                <ProductCard 
                  key={item._id} 
                  product={item}
                  onAddToCart={() => handleAddToCart(item)}
                  onToggleWishlist={() => handleToggleWishlist(item)}
                  onQuickView={() => navigate(`/product/${item._id}`)}
                  isInWishlist={wishlist.some(w => w._id === item._id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products Section */}
      {trending.length > 0 && (
        <section className="trending-products" id="trending">
          <div className="container">
            <div className="section-header">
              <h2>Trending Now</h2>
              <p>What's hot right now</p>
            </div>
            <div className="products-grid">
              {trending.map((item) => (
                <ProductCard 
                  key={item._id} 
                  product={item}
                  onAddToCart={() => handleAddToCart(item)}
                  onToggleWishlist={() => handleToggleWishlist(item)}
                  onQuickView={() => navigate(`/product/${item._id}`)}
                  isInWishlist={wishlist.some(w => w._id === item._id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* View All Products Button */}
      <section className="view-all-products">
        <div className="container">
          <div className="section-header">
            <h2>Shop All Products</h2>
            <p>Browse our complete collection of premium clothing</p>
          </div>
          <div className="cta-container">
            <Link to="/products" className="cta-button">
              <i className="fas fa-shopping-bag"></i>
              View All Products
            </Link>
          </div>
        </div>
      </section>
      
      {/* Auth Modal */}
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          onSuccess={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}

export default HomePage;
