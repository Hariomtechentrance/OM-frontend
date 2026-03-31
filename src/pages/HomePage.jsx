import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import DataService from '../services/dataService';

function HomePage() {
  const [homepageData, setHomepageData] = useState({
    products: [],
    categories: [],
    collections: [],
    organizedByCategories: {},
    organizedByCollections: {},
    featuredProducts: [],
    newArrivals: [],
    trendingProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // Hero images array (Peter England Style)
  const heroImages = useMemo(() => [
    {
      src: '/images/hero/15.jpg',
      alt: 'Black Locust Premium Fashion Collection 1',
      title: 'India\'s Most Trusted Fashion Destination',
      subtitle: 'Discover premium quality clothing for men and kids'
    },
    {
      src: '/images/hero/16.jpg',
      alt: 'Black Locust Premium Fashion Collection 2',
      title: 'Unmatched Value Proposition',
      subtitle: 'International fashion standards at affordable prices'
    },
    {
      src: '/images/hero/17.jpg',
      alt: 'Black Locust Premium Fashion Collection 3',
      title: 'Crafted for Excellence',
      subtitle: 'Premium fabrics tailored to perfection'
    },
    {
      src: '/images/hero/18.jpg',
      alt: 'Black Locust Premium Fashion Collection 4',
      title: 'Effortless Style',
      subtitle: 'Casual and formal outfits for every occasion'
    },
    {
      src: '/images/hero/19.jpg',
      alt: 'Black Locust Premium Fashion Collection 5',
      title: 'Timeless Fashion',
      subtitle: 'Trendsetting clothing that lasts'
    }
  ], []);

  // Auto-rotate hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Manual slide navigation
  const goToSlide = (index) => {
    setCurrentHeroSlide(index);
  };

  const nextSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  // Fetch homepage data
  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const data = await DataService.getHomepageData();
      setHomepageData(data);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentHeroImage = heroImages[currentHeroSlide];

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - Peter England Style */}
      <section className="relative">
        <div className="relative h-[600px] w-full overflow-hidden">
          {/* Hero Image */}
          <img
            src={currentHeroImage.src}
            alt={currentHeroImage.alt}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">{currentHeroImage.title}</h1>
              <p className="text-xl md:text-2xl mb-8">{currentHeroImage.subtitle}</p>
              <Link
                to="/products"
                className="bg-white text-black px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors inline-block"
              >
                SHOP NOW
              </Link>
            </div>
          </div>

          {/* Slide Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentHeroSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* MEN'S CATEGORY SECTION */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Content - Text */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Men's Collection</h2>
              <p className="text-lg text-gray-600 mb-6">Discover our latest men's fashion collection featuring premium quality shirts, pants, and more. Designed for the modern man who values style and comfort.</p>
              <Link
                to="/category/men"
                className="inline-flex items-center bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Shop Men
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v6m-5-6h6" />
                </svg>
              </Link>
            </div>
            
            {/* Right Content - Image */}
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1617137968032-f6e7b6d5e9a?w=600&q=80"
                alt="Men's Collection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-40"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Premium Men's Wear</h3>
                <p className="text-gray-200">From casual to formal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KIDS' CATEGORY SECTION */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Content - Image */}
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80"
                alt="Kids' Collection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-40"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Kids Collection</h3>
                <p className="text-gray-200">Fun & comfortable styles</p>
              </div>
            </div>
            
            {/* Right Content - Text */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Kids' Collection</h2>
              <p className="text-lg text-gray-600 mb-6">Explore our vibrant kids' collection with comfortable and stylish outfits for every occasion. From playful casual wear to elegant party outfits, we have it all.</p>
              <Link
                to="/category/kids"
                className="inline-flex items-center bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Shop Kids
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v6m-5-6h6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS SECTION */}
      {homepageData.collections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Collection</h2>
            <p className="text-lg text-gray-600">Curated collections for every occasion</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homepageData.collections.map((collection) => (
              <div key={collection._id} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{collection.name}</h3>
                  <p className="text-gray-200 mb-4">{collection.description}</p>
                  <Link
                    to={`/collection/${collection.slug}`}
                    className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors inline-block"
                  >
                    EXPLORE
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES SECTION */}
      {homepageData.categories.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-lg text-gray-600">Find exactly what you're looking for</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {homepageData.categories.map((category) => (
                <div key={category._id} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-gray-200 mb-4">{category.description}</p>
                    <Link
                      to={`/category/${category.slug}`}
                      className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors inline-block"
                    >
                      SHOP NOW
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS SECTION */}
      {homepageData.featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Handpicked favorites from our collection</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homepageData.featuredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => handleProductClick(product._id)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-black text-white px-3 py-1 text-sm hover:bg-gray-800 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEW ARRIVALS SECTION */}
      {homepageData.newArrivals.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">New Arrivals</h2>
              <p className="text-lg text-gray-600">Fresh styles just landed</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {homepageData.newArrivals.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <div className="aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => handleProductClick(product._id)}>
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
                        NEW
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-black text-white px-3 py-1 text-sm hover:bg-gray-800 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIEW ALL PRODUCTS BUTTON */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            View All Products
          </Link>
        </div>
      </section>

      {/* COLLECTIONS WITH PRODUCTS SECTION */}
      {Object.entries(homepageData.organizedByCollections).map(([slug, data]) => (
        data.products.length > 0 && (
          <section key={slug} className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{data.collection.name}</h2>
                <p className="text-lg text-gray-600">{data.collection.description}</p>
              </div>
              <Link
                to={`/collection/${slug}`}
                className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                VIEW ALL
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.products.slice(0, 8).map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <div className="aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => handleProductClick(product._id)}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-black text-white px-3 py-1 text-sm hover:bg-gray-800 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      ))}

      {/* CATEGORIES WITH PRODUCTS SECTION */}
      {Object.entries(homepageData.organizedByCategories).map(([slug, data]) => (
        data.products.length > 0 && (
          <section key={slug} className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{data.category.name}</h2>
                  <p className="text-lg text-gray-600">{data.category.description}</p>
                </div>
                <Link
                  to={`/category/${slug}`}
                  className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
                >
                  VIEW ALL
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.products.slice(0, 8).map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => handleProductClick(product._id)}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-black text-white px-3 py-1 text-sm hover:bg-gray-800 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      ))}

      {/* TRUST SECTION */}
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Shop With Us</h2>
            <p className="text-lg text-gray-300">Experience the Black Locust difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8-4m8-4l8 4m0-10l-8 4m8 4l8 4m0-10v10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
              <p className="text-gray-300">On orders above ₹999</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l4 4m-4-4v4m0 0V8a4 4 0 014-4h4a4 4 0 014 4v0" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">15 Days Return</h3>
              <p className="text-gray-300">Easy returns and exchanges</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
              <p className="text-gray-300">100% secure transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Stay in Style</h2>
          <p className="text-lg text-gray-600 mb-8">Subscribe to our newsletter for exclusive offers and new arrivals</p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
