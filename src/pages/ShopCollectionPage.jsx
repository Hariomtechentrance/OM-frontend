import React, { useState, useEffect } from 'react';
import ProductCard from '../components/Products/ProductCard';
import { formatPrice } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import './ShopCollectionPage.css';

const ShopCollectionPage = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      // Only show loading on initial load, not refreshes
      if (initialLoad) {
        setLoading(true);
      }
      
      // Sample collections data
      const sampleCollections = [
        {
          _id: '1',
          name: 'Premium Cotton Collection',
          category: 'premium',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
          description: 'Luxurious cotton pieces for everyday elegance',
          rating: 4.9,
          featured: true,
          collection: 'premium'
        },
        {
          _id: '2',
          name: 'Denim Essentials',
          category: 'denim',
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600',
          description: 'Timeless denim pieces for modern style',
          rating: 4.8,
          featured: true,
          collection: 'denim'
        },
        {
          _id: '3',
          name: 'Urban Streetwear',
          category: 'streetwear',
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
          description: 'Edgy streetwear for the modern urbanite',
          rating: 4.7,
          featured: true,
          collection: 'streetwear'
        },
        {
          _id: '4',
          name: 'Formal Excellence',
          category: 'formal',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
          description: 'Sophisticated formal wear for professionals',
          rating: 4.9,
          featured: true,
          collection: 'formal'
        },
        {
          _id: '5',
          name: 'Athletic Performance',
          category: 'sports',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
          description: 'High-performance athletic wear for active lifestyles',
          rating: 4.6,
          featured: false,
          collection: 'sports'
        },
        {
          _id: '6',
          name: 'Minimalist Basics',
          category: 'minimal',
          image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
          description: 'Clean, minimalist pieces for versatile styling',
          rating: 4.8,
          featured: false,
          collection: 'minimal'
        },
        {
          _id: '7',
          name: 'Vintage Revival',
          category: 'vintage',
          image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
          description: 'Retro-inspired pieces with modern comfort',
          rating: 4.7,
          featured: false,
          collection: 'vintage'
        },
        {
          _id: '8',
          name: 'Sustainable Fashion',
          category: 'eco',
          image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600',
          description: 'Eco-friendly fashion for conscious consumers',
          rating: 4.9,
          featured: true,
          collection: 'eco'
        },
        {
          _id: '9',
          name: 'Business Casual',
          category: 'business',
          image: 'https://images.unsplash.com/photo-1554568218-0f585de2e08c?w=600',
          description: 'Professional yet comfortable for modern workplaces',
          rating: 4.8,
          featured: false,
          collection: 'business'
        },
        {
          _id: '10',
          name: 'Weekend Comfort',
          category: 'casual',
          image: 'https://images.unsplash.com/photo-1517891905240-472988babdf9?w=600',
          description: 'Relaxed pieces for perfect weekend vibes',
          rating: 4.6,
          featured: false,
          collection: 'casual'
        },
        {
          _id: '11',
          name: 'Evening Elegance',
          category: 'evening',
          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
          description: 'Sophisticated evening wear for special occasions',
          rating: 4.9,
          featured: true,
          collection: 'evening'
        },
        {
          _id: '12',
          name: 'Travel Essentials',
          category: 'travel',
          image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600',
          description: 'Comfortable and stylish pieces for your journeys',
          rating: 4.7,
          featured: false,
          collection: 'travel'
        }
      ];
      
      setCollections(sampleCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  };

  const handleExploreCollection = (collectionType) => {
    navigate(`/products?category=${collectionType}`);
  };

  const handleQuickView = (collectionType) => {
    navigate(`/products?category=${collectionType}&view=quick`);
  };

  const filteredCollections = selectedCollection === 'all' 
    ? collections 
    : collections.filter(collection => collection.collection === selectedCollection);

  // Return loading state with same layout structure (only on initial load)
  if (loading && initialLoad) {
    return (
      <div className="shop-collection-page">
        <div className="hero-section">
          <div className="hero-content">
            <div className="collection-icon">👔</div>
            <h1>SHOP COLLECTIONS</h1>
            <p>Curated collections for every style and occasion</p>
            <div className="collection-stats">
              <div className="stat">
                <span className="stat-number">12</span>
                <span className="stat-label">Collections</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Quality</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="collection-filters">
            <button className="filter-btn active">All Collections</button>
            <button className="filter-btn">Premium</button>
            <button className="filter-btn">Denim</button>
            <button className="filter-btn">Streetwear</button>
            <button className="filter-btn">Formal</button>
            <button className="filter-btn">Sports</button>
            <button className="filter-btn">Minimal</button>
            <button className="filter-btn">Eco-Friendly</button>
          </div>

          <div className="collections-grid">
            {/* Loading skeleton cards */}
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="collection-card loading-skeleton">
                <div className="collection-badge">LOADING</div>
                <div className="collection-image">
                  <div className="skeleton-loader"></div>
                </div>
                <div className="collection-info">
                  <h3><div className="skeleton-loader"></div></h3>
                  <p><div className="skeleton-loader"></div></p>
                  <div className="collection-meta">
                    <div className="collection-rating">
                      <span className="rating-text">⭐ Loading...</span>
                    </div>
                    <div className="collection-price">
                      Starting from Loading...
                    </div>
                  </div>
                  <div className="collection-actions">
                    <button className="explore-btn" disabled>Loading...</button>
                    <button className="quick-view-btn" disabled>Loading...</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-collection-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="collection-icon">👔</div>
          <h1>SHOP COLLECTIONS</h1>
          <p>Curated collections for every style and occasion</p>
          <div className="collection-stats">
            <div className="stat">
              <span className="stat-number">12</span>
              <span className="stat-label">Collections</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Quality</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="collection-filters">
          <button 
            className={`filter-btn ${selectedCollection === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCollection('all')}
          >
            All Collections
          </button>
          <button 
            className={`filter-btn ${selectedCollection === 'premium' ? 'active' : ''}`}
            onClick={() => setSelectedCollection('premium')}
          >
            Premium
          </button>
          <button 
            className={`filter-btn ${selectedCollection === 'denim' ? 'active' : ''}`}
            onClick={() => setSelectedCollection('denim')}
          >
            Denim
          </button>
          <button 
            className={`filter-btn ${selectedCollection === 'streetwear' ? 'active' : ''}`}
            onClick={() => setSelectedCollection('streetwear')}
          >
            Streetwear
          </button>
          <button 
            className={`filter-btn ${selectedCollection === 'formal' ? 'active' : ''}`}
            onClick={() => setSelectedCollection('formal')}
          >
            Formal
          </button>
          <button 
            className={`filter-btn ${selectedCollection === 'sports' ? 'active' : ''}`}
            onClick={() => setSelectedCollection('sports')}
          >
            Sports
          </button>
          <button 
            className={`filter-btn ${selectedCollection === 'minimal' ? 'active' : ''}`}
            onClick={() => setSelectedCollection('minimal')}
          >
            Minimal
          </button>
          <button 
            className={`filter-btn ${selectedCollection === 'eco' ? 'active' : ''}`}
            onClick={() => setSelectedCollection('eco')}
          >
            Eco-Friendly
          </button>
        </div>

        <div className="collections-grid">
          {filteredCollections.map(collection => (
            <div key={collection._id} className="collection-card">
              <div className="collection-badge">
                {collection.collection.toUpperCase()}
              </div>
              <div className="collection-image">
                <img src={collection.image} alt={collection.name} />
              </div>
              <div className="collection-info">
                <h3>{collection.name}</h3>
                <p>{collection.description}</p>
                <div className="collection-meta">
                  <div className="collection-rating">
                    <span className="rating-text">⭐ {collection.rating}</span>
                  </div>
                  <div className="collection-price">
                    Starting from {formatPrice(1999)}
                  </div>
                </div>
                <div className="collection-actions">
                  <button 
                    className="explore-btn" 
                    onClick={() => handleExploreCollection(collection.collection)}
                  >
                    Explore Collection
                  </button>
                  <button 
                    className="quick-view-btn"
                    onClick={() => handleQuickView(collection)}
                  >
                    Quick View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="collection-highlights">
          <h2>Collection Highlights</h2>
          <div className="highlights-grid">
            <div className="highlight-card">
              <div className="highlight-icon">🏆</div>
              <h3>Premium Quality</h3>
              <p>Only the finest materials and craftsmanship</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">🌍</div>
              <h3>Sustainable Fashion</h3>
              <p>Eco-friendly options for conscious consumers</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">🎨</div>
              <h3>Unique Designs</h3>
              <p>Exclusive patterns and modern aesthetics</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">👔</div>
              <h3>Perfect Fit</h3>
              <p>Tailored for comfort and style</p>
            </div>
          </div>
        </div>

        <div className="style-guide">
          <h2>Find Your Style</h2>
          <div className="style-quiz">
            <p>Not sure which collection is right for you?</p>
            <button className="style-quiz-btn">Take Style Quiz</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCollectionPage;
