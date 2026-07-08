import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from '../../../assets/images/logo/logo.png';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Brand Section */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src={logo} alt="SecondLife Logo" />
            <div className="logo-text">
              <span className="brand-name">SecondLife</span>
              <span className="brand-tagline">REUSE. RESTYLE. RELIVE.</span>
            </div>
          </Link>
          <p className="brand-description">
            A community marketplace for buying and selling pre-loved fashion.
          </p>
        </div>

        {/* Links Sections */}
        <div className="footer-links">
          <div className="footer-column">
            <h4>Shop</h4>
            <ul>
              <li><Link to="#">New Arrivals</Link></li>
              <li><Link to="#">Women</Link></li>
              <li><Link to="#">Men</Link></li>
              <li><Link to="#">Sale</Link></li>
              <li><Link to="#">All Categories</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>Help</h4>
            <ul>
              <li><Link to="#">Shipping & Delivery</Link></li>
              <li><Link to="#">Returns & Refunds</Link></li>
              <li><Link to="#">Sizing Guide</Link></li>
              <li><Link to="#">FAQs</Link></li>
              <li><Link to="#">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><Link to="#">About Us</Link></li>
              <li><Link to="#">Our Mission</Link></li>
              <li><Link to="#">Blog</Link></li>
              <li><Link to="#">Careers</Link></li>
              <li><Link to="#">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login / Sign Up</Link></li>
              <li><Link to="#">My Orders</Link></li>
              <li><Link to="#">Wishlist</Link></li>
              <li><Link to="#">Sell with Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        {/* App Download Section */}
        <div className="footer-app">
          <h4>Download the App</h4>
          <div className="app-buttons">
            <button className="app-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 2.5v19l11-9.5-11-9.5z" fill="#00e676" />
                <path d="M5 2.5l11 9.5 4.5-3.5L5 2.5z" fill="#f44336" />
                <path d="M5 21.5l11-9.5 4.5 3.5L5 21.5z" fill="#ffeb3b" />
                <path d="M16 12l4.5-3.5 1.5 1.5-6 6L16 12z" fill="#2196f3" />
              </svg>
              <div className="app-btn-text">
                <span className="small-text">GET IT ON</span>
                <span className="big-text">Google Play</span>
              </div>
            </button>
            
            <button className="app-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 14.5c0-2.5 2-3.7 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.1-3 1-3.8 1-.8 0-2-1-3.2-1-1.6 0-3 1-3.8 2.5-1.7 3-2.1 7.2-.5 9.8.7 1 1.5 2.2 2.7 2.1 1.1-.1 1.6-.8 2.9-.8 1.3 0 1.7.8 2.9.8 1.2.1 1.9-1 2.6-2.1.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.6-1-2.6-4.1zM14 6.5c.6-.8 1-1.9.9-2.9-1 .1-2.2.6-2.9 1.4-.6.7-1 1.8-.9 2.8 1.1 0 2.2-.6 2.9-1.3z" />
              </svg>
              <div className="app-btn-text">
                <span className="small-text">Download on the</span>
                <span className="big-text">App Store</span>
              </div>
            </button>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2025 SecondLife. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
