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

  // Function to get collection image filename
  const getCollectionImage = (collection) => {
    const imageMap = {
      'denim-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/denim-collection.jpg',
      'trouser-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/trousers-collection.jpg',
      'cargo-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/cargo-collection.jpg',
      'casual-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/casual-collection.jpg',
      'formal-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/formal-collection.jpg',
      'formal-pants': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/formal-pants.jpg?updatedAt=1775035891099',
      'party-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/party-collection.jpg',
      'party-wear-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/party-wear-collection.jpg?updatedAt=1775035958472',
      'polo-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/polo-collection.jpg',
      'polos': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/polos.jpg?updatedAt=1775036002489',
      'office-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/office-collection.jpg',
      'summer-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/summer-collection.jpg',
      'winter-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/winter-collection.jpg',
      'new-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/new-collection.jpg',
      'checked-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/checked-collection.jpg',
      'striped-collection': 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/striped-collection.jpg'
    };
    
    // Try exact match first
    if (imageMap[collection.slug]) {
      return imageMap[collection.slug];
    }
    
    // Try name-based matching
    const nameKey = collection.name.toLowerCase().replace(/\s+/g, '-');
    if (imageMap[nameKey]) {
      return imageMap[nameKey];
    }
    
    // Try direct name match for common collections
    if (collection.name === 'Denim collection') {
      return 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/denim-collection.jpg';
    }
    if (collection.name === 'Trouser collection') {
      return 'https://ik.imagekit.io/lt7mwv7fv/New%20Products%202/Collections/trousers-collection.jpg';
    }
    
    // Fallback to slug-based filename
    return `/images/collections/${collection.slug}.jpg`;
  };

  // Hero images array (Peter England Style)
  const desktopHeroImages = useMemo(() => [
    {
      src: '/images/hero/17.jpg',
      alt: 'Black Locust Premium Fashion Collection 3',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/18.jpg',
      alt: 'Black Locust Premium Fashion Collection 4',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/19.jpg',
      alt: 'Black Locust Premium Fashion Collection 5',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/20.jpg',
      alt: 'Black Locust Premium Fashion Collection 6',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/21.jpg',
      alt: 'Black Locust Premium Fashion Collection 7',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/22.jpg',
      alt: 'Black Locust Premium Fashion Collection 8',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/23.jpg',
      alt: 'Black Locust Premium Fashion Collection 9',
      title: '',
      subtitle: ''
    }
  ], []);

  const mobileHeroImages = useMemo(() => [
    {
      src: '/images/hero/24.jpg',
      alt: 'Black Locust Mobile Fashion Collection 1',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/25.jpg',
      alt: 'Black Locust Mobile Fashion Collection 2',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/26.jpg',
      alt: 'Black Locust Mobile Fashion Collection 3',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/27.jpg',
      alt: 'Black Locust Mobile Fashion Collection 4',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/28.jpg',
      alt: 'Black Locust Mobile Fashion Collection 5',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/29.jpg',
      alt: 'Black Locust Mobile Fashion Collection 6',
      title: '',
      subtitle: ''
    },
    {
      src: '/images/hero/30.jpg',
      alt: 'Black Locust Mobile Fashion Collection 7',
      title: '',
      subtitle: ''
    }
  ], []);

  // Responsive hero images based on screen size
  const [heroImages, setHeroImages] = useState(desktopHeroImages);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size and set appropriate images
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setHeroImages(mobile ? mobileHeroImages : desktopHeroImages);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [desktopHeroImages, mobileHeroImages]);

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

  const currentHeroImage = heroImages[currentHeroSlide] || heroImages[0] || desktopHeroImages[0];

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
        <div className="relative h-[80vh] w-full overflow-hidden">
          {/* Hero Image */}
          <img
            src={currentHeroImage.src}
            alt={currentHeroImage.alt}
            className="w-full h-full object-cover"
          />
          
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
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Collection</h2>
              <p className="text-lg text-gray-600">Curated collections for every occasion</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
            {homepageData.collections
              .filter(collection => collection.name !== 'Denim' && collection.name !== 'Denim collection' && collection.name !== 'Trouser' && collection.name !== 'Printed collection')
              .map((collection) => (
              <div key={collection._id} className="group relative flex flex-col items-center">
                <Link 
                  to={`/collection/${collection.slug}`}
                  className="block mb-4"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <img
                      src={getCollectionImage(collection)}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                      onError={(e) => {
                        console.log('Failed to load image for:', collection.name, 'slug:', collection.slug);
                        e.target.src = '/images/placeholder.jpg'; // Fallback image
                      }}
                    />
                  </div>
                </Link>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">{collection.name}</h3>
                <Link
                  to={`/collection/${collection.slug}`}
                  className="text-sm text-gray-600 hover:text-black font-medium transition-colors text-center"
                >
                  Explore Collection →
                </Link>
              </div>
            ))}
          </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {homepageData.featuredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => handleProductClick(product._id)}>
                  <img
                    src={product.images?.[0]?.url || "/images/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 text-sm md:text-base">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-black text-white px-3 py-1 text-xs md:text-sm hover:bg-gray-800 transition-colors"
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
        <section className="bg-white py-16">
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
                        src={product.images?.[0]?.url || "/images/placeholder.jpg"}
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
                      src={product.images?.[0]?.url || "/images/placeholder.jpg"}
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
                        src={product.images?.[0]?.url || "/images/placeholder.jpg"}
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
    </div>
  );
}

export default HomePage;
