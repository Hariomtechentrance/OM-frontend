import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import ProductReviews from '../components/ProductReviews/ProductReviews';

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

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      // MongoDB ObjectIds are 24 hex chars; demo fallbacks used "1","2","4" and always 404 on the API.
      if (id && !/^[a-fA-F0-9]{24}$/.test(String(id))) {
        toast.error('This product link is invalid. Use Shop or Collections so the URL contains a real product id.');
        setProduct(null);
        setLoading(false);
        return;
      }
      const response = await api.get(`/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.product);
        
        // Fetch related products (same category or collection)
        try {
          const allProductsResponse = await api.get('/products');
          if (allProductsResponse.data.success) {
            const allProducts = allProductsResponse.data.products || [];
            const currentProduct = response.data.product;
            
            // Filter related products (same category, collection, or exclude current product)
            let related = allProducts.filter(p => {
              // Exclude current product
              if (p._id === currentProduct._id) return false;
              
              // Check if same collection (most products have collections)
              if (currentProduct.collection && p.collection) {
                if (typeof currentProduct.collection === 'object' && typeof p.collection === 'object') {
                  if (currentProduct.collection._id === p.collection._id) return true;
                }
              }
              
              // Check if same category (some products have categories)
              if (currentProduct.category && p.category) {
                if (typeof currentProduct.category === 'object' && typeof p.category === 'object') {
                  if (currentProduct.category._id === p.category._id) return true;
                }
                if (typeof currentProduct.category === 'string' && typeof p.category === 'string') {
                  if (currentProduct.category === p.category) return true;
                }
              }
              
              return false;
            });
            
            // Debug logging
            console.log('Current product:', currentProduct.name, 'Collection:', currentProduct.collection?.name, 'Category:', currentProduct.category?.name);
            console.log('Found related products:', related.length);
            
            // If no related products found, show some random products as fallback
            if (related.length === 0) {
              console.log('No related products found, using random fallback');
              const otherProducts = allProducts.filter(p => p._id !== currentProduct._id);
              // Shuffle and take first 4
              related = otherProducts.sort(() => 0.5 - Math.random()).slice(0, 4);
            }
            
            // Take first 4 related products
            setRelatedProducts(related.slice(0, 4));
          }
        } catch (error) {
          console.error('Error fetching related products:', error);
          // If error, set empty array
          setRelatedProducts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // ─── Helper to get product image ───────────────────────────────────────────────
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      return typeof img === 'string' ? img : img.url;
    }
    return product.image || product.imageUrl || IMG_FALLBACK.default;
  };

  // ─── Helper to handle related product click ───────────────────────────────────────
  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };
  const getProductImages = (product) => {
    const images = [];
    
    // Try different image properties and ensure they're strings
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img, index) => {
        if (index < 4) { // Only get first 4 images
          const imgSrc = typeof img === 'string' ? img : 
                         (img && typeof img.url === 'string') ? img.url : 
                         null;
          if (imgSrc) images.push(imgSrc);
        }
      });
    } else {
      // Fallback to single image properties
      const singleImage = product.image || product.imageUrl || null;
      if (singleImage && typeof singleImage === 'string') {
        images.push(singleImage);
      }
    }
  
    // Ensure we have exactly 4 images by duplicating if needed
    while (images.length < 4) {
      const lastImage = images[images.length - 1] || IMG_FALLBACK[product.category] || IMG_FALLBACK.default;
      images.push(lastImage);
    }
    
    return images;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const cartItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity
    };

    addToCart(cartItem);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const cartItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity
    };

    addToCart(cartItem);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);
  const fallback = IMG_FALLBACK[product.category] || IMG_FALLBACK.default;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="breadcrumb">
          <button onClick={() => navigate('/')} className="hover:text-black">Home</button>
          <span className="separator">/</span>
          <button onClick={() => navigate('/products')} className="hover:text-black">Products</button>
          <span className="separator">/</span>
          <span className="current" title={product.name}>
            {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
          </span>
        </nav>
      </div>
      
      {/* Product Detail Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] overflow-hidden bg-gray-50 rounded-lg">
              <SafeImg
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                fallback={fallback}
              />
            </div>
            
            {/* 4 Small Images Grid - Always show */}
            <div className="bg-gray-50 p-2">
              <div className="grid grid-cols-4 gap-1">
                {productImages.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square cursor-pointer border-2 transition-all duration-200 relative ${
                      currentImageIndex === index 
                        ? 'border-black scale-105' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={(e) => {
                      setCurrentImageIndex(index);
                    }}
                    title={`View image ${index + 1}`}
                  >
                    <SafeImg
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      fallback={fallback}
                    />
                    {currentImageIndex === index && (
                      <div className="absolute top-1 right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Name and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`text-lg ${s <= Math.round(Number(product.rating) || 0) ? 'text-black' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
                <a
                  href="#product-reviews"
                  className="text-sm text-gray-500 hover:text-black ml-1"
                >
                  ({product.numReviews ?? 0} reviews)
                </a>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                {product.mrp && (
                  <span className="text-lg text-gray-500 line-through">₹{product.mrp}</span>
                )}
                {product.mrp && (
                  <span className="text-sm text-green-600 font-medium">
                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'Premium quality product crafted with attention to detail. Perfect for any occasion.'}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Color</h3>
              <div className="flex space-x-2">
                {['Black', 'White', 'Navy', 'Gray', 'Blue'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:border-black"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:border-black"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                ADD TO CART
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full border border-black text-black py-3 rounded-md font-medium hover:bg-black hover:text-white transition-colors"
              >
                BUY NOW
              </button>
            </div>

            {/* Product Features */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>Brand</span>
                  <span className="font-medium">Black Locust</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>Material</span>
                  <span className="font-medium">Premium Cotton</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>Fit</span>
                  <span className="font-medium">Regular Fit</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>Care</span>
                  <span className="font-medium">Machine Wash</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Country of Origin</span>
                  <span className="font-medium">India</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8-4m8-4l8 4m0-10l-8 4m8 4l8 4m0-10v10" />
                  </svg>
                  <p className="text-xs text-gray-600">Free Shipping</p>
                </div>
                <div>
                  <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8M0 0l4 4m-4-4v4m0 0V8a4 4 0 014-4h4a4 4 0 014 4v0" />
                  </svg>
                  <p className="text-xs text-gray-600">15 Days Return</p>
                </div>
                <div>
                  <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs text-gray-600">Secure Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <ProductReviews productId={id} onReviewsChanged={fetchProduct} />
      </div>

      {/* Related Products */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer" onClick={() => handleRelatedProductClick(relatedProduct._id)}>
                <div className="aspect-[3/4] overflow-hidden">
                  <SafeImg
                    src={getProductImage(relatedProduct)}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    fallback={IMG_FALLBACK[relatedProduct.category] || IMG_FALLBACK.default}
                  />
                  {(relatedProduct.isNewArrival || relatedProduct.newArrival) && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 text-xs font-medium rounded">NEW</div>
                  )}
                  {(relatedProduct.isFeatured || relatedProduct.featured) && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-0.5 text-xs font-medium rounded">FEATURED</div>
                  )}
                  {relatedProduct.mrp && relatedProduct.mrp > relatedProduct.price && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 text-xs font-medium rounded">
                      {Math.round(((relatedProduct.mrp - relatedProduct.price) / relatedProduct.mrp) * 100)}% OFF
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{relatedProduct.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900">₹{relatedProduct.price}</span>
                      {relatedProduct.mrp && (
                        <span className="text-sm text-gray-500 line-through ml-1">₹{relatedProduct.mrp}</span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation to product page
                        handleAddToCart(relatedProduct);
                      }}
                      className="bg-black text-white px-3 py-1 text-sm hover:bg-gray-800 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No related products found</h3>
            <p className="text-gray-600 mb-6">Check out our other collections</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to continue with your purchase.</p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
