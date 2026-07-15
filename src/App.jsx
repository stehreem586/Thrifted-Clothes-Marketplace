import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar/Navbar';
import Footer from './components/layout/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import MHNavbar from './pages/Marketplace-Homepage/MH-navbar/MHNavbar';
import MarketplaceHomepage from './pages/Marketplace-Homepage/MarketplaceHomepage';
import MHFooter from './pages/Marketplace-Homepage/MH-Footer/MHFooter';
import Shop from './pages/Shop/Shop';
import Chat from './pages/Chat/Chat';
import SavedItems from './pages/Saved-Items/Saved-Items';
import OrderHistory from './pages/OrderHistory/OrderHistory';
import Settings from './pages/Settings/Settings';
import Product from './pages/Product/Product';
import Seller from './pages/Seller/Seller';
import ProfileSetup from './pages/ProfileSetup/ProfileSetup';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Admin layout + pages
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

/* ─── Loading Spinner ─────────────────────────────────────── */
function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--auth-bg, #fffdf9)'
    }}>
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid #e5e0d8',
        borderTopColor: '#c19358',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Main Layout (with nav + footer) ─────────────────────── */
function MainLayout() {
  const { user, profile, loading, isProfileComplete } = useAuth();

  if (loading) return <LoadingSpinner />;

  // If logged-in customer hasn't completed profile, redirect to setup
  if (user && profile !== undefined) {
    const role = profile?.role || 'customer';
    if (role === 'customer' && !isProfileComplete(profile)) {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  const userRole = user ? (profile?.role || 'customer') : null;
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

/* ─── Home Router (customer vs guest/other roles) ─────────── */
function HomeRouter() {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  const userRole = user ? (profile?.role || 'customer') : null;
  if (userRole === 'customer') return <MarketplaceHomepage />;
  return <Home />;
}

/* ─── Profile Setup Guard ─────────────────────────────────── */
// Redirect away if profile is already complete
function ProfileSetupGuard() {
  const { user, profile, loading, isProfileComplete } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (isProfileComplete(profile)) return <Navigate to="/" replace />;
  return <ProfileSetup />;
}

/* ─── App ─────────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeRouter />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/saved" element={<SavedItems />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/product/:id" element={<Product />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* One-time profile setup — shown after first signup, skipped if complete */}
        <Route path="/profile-setup" element={<ProfileSetupGuard />} />

        {/* Seller/Merchant portal - protected */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRoles={['merchant', 'admin']}>
              <Seller />
            </ProtectedRoute>
          }
        />

        {/* Admin portal — protected and inside AdminLayout */}
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
