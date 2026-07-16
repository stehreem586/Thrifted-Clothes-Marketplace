import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Seller.css';
import SellerDashboard from './SellerDashboard';
import Inventory from './Inventory';
import OrderHistory from './OrderHistory';
import SellerProfile from './SellerProfile';

function Seller() {
  const { switchMode, user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Search states (passed down to sub-views)
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [ordersSearch, setOrdersSearch] = useState('');

  const switchTab = (tab) => {
    setActiveTab(tab);
    setShowProfileMenu(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showProfileMenu]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowProfileMenu(false);
    };
    if (showProfileMenu) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showProfileMenu]);

  // Avatar display fallback
  const renderAvatar = () => {
    if (profile?.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt="Profile"
          className="mh-avatar-img"
        />
      );
    }
    const initial = (profile?.name || user?.email || '?').charAt(0).toUpperCase();
    return <div className="mh-avatar-initials">{initial}</div>;
  };

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
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Seller Avatar" />
            ) : (
              <div className="mh-avatar-initials" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c19358', color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                {(profile?.name || user?.email || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h4>{profile?.name || user?.email?.split('@')[0] || 'Seller Store'}</h4>
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
            { key: 'profile', label: 'Store Profile', icon: (
              <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>
            )},
            { key: 'sales', label: 'Sales', icon: (
              <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>
            )},
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

        <div className="seller-sidebar-footer">
          <button className="footer-nav-item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Help Center
          </button>
          <button className="footer-nav-item logout" onClick={() => switchMode('buyer')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Switch to Buyer
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

            {/* Profile Avatar Button + Dropdown (Matching Buyer Dropdown Structure but without settings & logout) */}
            <div className="mh-profile-container" ref={dropdownRef}>
              <button
                className="mh-avatar-btn"
                aria-label="Profile Menu"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {renderAvatar()}
              </button>

              {showProfileMenu && (
                <div className="mh-profile-dropdown" style={{ right: 0, top: '45px' }}>
                  {/* Dropdown header with avatar */}
                  <div className="mh-dropdown-header">
                    <div className="mh-dropdown-avatar">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="mh-dropdown-avatar-img" />
                      ) : (
                        <div className="mh-dropdown-avatar-initials">
                          {(profile?.name || user?.email || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="mh-user-name">
                        {profile?.name || user?.email?.split('@')[0] || 'Seller Store'}
                      </p>
                      <p className="mh-user-email">{user?.email || ''}</p>
                      {profile?.city && (
                        <p className="mh-user-city">📍 {profile.city}</p>
                      )}
                    </div>
                  </div>
                  <div className="mh-dropdown-divider"></div>

                  {/* View Selling Profile — switches to profile tab */}
                  <button
                    className="mh-dropdown-item"
                    onClick={() => switchTab('profile')}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    View Selling Profile
                  </button>
                </div>
              )}
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

        {activeTab === 'profile' && (
          <SellerProfile />
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