import api from '../api/axios';

// Data fetching service for collections and categories
class DataService {
  // Fetch all products with collection and category info
  static async fetchAllProducts() {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, products: [] };
    }
  }

  // Fetch all categories
  static async fetchCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, categories: [] };
    }
  }

  // Fetch all collections
  static async fetchCollections() {
    try {
      const response = await api.get('/collections');
      return response.data;
    } catch (error) {
      console.error('Error fetching collections:', error);
      return { success: false, collections: [] };
    }
  }

  // Organize products by categories
  static organizeByCategories(products, categories) {
    const organized = {};
    
    categories.forEach(category => {
      organized[category.slug] = {
        category,
        products: products.filter(product => 
          product.category === category.slug || 
          product.categoryId === category._id ||
          product.categoryName === category.name
        )
      };
    });

    return organized;
  }

  // Organize products by collections
  static organizeByCollections(products, collections) {
    const organized = {};
    
    collections.forEach(collection => {
      organized[collection.slug] = {
        collection,
        products: products.filter(product => {
          // Handle both populated collection object and collection ID
          if (product.collection && typeof product.collection === 'object') {
            // Collection is populated - match by _id or slug
            return product.collection._id === collection._id || 
                   product.collection.slug === collection.slug;
          } else {
            // Collection is just an ID - match by ID
            return product.collection === collection._id;
          }
        })
      };
    });

    return organized;
  }

  // Get featured products
  static getFeaturedProducts(products, limit = 8) {
    return products
      .filter(product => product.isFeatured || product.featured)
      .slice(0, limit);
  }

  // Get new arrivals
  static getNewArrivals(products, limit = 8) {
    return products
      .filter(product => product.isNewArrival || product.newArrival)
      .slice(0, limit);
  }

  // Get trending products
  static getTrendingProducts(products, limit = 8) {
    return products
      .filter(product => product.isTrending || product.trending)
      .slice(0, limit);
  }

  // Get products by price range
  static getProductsByPriceRange(products, minPrice, maxPrice) {
    return products.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
  }

  // Search products
  static searchProducts(products, query) {
    const searchTerm = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.categoryName?.toLowerCase().includes(searchTerm) ||
      product.collectionName?.toLowerCase().includes(searchTerm)
    );
  }

  // Get all organized data for homepage
  static async getHomepageData() {
    try {
      const [productsResponse, categoriesResponse, collectionsResponse] = await Promise.all([
        this.fetchAllProducts(),
        this.fetchCategories(),
        this.fetchCollections()
      ]);

      const products = productsResponse.products || [];
      const categories = categoriesResponse.categories || [];
      const collections = collectionsResponse.collections || [];

      return {
        products,
        categories,
        collections,
        organizedByCategories: this.organizeByCategories(products, categories),
        organizedByCollections: this.organizeByCollections(products, collections),
        featuredProducts: this.getFeaturedProducts(products),
        newArrivals: this.getNewArrivals(products),
        trendingProducts: this.getTrendingProducts(products)
      };
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      throw error;
    }
  }
}

export default DataService;
