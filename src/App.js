import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/tailwind.css';
import './styles/main.css';
import { trackPageView } from './utils/analytics';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StockProvider } from './context/StockContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Header from './components/Header/Header';
import PromoBanner from './components/PromoBanner/PromoBanner';
import Footer from './components/Footer/Footer';
import PageLoader from './components/PageLoader/PageLoader';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

// Pages (Lazy)
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const KidsComingSoonPage = lazy(() => import('./pages/KidsComingSoonPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage'));
const ShopSummerPage = lazy(() => import('./pages/ShopSummerPage'));
const ShopCollectionsPage = lazy(() => import('./pages/ShopCollectionsPage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const ReturnPolicyPage = lazy(() => import('./pages/ReturnPolicyPage'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

const AppLayout = () => {
  const location = useLocation();

  const hideLayout = ['/login', '/register', '/admin/login'].includes(location.pathname);

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <PromoBanner />}

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
          <Route path="/kids" element={<KidsComingSoonPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* CATEGORY */}
          <Route path="/party-wear" element={<CollectionPage />} />
          <Route path="/casual" element={<CollectionPage />} />
          <Route path="/polo-tshirts" element={<CollectionPage />} />
          <Route path="/new-collection" element={<CollectionPage />} />
          <Route path="/striped-collection" element={<CollectionPage />} />
          <Route path="/cargo-collection" element={<CollectionPage />} />
          <Route path="/trousers-collection" element={<CollectionPage />} />
          <Route path="/denim-collection" element={<CollectionPage />} />
          <Route path="/winter-collection" element={<CollectionPage />} />
          <Route path="/formal-pants" element={<CollectionPage />} />
          <Route path="/summer-final" element={<CollectionPage />} />
          <Route path="/office-collection" element={<CollectionPage />} />
          <Route path="/checked-collection" element={<CollectionPage />} />
          <Route path="/monsoon-collection" element={<CollectionPage />} />

          {/* OTHER */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route
            path="/order-status"
            element={<InfoPage title="Order Status" subtitle="Track your order and shipping progress." />}
          />
          <Route
            path="/faq"
            element={<FAQPage />}
          />
          <Route
            path="/privacy"
            element={<PrivacyPolicyPage />}
          />
          <Route
            path="/return-policy"
            element={<ReturnPolicyPage />}
          />
          <Route
            path="/shipping-policy"
            element={<InfoPage title="Shipping Policy" subtitle="Shipping timelines, service levels, and delivery regions." />}
          />
          <Route
            path="/returns"
            element={<InfoPage title="Returns & Exchanges" subtitle="How returns, exchanges, and refunds work." />}
          />
          <Route
            path="/delivery"
            element={<InfoPage title="Delivery Information" subtitle="Delivery windows and dispatch process details." />}
          />
          <Route
            path="/privacy"
            element={<InfoPage title="Privacy Policy" subtitle="How we collect, use, and protect customer data." />}
          />
          <Route
            path="/terms"
            element={<InfoPage title="Terms & Conditions" subtitle="Guidelines and legal terms for using our platform." />}
          />
          <Route
            path="/our-story"
            element={<InfoPage title="Our Story" subtitle="The journey and values behind Black Locust." />}
          />
          <Route
            path="/store-locator"
            element={<InfoPage title="Store Locator" subtitle="Find a Black Locust store near you." />}
          />
          <Route
            path="/blog"
            element={<InfoPage title="Blog" subtitle="Style stories, trends, and seasonal updates." />}
          />
          <Route
            path="/careers"
            element={<InfoPage title="Careers" subtitle="Build your career with Black Locust." />}
          />
          <Route
            path="/gift-cards"
            element={<InfoPage title="Gift Cards" subtitle="Gift style with Black Locust digital cards." />}
          />

          {/* USER */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
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
      <ScrollToTop />
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