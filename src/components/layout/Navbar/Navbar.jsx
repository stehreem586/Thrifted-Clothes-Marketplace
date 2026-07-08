import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../../assets/images/logo/logo.png';

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
          <Link to="/">
            <img src={logo} alt="SecondLife Logo" />
            <div className="logo-text">
              <span className="brand-name">SecondLife</span>
              <span className="brand-tagline">REUSE. RESTYLE. RELIVE.</span>
            </div>
          </Link>
        </div>

        <div className="navbar-search">
          <input type="text" placeholder="Search outfits, brands, or categories..." />
          <button className="search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <div className="navbar-actions">
          <Link to="/login" className="action-item login-action" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Login / Sign Up</span>
          </Link>
          
          <button className="action-item icon-only">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          
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
    </>
  );
};

export default Navbar;
