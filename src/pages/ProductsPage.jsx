import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductCard from '../components/Products/ProductCard';
import AuthModal from '../components/AuthModal/AuthModal';
import GlobalProductFilters from '../components/GlobalProductFilters/GlobalProductFilters';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { filtersToSearchParams, defaultProductFilterState } from '../utils/productFilters';

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [listFilters, setListFilters] = useState({ ...defaultProductFilterState });

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const col = searchParams.get('collection') || '';
    setListFilters((prev) => ({
      ...prev,
      category: cat,
      collection: col,
    }));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = filtersToSearchParams(listFilters);
        const response = await api.get(`/products?${params.toString()}`);
        if (cancelled) return;
        if (response.data?.success) {
          setProducts(response.data.products || []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching products:', err);
          setError('Failed to fetch products');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [listFilters]);

  const getPageTitle = () => {
    const collection = searchParams.get('collection');
    const category = searchParams.get('category');

    if (collection) {
      return collection
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    if (category) {
      return category
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return 'All Products';
  };

  const handleAddToCart = (product) => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    addToCart(product, 1, undefined, undefined);
  };

  const handleQuickView = (product) => {
    navigate(`/product/${product.id || product._id}`);
  };

  const handleAddToWishlist = (product) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find((item) => item.id === (product.id || product._id));

    if (!exists) {
      wishlist.push({
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        category: product.category,
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      toast.success(`${product.name} added to wishlist!`);
    } else {
      const updatedWishlist = wishlist.filter((item) => item.id !== (product.id || product._id));
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      toast.success(`${product.name} removed from wishlist!`);
    }
  };

  const handleCompare = (product) => {
    const compare = JSON.parse(localStorage.getItem('compare') || '[]');
    if (compare.length < 4) {
      const exists = compare.find((item) => item.id === (product.id || product._id));
      if (!exists) {
        compare.push({
          id: product.id || product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          category: product.category,
        });
        localStorage.setItem('compare', JSON.stringify(compare));
        toast.success(`${product.name} added to compare!`);
      } else {
        toast.info('Product already in compare list!');
      }
    } else {
      toast.error('You can compare up to 4 products at a time!');
    }
  };

  const initialFilterSync = {
    category: searchParams.get('category') || '',
    collection: searchParams.get('collection') || '',
  };

  return (
    <div className="bg-black pt-[76px] text-white">
      <div className="bl-container py-8 md:py-10 lg:py-14">
        <header className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-white md:text-4xl">
              {getPageTitle()}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              {searchParams.get('collection') || searchParams.get('category')
                ? `Browse our ${getPageTitle().toLowerCase()} edit of premium fashion essentials.`
                : 'Explore the complete Blacklocust range for Men and Kids.'}
            </p>
          </div>
          <p className="text-xs font-semibold tracking-[0.18em] text-white/50">
            {loading ? 'LOADING PRODUCTS…' : `${products.length} ITEMS`}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[280px,minmax(0,1fr)]">
          {/* Filters sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold tracking-[0.18em] text-white/80">
                  FILTERS
                </h2>
                <button
                  type="button"
                  onClick={() => setListFilters({ ...defaultProductFilterState })}
                  className="text-[11px] font-semibold tracking-[0.16em] text-white/40 hover:text-white/70"
                >
                  CLEAR
                </button>
              </div>
              <GlobalProductFilters
                key={`${initialFilterSync.category}-${initialFilterSync.collection}`}
                initialFilters={initialFilterSync}
                onApply={setListFilters}
              />
            </div>
          </aside>

          {/* Products grid */}
          <section>
            {loading ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blacklocust-gold" />
                <p className="text-sm text-white/70">Loading products…</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
                <h3 className="font-heading text-xl text-white">Error Loading Products</h3>
                <p className="mt-2 text-sm text-white/70">{error}</p>
                <button
                  type="button"
                  onClick={() => setListFilters((f) => ({ ...f }))}
                  className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-white/80 hover:border-blacklocust-gold hover:text-blacklocust-gold"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {products.map((item) => (
                  <ProductCard
                    key={item._id || item.id}
                    product={item}
                    onAddToCart={handleAddToCart}
                    onQuickView={handleQuickView}
                    onAddToWishlist={handleAddToWishlist}
                    onCompare={handleCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <h3 className="font-heading text-xl text-white">No products found</h3>
                <p className="mt-2 max-w-md text-sm text-white/70">
                  Try adjusting your filters or explore all products to discover more from Blacklocust.
                </p>
                <button
                  type="button"
                  onClick={() => setListFilters({ ...defaultProductFilterState })}
                  className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-white/80 hover:border-blacklocust-gold hover:text-blacklocust-gold"
                >
                  RESET FILTERS
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

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

export default ProductsPage;
