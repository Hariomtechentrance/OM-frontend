import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import DataService from '../services/dataService';

// ─── Unsplash fallback per category (never 404) ─────────────────────────────
const IMG_FALLBACK = {
  men:     'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop',
  kids:    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop',
};

// Safe image component — swaps to fallback silently on any error
const SafeImg = ({ src, alt, className, fallback, onClick }) => {
  const [errored, setErrored] = useState(false);
  
  // Ensure src is a string before calling .includes()
  const srcString = typeof src === 'string' ? src : '';
  const resolvedSrc = (errored || !srcString || srcString.includes('placeholder')) ? fallback : srcString;
  
  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  );
};

function HomePage() {
  const [homepageData, setHomepageData] = useState({
    products: [], categories: [], collections: [],
    organizedByCategories: {}, organizedByCollections: {},
    featuredProducts: [], newArrivals: [], trendingProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // ─── Hero images (Local Public Images) ─────────────────────────────────────────────────
  const desktopHeroImages = useMemo(() => [
    { src: '/images/hero/17.jpg', alt: 'Collection 1' },
    { src: '/images/hero/18.jpg', alt: 'Collection 2' },
    { src: '/images/hero/19.jpg', alt: 'Collection 3' },
    { src: '/images/hero/20.jpg', alt: 'Collection 4' },
    { src: '/images/hero/21.jpg', alt: 'Collection 5' },
    { src: '/images/hero/22.jpg', alt: 'Collection 6' },
    { src: '/images/hero/23.jpg', alt: 'Collection 7' },
  ], []);

  const mobileHeroImages = useMemo(() => [
    { src: '/images/hero/24.jpg', alt: 'Mobile 1' },
    { src: '/images/hero/25.jpg', alt: 'Mobile 2' },
    { src: '/images/hero/26.jpg', alt: 'Mobile 3' },
    { src: '/images/hero/27.jpg', alt: 'Mobile 4' },
    { src: '/images/hero/28.jpg', alt: 'Mobile 5' },
    { src: '/images/hero/29.jpg', alt: 'Mobile 6' },
    { src: '/images/hero/30.jpg', alt: 'Mobile 7' },
  ], []);

  // Fallback hero images (local) if primary ones fail
  const heroFallbacks = [
    '/images/hero/17.jpg',
    '/images/hero/18.jpg', 
    '/images/hero/19.jpg'
  ];

  const [heroImages, setHeroImages] = useState(desktopHeroImages);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setHeroImages(mobile ? mobileHeroImages : desktopHeroImages);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [desktopHeroImages, mobileHeroImages]);

  // Auto-rotate hero
  useEffect(() => {
    const t = setInterval(() => setCurrentHeroSlide((p) => (p + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  const goToSlide  = (i) => setCurrentHeroSlide(i);
  const nextSlide  = () => setCurrentHeroSlide((p) => (p + 1) % heroImages.length);
  const prevSlide  = () => setCurrentHeroSlide((p) => (p - 1 + heroImages.length) % heroImages.length);

  // Fetch data
  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await DataService.getHomepageData();
      setHomepageData(data);
    } catch (e) {
      console.error('Homepage data error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1, 'M', 'Default');
  };

  // ─── Product image helper ───────────────────────────────────────────────────
  const getProductImage = (product) => {
    const src =
      product.images?.[0]?.url ||
      product.images?.[0] ||
      product.image ||
      product.imageUrl ||
      null;
    if (!src || src.includes('placeholder') || src.trim() === '') {
      return IMG_FALLBACK[product.category] || IMG_FALLBACK.default;
    }
    return src;
  };

  // ─── Collection image helper ───────────────────────────────────────────────────
  const getCollectionImage = (collection) => {
    const imageMap = {
      'cargo-collection': '/images/collections/cargo-collection.jpg',
      'casual-collection': '/images/collections/casual-collection.jpg',
      'checked-collection': '/images/collections/checked-collection.jpg',
      'denim-collection': '/images/collections/denim-collection.jpg',
      'denim': '/images/collections/denim-collection.jpg',
      'formal-collection': '/images/collections/formal-collection.jpg',
      'formal-pants': '/images/collections/formal-collection.jpg',
      'new-collection': '/images/collections/new-collection.jpg',
      'office-collection': '/images/collections/office-collection.jpg',
      'party-wear-collection': '/images/collections/party-collection.jpg',
      'polos': '/images/collections/polo-collection.jpg',
      'striped-collection': '/images/collections/striped-collection.jpg',
      'summer-collection': '/images/collections/summer-collection.jpg',
      'trousers-collection': '/images/collections/trousers-collection.jpg',
      'winter-collection': '/images/collections/winter-collection.jpg'
    };
    
    const mappedImage = imageMap[collection.slug] || 
           imageMap[collection.name?.toLowerCase().replace(/\s+/g, '-')] ||
           '/images/collections/casual-collection.jpg';
    
    return mappedImage;
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

  const currentHero = heroImages[currentHeroSlide] || heroImages[0] || desktopHeroImages[0];

  return (
    <div className="min-h-screen bg-white">

      {/* ═════════════ HERO ═════════════ */}
      <section className="relative">
        <div className="relative h-[80vh] w-full overflow-hidden">
          <SafeImg
            src={currentHero.src}
            alt={currentHero.alt}
            className="w-full h-full object-cover"
            fallback={heroFallbacks[currentHeroSlide % heroFallbacks.length]}
          />

          {/* Arrows */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all z-10">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all z-10">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {heroImages.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === currentHeroSlide ? 'bg-white scale-125' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════ MEN / KIDS CATEGORY TILES ═════════════ */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Men */}
            <Link to="/category/men" className="group relative overflow-hidden rounded-lg shadow-lg h-64 block">
              <SafeImg
                src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&auto=format&fit=crop"
                alt="Men's Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                fallback={IMG_FALLBACK.men}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-3xl font-bold text-white">Men</h3>
                <p className="text-white/80 text-sm mt-1">Premium clothing for modern man</p>
                <span className="inline-block mt-4 bg-white text-black px-5 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-gray-100">SHOP NOW</span>
              </div>
            </Link>

            {/* Kids */}
            <Link to="/category/kids" className="group relative overflow-hidden rounded-lg shadow-lg h-64 block">
              <SafeImg
                src="https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&auto=format&fit=crop"
                alt="Kids Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                fallback={IMG_FALLBACK.kids}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-3xl font-bold text-white">Kids</h3>
                <p className="text-white/80 text-sm mt-1">Fun & comfortable styles</p>
                <span className="inline-block mt-4 bg-white text-black px-5 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-gray-100">SHOP NOW</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════════ SHOP BY COLLECTION — circles ═════════════ */}
      {homepageData.collections.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Collection</h2>
              <p className="text-lg text-gray-600">Curated collections for every occasion</p>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {homepageData.collections.map((col) => (
                <div key={col._id} className="group flex flex-col items-center">
                  <Link to={`/collection/${col.slug}`} className="block mb-3">
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-gray-100 group-hover:border-gray-400">
                      <SafeImg
                        src={getCollectionImage(col)}
                        alt={col.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        fallback="/images/collections/casual-collection.jpg"
                      />
                    </div>
                  </Link>
                  <h3 className="text-sm font-semibold text-gray-900 text-center">{col.name}</h3>
                  <Link to={`/collection/${col.slug}`} className="text-xs text-gray-500 hover:text-black font-medium mt-0.5 transition-colors">
                    Explore Collection →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═════════════ SHOP BY CATEGORY ═════════════ */}
      {homepageData.categories.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-lg text-gray-600">Find exactly what you're looking for</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {homepageData.categories.map((cat) => (
                <div key={cat._id} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[3/2] overflow-hidden">
                    <SafeImg
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallback={IMG_FALLBACK[cat.slug] || IMG_FALLBACK.default}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-gray-200 text-sm mb-4">{cat.description}</p>
                    <Link to={`/category/${cat.slug}`} className="bg-white text-black px-6 py-2 text-sm font-medium hover:bg-gray-100 transition-colors inline-block">
                      SHOP NOW
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═════════════ FEATURED PRODUCTS ═════════════ */}
      {homepageData.featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Handpicked favorites from our collection</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {homepageData.featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} getImg={getProductImage} onAddToCart={handleAddToCart} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* ═════════════ NEW ARRIVALS ═════════════ */}
      {homepageData.newArrivals.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">New Arrivals</h2>
              <p className="text-lg text-gray-600">Fresh styles just landed</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {homepageData.newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} getImg={getProductImage} onAddToCart={handleAddToCart} navigate={navigate} isNew />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═════════════ VIEW ALL ═════════════ */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Link to="/shop" className="inline-flex items-center justify-center bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl">
            View All Products
          </Link>
        </div>
      </section>

      {/* ═════════════ COLLECTIONS WITH PRODUCTS ═════════════ */}
      {Object.entries(homepageData.organizedByCollections).map(([slug, data]) =>
        data.products.length > 0 && (
          <section key={slug} className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{data.collection.name}</h2>
                <p className="text-gray-600 mt-1">{data.collection.description}</p>
              </div>
              <Link to={`/collection/${slug}`} className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">VIEW ALL</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.products.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} getImg={getProductImage} onAddToCart={handleAddToCart} navigate={navigate} />
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}

// ─── Reusable Product Card ─────────────────────────────────────────────────────
function ProductCard({ product, getImg, onAddToCart, navigate, isNew = false }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fallback = IMG_FALLBACK[product.category] || IMG_FALLBACK.default;
  
  // Get all product images with better error handling
  const productImages = [];
  
  // Try different image properties and ensure they're strings
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img, index) => {
      if (index < 4) { // Only get first 4 images
        const imgSrc = typeof img === 'string' ? img : 
                     (img && typeof img.url === 'string') ? img.url : 
                     null;
        if (imgSrc) productImages.push(imgSrc);
      }
    });
  } else {
    // Fallback to single image properties
    const singleImage = product.image || product.imageUrl || null;
    if (singleImage && typeof singleImage === 'string') {
      productImages.push(singleImage);
    }
  }
  
  // Ensure we have exactly 4 images by duplicating if needed
  while (productImages.length < 4) {
    const lastImage = productImages[productImages.length - 1] || getImg(product) || fallback;
    productImages.push(lastImage);
  }
  
  // Get current selected image
  const currentImage = productImages[selectedImageIndex] || getImg(product) || fallback;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Big Image Display */}
      <div className="aspect-[3/4] overflow-hidden cursor-pointer relative" onClick={() => navigate(`/product/${product._id}`)}>
        <SafeImg
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          fallback={fallback}
        />
        {isNew && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 text-xs font-medium rounded">NEW</div>
        )}
      </div>
      
      {/* 4 Small Images Grid - Always show with indicators */}
      <div className="bg-gray-50 p-2">
        <div className="grid grid-cols-4 gap-1">
          {productImages.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`aspect-square cursor-pointer border-2 transition-all duration-200 relative ${
                selectedImageIndex === index 
                  ? 'border-black scale-105' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent navigation to product page
                setSelectedImageIndex(index);
              }}
              title={`View image ${index + 1}`}
            >
              <SafeImg
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                fallback={fallback}
              />
              {selectedImageIndex === index && (
                <div className="absolute top-1 right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-3 md:p-4">
        <h3 className="font-medium text-gray-900 mb-2 text-sm md:text-base line-clamp-2">{product.name}</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <span className="text-base font-bold text-gray-900 tabular-nums">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="ml-1 text-xs text-gray-400 line-through tabular-nums">₹{product.mrp}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="w-full shrink-0 bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 sm:w-auto"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
