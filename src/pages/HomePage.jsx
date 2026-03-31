import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductCard from '../components/Products/ProductCard';
import AuthModal from '../components/AuthModal/AuthModal';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // Hero images array
  const heroImages = useMemo(() => [
    {
      src: '/images/hero/15.jpg',
      alt: 'Black Locust Premium Fashion Collection 1',
      title: 'Elevate Your Style',
      subtitle: 'Discover our latest premium collection'
    },
    {
      src: '/images/hero/16.jpg',
      alt: 'Black Locust Premium Fashion Collection 2',
      title: 'Timeless Elegance',
      subtitle: 'Classic designs with modern sophistication'
    },
    {
      src: '/images/hero/17.jpg',
      alt: 'Black Locust Premium Fashion Collection 3',
      title: 'Premium Quality',
      subtitle: 'Crafted with attention to every detail'
    },
    {
      src: '/images/hero/18.jpg',
      alt: 'Black Locust Premium Fashion Collection 4',
      title: 'Modern Luxury',
      subtitle: 'Contemporary style meets comfort'
    },
    {
      src: '/images/hero/19.jpg',
      alt: 'Black Locust Premium Fashion Collection 5',
      title: 'Sophisticated Design',
      subtitle: 'Where fashion meets functionality'
    }
  ], []);

  // Auto-rotate hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

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

  // Initialize products and categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const data = response.data;

      if (data.success) {
        setProducts(data.products || []);
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

  const newArrivals = useMemo(
    () => products.filter((p) => p.isNewArrival).slice(0, 8),
    [products]
  );
  const trending = useMemo(
    () => products.filter((p) => p.isTrending).slice(0, 8),
    [products]
  );

  const currentHeroImage = heroImages[currentHeroSlide];

  return (
    <div className="pt-[76px]">
      {/* HERO CAROUSEL */}
      <section className="relative">
        <div className="relative h-[560px] w-full overflow-hidden md:h-[640px]">
          {/* Hero Image */}
          <img
            src={currentHeroImage.src}
            alt={currentHeroImage.alt}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
            loading="eager"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0">
            <div className="bl-container h-full">
              <div className="flex h-full max-w-2xl flex-col justify-center">
                <Badge tone="neutral" className="w-fit border-white/15">
                  PREMIUM MEN & KIDS
                </Badge>
                <h1 className="mt-4 font-heading text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                  {currentHeroImage.title}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/75 md:text-lg">
                  {currentHeroImage.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button onClick={() => navigate('/products')} variant="primary">
                    SHOP NOW
                  </Button>
                  <Button onClick={() => navigate('/new-arrivals')} variant="outline">
                    NEW ARRIVALS
                  </Button>
                </div>
                <div className="mt-10 flex items-center gap-6 text-xs font-semibold tracking-[0.18em] text-white/60">
                  <span>FREE SHIPPING*</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>EASY RETURNS</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>SECURE PAYMENTS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Navigation */}
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white transition hover:bg-white/30 md:left-6"
            aria-label="Previous slide"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white transition hover:bg-white/30 md:right-6"
            aria-label="Next slide"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all md:h-3 md:w-3 ${
                  index === currentHeroSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bl-section">
        <div className="bl-container">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-white md:text-4xl">Shop Collections</h2>
              <p className="mt-2 text-sm text-white/60">Curated edits for every style and occasion.</p>
            </div>
            <Link className="bl-link text-sm font-semibold tracking-[0.14em]" to="/collections">
              VIEW ALL
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {categories.slice(0, 2).map((category) => (
              <Link
                key={category._id}
                to="/products"
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-luxe transition duration-300 ease-out hover:scale-[1.02]"
              >
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                </div>
                <div className="relative p-6 md:p-8">
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral" className="border-white/20">
                      {category.name.toUpperCase().includes('KID') ? 'KIDS' : 'MEN'}
                    </Badge>
                    <Badge tone="sale" className="opacity-95">
                      NEW DROP
                    </Badge>
                  </div>
                  <h3 className="mt-4 font-heading text-2xl font-semibold text-white md:text-3xl">
                    {category.name}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-white/70">{category.description}</p>
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.14em] text-blacklocust-gold">
                      SHOP NOW <span className="transition group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="bl-section pt-0">
        <div className="bl-container">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-white md:text-4xl">New Arrivals</h2>
              <p className="mt-2 text-sm text-white/60">Fresh edits. Premium finish.</p>
            </div>
            <Link className="bl-link text-sm font-semibold tracking-[0.14em]" to="/new-arrivals">
              VIEW ALL
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(newArrivals.length ? newArrivals : products.slice(0, 8)).map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onQuickView={() => navigate(`/product/${product._id || product.id}`)}
                onAddToWishlist={() => handleToggleWishlist(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING TAGS */}
      <section className="bl-section pt-0">
        <div className="bl-container">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">Trending Now</h2>
                <p className="mt-2 text-sm text-white/60">Quick picks designed for conversion.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="rounded-full border border-white/15 bg-transparent px-5 py-2 text-xs font-semibold tracking-[0.16em] text-white/80 transition hover:border-blacklocust-gold hover:text-blacklocust-gold"
                >
                  BEST SELLER
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="rounded-full border border-white/15 bg-transparent px-5 py-2 text-xs font-semibold tracking-[0.16em] text-white/80 transition hover:border-blacklocust-gold hover:text-blacklocust-gold"
                >
                  UNDER ₹999
                </button>
              </div>
            </div>
            {trending.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {trending.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onQuickView={() => navigate(`/product/${product._id || product.id}`)}
                    onAddToWishlist={() => handleToggleWishlist(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="bl-section pt-0">
        <div className="bl-container">
          <div className="grid gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:grid-cols-2 md:p-10">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1600&q=80&auto=format&fit=crop"
                alt="Brand story"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-center">
              <Badge tone="neutral" className="w-fit border-white/15">
                OUR STORY
              </Badge>
              <h2 className="mt-4 font-heading text-3xl font-semibold text-white md:text-4xl">
                Made for a premium global wardrobe.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/65">
                Blacklocust is built on luxury minimalism—clean silhouettes, elevated fabrics, and a fit-first approach.
                Every detail is designed to feel expensive and effortless.
              </p>
              <div className="mt-6">
                <Button as={Link} to="/about" variant="outline">
                  READ MORE
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bl-section pt-0">
        <div className="bl-container">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-white md:text-4xl">Loved by Customers</h2>
            <p className="mt-2 text-sm text-white/60">High trust, high conversion.</p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Aman', text: 'Premium feel and perfect fit. Packaging looked luxury.' },
              { name: 'Rohit', text: 'Fast delivery. The fabric quality is way above the price.' },
              { name: 'Neha', text: 'Bought kids sets—super comfortable and stylish.' },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:translate-y-[-2px]"
              >
                <div className="flex items-center gap-1 text-blacklocust-gold">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-sm">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-white/70">“{t.text}”</p>
                <div className="mt-6 text-xs font-semibold tracking-[0.18em] text-white/60">
                  {t.name.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
}

export default HomePage;
