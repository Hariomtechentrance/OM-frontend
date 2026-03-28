import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/Products/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './CollectionPage.css';

const CollectionPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [collectionName, setCollectionName] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const colRes = await api.get(`/collections/${encodeURIComponent(slug)}`);
        if (colRes.data?.success && colRes.data.collection) {
          setCollectionName(colRes.data.collection.name || slug);
        } else {
          setCollectionName(slug.replace(/-/g, ' '));
        }

        const prodRes = await api.get(
          `/collections/${encodeURIComponent(slug)}/products?limit=100`
        );
        if (prodRes.data?.success) {
          setProducts(prodRes.data.products || []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Collection load error:', err);
        toast.error('Could not load this collection');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      return;
    }
    addToCart(product, 1, undefined, undefined);
  };

  return (
    <div className="collection-page collection-page--slug">
      <div className="collection-page-inner">
        <nav className="collection-breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          <Link to="/collections">Collections</Link>
          <span> / </span>
          <span>{collectionName || slug}</span>
        </nav>

        <header className="collection-page-header">
          <h1>{collectionName || slug}</h1>
          <p className="collection-product-count">
            {loading ? 'Loading…' : `${products.length} product${products.length === 1 ? '' : 's'}`}
          </p>
        </header>

        {loading ? (
          <p className="collection-loading-text">Loading products…</p>
        ) : products.length === 0 ? (
          <div className="collection-empty">
            <p>No products in this collection yet.</p>
            <Link to="/shop" className="btn-primary">
              Shop all products
            </Link>
          </div>
        ) : (
          <div className="collection-products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onQuickView={() => navigate(`/product/${product._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
