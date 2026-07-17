import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import EditProfile from '../../../pages/EditProfile/EditProfile';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './MHNavbar.css';

const MHNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentPath = location.pathname;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Pakistan');
  const { user, profile, logout, switchMode } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Sync searchQuery state with the query param in the URL
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSellClick = () => {
    switchMode('seller');
    navigate('/seller');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleOpenEdit = () => {
    setShowProfileMenu(false);
    setShowEditProfile(true);
  };

  // Avatar display: photo → initials → icon
  const renderAvatar = () => {
    if (profile?.avatar_url) {
      return <img src={profile.avatar_url} alt="Profile" className="mh-avatar-img" />;
    }
    const initial = (profile?.name || user?.email || '?').charAt(0).toUpperCase();
    return <div className="mh-avatar-initials">{initial}</div>;
  };

  return (
    <>
      <nav className="mh-navbar">
        <div className="mh-navbar-container">
          {/* Brand logo */}
          <div className="mh-navbar-brand">
            <Link to="/" className="mh-brand-logo">SecondLife</Link>
          </div>

          {/* Search bar + Location */}
          <div className="mh-search-wrapper">
            <form className="mh-search-container" onSubmit={handleSearchSubmit}>
              <button
                type="submit"
                style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'inherit' }}
              >
                <svg className="mh-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search pre-loved items..."
                className="mh-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            </form>
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
                <Link to="/order-history">Orders</Link>
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

              {/* Cart Icon */}
              <button className="mh-icon-btn mh-cart-btn" aria-label="Cart">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span className="mh-cart-badge">2</span>
              </button>

              {/* Dark Mode Toggle */}
              <button className="mh-icon-btn mh-theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
                {isDarkMode ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>

              {/* Profile avatar button */}
              <div className="mh-profile-container">
                <button
                  className="mh-avatar-btn"
                  aria-label="Profile Menu"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  {renderAvatar()}
                </button>

                {showProfileMenu && (
                  <div className="mh-profile-dropdown">
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
                          {profile?.name || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="mh-user-email">{user?.email || ''}</p>
                        {profile?.city && <p className="mh-user-city">📍 {profile.city}</p>}
                      </div>
                    </div>
                    <div className="mh-dropdown-divider"></div>

                    <button className="mh-dropdown-item" onClick={handleOpenEdit}>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit Profile
                    </button>

                    <Link
                      to="/settings"
                      className="mh-dropdown-item"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Settings
                    </Link>

                    <div className="mh-dropdown-divider"></div>
                    <button className="mh-dropdown-item mh-dropdown-item--logout" onClick={handleLogout}>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mh-actions-divider"></div>
            <button className="mh-sell-btn" onClick={handleSellClick}>Sell an Item</button>
          </div>
        </div>
      </nav>

      {/* Edit Profile slide-in panel */}
      <EditProfile isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
    </>
  );
};

export default MHNavbar;