import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.css';

// Import contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StockProvider } from './context/StockContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// Pages
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
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

// New Collection Pages
const PartyWearPage = lazy(() => import('./pages/PartyWearPage'));
const CasualPage = lazy(() => import('./pages/CasualPage'));
const PoloTshirtsPage = lazy(() => import('./pages/PoloTshirtsPage'));
const NewCollectionPage = lazy(() => import('./pages/NewCollectionPage'));
const StripedCollectionPage = lazy(() => import('./pages/StripedCollectionPage'));
const CargoCollectionPage = lazy(() => import('./pages/CargoCollectionPage'));
const TrousersCollectionPage = lazy(() => import('./pages/TrousersCollectionPage'));
const DenimCollectionPage = lazy(() => import('./pages/DenimCollectionPage'));
const WinterCollectionPage = lazy(() => import('./pages/WinterCollectionPage'));
const FormalPantsPage = lazy(() => import('./pages/FormalPantsPage'));
const SummerFinalPage = lazy(() => import('./pages/SummerFinalPage'));
const OfficeCollectionPage = lazy(() => import('./pages/OfficeCollectionPage'));
const CheckedCollectionPage = lazy(() => import('./pages/CheckedCollectionPage'));

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const isAdminLoginRoute = location.pathname === '/admin/login';
  
  return (
    <>
      {isAdminRoute ? (
        // Admin routes - no Header/Footer (authentication required)
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      ) : isAdminLoginRoute ? (
        // Admin login page - no Header/Footer
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      ) : isAuthRoute ? (
        // Auth pages - no Header/Footer
        <div className="auth-app">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      ) : (
        // Main app - with Header/Footer
        <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ProductsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/new-arrivals" element={<NewArrivalsPage />} />
              <Route path="/shop-summer" element={<ShopSummerPage />} />
              <Route path="/shop-collection" element={<ShopCollectionPage />} />
              <Route path="/collections" element={<ShopCollectionPage />} />
              <Route path="/collection/:slug" element={<CollectionPage />} />
              <Route path="/search" element={<SearchPage />} />
              
              {/* Category Routes */}
              <Route path="/category/mens-collection" element={<Navigate to="/products" replace />} />
              <Route path="/category/kids-collection" element={<Navigate to="/products" replace />} />
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
              
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Protected routes */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
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
              <Suspense fallback={<div>Loading...</div>}>
                <AppContent />
              </Suspense>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
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
