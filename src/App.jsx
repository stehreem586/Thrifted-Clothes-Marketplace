import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar/Navbar';
import Footer from './components/layout/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import MHNavbar from './pages/Marketplace-Homepage/MH-navbar/MHNavbar';
import MarketplaceHomepage from './pages/Marketplace-Homepage/MarketplaceHomepage';
import MHFooter from './pages/Marketplace-Homepage/MH-Footer/MHFooter';
import Shop from './pages/Shop/Shop';
import Chat from './pages/Chat/Chat';
import SavedItems from './pages/Saved-Items/Saved-Items';
import OrderHistory from './pages/OrderHistory/OrderHistory';
import Settings from './pages/Settings/Settings';
import Product from './pages/Product/Product';
import Storefront from './pages/Storefront/Storefront';
import SearchResults from './pages/SearchResults/SearchResults';
import Seller from './pages/Seller/Seller';
import ProfileSetup from './pages/ProfileSetup/ProfileSetup';
import SellerPublicProfile from './pages/SellerPublicProfile/SellerPublicProfile';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Admin layout + pages
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Sellers from './pages/Admin/Sellers';
import Inventory from './pages/Admin/Inventory';
import Analytics from './pages/Admin/Analytics';
import Sales from './pages/Admin/Sales';
import Messages from './pages/Admin/Messages';
import Community from './pages/Admin/Community';
import Disputes from './pages/Admin/Disputes';
import AdminSettings from './pages/Admin/Settings';

import './App.css';

function MainLayout() {
  const { user, profile } = useAuth();
  const userRole = user ? (profile?.role || user?.user_metadata?.role || localStorage.getItem('userRole') || 'customer') : null;
  return (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {userRole === 'customer' ? <MHNavbar /> : <Navbar />}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      {userRole === 'customer' ? <MHFooter /> : <Footer />}
    </div>
  );
}

function HomeRouter() {
  const { user, profile } = useAuth();
  const userRole = user ? (profile?.role || user?.user_metadata?.role || localStorage.getItem('userRole') || 'customer') : null;
  if (userRole === 'customer') {
    return <MarketplaceHomepage />;
  }
  return <Home />;
}

/* ─── Profile Setup Guard ─────────────────────────────────── */
// Redirect away if profile is already complete
function ProfileSetupGuard() {
  const { user, profile, loading, isProfileComplete } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (isProfileComplete(profile)) return <Navigate to="/" replace />;
  return <ProfileSetup />;
}

/* ─── Mode Redirect & Global Toast ───────────────────────── */
function ModeRedirectAndToast() {
  const { user, profile, loading, isProfileComplete, userMode, switchMode, toast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // 1. Check if profile setup is required
      if (!isProfileComplete(profile)) {
        if (location.pathname !== '/profile-setup' && location.pathname !== '/login') {
          navigate('/profile-setup', { replace: true });
          return;
        }
      }

      // 2. Mode redirect — use reactive userMode state (not localStorage) to avoid stale reads
      if (userMode === 'seller' && location.pathname === '/') {
        navigate('/seller', { replace: true });
      }
    }
  }, [user, profile, loading, userMode, location.pathname, navigate, isProfileComplete]);

  if (!toast.show) return null;

  return (
    <div className="global-toast">
      <div className="toast-inner">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

/* ─── App ─────────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <ModeRedirectAndToast />
      <Routes>
        {/* Public / customer routes — wrapped in MainLayout (navbar + footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeRouter />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/saved" element={<SavedItems />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/storefront" element={<Storefront />} />
          <Route path="/seller-profile/:sellerId" element={<SellerPublicProfile />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/seller" element={<Seller />} />

        {/* One-time profile setup — shown after first signup, skipped if complete */}
        <Route path="/profile-setup" element={<ProfileSetupGuard />} />

        {/* Admin portal — protected, nested under AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="sales" element={<Sales />} />
          <Route path="messages" element={<Messages />} />
          <Route path="community" element={<Community />} />
          <Route path="disputes" element={<Disputes />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;