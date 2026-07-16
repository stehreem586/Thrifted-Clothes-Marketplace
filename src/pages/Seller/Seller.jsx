import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Seller.css';
import SellerDashboard from './SellerDashboard';
import Inventory from './Inventory';
import OrderHistory from './OrderHistory';

function Seller() {
  const { switchMode } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');

  // Search states (passed down to sub-views)
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [ordersSearch, setOrdersSearch] = useState('');

  const switchTab = (tab) => setActiveTab(tab);

  return (
    <div className="dashboard-container">

      {/* ── SIDEBAR ── */}
      <aside className="seller-sidebar">
        <div className="seller-brand">
          <svg className="logo-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="brand-info">
            <h2>SecondLife</h2>
            <p className="panel-tag">SELLER PANEL</p>
          </div>
        </div>

        <div className="seller-profile-card">
          <div className="profile-avatar">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Seller Avatar" />
          </div>
          <div className="profile-info">
            <h4>Seller Panel</h4>
            <span className="manage-badge">Manage Brand store</span>
          </div>
        </div>

        <nav className="seller-nav-menu">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: (
              <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>
            )},
            { key: 'inventory', label: 'Inventory', icon: (
              <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 11l2 2 4-4"/></>
            )},
            { key: 'history', label: 'History', icon: (
              <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>
            )},
            { key: 'sales', label: 'Sales', icon: (
              <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>
            )},
            // { key: 'messages', label: 'Messages', icon: (
            //   <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            // )},
            // { key: 'community', label: 'Community', icon: (
            //   <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            //     <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>
            // )},
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              className={`nav-item ${activeTab === key ? 'active' : ''}`}
              onClick={() => switchTab(key)}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                {icon}
              </svg>
              {label}
            </button>
          ))}
        </nav>

        {/* <button className="sidebar-action-btn" onClick={() => switchTab('inventory')}>
          Create Listing
        </button> */}

        <div className="seller-sidebar-footer">
          <button className="footer-nav-item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Help Center
          </button>
          <button className="footer-nav-item logout">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="seller-main">

        {/* Header */}
        <header className="seller-header">
          <div className="header-search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            {activeTab === 'dashboard' && (
              <input type="text" placeholder="Search articles, users, or listings..."
                value={dashboardSearch} onChange={e => setDashboardSearch(e.target.value)} />
            )}
            {activeTab === 'inventory' && (
              <input type="text" placeholder="Search your listings..."
                value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} />
            )}
            {activeTab === 'history' && (
              <input type="text" placeholder="Search orders..."
                value={ordersSearch} onChange={e => setOrdersSearch(e.target.value)} />
            )}
            {!['dashboard', 'inventory', 'history'].includes(activeTab) && (
              <input type="text" placeholder="Search..." />
            )}
          </div>

          <div className="header-actions">
            <div className="header-nav-shortcuts">
              <Link to="/" className="shortcut-link" onClick={() => switchMode('buyer')}>Marketplace</Link>
              <a href="/sell" className="shortcut-link active">Sell</a>
              <a href="/collections" className="shortcut-link">Collections</a>
            </div>
            <button className="icon-btn notification-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <button className="icon-btn message-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </button>
            <button className="icon-btn settings-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            <div className="user-profile-avatar">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Avatar" />
            </div>
          </div>
        </header>

        {/* ── Views ── */}
        {activeTab === 'dashboard' && (
          <SellerDashboard dashboardSearch={dashboardSearch} setDashboardSearch={setDashboardSearch} />
        )}

        {activeTab === 'inventory' && (
          <Inventory inventorySearch={inventorySearch} />
        )}

        {activeTab === 'history' && (
          <OrderHistory ordersSearch={ordersSearch} />
        )}

        {/* Placeholder views for other tabs */}
        {['sales', 'messages', 'community'].includes(activeTab) && (
          <div className="view-content fade-in">
            <div className="view-heading">
              <div>
                <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                <p className="view-sub">This section is coming soon.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Seller;