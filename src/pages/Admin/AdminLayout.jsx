import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Store, Package, BarChart2, Star,
  MessageSquare, Users, Scale, Settings as SettingsIcon, LogOut,
  Bell, Globe, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useListings } from '../../context/ListingsContext';
import './AdminLayout.css';

const navItems = [
  { path: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { path: '/admin/sellers', label: 'Sellers', Icon: Store },
  { path: '/admin/inventory', label: 'Inventory', Icon: Package },
  { path: '/admin/analytics', label: 'Analytics', Icon: BarChart2 },
  { path: '/admin/sales', label: 'Reviews', Icon: Star },
  { path: '/admin/messages', label: 'Messages', Icon: MessageSquare },
  { path: '/admin/community', label: 'Community', Icon: Users },
  { path: '/admin/disputes', label: 'Disputes', Icon: Scale },
  { path: '/admin/settings', label: 'Settings', Icon: SettingsIcon },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, profile, logout, switchMode } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useListings();
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleGoToMarketplace = () => {
    switchMode('buyer');
    navigate('/');
  };

  const renderAvatar = () => {
    if (profile?.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt="Admin Avatar"
          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
        />
      );
    }
    const initial = (profile?.name || user?.email || 'A').charAt(0).toUpperCase();
    return (
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: '#c19358', color: '#ffffff', fontSize: '15px',
        fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {initial}
      </div>
    );
  };

  return (
    <div className="admin-shell">
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-dot" style={{ background: '#ad7f45' }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>S</span>
          </div>
          <div>
            <p className="brand-name">SecondLife</p>
            <p className="brand-role">Admin Portal</p>
          </div>
        </div>

        {/* Profile Card in Sidebar */}
        <div className="admin-avatar-row" style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0' }}>
          {renderAvatar()}
          <div style={{ minWidth: 0 }}>
            <p className="admin-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.name || user?.email?.split('@')[0] || 'Admin User'}
            </p>
            <p className="admin-subtext">System Administrator</p>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ path, label, Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><Icon size={16} strokeWidth={1.8} /></span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-footer-links">
            <button
              type="button"
              className="sidebar-footer-link"
              onClick={handleGoToMarketplace}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <Globe size={14} /> Go to Marketplace
            </button>
            <button
              type="button"
              className="sidebar-footer-link"
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', textAlign: 'left', width: '100%' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="admin-main">
        {/* Topbar: Search Bar + Notifications & Avatar */}
        <header className="admin-topbar">
          <div className="topbar-search">
            <Search size={15} className="search-icon-top" />
            <input
              type="text"
              placeholder="Search analytics, listings or users…"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </div>
          <div className="topbar-actions" style={{ gap: '16px', alignItems: 'center' }}>
            {/* Universal Notifications Bell */}
            <button
              className="topbar-icon-btn"
              title="Universal Notifications"
              onClick={() => setShowNotifModal(true)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <Bell size={20} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '1px', right: '1px',
                  minWidth: '16px', height: '16px', background: '#ef4444',
                  borderRadius: '50%', fontSize: '10px', fontWeight: '700',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, padding: '0 3px'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Admin Avatar */}
            <div onClick={() => navigate('/admin/settings')} style={{ cursor: 'pointer' }}>
              {renderAvatar()}
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* ── Universal Notifications Modal (Buyer, Seller & Admin Events) ── */}
      {showNotifModal && (
        <div className="seller-help-overlay" onClick={() => { markAllNotificationsRead(); setShowNotifModal(false); }}>
          <div
            className="seller-help-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '500px', padding: 0, overflow: 'hidden', borderRadius: '18px' }}
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
                  <Bell size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '15px' }}>Universal Notifications</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                    Seller, Buyer &amp; Marketplace Updates
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    style={{
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#e2e8f0', fontSize: '11px', fontWeight: '600',
                      padding: '5px 12px', borderRadius: '8px', cursor: 'pointer'
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
            <div style={{ maxHeight: '420px', overflowY: 'auto', background: '#f8fafc' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '50px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '44px', marginBottom: '12px' }}>🔕</div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>No notifications yet</p>
                  <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                    Activity from buyers and sellers will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        padding: '14px 18px',
                        background: n.read ? 'transparent' : '#ffffff',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', flexShrink: 0
                      }}>
                        🔔
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <p style={{ margin: 0, fontWeight: n.read ? '500' : '700', fontSize: '13px', color: '#0f172a' }}>
                            {n.title}
                          </p>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{n.time}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                          {n.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
