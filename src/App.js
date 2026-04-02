import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/tailwind.css';
import './styles/main.css';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StockProvider } from './context/StockContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PageLoader from './components/PageLoader/PageLoader';

// Pages (Lazy)
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage'));
const ShopSummerPage = lazy(() => import('./pages/ShopSummerPage'));
const ShopCollectionPage = lazy(() => import('./pages/ShopCollectionPage'));
const ShopCollectionsPage = lazy(() => import('./pages/ShopCollectionsPage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

const AppLayout = () => {
  const location = useLocation();

  const hideLayout = ['/login', '/register', '/admin/login'].includes(location.pathname);

  return (
    <>
      {!hideLayout && <Header />}

      <main>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* PRODUCTS */}
          <Route path="/shop" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage />} />
          <Route path="/shop-summer" element={<ShopSummerPage />} />
          <Route path="/shop-collection" element={<ShopCollectionsPage />} />
          <Route path="/collections" element={<ShopCollectionsPage />} />
          <Route path="/collection/:slug" element={<CollectionPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* CATEGORY */}
          <Route path="/party-wear" element={<CategoryPage />} />
          <Route path="/casual" element={<CategoryPage />} />
          <Route path="/polo-tshirts" element={<CategoryPage />} />
          <Route path="/new-collection" element={<CategoryPage />} />
          <Route path="/striped-collection" element={<CategoryPage />} />
          <Route path="/cargo-collection" element={<CategoryPage />} />
          <Route path="/trousers-collection" element={<CategoryPage />} />
          <Route path="/denim-collection" element={<CategoryPage />} />
          <Route path="/winter-collection" element={<CategoryPage />} />
          <Route path="/formal-pants" element={<CategoryPage />} />
          <Route path="/summer-final" element={<CategoryPage />} />
          <Route path="/office-collection" element={<CategoryPage />} />
          <Route path="/checked-collection" element={<CategoryPage />} />

          {/* OTHER */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* USER */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* ADMIN */}
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* FALLBACK */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <StockProvider>
          <CartProvider>
            <WishlistProvider>
              <Suspense fallback={<PageLoader />}>
                <AppLayout />
              </Suspense>

              <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="dark"
              />
            </WishlistProvider>
          </CartProvider>
        </StockProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;