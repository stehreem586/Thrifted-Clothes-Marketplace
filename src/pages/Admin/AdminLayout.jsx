import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Store, Package, BarChart2, ShoppingBag,
  MessageSquare, Users, Scale, Settings as SettingsIcon, HelpCircle, LogOut, Plus,
  Search, Bell, Mail, SlidersHorizontal
} from 'lucide-react';
import './AdminLayout.css';


const navItems = [
  { path: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { path: '/admin/sellers', label: 'Sellers', Icon: Store },
  { path: '/admin/inventory', label: 'Inventory', Icon: Package },
  { path: '/admin/analytics', label: 'Analytics', Icon: BarChart2 },
  { path: '/admin/sales', label: 'Reviews', Icon: ShoppingBag },
  { path: '/admin/messages', label: 'Messages', Icon: MessageSquare },
  { path: '/admin/community', label: 'Community', Icon: Users },
  { path: '/admin/disputes', label: 'Disputes', Icon: Scale },
  { path: '/admin/settings', label: 'Settings', Icon: SettingsIcon },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  return (
    <div className="admin-shell">
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-dot"></span>
          <div>
            <p className="brand-name">SecondLife</p>
            <p className="brand-role">Admin Panel</p>
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
            <a href="#help" className="sidebar-footer-link"><HelpCircle size={13} /> Help Center</a>
            <a href="/" className="sidebar-footer-link"><LogOut size={13} /> Logout</a>
          </div>
          <div className="admin-avatar-row">
            <div className="admin-avatar">AP</div>
            <div>
              <p className="admin-name">Admin Panel</p>
              <p className="admin-subtext">Manage Marketplace</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="admin-main">
        {/* Top bar */}
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
          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Notifications"><Bell size={17} strokeWidth={1.8} /></button>
            <button className="topbar-icon-btn" title="Messages"><Mail size={17} strokeWidth={1.8} /></button>
            <button className="topbar-icon-btn" title="Settings"><SlidersHorizontal size={17} strokeWidth={1.8} /></button>
            <div className="topbar-avatar">A</div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
