import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useListings } from '../../context/ListingsContext';
import './Seller.css';
import SellerDashboard from './SellerDashboard';
import Inventory from './Inventory';
import OrderHistory from './OrderHistory';
import SellerProfile from './SellerProfile';

function Seller() {
  const { switchMode, user, profile } = useAuth();
  const { notifications, conversations, setConversations, sendSellerReply, markNotificationRead, markAllNotificationsRead } = useListings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const dropdownRef = useRef(null);

  // First time Seller Onboarding (3 interactive pages)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('secondlife_seller_onboarded');
  });
  const [onboardingStep, setOnboardingStep] = useState(1);

  const [activeChatId, setActiveChatId] = useState(() => {
    return conversations && conversations.length > 0 ? conversations[0].id : null;
  });
  const [replyInput, setReplyInput] = useState('');

  // Sync activeChatId when new conversations arrive
  useEffect(() => {
    if (!activeChatId && conversations.length > 0) {
      setActiveChatId(conversations[0].id);
    }
  }, [conversations]);

  // Search states (passed down to sub-views)
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [ordersSearch, setOrdersSearch] = useState('');

  const switchTab = (tab) => {
    setActiveTab(tab);
    setShowProfileMenu(false);
  };

  const handleSwitchToBuyer = () => {
    switchMode('buyer');
    navigate('/');
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('secondlife_seller_onboarded', 'true');
    setShowOnboarding(false);
    switchTab('profile'); // Directs user to complete their mandatory profile details!
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeChatId) return;
    sendSellerReply(activeChatId, replyInput.trim());
    setReplyInput('');
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

  // Close modals on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        setShowHelpGuide(false);
        setShowMessagesModal(false);
        setShowNotifModal(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

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

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];

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
          <button className="footer-nav-item" onClick={() => setShowHelpGuide(true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Help Center
          </button>
          <button className="footer-nav-item logout" onClick={handleSwitchToBuyer}>
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
            <button
              className="icon-btn notification-btn"
              onClick={() => setShowNotifModal(true)}
              title="Store Notifications"
              style={{ position: 'relative' }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notifications && notifications.filter(n => !n.read).length > 0 && (
                <span style={{
                  position: 'absolute', top: '3px', right: '3px',
                  minWidth: '16px', height: '16px', background: '#ef4444',
                  borderRadius: '50%', fontSize: '9px', fontWeight: '700',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, padding: '0 2px'
                }}>
                  {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Dedicated Seller Messages Button */}
            <button
              className="icon-btn message-btn"
              onClick={() => { setShowMessagesModal(true); setActiveChatId(conversations[0]?.id || null); }}
              title="Seller Messages Inbox"
              style={{ position: 'relative' }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {conversations && conversations.filter(c => c.unread).length > 0 && (
                <span style={{
                  position: 'absolute', top: '3px', right: '3px',
                  minWidth: '16px', height: '16px', background: '#f97316',
                  borderRadius: '50%', fontSize: '9px', fontWeight: '700',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, padding: '0 2px'
                }}>
                  {conversations.filter(c => c.unread).length}
                </span>
              )}
            </button>

            {/* Profile Avatar Button + Dropdown */}
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
          <Inventory inventorySearch={inventorySearch} onNavigateToProfile={() => switchTab('profile')} />
        )}

        {activeTab === 'history' && (
          <OrderHistory ordersSearch={ordersSearch} />
        )}

        {activeTab === 'profile' && (
          <SellerProfile />
        )}

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

      {/* ── Help Guide Modal ── */}
      {showHelpGuide && (
        <div className="seller-help-overlay" onClick={() => setShowHelpGuide(false)}>
          <div className="seller-help-modal" onClick={e => e.stopPropagation()}>
            <div className="seller-help-header">
              <h3>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Seller Guide & Help Center
              </h3>
              <button className="seller-help-close-btn" onClick={() => setShowHelpGuide(false)}>✕</button>
            </div>
            <div className="seller-help-body">
              <div className="help-step-card">
                <div className="help-step-num">1</div>
                <div className="help-step-content">
                  <h4>Create & Publish Listings Live</h4>
                  <p>Go to the <strong>Inventory</strong> tab and click <strong>Create New Listing</strong>. Upload photos, set price and condition. Once published, your item is instantly visible to real buyers in the Marketplace in real-time!</p>
                </div>
              </div>

              <div className="help-step-card">
                <div className="help-step-num">2</div>
                <div className="help-step-content">
                  <h4>Track Real Performance & Sales</h4>
                  <p>In the <strong>Dashboard</strong> tab, use real date filters (Today, Last 7 Days, This Month, All Time) to inspect your revenue, listing count, recent sales, and dynamic <strong>Sales Over Time</strong> SVG charts (Weekly & Monthly views).</p>
                </div>
              </div>

              <div className="help-step-card">
                <div className="help-step-num">3</div>
                <div className="help-step-content">
                  <h4>Fulfill Customer Orders</h4>
                  <p>Manage pending shipments and view completed sales under <strong>History</strong>. Export CSV reports and monitor your average order value automatically.</p>
                </div>
              </div>

              <div className="help-step-card">
                <div className="help-step-num">4</div>
                <div className="help-step-content">
                  <h4>Build Storefront Profile</h4>
                  <p>Update your store name, city, bio, and phone number under <strong>Store Profile</strong>. Enable "Show phone number in ads" so buyers can reach you directly on WhatsApp.</p>
                </div>
              </div>

              <div className="help-step-card">
                <div className="help-step-num">5</div>
                <div className="help-step-content">
                  <h4>Switch Between Seller and Buyer Modes</h4>
                  <p>Click <strong>Switch to Buyer</strong> in the bottom left sidebar at any time to return to the customer marketplace view. You can switch back by choosing "Sell" in the top navigation.</p>
                </div>
              </div>
            </div>
            <div className="seller-help-footer">
              <button className="seller-help-gotit-btn" onClick={() => setShowHelpGuide(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3-Step Interactive First-Time Seller Onboarding Modal ── */}
      {showOnboarding && (
        <div className="seller-help-overlay">
          <div className="seller-help-modal" style={{ maxWidth: '520px', padding: 0, overflow: 'hidden' }}>
            <div style={{ background: '#0f172a', color: '#fff', padding: '24px 28px', textAlign: 'center', position: 'relative' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', tracking: '1px', fontWeight: '700', color: '#c19358' }}>
                Seller Onboarding • Step {onboardingStep} of 3
              </span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '22px', fontWeight: '700' }}>
                {onboardingStep === 1 && '🛍️ Welcome to SecondLife Selling!'}
                {onboardingStep === 2 && '📊 Track Real Sales & Inventory'}
                {onboardingStep === 3 && '🔐 Complete Profile & Verify Phone'}
              </h2>
            </div>

            <div style={{ padding: '28px 28px 20px 28px', textAlign: 'center' }}>
              {onboardingStep === 1 && (
                <div>
                  <div style={{ width: '70px', height: '70px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#c19358' }}>
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                    Turn your pre-loved fashion into income! Showcase your items directly to thousands of active thrift buyers across Pakistan.
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    SecondLife is built for fast, transparent, and eco-friendly circular fashion commerce.
                  </p>
                </div>
              )}

              {onboardingStep === 2 && (
                <div>
                  <div style={{ width: '70px', height: '70px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#0284c7' }}>
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                    Monitor 100% real weekly sales counts, inspect item views & hearts, and navigate inventory with 4 products per page.
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Filter performance by Today, Last 7 Days, This Month, or All Time instantly.
                  </p>
                </div>
              )}

              {onboardingStep === 3 && (
                <div>
                  <div style={{ width: '70px', height: '70px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#16a34a' }}>
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 11l2 2 4-4"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                    Before publishing your first item, complete your Store Name, City, and verify your Phone Number via 4-digit OTP.
                  </p>
                  <p style={{ fontSize: '13px', color: '#d97706', background: '#fffbeb', padding: '10px', borderRadius: '8px' }}>
                    Mandatory verification ensures maximum buyer confidence and safe transactions.
                  </p>
                </div>
              )}

              {/* Progress indicator dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0 10px 0' }}>
                {[1, 2, 3].map(step => (
                  <div
                    key={step}
                    style={{
                      width: step === onboardingStep ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: step === onboardingStep ? '#0f172a' : '#cbd5e1',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="seller-help-footer" style={{ padding: '16px 28px', justifyContent: 'space-between' }}>
              {onboardingStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {onboardingStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(prev => prev + 1)}
                  className="seller-help-gotit-btn"
                  style={{ padding: '10px 20px' }}
                >
                  Next Step ➔
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="seller-help-gotit-btn"
                  style={{ padding: '10px 20px', background: '#c19358' }}
                >
                  Complete Store Profile Now ➔
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Dedicated Seller Messages Inbox Modal ── */}
      {showMessagesModal && (
        <div className="seller-help-overlay" onClick={() => setShowMessagesModal(false)}>
          <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', padding: 0, overflow: 'hidden', height: '520px', display: 'flex', flexDirection: 'column' }}>
            <div className="seller-help-header" style={{ padding: '16px 20px', background: '#0f172a', color: '#fff' }}>
              <h3 style={{ color: '#fff' }}>💬 Seller Messages &amp; Buyer Inquiries</h3>
              <button className="seller-help-close-btn" style={{ color: '#fff' }} onClick={() => setShowMessagesModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Column: Buyer Conversations */}
              <div style={{ width: '260px', borderRight: '1px solid #e2e8f0', background: '#f8fafc', overflowY: 'auto' }}>
                <div style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Buyer Conversations ({conversations.length})
                </div>
                {conversations.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#64748b' }}>No messages yet</p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', lineHeight: '1.5' }}>
                      When buyers message you about your listings, they will appear here.
                    </p>
                  </div>
                ) : (
                  conversations.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      style={{
                        display: 'flex', gap: '10px', padding: '12px 16px', cursor: 'pointer',
                        background: activeChatId === chat.id ? '#ffffff' : 'transparent',
                        borderLeft: activeChatId === chat.id ? '4px solid #c19358' : '4px solid transparent',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <img src={chat.buyerAvatar} alt={chat.buyerName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{chat.buyerName}</span>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>{chat.time}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right Column: Chat or empty state */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
                {!activeChat ? (
                  /* No active chat — show placeholder */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '14px' }}>💬</div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>No conversations yet</p>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', textAlign: 'center', lineHeight: '1.6', color: '#64748b' }}>
                      Buyers can message you from any of your active listings.<br />
                      Replies from you will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={activeChat.buyerAvatar} alt={activeChat.buyerName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{activeChat.buyerName}</h4>
                        <span style={{ fontSize: '11px', color: '#16a34a' }}>● Active Buyer</span>
                      </div>
                      {activeChat.productTitle && (
                        <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#f1f5f9', padding: '3px 10px', borderRadius: '99px', color: '#475569' }}>
                          Re: {activeChat.productTitle}
                        </span>
                      )}
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activeChat.messages.map((msg, idx) => (
                        <div
                          key={idx}
                          style={{
                            alignSelf: msg.sender === 'seller' ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            background: msg.sender === 'seller' ? '#0f172a' : '#f1f5f9',
                            color: msg.sender === 'seller' ? '#ffffff' : '#1e293b',
                            padding: '10px 14px',
                            borderRadius: msg.sender === 'seller' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            fontSize: '13px'
                          }}
                        >
                          <p style={{ margin: 0, lineHeight: '1.4' }}>{msg.text}</p>
                          <span style={{ display: 'block', fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>{msg.time}</span>
                        </div>
                      ))}
                    </div>

                    {/* Reply Form */}
                    <form onSubmit={handleSendReply} style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Type your reply to buyer..."
                        value={replyInput}
                        onChange={e => setReplyInput(e.target.value)}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                      <button type="submit" className="seller-help-gotit-btn" style={{ padding: '0 18px', fontSize: '13px' }}>
                        Send
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Modal — Professional Design ── */}
      {showNotifModal && (
        <div className="seller-help-overlay" onClick={() => { markAllNotificationsRead(); setShowNotifModal(false); }}>
          <div
            className="seller-help-modal notif-modal-pro"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: 0, overflow: 'hidden', borderRadius: '18px' }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              padding: '20px 22px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '15px' }}>Notifications</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                    {notifications.filter(n => !n.read).length > 0
                      ? `${notifications.filter(n => !n.read).length} unread`
                      : 'All caught up'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {notifications.filter(n => !n.read).length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    style={{
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#e2e8f0', fontSize: '11px', fontWeight: '600',
                      padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                    width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >✕</button>
              </div>
            </div>

            {/* Notification List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', background: '#f8fafc' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '50px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '44px', marginBottom: '12px', filter: 'grayscale(0.3)' }}>🔕</div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>All caught up!</p>
                  <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                    Buyer activity like messages, wishlist adds,<br/>and orders will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  {notifications.map((n, idx) => {
                    // Icon per notification type
                    const iconMap = {
                      like:    { emoji: '❤️', bg: '#fef2f2', dot: '#ef4444' },
                      message: { emoji: '💬', bg: '#eff6ff', dot: '#3b82f6' },
                      listing: { emoji: '🛍️', bg: '#f0fdf4', dot: '#22c55e' },
                      system:  { emoji: '🎉', bg: '#fefce8', dot: '#eab308' },
                      info:    { emoji: '📢', bg: '#f5f3ff', dot: '#8b5cf6' },
                    };
                    const style = iconMap[n.type] || iconMap.info;

                    return (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '12px',
                          padding: '14px 18px',
                          background: n.read ? 'transparent' : '#fff',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          position: 'relative',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : '#fff'}
                      >
                        {/* Unread dot */}
                        {!n.read && (
                          <div style={{
                            position: 'absolute', top: '18px', right: '14px',
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: style.dot, flexShrink: 0
                          }} />
                        )}

                        {/* Icon bubble */}
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '12px',
                          background: style.bg, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          {style.emoji}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                            <p style={{
                              margin: 0, fontWeight: n.read ? '500' : '700',
                              fontSize: '13px', color: '#0f172a',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {n.title}
                            </p>
                            <span style={{ fontSize: '10.5px', color: '#94a3b8', marginLeft: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {n.time}
                            </span>
                          </div>
                          <p style={{
                            margin: 0, fontSize: '12px', color: '#64748b',
                            lineHeight: '1.45', overflow: 'hidden',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                          }}>
                            {n.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '12px 18px', background: '#fff',
                borderTop: '1px solid #e2e8f0', textAlign: 'center'
              }}>
                <button
                  onClick={() => setShowNotifModal(false)}
                  style={{
                    background: 'none', border: 'none', color: '#64748b',
                    fontSize: '12px', cursor: 'pointer', fontWeight: '500'
                  }}
                >
                  Close panel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Seller;