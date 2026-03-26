import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from '../components/Products/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';
import api from '../api/axios';
import './CollectionPage.css';

const CollectionPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Safely get cart context
  let addToCart = () => {};
  try {
    const cartContext = useCart();
    addToCart = cartContext.addToCart || (() => {});
  } catch (error) {
    console.warn('Cart context not available:', error);
  }
  
  // Safely get wishlist context
  let wishlist = [];
  let addToWishlist = () => {};
  let removeFromWishlist = () => {};
  
  try {
    const wishlistContext = useWishlist();
    wishlist = wishlistContext.wishlist || [];
    addToWishlist = wishlistContext.addToWishlist || (() => {});
    removeFromWishlist = wishlistContext.removeFromWishlist || (() => {});
  } catch (error) {
    console.warn('Wishlist context not available:', error);
  }
  const [products, setProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });

  // Handler functions
  const handleAddToCart = (product) => {
    try {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleToggleWishlist = (product) => {
    try {
      const isInWishlist = wishlist && wishlist.some && wishlist.some(item => item._id === product._id);
      if (isInWishlist) {
        removeFromWishlist(product._id);
        toast.success(`${product.name} removed from wishlist!`);
      } else {
        addToWishlist(product);
        toast.success(`${product.name} added to wishlist!`);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleQuickView = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchCollectionData();
  }, [slug]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching collection data for slug:', slug);
      
      // First, get all collections to find the one by slug
      const collectionsResponse = await api.get('/api/collections?showInNavbar=true&isActive=true');
      console.log('🔍 Collections response:', collectionsResponse.data);
      
      if (collectionsResponse.data && collectionsResponse.data.collections) {
        const allCollections = collectionsResponse.data.collections || [];
        const collection = allCollections.find(c => c.slug === slug);
        
        console.log('🔍 Found collection:', collection);
        
        if (collection) {
          setCollection(collection);
          
          // Fetch collection products using the collection ID
          console.log('🔍 About to fetch products for collection ID:', collection._id);
          
          try {
            const productsResponse = await api.get(`/api/collections/${collection._id}/products?page=1&limit=20`);
            console.log('🔍 Products API response:', productsResponse.data);
            
            // Handle different response structures
            let products = [];
            let pagination = { current: 1, pages: 1, total: 0, limit: 20 };
            
            if (productsResponse.data) {
              if (productsResponse.data.success && productsResponse.data.products) {
                // Standard response format
                products = productsResponse.data.products;
                pagination = productsResponse.data.pagination || pagination;
              } else if (Array.isArray(productsResponse.data)) {
                // Direct array response
                products = productsResponse.data;
                pagination.total = products.length;
              } else if (productsResponse.data.products) {
                // Products property without success flag
                products = productsResponse.data.products;
                pagination.total = products.length;
              }
            }
            
            console.log('🔍 Setting products array:', products.length, 'items');
            console.log('🔍 Products details:', products.map(p => ({ name: p.name, id: p._id })));
            
            setProducts(products);
            setPagination(pagination);
            console.log('🔍 Products set successfully:', products.length);
            
          } catch (productsError) {
            console.error('Error fetching products:', productsError);
            // Try fallback - get all products and filter by collection
            try {
              console.log('🔍 Trying fallback: fetch all products and filter');
              const allProductsResponse = await api.get('/api/products');
              if (allProductsResponse.data && allProductsResponse.data.products) {
                const filteredProducts = allProductsResponse.data.products.filter(
                  product => product.collection === collection._id || 
                             (product.collection && product.collection._id === collection._id)
                );
                console.log('🔍 Fallback found products:', filteredProducts.length);
                setProducts(filteredProducts);
                setPagination({
                  current: 1,
                  pages: 1,
                  total: filteredProducts.length,
                  limit: 20
                });
              }
            } catch (fallbackError) {
              console.error('Fallback also failed:', fallbackError);
              setProducts([]);
            }
          }
        } else {
          console.error('Collection not found with slug:', slug);
          console.error('Available collections:', allCollections.map(c => ({ name: c.name, slug: c.slug })));
          setProducts([]);
        }
      } else {
        console.error('Invalid collections response:', collectionsResponse.data);
        setProducts([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch collection data:', error);
      setProducts([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="collection-page">
        <div className="collection-loading">
          <div className="loading-spinner"></div>
          <p>Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="collection-page">
      {/* Collection Hero Section */}
      <div className="collection-hero">
        <div className="hero-content">
          <h1>{collection?.name || 'Collection'}</h1>
          <p>{collection?.description || 'Discover our premium collection'}</p>
          <div className="collection-stats">
            <div className="stat">
              <span className="stat-number">{pagination.total}</span>
              <span className="stat-label">Products</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Collection Content */}
      <div className="container">
        {/* Products Grid */}
        <div className="collection-products">
          {products.length === 0 ? (
            <div className="collection-empty">
              <h3>No products found</h3>
              <p>This collection doesn't have any products yet. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={{
                      ...product,
                      id: product._id,
                      image: product.images?.[0]?.url || '/placeholder-image.jpg',
                      originalPrice: product.price * 1.2, // Add some markup for original price
                      discount: Math.round(((product.price * 1.2 - product.price) / (product.price * 1.2)) * 100),
                      // Add new fields for display
                      skuCode: product.skuCode,
                      availability: product.availability,
                      h1Heading: product.h1Heading
                    }}
                    onAddToCart={() => handleAddToCart(product)}
                    onToggleWishlist={() => handleToggleWishlist(product)}
                    onQuickView={() => handleQuickView(product._id)}
                    isInWishlist={wishlist && wishlist.some ? wishlist.some(w => w._id === product._id) : false}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={pagination.current === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  <button 
                    disabled={pagination.current === pagination.pages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
