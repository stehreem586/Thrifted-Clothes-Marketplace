import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './MHNavbar.css';

const MHNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('New York');

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  return (
    <nav className="mh-navbar">
      <div className="mh-navbar-container">
        {/* Brand logo */}
        <div className="mh-navbar-brand">
          <Link to="/" className="mh-brand-logo">
            SecondLife
          </Link>
        </div>

        {/* Search bar + Location */}
        <div className="mh-search-wrapper">
          <div className="mh-search-container">
            <svg className="mh-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search pre-loved items..." 
              className="mh-search-input"
            />
            <div className="mh-search-divider"></div>
            <div className="mh-location-picker">
              <svg className="mh-location-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="mh-location-text">{selectedLocation}</span>
              <svg className="mh-chevron-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Links & Actions */}
        <div className="mh-nav-actions">
          <ul className="mh-nav-links">
            <li className={`mh-nav-item ${currentPath === '/' ? 'active' : ''}`}>
              <Link to="/">Home</Link>
              {currentPath === '/' && <span className="mh-active-indicator"></span>}
            </li>
            <li className={`mh-nav-item ${currentPath.startsWith('/shop') ? 'active' : ''}`}>
              <Link to="/shop">Browse</Link>
              {currentPath.startsWith('/shop') && <span className="mh-active-indicator"></span>}
            </li>
            <li className={`mh-nav-item ${currentPath === '/saved' ? 'active' : ''}`}>
              <Link to="/saved">Saved</Link>
              {currentPath === '/saved' && <span className="mh-active-indicator"></span>}
            </li>
            <li className={`mh-nav-item ${currentPath.startsWith('/chat') ? 'active' : ''}`}>
              <Link to="/chat">Chat</Link>
              {currentPath.startsWith('/chat') && <span className="mh-active-indicator"></span>}
            </li>
            <li className={`mh-nav-item ${currentPath.startsWith('/order-history') ? 'active' : ''}`}>
              <Link to="/order-history">Order History</Link>
              {currentPath.startsWith('/order-history') && <span className="mh-active-indicator"></span>}
            </li>
          </ul>

          <div className="mh-icons-group">
            <button className="mh-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <button className="mh-icon-btn" aria-label="Messages">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </button>
            
            <div className="mh-profile-container">
              <button 
                className="mh-icon-btn mh-profile-trigger" 
                aria-label="Profile Menu"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              
              {showProfileMenu && (
                <div className="mh-profile-dropdown">
                  <div className="mh-dropdown-header">
                    <p className="mh-user-name">Customer User</p>
                    <p className="mh-user-email">customer@secondlife.com</p>
                  </div>
                  <div className="mh-dropdown-divider"></div>
                  <Link 
                    to="/settings" 
                    className="mh-dropdown-item" 
                    onClick={() => setShowProfileMenu(false)}
                    style={{ textDecoration: 'none', display: 'block', boxSizing: 'border-box' }}
                  >
                    Profile Settings
                  </Link>
                  <button className="mh-dropdown-item logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mh-actions-divider"></div>

          <button className="mh-sell-btn">
            Sell an Item
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MHNavbar;
