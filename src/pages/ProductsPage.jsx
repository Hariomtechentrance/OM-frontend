import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import DataService from '../services/dataService';

function ProductsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await DataService.getHomepageData();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (filterBy !== 'all') {
      if (filterBy === 'new') {
        filtered = filtered.filter(p => p.isNewArrival || p.newArrival);
      } else if (filterBy === 'sale') {
        filtered = filtered.filter(p => p.mrp && p.mrp > p.price);
      } else if (filterBy === 'featured') {
        filtered = filtered.filter(p => p.isFeatured || p.featured);
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = DataService.searchProducts(filtered, searchQuery);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filterBy, sortBy, searchQuery]);

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
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-lg text-gray-600">Discover our complete collection</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Products</option>
              <option value="new">New Arrivals</option>
              <option value="sale">On Sale</option>
              <option value="featured">Featured</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-48 h-48 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => handleProductClick(product._id)}>
                    <div className="relative w-full h-full">
                      <img
                        src={product.images?.[0]?.url || "/images/placeholder.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                      />
                      {(product.isNewArrival || product.newArrival) && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
                          NEW
                        </div>
                      )}
                      {(product.isFeatured || product.featured) && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs font-medium rounded">
                          FEATURED
                        </div>
                      )}
                      {product.mrp && product.mrp > product.price && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded">
                          {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2 cursor-pointer hover:text-black" onClick={() => handleProductClick(product._id)}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.description || 'High-quality product from Black Locust collection'}
                      </p>
                      
                      {/* Product Meta */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.category && typeof product.category === 'object' && product.category.name && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {product.category.name}
                          </span>
                        )}
                        {product.category && typeof product.category === 'string' && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        )}
                        {product.brand && typeof product.brand === 'object' && product.brand.name && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {product.brand.name}
                          </span>
                        )}
                        {product.brand && typeof product.brand === 'string' && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {product.brand}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                        {product.mrp && (
                          <span className="text-sm text-gray-500 line-through ml-2">₹{product.mrp}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-black text-white px-6 py-2 text-sm hover:bg-gray-800 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setFilterBy('all');
                setSortBy('name');
                setSearchQuery('');
              }}
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
