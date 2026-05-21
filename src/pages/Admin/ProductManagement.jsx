import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios'; // ✅ FIXED: Use shared axios instance
import SafeImg from '../../components/SafeImg/SafeImg';
import './ProductManagement.css';

const ProductManagement = () => {
  
  // Convert Dropbox preview URL to direct download URL
  const convertDropboxUrl = (url) => {
    if (!url || !url.includes('dropbox.com')) return url;
    return url
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '');
  };

  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResults, setCsvResults] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const csvInputRef = useRef(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountFormData, setDiscountFormData] = useState({
    discountMode: 'inherit',
    discountPercent: 0
  });
  const [collections, setCollections] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [editProduct, setEditProduct] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCollection, setFilterCollection] = useState('');
  const [filterAvailability, setFilterAvailability] = useState(''); 
  const [shopSettings, setShopSettings] = useState({
    globalDiscountEnabled: true,
    globalDiscountPercent: 50
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '', // Collection selection
    collection: '', // Explicit collection field
    brand: 'Black Locust',
    subcategory: '',
    sizes: [],
    colors: [],
    images: [],
    stock: '',
    featured: false,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    tags: [],
    // New fields you requested
    skuCode: '',
    discountMode: 'inherit',
    discountPercent: 0,
    h1Heading: '',
    specifications: '', // Detailed specifications text
    productLink: '', // Dropbox link
    availability: 'in_stock',
    // Enhanced product specifications
    productSpecs: {
      fit: 'Regular Fit',
      availableSizes: [
        { size: 'S', stock: 0 },
        { size: 'M', stock: 0 },
        { size: 'L', stock: 0 },
        { size: 'XL', stock: 0 },
        { size: 'XXL', stock: 0 }
      ],
      marketingDescription: '',
      technicalSpecs: {
        fabric: '',
        sleeves: '',
        collar: '',
        pocket: '',
        occasion: ''
      }
    },
    measurements: {
      chest: '',
      length: '',
      shoulders: '',
      sleeves: '',
      waist: '',
      hips: '',
      inseam: '',
      rise: ''
    },
    variants: []
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!imageFiles?.length) {
      setImagePreviews([]);
      return;
    }

    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imageFiles]);

  // Clothing categories with their specific measurements
  const clothingCategories = {
    'T-Shirts': {
      measurements: ['chest', 'length', 'shoulders', 'sleeves'],
      variants: ['S', 'M', 'L', 'XL', 'XXL'],
      specifications: ['material', 'care', 'origin', 'season', 'fit', 'weight', 'style']
    },
    'Shirts': {
      measurements: ['chest', 'length', 'shoulders', 'sleeves', 'collar'],
      variants: ['S', 'M', 'L', 'XL', 'XXL'],
      specifications: ['material', 'care', 'origin', 'season', 'fit', 'weight', 'style']
    },
    'Pants': {
      measurements: ['waist', 'hips', 'inseam', 'rise', 'length'],
      variants: ['28', '30', '32', '34', '36', '38'],
      specifications: ['material', 'care', 'origin', 'season', 'fit', 'weight', 'style']
    },
    'Jeans': {
      measurements: ['waist', 'hips', 'inseam', 'rise', 'length'],
      variants: ['28', '30', '32', '34', '36', '38'],
      specifications: ['material', 'care', 'origin', 'season', 'fit', 'weight', 'style']
    },
    'Jackets': {
      measurements: ['chest', 'length', 'shoulders', 'sleeves'],
      variants: ['S', 'M', 'L', 'XL', 'XXL'],
      specifications: ['material', 'care', 'origin', 'season', 'fit', 'weight', 'style']
    },
    'Sweaters': {
      measurements: ['chest', 'length', 'shoulders', 'sleeves'],
      variants: ['S', 'M', 'L', 'XL', 'XXL'],
      specifications: ['material', 'care', 'origin', 'season', 'fit', 'weight', 'style']
    },
    'Accessories': {
      measurements: ['length', 'width', 'height'],
      variants: ['One Size'],
      specifications: ['material', 'care', 'origin', 'season', 'fit', 'weight', 'style']
    },
    'Shoes': {
      measurements: ['length', 'width'],
      variants: ['7', '8', '9', '10', '11', '12'],
      specifications: ['material', 'care', 'origin', 'season', 'fit', 'weight', 'style']
    }
  };

  const materials = [
    'Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 
    'Leather', 'Suede', 'Nylon', 'Spandex', 'Rayon', 'Viscose',
    'Modal', 'Bamboo', 'Hemp', 'Cashmere', 'Merino Wool'
  ];

  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];
  const fits = ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Skinny', 'Straight', 'Bootcut'];
  const styles = ['Casual', 'Formal', 'Business', 'Sport', 'Street', 'Vintage', 'Modern', 'Classic'];
  const careInstructions = ['Machine Wash', 'Hand Wash', 'Dry Clean Only', 'Spot Clean', 'Professional Clean'];

  const fetchShopSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings/shop');
      if (res.data?.settings) setShopSettings(res.data.settings);
    } catch (e) {
      console.error('Shop settings:', e);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories");
      console.log("Categories:", response.data);
      setCategories(response.data.categories);
    } catch (error) {
      console.error(error);
      setCategories([]); // Don't show alert for categories as they might not exist
    }
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const response = await api.get("/collections?showInNavbar=true&isActive=true&sortBy=order&sortOrder=asc");
      console.log("Collections:", response.data);
      setCollections(response.data.collections);
    } catch (err) {
      console.error(err);
      setCollections([]); // Don't show alert for collections as they might not exist
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      // Fetch all products including inactive ones for admin panel
      const response = await api.get("/products?includeInactive=true");
      console.log("Products:", response.data);
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch products");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // Fetch categories from API
    fetchCollections(); // Fetch collections from API
    fetchShopSettings();
    
    // Listen for storage changes to update collections when new ones are added
    const handleStorageChange = (e) => {
      if (e.key === 'collections') {
        fetchCollections();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchShopSettings, fetchCategories, fetchCollections, fetchProducts]);

  const saveShopSettings = useCallback(async () => {
    const pct = Number(shopSettings.globalDiscountPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      toast.error("Global discount must be between 0 and 100");
      return;
    }
    try {
      const res = await api.put("/settings/shop", {
        globalDiscountEnabled: shopSettings.globalDiscountEnabled,
        globalDiscountPercent: pct
      });
      if (res.data?.settings) setShopSettings(res.data.settings);
      toast.success("Shop-wide discount saved");
      fetchProducts();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save shop settings");
    }
  }, [shopSettings, fetchProducts]);

  const syncAllProductsToInheritDiscount = useCallback(async () => {
    if (
      !window.confirm(
        "Set every product to follow the shop-wide discount? Per-product custom discounts will be cleared."
      )
    ) {
      return;
    }
    try {
      const res = await api.post("/products/admin/sync-discount-inherit");
      toast.success(
        `Synced: ${res.data?.modifiedCount ?? 0} product(s) now use shop-wide rules`
      );
      fetchProducts();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not sync products");
    }
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("🔍 INPUT CHANGE:", { name, value, type, checked });
    
    if (name.startsWith('productSpecs.technicalSpecs.')) {
      // ✅ Three-level deep: productSpecs.technicalSpecs.fabric
      const field = name.split('.')[2];
      setFormData(prev => ({
        ...prev,
        productSpecs: {
          ...prev.productSpecs,
          technicalSpecs: {
            ...prev.productSpecs.technicalSpecs,
            [field]: type === 'checkbox' ? checked : value
          }
        }
      }));
    } else if (name.startsWith('productSpecs.')) {
      // ✅ Two-level deep: productSpecs.marketingDescription
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        productSpecs: {
          ...prev.productSpecs,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('specifications.') || name.includes('measurements.')) {
      const [category, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSizeChange = (sizeName) => {
    setFormData(prev => {
      const existingSize = prev.sizes.find(s => s.size === sizeName);
      if (existingSize) {
        // Remove size if it exists
        return {
          ...prev,
          sizes: prev.sizes.filter(s => s.size !== sizeName)
        };
      } else {
        // Add size with default stock of 0
        return {
          ...prev,
          sizes: [...prev.sizes, { size: sizeName, stock: 0 }]
        };
      }
    });
  };

  const handleSizeStockChange = (sizeName, stock) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).map(size => 
        size.size === sizeName ? { ...size, stock: parseInt(stock) || 0 } : size
      )
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleImageAdd = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', public_id: '' }]
    }));
  };

  const addImage = (url) => {
    setFormData(prev => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url: url,
          public_id: "manual_" + Date.now()
        }
      ]
    }));
  };

  const handleImageChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async (files) => {
    const uploadedImages = [];
    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
      
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        if (data.secure_url) {
          uploadedImages.push({
            url: data.secure_url,
            public_id: data.public_id
          });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Failed to upload image ${i + 1}`);
      }
    }
    
    setUploading(false);
    return uploadedImages;
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setImageFiles([]);
      return;
    }

    if (files.length > 5) {
      toast.error('Please select up to 5 images');
      setImageFiles(files.slice(0, 5));
      return;
    }

    setImageFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error('Product name is required');
        return;
      }
      
      if (!formData.skuCode.trim()) {
        toast.error('SKU code is required');
        return;
      }
      
      if (!formData.h1Heading.trim()) {
        toast.error('H1 heading is required');
        return;
      }
      
      if (!formData.specifications.trim()) {
        toast.error('Product specifications are required');
        return;
      }
      
      if (!formData.price || formData.price <= 0) {
        toast.error('Valid price is required');
        return;
      }

      if (formData.discountMode === 'custom') {
        const d = Number(formData.discountPercent);
        if (!Number.isFinite(d) || d < 0 || d > 100) {
          toast.error('Custom discount must be between 0 and 100');
          return;
        }
      }
      
      if (!formData.category) {
        toast.error('Please select a collection');
        return;
      }
      
      if (formData.sizes.length === 0) {
        toast.error('Please select at least one size');
        return;
      }
      
      const totalStock = formData.sizes.reduce((total, size) => total + (size.stock || 0), 0);
      if (totalStock === 0) {
        toast.error('Please add stock for at least one size');
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        collection: formData.collection || formData.category,
        brand: formData.brand,
        images: [],
        
        // New fields you requested
        skuCode: formData.skuCode.trim(),
        discountMode: formData.discountMode,
        discountPercent:
          formData.discountMode === 'custom'
            ? Math.min(100, Math.max(0, Number(formData.discountPercent) || 0))
            : 0,
        h1Heading: formData.h1Heading,
        specifications: formData.specifications,
        productLink: formData.productLink,
        availability: formData.availability,
        
        // Enhanced product specifications
        productSpecs: formData.productSpecs,

        sizes: formData.sizes, // already array
        colors: formData.colors, // already array from input

        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isTrending: formData.isTrending,

        tags: formData.tags,
        material: formData.specifications?.material,
        careInstructions: formData.specifications?.care,
        isActive: true
      };

      // Upload selected images (up to 5) and merge with any URL-based images
      const existingImages = (formData.images || [])
        .filter((img) => img?.url)
        .map((img) => ({
          ...img,
          url: convertDropboxUrl(img.url)
        }));

      const uploaded = imageFiles?.length ? await uploadImages(imageFiles) : [];
      const mergedImages = [...uploaded, ...existingImages].slice(0, 5);

      if (!mergedImages.length) {
        toast.error('Please add at least 1 product image (upload or URL)');
        return;
      }

      payload.images = mergedImages;

      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post("/products", payload);
        toast.success('Product added successfully');
      }

      fetchProducts();
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      setImageFiles([]);
    } catch (error) {
      console.error('❌ Product save error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      toast.error(error.response?.data?.message || error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    console.log("DEBUG PRODUCT:", product);
    console.log("DEBUG SIZES:", product?.sizes);
    console.log("DEBUG PRODUCT SPECS:", product?.productSpecs);
    
    setSelectedProduct(product);
    setFormData({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.listPrice ?? product?.price ?? '',
      category: product?.category?._id || product?.category || '',
      collection: product?.collection?._id || product?.collection || '',
      brand: product?.brand || 'Black Locust',
      subcategory: product?.subcategory || '',
      sizes: product?.sizes || [],
      colors: product?.colors || [],
      images: product?.images || [],
      stock: product?.stock || '',
      featured: product?.featured || false,
      isFeatured: product?.isFeatured || false,
      isNewArrival: product?.isNewArrival || false,
      isTrending: product?.isTrending || false,
      tags: product?.tags || [],
      // New fields you requested
      skuCode: product?.skuCode || product?.sku || '',
      discountMode: product?.discountMode === 'custom' ? 'custom' : 'inherit',
      discountPercent:
        product?.discountMode === 'custom' ? product?.discountPercent ?? 0 : 0,
      h1Heading: product?.h1Heading || '',
      specifications: product?.specifications || '',
      productLink: product?.productLink || '',
      availability: product?.availability || 'in_stock',
      // Enhanced product specifications
      productSpecs: product?.productSpecs || {
        fit: product?.productSpecs?.fit || 'Regular Fit',
        availableSizes: product?.productSpecs?.availableSizes || [
          { size: 'S', stock: 0 },
          { size: 'M', stock: 0 },
          { size: 'L', stock: 0 },
          { size: 'XL', stock: 0 },
          { size: 'XXL', stock: 0 }
        ],
        marketingDescription: product?.productSpecs?.marketingDescription || '',
        technicalSpecs: {
          fabric: product?.productSpecs?.technicalSpecs?.fabric || '',
          sleeves: product?.productSpecs?.technicalSpecs?.sleeves || '',
          collar: product?.productSpecs?.technicalSpecs?.collar || '',
          pocket: product?.productSpecs?.technicalSpecs?.pocket || '',
          occasion: product?.productSpecs?.technicalSpecs?.occasion || ''
        }
      },
      measurements: product?.measurements || {
        chest: product?.measurements?.chest || '',
        length: product?.measurements?.length || '',
        shoulders: product?.measurements?.shoulders || '',
        sleeves: product?.measurements?.sleeves || '',
        waist: product?.measurements?.waist || '',
        hips: product?.measurements?.hips || '',
        inseam: product?.measurements?.inseam || '',
        rise: product?.measurements?.rise || ''
      },
      variants: []
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        name: editProduct.name,
        description: editProduct.description,
        price: Number(editProduct.price),
        category: editProduct.category,
        collection: editProduct.collection,
        brand: editProduct.brand,
        images: editProduct.images.map(img => ({
          ...img,
          url: convertDropboxUrl(img.url)
        })),
        sizes: editProduct.sizes,
        colors: editProduct.colors,
        isFeatured: editProduct.isFeatured,
        isNewArrival: editProduct.isNewArrival,
        isTrending: editProduct.isTrending,
        material: editProduct.specifications?.material,
        careInstructions: editProduct.specifications?.care,
        isActive: true
      };

      await api.put(
        `/products/${editProduct._id}`,
        payload
      );

      fetchProducts();
      setEditProduct(null);
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await api.put(`/products/${product?._id}`, {
        isFeatured: !product?.isFeatured
      });
      fetchProducts();
      toast.success('Product featured status updated');
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const toggleNewArrival = async (product) => {
    try {
      await api.put(
        `/products/${product?._id}`,
        {
          isNewArrival: !product?.isNewArrival
        }
      );

      fetchProducts();
      toast.success('Product arrival status updated');
    } catch (error) {
      toast.error('Failed to update arrival status');
    }
  };

  const toggleTrending = async (product) => {
    try {
      await api.put(
        `/products/${product?._id}`,
        {
          isTrending: !product?.isTrending
        }
      );

      fetchProducts();
    } catch (error) {
      toast.error('Failed to toggle trending status');
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      const response = await api.put(`/products/${product?._id}/toggle-status`);
      toast.success(response.data.message || `Product ${product.isActive ? 'disabled' : 'enabled'} successfully`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to toggle product status');
    }
  };

  const handleOpenDiscountModal = (product) => {
    setSelectedProduct(product);
    setDiscountFormData({
      discountMode: product?.discountMode || 'inherit',
      discountPercent: product?.discountPercent || 0
    });
    setShowDiscountModal(true);
  };

  const handleSaveDiscount = async () => {
    try {
      const discountPercent = Number(discountFormData.discountPercent);
      
      if (discountFormData.discountMode === 'custom') {
        if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
          toast.error('Discount must be between 0 and 100');
          return;
        }
      }

      await api.put(`/products/${selectedProduct._id}`, {
        discountMode: discountFormData.discountMode,
        discountPercent: discountFormData.discountMode === 'custom' ? discountPercent : 0
      });

      toast.success('Discount updated successfully');
      setShowDiscountModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update discount');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '', // Collection selection
      collection: '', // Explicit collection field
      brand: 'Black Locust',
      subcategory: '',
      sizes: [],
      colors: [],
      images: [],
      stock: '',
      featured: false,
      isFeatured: false,
      isNewArrival: false,
      isTrending: false,
      tags: [],
      // New fields you requested
      skuCode: '',
      discountMode: 'inherit',
      discountPercent: 0,
      h1Heading: '',
      specifications: '', // Detailed specifications text
      productLink: '', // Dropbox link
      availability: 'in_stock',
      // Enhanced product specifications - FIXED: was techSpecs, now productSpecs
      productSpecs: {
        fit: 'Regular Fit',
        availableSizes: [
          { size: 'S', stock: 0 },
          { size: 'M', stock: 0 },
          { size: 'L', stock: 0 },
          { size: 'XL', stock: 0 },
          { size: 'XXL', stock: 0 }
        ],
        marketingDescription: '',
        technicalSpecs: {
          fabric: '',
          sleeves: '',
          collar: '',
          pocket: '',
          occasion: ''
        }
      },
      measurements: {
        chest: '',
        length: '',
        shoulders: '',
        sleeves: '',
        waist: '',
        hips: '',
        inseam: '',
        rise: ''
      },
      variants: []
    });
    setImageFiles([]);
    setSelectedProduct(null);
  };

  const currentCategorySpecs = clothingCategories['T-Shirts'] || {
    measurements: [],
    variants: [],
    specifications: []
  };

  // Check if selected category is actually a collection
  const selectedCollection = collections.find(c => c._id === formData.category);
  const isCollection = selectedCollection !== undefined;
  
  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (product?.skuCode && product?.skuCode?.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (product?.description && product?.description?.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (product?.h1Heading && product?.h1Heading?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCollection = !filterCollection || product?.collection === filterCollection;
    const matchesAvailability = !filterAvailability || product?.availability === filterAvailability;
    
    return matchesSearch && matchesCollection && matchesAvailability;
  });
  
  // For collections, use default specs (can be customized later)
  const collectionSpecs = isCollection ? {
    measurements: ['chest', 'length', 'shoulders', 'sleeves'], // Default for collections
    variants: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: ['material', 'care', 'origin', 'season', 'fit', 'weight', 'style']
  } : null;

  // ── CSV columns covering ALL product types ────────────────────────────────
  const CSV_HEADERS = [
    // Required
    'name','skuCode','h1Heading','price','categoryName',
    // Identity
    'gender','subcategory','ageGroup','season',
    // Optional identity
    'collectionName','brand',
    // Content
    'description','specifications','availability',
    // Sizes & variants  (shirts/jackets: S:10,M:15 | pants/jeans: 28:10,30:15 | kids: 2-4Y:10,5-7Y:8)
    'sizes','colors','imageUrls',
    // Flags
    'isFeatured','isNewArrival','isTrending',
    // Discount
    'discountMode','discountPercent',
    // Extra tags
    'tags','material','careInstructions','productLink',
    // Fit & marketing
    'fit','marketingDescription',
    // Technical specs — fill only what applies to this product type
    'fabric',
    // Shirts / Tops
    'sleeves','collar','pocket',
    // Pants / Jeans / Cargo
    'rise','legStyle','closure',
    // Jackets / Hoodies
    'lining','hood',
    // Common
    'occasion'
  ];

  // One sample row per product type so the user sees exactly what to fill
  const CSV_SAMPLES = [
    // 1. Men's Shirt
    ['Classic White Formal Shirt','BL-SHIRT-001','Premium White Formal Shirt for Men','1299',
     'Men','Men','Formal Shirt','','All Season','Formal Collection','Black Locust',
     'Premium white formal shirt for office and formal occasions.','100% Cotton - Machine Wash Cold - Do Not Bleach',
     'in_stock','S:10,M:15,L:20,XL:10,XXL:5','White,Light Blue','',
     'false','true','false','inherit','0',
     'formal,shirt,office,cotton','Cotton','Machine wash cold','',
     'Regular Fit','The perfect shirt for your office days',
     'Cotton Blend','Full Sleeves','Spread Collar','Chest Pocket','','','','','','Formal & Office'],

    // 2. Men's Jeans
    ['Classic Slim Fit Blue Jeans','BL-JEANS-001','Slim Fit Blue Denim Jeans for Men','1799',
     'Men','Men','Jeans','','All Season','Denim Collection','Black Locust',
     'Premium slim fit blue jeans made from stretch denim for all-day comfort.',
     'Stretch Denim 98% Cotton 2% Elastane - Machine Wash Cold',
     'in_stock','28:10,30:15,32:20,34:10,36:5','Blue,Black,Dark Grey','',
     'false','true','false','inherit','0',
     'jeans,denim,slim-fit,casual','Denim','Machine wash cold separately','',
     'Slim Fit','Your go-to pair of jeans for every occasion',
     'Stretch Denim','','','5-Pocket','Mid Rise','Slim','Zipper & Button','','','Casual & Smart Casual'],

    // 3. Men's Cargo Pants
    ['Urban Cargo Pants','BL-CARGO-001','Relaxed Fit Cargo Pants for Men','1599',
     'Men','Men','Cargo Pants','','All Season','Casuals Collection','Black Locust',
     'Utility cargo pants with multiple pockets for an urban streetwear look.',
     '100% Cotton Twill - Machine Wash Cold',
     'in_stock','28:8,30:12,32:15,34:10,36:6','Olive,Black,Khaki,Navy','',
     'false','false','true','inherit','0',
     'cargo,pants,utility,streetwear,casual','Cotton Twill','Machine wash cold','',
     'Relaxed Fit','Built for the streets - style meets utility',
     'Cotton Twill','','','6 Cargo Pockets','Mid Rise','Regular','Drawstring & Button','','','Casual & Streetwear'],

    // 4. Men's Jacket
    ['Classic Bomber Jacket','BL-JACKET-001','Men\'s Slim Fit Bomber Jacket','2999',
     'Men','Men','Bomber Jacket','','Winter','Winter Collection','Black Locust',
     'Premium bomber jacket with ribbed cuffs and hem for a classic streetwear look.',
     'Polyester Shell 100% - Polyester Lining - Dry Clean Only',
     'in_stock','S:5,M:10,L:8,XL:5,XXL:3','Black,Olive,Navy','',
     'false','true','false','inherit','0',
     'jacket,bomber,winter,streetwear','Polyester','Dry clean only','',
     'Slim Fit','The classic bomber - timeless style redefined',
     'Polyester Shell','Full Sleeves','Ribbed Collar','Side Pockets','','','Zipper','Half Lined','No','Casual & Streetwear'],

    // 5. Kids T-Shirt
    ['Kids Graphic Printed T-Shirt','BL-KIDS-001','Soft Cotton Printed T-Shirt for Kids','699',
     'Kids','Kids','T-Shirt','2-13 Years','All Season','Kids Collection','Black Locust',
     'Bright and fun graphic printed t-shirt made from soft breathable cotton for kids.',
     '100% Combed Cotton - Machine Wash Cold Gentle - Do Not Bleach',
     'in_stock','2-4Y:15,5-7Y:20,8-10Y:18,11-13Y:12','Red,Blue,Yellow,Green,White','',
     'false','true','false','inherit','0',
     'kids,t-shirt,printed,cotton,children','Cotton','Machine wash gentle cold','',
     'Regular Fit','Fun and comfortable - perfect for active kids',
     'Combed Cotton','Short Sleeves','Round Neck','No Pocket','','','','','','Casual & Play'],
  ];

  const handleDownloadTemplate = () => {
    const escape = (v) => {
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [CSV_HEADERS.join(','), ...CSV_SAMPLES.map(row => row.map(escape).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bulk_product_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) { toast.error('Please select a CSV file first'); return; }
    setCsvUploading(true);
    setCsvResults(null);
    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      const res = await api.post('/products/admin/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const r = res.data.results;
      setCsvResults(r);
      if (r.created > 0) {
        toast.success(`${r.created} product${r.created !== 1 ? 's' : ''} created!`);
        fetchProducts();
      }
      if (r.failed > 0) toast.warning(`${r.failed} row${r.failed !== 1 ? 's' : ''} failed — see details`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setCsvUploading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-management">
      <div className="page-header">
        <h2>Product Management</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => { setCsvFile(null); setCsvResults(null); setShowUploadModal(true); }}
            title="Upload products in bulk via CSV"
          >
            <i className="fas fa-upload"></i> Upload
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              try {
                resetForm();
                setShowAddModal(true);
              } catch (error) {
                alert(`Error opening Add Product modal: ${error.message}`);
              }
            }}
          >
            <i className="fas fa-plus"></i> Add Product
          </button>
        </div>
      </div>

      <div className="shop-discount-panel">
        <h3>Shop-wide discount</h3>
        <p className="shop-discount-hint">
          Applies to all products in <strong>inherit</strong> mode. Use per-product
          &quot;Custom&quot; discount in Add/Edit when one item needs a different rate.
        </p>
        <label className="shop-discount-check">
          <input
            type="checkbox"
            checked={!!shopSettings.globalDiscountEnabled}
            onChange={(e) =>
              setShopSettings((s) => ({
                ...s,
                globalDiscountEnabled: e.target.checked
              }))
            }
          />
          Enable global discount
        </label>
        <label className="shop-discount-pct">
          Percent off (0–100)
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={shopSettings.globalDiscountPercent ?? 0}
            onChange={(e) =>
              setShopSettings((s) => ({
                ...s,
                globalDiscountPercent: e.target.value
              }))
            }
          />
        </label>
        <button type="button" className="btn btn-primary btn-sm" onClick={saveShopSettings}>
          Save shop settings
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={syncAllProductsToInheritDiscount}
        >
          Set all products to shop-wide (inherit)
        </button>
      </div>

      <div className="products-table">
        <div className="table-info">
          <p>Showing {filteredProducts.length} of {products.length} products</p>
          <button className="btn btn-secondary btn-sm" onClick={fetchProducts}>
            <i className="fas fa-refresh"></i> Refresh
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <div className="filter-options">
            <select
              value={filterCollection}
              onChange={(e) => setFilterCollection(e.target.value)}
              className="filter-select"
            >
              <option value="">All Collections</option>
              {collections.map(collection => (
                <option key={collection._id} value={collection._id}>
                  {collection.name}
                </option>
              ))}
            </select>
            
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="filter-select"
            >
              <option value="">All Availability</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="limited">Limited Stock</option>
            </select>
            
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchTerm('');
                setFilterCollection('');
                setFilterAvailability('');
              }}
            >
              <i className="fas fa-times"></i> Clear Filters
            </button>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>SKU Code</th>
              <th>Collection</th>
              <th>MRP / sale</th>
              <th>Discount</th>
              <th>Stock</th>
              <th>Availability</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product?._id} className={!product?.isActive ? 'inactive-product' : ''}>
                  <td>
                    {product?.images?.[0] ? (
                      <SafeImg 
                        src={product?.images[0]?.url} 
                        alt={product?.name}
                        className="product-thumbnail"
                        fallback="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=50&auto=format&fit=crop"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </td>
                  <td>
                    <div className="product-info">
                      <strong>{product?.name}</strong>
                      {product?.h1Heading && (
                        <small className="text-muted">{product?.h1Heading}</small>
                      )}
                    </div>
                  </td>
                  <td>{product?.skuCode || product?.sku || 'N/A'}</td>
                  <td>
                    <span className="collection-badge">
                      {collections.find(c => c._id === (product?.collection?._id || product?.collection))?.name || product?.collection?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="price pricing-cell">
                    {product?.discountPercentApplied > 0 ? (
                      <>
                        <span className="pricing-mrp">₹{product?.listPrice}</span>
                        <span className="pricing-sale"> ₹{product?.price}</span>
                        <span className="pricing-pct">
                          {product?.discountMode === "custom"
                            ? `custom ${product?.discountPercentApplied}%`
                            : `${product?.discountPercentApplied}% off`}
                        </span>
                      </>
                    ) : (
                      <span>₹{product?.listPrice ?? product?.price}</span>
                    )}
                  </td>
                  <td>
                    <div className="discount-info">
                      {product?.discountMode === 'custom' ? (
                        <span className="discount-badge custom">
                          <i className="fas fa-tag"></i> {product?.discountPercent}% Custom
                        </span>
                      ) : (
                        <span className="discount-badge inherit">
                          <i className="fas fa-store"></i> Shop-wide
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`stock-badge ${product?.totalStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product?.totalStock || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`availability-badge ${product?.availability || 'in_stock'}`}>
                      {product?.availability ? product?.availability.replace('_', ' ').toUpperCase() : 'IN STOCK'}
                    </span>
                  </td>
                  <td>
                    <div className="toggle-group">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={product?.isFeatured || false}
                          onChange={() => handleToggleFeatured(product)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${product?.isActive ? 'active' : 'inactive'}`}>
                      {product?.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => window.open(`/product/${product?._id}`, '_blank')}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => toggleNewArrival(product)}
                      >
                        {product?.isNewArrival ? 'Remove New' : 'Mark New'}
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => toggleTrending(product)}
                      >
                        {product?.isTrending ? 'Unmark Trend' : 'Mark Trend'}
                      </button>
                      <button
                        className="btn btn-sm btn-discount"
                        onClick={() => handleOpenDiscountModal(product)}
                        title="Set custom discount for this product"
                      >
                        <i className="fas fa-percent"></i> Discount
                      </button>
                      <button
                        className={`btn btn-sm ${product?.isActive ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => toggleProductStatus(product)}
                        title={product?.isActive ? 'Disable product (hide from website)' : 'Enable product (show on website)'}
                      >
                        {product?.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product?._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-products">
                  <div className="no-products-message">
                    <i className="fas fa-box"></i>
                    <h3>No products found</h3>
                    <p>Start by adding your first product using the "Add Product" button above.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal">
          <div className="modal-content product-form">
            <div className="modal-header">
              <h3>{selectedProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  try {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  } catch (error) {
                    console.error("❌ Error closing modal:", error);
                  }
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form-content">
              <div className="form-instructions">
                <h4>📝 Instructions:</h4>
                <ol>
                  <li>Fill in basic product information (name, description, price)</li>
                  <li>Select a category to see available sizes</li>
                  <li>Check the sizes you want to offer and set stock for each</li>
                  <li>Add colors and upload product images</li>
                  <li>Click "Add Product" to save</li>
                </ol>
              </div>
              
              <div className="form-sections">
                {/* Basic Information */}
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category/Collection *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category/Collection</option>
                        
                        {/* Categories from API */}
                        {(categories || []).map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                        
                        {/* Collections from Admin Panel */}
                        {(collections || []).length > 0 && (
                          <optgroup label="Collections">
                            {(collections || []).map(collection => (
                              <option key={collection._id} value={collection._id}>
                                📁 {collection.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Collection</label>
                      <select
                        name="collection"
                        value={formData.collection}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Collection</option>
                        {(collections || []).map(collection => (
                          <option key={collection._id} value={collection._id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>MRP (list price) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        required
                      />
                      <small className="text-muted">
                        Customer pays this minus the effective discount (shop-wide or custom).
                      </small>
                    </div>
                    <div className="form-group">
                      <label>SKU Code *</label>
                      <input
                        type="text"
                        name="skuCode"
                        value={formData.skuCode}
                        onChange={handleInputChange}
                        placeholder="e.g., BL-SHIRT-001"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Product discount</label>
                      <select
                        name="discountMode"
                        value={formData.discountMode}
                        onChange={handleInputChange}
                      >
                        <option value="inherit">Use shop-wide discount</option>
                        <option value="custom">Custom % for this product only</option>
                      </select>
                    </div>
                    {formData.discountMode === "custom" && (
                      <div className="form-group">
                        <label>Custom discount %</label>
                        <input
                          type="number"
                          name="discountPercent"
                          value={formData.discountPercent}
                          onChange={handleInputChange}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                    )}
                    <div className="form-group">
                      <label>H1 Heading *</label>
                      <input
                        type="text"
                        name="h1Heading"
                        value={formData.h1Heading}
                        onChange={handleInputChange}
                        placeholder="SEO-friendly heading"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Availability</label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="limited">Limited Stock</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Product Link (Dropbox)</label>
                      <input
                        type="url"
                        name="productLink"
                        value={formData.productLink}
                        onChange={handleInputChange}
                        placeholder="https://www.dropbox.com/s/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Product Description */}
                <div className="form-section">
                  <h4>Product Description</h4>
                  <div className="form-group">
                    <label>Product Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Describe your product in detail..."
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Detailed Specifications */}
                <div className="form-section">
                  <h4>Detailed Specifications</h4>
                  <div className="form-group">
                    <label>Product Specifications *</label>
                    <textarea
                      name="specifications"
                      value={formData.specifications}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Enter detailed product specifications, materials, features, etc..."
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Enhanced Product Specifications */}
                <div className="form-section">
                  <h4>Product Details & Marketing</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Fit Type</label>
                      <select
                        name="productSpecs.fit"
                        value={formData.productSpecs?.fit || 'Regular Fit'}
                        onChange={handleInputChange}
                      >
                        <option value="Regular Fit">Regular Fit</option>
                        <option value="Tailored Fit">Tailored Fit</option>
                        <option value="Slim Fit">Slim Fit</option>
                        <option value="Relaxed Fit">Relaxed Fit</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Marketing Description *</label>
                    <textarea
                      name="productSpecs.marketingDescription"
                      value={formData.productSpecs?.marketingDescription ?? ''}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Upgrade your everyday wardrobe with this Men's..."
                      required
                    ></textarea>
                  </div>

                  <div className="form-section">
                    <h4>Technical Specifications</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Fabric</label>
                        <input
                          type="text"
                          name="productSpecs.technicalSpecs.fabric"
                          value={formData.productSpecs.technicalSpecs.fabric}
                          onChange={handleInputChange}
                          placeholder="e.g., 100% Cotton"
                        />
                      </div>
                      <div className="form-group">
                        <label>Sleeves</label>
                        <input
                          type="text"
                          name="productSpecs.technicalSpecs.sleeves"
                          value={formData.productSpecs.technicalSpecs.sleeves}
                          onChange={handleInputChange}
                          placeholder="e.g., Full, Short, Sleeveless"
                        />
                      </div>
                      <div className="form-group">
                        <label>Collar</label>
                        <input
                          type="text"
                          name="productSpecs.technicalSpecs.collar"
                          value={formData.productSpecs.technicalSpecs.collar}
                          onChange={handleInputChange}
                          placeholder="e.g., Spread Collar, Mandarin Collar"
                        />
                      </div>
                      <div className="form-group">
                        <label>Pocket</label>
                        <input
                          type="text"
                          name="productSpecs.technicalSpecs.pocket"
                          value={formData.productSpecs.technicalSpecs.pocket}
                          onChange={handleInputChange}
                          placeholder="e.g., One with logo embroidery"
                        />
                      </div>
                      <div className="form-group">
                        <label>Occasion</label>
                        <input
                          type="text"
                          name="productSpecs.technicalSpecs.occasion"
                          value={formData.productSpecs.technicalSpecs.occasion}
                          onChange={handleInputChange}
                          placeholder="e.g., Formal & Casual"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Status */}
                <div className="form-section">
                  <h4>Product Status</h4>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                      />
                      Featured Product
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="isNewArrival"
                        checked={formData.isNewArrival}
                        onChange={handleInputChange}
                      />
                      New Arrival
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="isTrending"
                        checked={formData.isTrending}
                        onChange={handleInputChange}
                      />
                      Trending
                    </label>
                  </div>
                </div>

                {!isCollection && (
                <div className="form-section">
                  <h4>Specifications</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Material</label>
                      <select
                        name="specifications.material"
                        value={formData.specifications.material}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Material</option>
                        {(materials || []).map(material => (
                          <option key={material} value={material}>{material}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Care Instructions</label>
                      <select
                        name="specifications.care"
                        value={formData.specifications.care}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Care</option>
                        {(careInstructions || []).map(care => (
                          <option key={care} value={care}>{care}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Origin</label>
                      <input
                        type="text"
                        name="specifications.origin"
                        value={formData.specifications.origin}
                        onChange={handleInputChange}
                        placeholder="e.g., Made in USA"
                      />
                    </div>
                    <div className="form-group">
                      <label>Season</label>
                      <select
                        name="specifications.season"
                        value={formData.specifications.season}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Season</option>
                        {(seasons || []).map(season => (
                          <option key={season} value={season}>{season}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fit</label>
                      <select
                        name="specifications.fit"
                        value={formData.specifications?.fit || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Fit</option>
                        {(fits || []).map(fit => (
                          <option key={fit} value={fit}>{fit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Style</label>
                      <select
                        name="specifications.style"
                        value={formData.specifications.style}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Style</option>
                        {(styles || []).map(style => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                )}

                {!isCollection && currentCategorySpecs.measurements.length > 0 && (
                <div className="form-section">
                  <h4>Measurements (in inches)</h4>
                  <div className="form-grid">
                    {(currentCategorySpecs.measurements || []).map(measurement => (
                      <div key={measurement} className="form-group">
                        <label>{measurement.charAt(0).toUpperCase() + measurement.slice(1)}</label>
                        <input
                          type="number"
                          name={`measurements.${measurement}`}
                          value={formData.measurements[measurement] || ''}
                          onChange={handleInputChange}
                          placeholder="0"
                          step="0.1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isCollection && (
                <div className="form-section">
                  <h4>Collection Product Specifications</h4>
                  <p style={{color: '#666', fontSize: '0.9em', marginBottom: '15px'}}>
                    This product belongs to the <strong>{selectedCollection?.name}</strong> collection.
                    Standard clothing measurements will be used.
                  </p>
                </div>
              )}

                {/* Sizes */}
                <div className="form-section">
                  <h4>Available Sizes & Stock Management</h4>
                  <div className="sizes-stock-management">
                    {(isCollection ? collectionSpecs : currentCategorySpecs).variants?.map(size => {
                      const sizeData = (formData.sizes || []).find(s => s.size === size);
                      return (
                        <div key={size} className="size-stock-row">
                          <label className="size-checkbox">
                            <input
                              type="checkbox"
                              checked={(formData.sizes || []).some(s => s.size === size)}
                              onChange={() => handleSizeChange(size)}
                            />
                            <span className="size-label">{size}</span>
                          </label>
                          <div className="stock-input-group">
                            <label className="stock-label">Stock:</label>
                            <input
                              type="number"
                              min="0"
                              value={sizeData?.stock || 0}
                              onChange={(e) => handleSizeStockChange(size, e.target.value)}
                              className="stock-input"
                              placeholder="0"
                            />
                            <span className="stock-unit">pieces</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="total-stock-info">
                    <strong>Total Stock: {formData.sizes.reduce((total, size) => total + (size.stock || 0), 0)} pieces</strong>
                  </div>
                </div>

                {/* Colors */}
                <div className="form-section">
                  <h4>Available Colors</h4>
                  <div className="colors-input">
                    <input
                      type="text"
                      placeholder="Enter colors separated by commas"
                      value={(formData.colors || []).join(', ')}
                      onChange={(e) => {
                        const colors = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                        setFormData(prev => ({ ...prev, colors: colors || [] }));
                      }}
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="form-section">
                  <h4>Product Images (up to 5)</h4>
                  <div className="images-section">
                    {/* Upload previews */}
                    {imagePreviews.length > 0 && (
                      <div className="image-previews">
                        {imagePreviews.map((src, idx) => (
                          <div key={`preview-${idx}`} className="image-preview">
                            <SafeImg 
                              src={src} 
                              alt={`Selected ${idx + 1}`} 
                              fallback="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=100&auto=format&fit=crop"
                              style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            />
                            <span className="image-preview-badge">{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Existing images */}
                    {(formData.images || []).map((image, index) => (
                      <div key={`existing-${index}`} className="image-input-group">
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={image.url}
                          onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Image ID (optional)"
                          value={image.public_id}
                          onChange={(e) => handleImageChange(index, 'public_id', e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleImageRemove(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    
                    {/* File upload */}
                    <div className="image-upload-section">
                      <label className="file-upload-label">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageFilesChange}
                          disabled={uploading}
                        />
                        <i className="fas fa-cloud-upload-alt"></i>
                        {uploading ? 'Uploading...' : 'Select Images'}
                      </label>
                      {imageFiles.length > 0 && (
                        <div className="selected-files">
                          Selected: {imageFiles.length} file(s) (max 5)
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleImageAdd}
                    >
                      <i className="fas fa-plus"></i> Add Image URL
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="form-section">
                  <h4>Tags</h4>
                  <div className="tags-input">
                    <input
                      type="text"
                      placeholder="Enter tags separated by commas"
                      value={(formData.tags || []).join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                        setFormData(prev => ({ ...prev, tags: tags || [] }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && selectedProduct && (
        <div className="modal">
          <div className="modal-content discount-modal">
            <div className="modal-header">
              <h3>Set Discount for {selectedProduct.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDiscountModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="discount-modal-body">
              <div className="current-price-info">
                <p><strong>Current MRP:</strong> ₹{selectedProduct.listPrice || selectedProduct.price}</p>
                {selectedProduct.discountPercentApplied > 0 && (
                  <p><strong>Current Sale Price:</strong> ₹{selectedProduct.price} ({selectedProduct.discountPercentApplied}% off)</p>
                )}
              </div>

              <div className="discount-form">
                <div className="form-group">
                  <label>Discount Mode</label>
                  <select
                    value={discountFormData.discountMode}
                    onChange={(e) => setDiscountFormData(prev => ({
                      ...prev,
                      discountMode: e.target.value
                    }))}
                    className="form-control"
                  >
                    <option value="inherit">Use Shop-wide Discount ({shopSettings.globalDiscountPercent}%)</option>
                    <option value="custom">Custom Discount for This Product</option>
                  </select>
                  <small className="form-hint">
                    {discountFormData.discountMode === 'inherit' 
                      ? 'This product will use the shop-wide discount setting' 
                      : 'Set a specific discount percentage for this product only'}
                  </small>
                </div>

                {discountFormData.discountMode === 'custom' && (
                  <>
                    <div className="quick-discount-section">
                      <p className="section-label"><strong>Quick Set (Default Options):</strong></p>
                      <div className="quick-buttons">
                        <button
                          type="button"
                          className={`btn btn-sm btn-outline ${discountFormData.discountPercent === 10 ? 'active' : ''}`}
                          onClick={() => setDiscountFormData(prev => ({
                            ...prev,
                            discountPercent: 10
                          }))}
                        >
                          10%
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm btn-outline ${discountFormData.discountPercent === 20 ? 'active' : ''}`}
                          onClick={() => setDiscountFormData(prev => ({
                            ...prev,
                            discountPercent: 20
                          }))}
                        >
                          20%
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm btn-outline ${discountFormData.discountPercent === 30 ? 'active' : ''}`}
                          onClick={() => setDiscountFormData(prev => ({
                            ...prev,
                            discountPercent: 30
                          }))}
                        >
                          30%
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm btn-outline ${discountFormData.discountPercent === 50 ? 'active' : ''}`}
                          onClick={() => setDiscountFormData(prev => ({
                            ...prev,
                            discountPercent: 50
                          }))}
                        >
                          50%
                        </button>
                      </div>
                    </div>

                    <div className="divider-text">
                      <span>OR</span>
                    </div>

                    <div className="form-group">
                      <label>Enter Custom Discount Percentage</label>
                      <div className="discount-input-group">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={discountFormData.discountPercent}
                          onChange={(e) => setDiscountFormData(prev => ({
                            ...prev,
                            discountPercent: e.target.value
                          }))}
                          className="form-control"
                          placeholder="Enter any value 0-100"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                      <small className="form-hint">Enter a value between 0 and 100 (e.g., 15, 25, 35, 75)</small>
                    </div>
                    
                    {discountFormData.discountPercent > 0 && (
                      <div className="discount-preview">
                        <p><strong>Preview:</strong></p>
                        <p>MRP: ₹{selectedProduct.listPrice || selectedProduct.price}</p>
                        <p>Discount: {discountFormData.discountPercent}% off</p>
                        <p className="sale-price">
                          Sale Price: ₹{Math.round((selectedProduct.listPrice || selectedProduct.price) * (1 - discountFormData.discountPercent / 100))}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {discountFormData.discountMode === 'custom' && (
                  <div className="reset-section">
                    <button
                      type="button"
                      className="btn btn-sm btn-reset"
                      onClick={() => setDiscountFormData(prev => ({
                        discountMode: 'inherit',
                        discountPercent: 0
                      }))}
                    >
                      <i className="fas fa-undo"></i> Reset to Shop-wide Discount
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDiscountModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveDiscount}
                >
                  <i className="fas fa-save"></i> Save Discount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk CSV Upload Modal ───────────────────────────────────────── */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '560px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Upload Products via CSV</h3>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>
              {/* Download template */}
              <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 10px', fontWeight: '600', fontSize: '14px' }}>
                  Step 1 — Download the template
                </p>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>
                  Fill in Excel / Google Sheets. The template includes <strong>5 sample rows</strong> — one per product type (Shirt, Jeans, Cargo, Jacket, Kids). Delete the sample rows before uploading.
                </p>
                <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', lineHeight: '1.8' }}>
                  <strong>Sizes format by category:</strong><br />
                  Shirts / Jackets / Kids tops → <code style={{ background: '#e8e8e8', padding: '1px 4px', borderRadius: '3px' }}>S:10,M:15,L:20,XL:10</code><br />
                  Pants / Jeans / Cargo → <code style={{ background: '#e8e8e8', padding: '1px 4px', borderRadius: '3px' }}>28:10,30:15,32:20,34:10</code><br />
                  Kids by age → <code style={{ background: '#e8e8e8', padding: '1px 4px', borderRadius: '3px' }}>2-4Y:10,5-7Y:15,8-10Y:12,11-13Y:8</code><br />
                  <strong>gender</strong> → Men / Women / Kids / Unisex &nbsp;|&nbsp; <strong>categoryName</strong> must match exactly
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleDownloadTemplate}
                >
                  <i className="fas fa-download"></i> Download CSV Template
                </button>
              </div>

              {/* File select */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px', fontWeight: '600', fontSize: '14px' }}>
                  Step 2 — Select your filled CSV
                </p>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={(e) => { setCsvFile(e.target.files[0] || null); setCsvResults(null); }}
                />
                <div
                  onClick={() => csvInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${csvFile ? '#16a34a' : '#ccc'}`,
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: csvFile ? '#f0fff4' : '#fafafa',
                  }}
                >
                  {csvFile ? (
                    <>
                      <i className="fas fa-check-circle" style={{ color: '#16a34a', fontSize: '20px' }}></i>
                      <p style={{ margin: '8px 0 4px', fontWeight: '600' }}>{csvFile.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                        {(csvFile.size / 1024).toFixed(1)} KB &nbsp;·&nbsp;
                        <span
                          style={{ color: '#dc2626', cursor: 'pointer' }}
                          onClick={(e) => { e.stopPropagation(); setCsvFile(null); setCsvResults(null); if (csvInputRef.current) csvInputRef.current.value = ''; }}
                        >Remove</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-csv" style={{ fontSize: '24px', color: '#888' }}></i>
                      <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#666' }}>Click to select CSV file</p>
                    </>
                  )}
                </div>
              </div>

              {/* Results */}
              {csvResults && (
                <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: csvResults.errors?.length ? '12px' : 0 }}>
                    {[
                      { label: 'Total', value: csvResults.total, color: '#374151' },
                      { label: 'Created', value: csvResults.created, color: '#16a34a' },
                      { label: 'Failed', value: csvResults.failed, color: csvResults.failed > 0 ? '#dc2626' : '#374151' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ flex: 1, textAlign: 'center', background: '#fff', borderRadius: '6px', padding: '10px 6px', border: '1px solid #e5e5e5' }}>
                        <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color }}>{value}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                  {csvResults.errors?.length > 0 && (
                    <div style={{ maxHeight: '160px', overflowY: 'auto', background: '#fff8f8', border: '1px solid #fca5a5', borderRadius: '6px', padding: '10px' }}>
                      {csvResults.errors.map((err, i) => (
                        <p key={i} style={{ margin: '0 0 6px', fontSize: '12px' }}>
                          <strong>Row {err.row} ({err.name}):</strong> {err.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee' }}>
              <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCsvUpload}
                disabled={!csvFile || csvUploading}
              >
                {csvUploading
                  ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</>
                  : <><i className="fas fa-upload"></i> Upload Products</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
