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
      // Return default products if API fails
      return {
        success: true,
        products: [
          {
            _id: '1',
            name: 'Classic White Shirt',
            price: 1299,
            mrp: 1999,
            description: 'Premium cotton white shirt perfect for any occasion',
            image: 'https://images.unsplash.com/photo-1596755066917-39f4b7b7e4b?w=400&q=80',
            category: 'men',
            categoryName: 'Men',
            collection: 'summer-collection',
            collectionName: 'Summer Collection',
            isNewArrival: true,
            isFeatured: true,
            isActive: true
          },
          {
            _id: '2',
            name: 'Navy Blue Polo',
            price: 999,
            mrp: 1499,
            description: 'Comfortable navy blue polo shirt for casual wear',
            image: 'https://images.unsplash.com/photo-1596755066917-39f4b7b7e4b?w=400&q=80',
            category: 'men',
            categoryName: 'Men',
            collection: 'summer-collection',
            collectionName: 'Summer Collection',
            isNewArrival: false,
            isFeatured: true,
            isActive: true
          },
          {
            _id: '3',
            name: 'Kids Casual T-Shirt',
            price: 599,
            mrp: 899,
            description: 'Colorful and comfortable t-shirt for kids',
            image: 'https://images.unsplash.com/photo-1523381217965-fa30a36e6a9c?w=400&q=80',
            category: 'kids',
            categoryName: 'Kids',
            collection: 'summer-collection',
            collectionName: 'Summer Collection',
            isNewArrival: true,
            isFeatured: false,
            isActive: true
          },
          {
            _id: '4',
            name: 'Formal Black Pants',
            price: 1599,
            mrp: 2299,
            description: 'Professional black pants for formal occasions',
            image: 'https://images.unsplash.com/photo-1594634312680-0be55f8a4f2b?w=400&q=80',
            category: 'men',
            categoryName: 'Men',
            collection: 'formal-collection',
            collectionName: 'Formal Collection',
            isNewArrival: false,
            isFeatured: true,
            isActive: true
          },
          {
            _id: '5',
            name: 'Summer Dress',
            price: 899,
            mrp: 1399,
            description: 'Light and breezy summer dress for kids',
            image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
            category: 'kids',
            categoryName: 'Kids',
            collection: 'summer-collection',
            collectionName: 'Summer Collection',
            isNewArrival: true,
            isFeatured: false,
            isActive: true
          },
          {
            _id: '6',
            name: 'Winter Jacket',
            price: 2499,
            mrp: 3499,
            description: 'Warm and stylish winter jacket',
            image: 'https://images.unsplash.com/photo-1544968349-88a8e2b7b7e?w=400&q=80',
            category: 'men',
            categoryName: 'Men',
            collection: 'winter-collection',
            collectionName: 'Winter Collection',
            isNewArrival: false,
            isFeatured: true,
            isActive: true
          },
          {
            _id: '7',
            name: 'Casual Jeans',
            price: 1199,
            mrp: 1799,
            description: 'Comfortable denim jeans for everyday wear',
            image: 'https://images.unsplash.com/photo-1542272608-5c9ae14e76c3?w=400&q=80',
            category: 'men',
            categoryName: 'Men',
            collection: 'casual-collection',
            collectionName: 'Casual Collection',
            isNewArrival: true,
            isFeatured: false,
            isActive: true
          },
          {
            _id: '8',
            name: 'Kids Party Wear',
            price: 1299,
            mrp: 1999,
            description: 'Elegant party outfit for special occasions',
            image: 'https://images.unsplash.com/photo-1515886657613-9f3515b014d7?w=400&q=80',
            category: 'kids',
            categoryName: 'Kids',
            collection: 'party-collection',
            collectionName: 'Party Collection',
            isNewArrival: true,
            isFeatured: true,
            isActive: true
          }
        ]
      };
    }
  }

  // Fetch all categories
  static async fetchCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return default categories if API fails
      return {
        success: true,
        categories: [
          {
            _id: '1',
            name: 'Men',
            slug: 'men',
            description: 'Premium clothing for the modern man',
            image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80',
            order: 0,
            isActive: true,
            featured: true,
            type: 'category'
          },
          {
            _id: '2',
            name: 'Kids',
            slug: 'kids',
            description: 'Comfortable and stylish wear for kids',
            image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80',
            order: 1,
            isActive: true,
            featured: true,
            type: 'category'
          }
        ]
      };
    }
  }

  // Fetch all collections
  static async fetchCollections() {
    try {
      const response = await api.get('/collections');
      return response.data;
    } catch (error) {
      console.error('Error fetching collections:', error);
      // Return default collections if API fails
      return {
        success: true,
        collections: [
          {
            _id: '1',
            name: 'Summer Collection',
            slug: 'summer-collection',
            description: 'Light and breezy outfits for summer',
            image: 'https://images.unsplash.com/photo-1469338835442-7c5e22c68620?w=800&q=80',
            order: 0,
            isActive: true,
            featured: true,
            type: 'collection'
          },
          {
            _id: '2',
            name: 'Winter Collection',
            slug: 'winter-collection',
            description: 'Warm and cozy winter wear',
            image: 'https://images.unsplash.com/photo-1544968349-85a8c4c6b706?w=800&q=80',
            order: 1,
            isActive: true,
            featured: true,
            type: 'collection'
          },
          {
            _id: '3',
            name: 'Formal Collection',
            slug: 'formal-collection',
            description: 'Professional and elegant formal wear',
            image: 'https://images.unsplash.com/photo-1504593811423-6dd5b5523e1e?w=800&q=80',
            order: 2,
            isActive: true,
            featured: true,
            type: 'collection'
          },
          {
            _id: '4',
            name: 'Casual Collection',
            slug: 'casual-collection',
            description: 'Comfortable everyday casual wear',
            image: 'https://images.unsplash.com/photo-1517849901934-3bb0a6af5190?w=800&q=80',
            order: 3,
            isActive: true,
            featured: true,
            type: 'collection'
          },
          {
            _id: '5',
            name: 'Party Collection',
            slug: 'party-collection',
            description: 'Elegant outfits for special occasions',
            image: 'https://images.unsplash.com/photo-1515886657613-9f3515b014d7?w=800&q=80',
            order: 4,
            isActive: true,
            featured: true,
            type: 'collection'
          }
        ]
      };
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
