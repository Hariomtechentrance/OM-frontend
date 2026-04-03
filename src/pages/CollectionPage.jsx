import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import DataService from '../services/dataService';
import { FaFilter, FaTimes } from 'react-icons/fa';

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
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-gray-900">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{product.mrp}</span>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-black text-white px-3 py-1.5 text-xs hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function CollectionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchCollectionData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data using DataService
      const data = await DataService.getHomepageData();
      
      // Find the collection by slug
      const foundCollection = data.collections.find(c => c.slug === slug);
      if (!foundCollection) {
        setCollection(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      // Filter products by collection
      const collectionProducts = data.products.filter(product => {
        if (product.collection && typeof product.collection === 'object') {
          return product.collection.slug === slug;
        }
        return false;
      });

      setCollection(foundCollection);
      setProducts(collectionProducts);
    } catch (error) {
      console.error('Error fetching collection data:', error);
      setCollection(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCollectionData();
  }, [fetchCollectionData]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  // ─── Helper to get product image ───────────────────────────────────────────────
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      return typeof img === 'string' ? img : img.url;
    }
    return product.image || product.imageUrl || IMG_FALLBACK.default;
  };

  const sortProducts = (products) => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  const filteredProducts = products.filter(product => {
    if (filterBy === 'all') return true;
    if (filterBy === 'new') return product.isNewArrival || product.newArrival;
    if (filterBy === 'sale') return product.mrp && product.mrp > product.price;
    return true;
  });

  const displayedProducts = sortProducts(filteredProducts);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Collection Header */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src={collection.image}
          alt={collection.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{collection.name}</h1>
            <p className="text-xl md:text-2xl">{collection.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top controls: filter button below banner on the right */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{displayedProducts.length} Products</h2>
            <p className="text-sm text-gray-600">From {collection.name}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              <FaFilter className="text-sm" />
              <span className="text-sm font-medium">Filters</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-12 z-20 w-72 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Filter & Sort</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-700"
                    aria-label="Close filters"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter By</label>
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="all">All Products</option>
                      <option value="new">New Arrivals</option>
                      <option value="sale">On Sale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setFilterBy('all');
                      setSortBy('name');
                    }}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
            {/* Products Grid */}
            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    getImg={getProductImage}
                    onAddToCart={handleAddToCart}
                    navigate={navigate}
                    isNew={product.isNewArrival || product.newArrival}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.318 2.293M7 13l10 0m-10 0a2 2 0 00-2 2v0a2 2 0 002 2h0a2 2 0 002-2v0a2 2 0 00-2-2h0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or check back later</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default CollectionPage;
