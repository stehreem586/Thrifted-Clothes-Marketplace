import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar/Navbar';
import Footer from './components/layout/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Admin from './pages/Admin/Admin';
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
import './App.css';

function MainLayout() {
  const userRole = localStorage.getItem('userRole');
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
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'customer') {
    return <MarketplaceHomepage />;
  }
  return <Home />;
}

function App() {
  return (
    <Router>
      <Routes>
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
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
