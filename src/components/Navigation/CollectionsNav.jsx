import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/axios'; // ✅ FIXED: Use shared axios instance
import './CollectionsNav.css';

const CollectionsNav = () => {
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
    
    // Listen for storage changes to update collections when new ones are added from admin
    const handleStorageChange = (e) => {
      if (e.key === 'collections') {
        fetchCategories();
      }
    };
    
    // Also check periodically for new collections (fallback)
    const interval = setInterval(() => {
      fetchCategories();
    }, 5000); // Check every 5 seconds
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/categories/navbar"); // ✅ FIXED: Use proxy instead of hardcoded URL
      const data = res.data;
      
      if (data.success) {
        setCollections(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch navbar categories:', error);
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.closest('.collections-dropdown') === null) {
      setCollectionsOpen(false);
    }
  };

  useEffect(() => {
    if (collectionsOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [collectionsOpen]);

  return (
    <div className="collections-dropdown">
      <button 
        className={`collections-toggle ${collectionsOpen ? 'active' : ''}`}
        onClick={() => setCollectionsOpen(!collectionsOpen)}
      >
        Collections
      </button>
      
      {collectionsOpen && (
        <div className="collections-menu">
          {collections.map(cat => (
            <Link 
              key={cat._id} 
              to={`/collection/${cat._id}`}
              className="collection-link"
              onClick={() => setCollectionsOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsNav;
