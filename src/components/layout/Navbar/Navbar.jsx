import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import EditProfile from '../../../pages/EditProfile/EditProfile';
import './Navbar.css';
import Logo from '../../common/Logo/Logo';

const navLinks = [
  { name: 'New Arrivals', href: '#', isActive: true },
  { name: 'Women', href: '#', isActive: false },
  { name: 'Men', href: '#', isActive: false },
  { name: 'Categories', href: '#', isActive: false },
  { name: 'Sale', href: '#', isActive: false },
  { name: 'About Us', href: '#', isActive: false },
  { name: 'Blog', href: '#', isActive: false },
];

const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleOpenEdit = () => {
    setShowDropdown(false);
    setShowEditProfile(true);
  };

  const renderAvatar = () => {
    if (profile?.avatar_url) {
      return (
        <img src={profile.avatar_url} alt="Profile" className="nb-avatar-img" />
      );
    }
    const initial = (profile?.name || user?.email || '?').charAt(0).toUpperCase();
    return <div className="nb-avatar-initials">{initial}</div>;
  };

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <div className="announcement-bar">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#c19358">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h4v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
        </svg>
        <span>Free shipping on orders above Rs. 2,500</span>
      </div>

      <nav className="navbar-container">
        <div className="navbar-top">
          <div className="navbar-logo">
            <Logo size="medium" />
          </div>

          <form className="navbar-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search outfits, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          <div className="navbar-actions">
            {user ? (
              <div className="nb-profile-container">
                {/* Admin / Seller portal links */}
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="portal-link" style={{ fontSize: '13px', fontWeight: '600', color: '#ad7f45', textDecoration: 'none', marginRight: '8px' }}>
                    Admin Portal
                  </Link>
                )}
                {profile?.role === 'merchant' && (
                  <Link to="/seller" className="portal-link" style={{ fontSize: '13px', fontWeight: '600', color: '#ad7f45', textDecoration: 'none', marginRight: '8px' }}>
                    Seller Portal
                  </Link>
                )}

                {/* Avatar button */}
                <button
                  className="nb-avatar-btn"
                  onClick={() => setShowDropdown(d => !d)}
                  aria-label="Profile menu"
                >
                  {renderAvatar()}
                </button>

                {showDropdown && (
                  <div className="nb-dropdown">
                    <div className="nb-dropdown-header">
                      <div className="nb-dropdown-avatar-wrap">
                        {profile?.avatar_url
                          ? <img src={profile.avatar_url} alt="Avatar" className="nb-dropdown-avatar-img" />
                          : <div className="nb-dropdown-avatar-initials">
                            {(profile?.name || user?.email || '?').charAt(0).toUpperCase()}
                          </div>
                        }
                      </div>
                      <div>
                        <p className="nb-dd-name">{profile?.name || user?.email?.split('@')[0]}</p>
                        <p className="nb-dd-email">{user?.email}</p>
                        {profile?.city && <p className="nb-dd-city">📍 {profile.city}</p>}
                      </div>
                    </div>
                    <div className="nb-dd-divider" />
                    <button className="nb-dd-item" onClick={handleOpenEdit}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit Profile
                    </button>
                    <div className="nb-dd-divider" />
                    <button className="nb-dd-item nb-dd-item--logout" onClick={handleLogout}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="action-item login-action" style={{ textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Login / Sign Up</span>
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <button
              className="action-item icon-only nb-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'inherit',
                padding: '6px',
                borderRadius: '50%'
              }}
            >
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

            <Link to="/saved" className="action-item icon-only" aria-label="Saved items">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </Link>

            <button className="action-item icon-only cart-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className="cart-badge">2</span>
            </button>
          </div>
        </div>

        <div className="navbar-bottom">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.name} className={link.isActive ? 'active' : ''}>
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Edit Profile slide-in panel */}
      <EditProfile
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </>
  );
};

export default Navbar;
