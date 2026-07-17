import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import Logo from '../../common/Logo/Logo';
import playIcon from '../../../assets/icons/Google-play-icon.avif';
import appleIcon from '../../../assets/icons/apple-icon.jpg';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Brand Section */}
        <div className="footer-brand">
          <Logo variant="footer" size="medium" />
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
            <a href="#" className="app-download-link">
              <img src={playIcon} alt="Google Play icon" className="app-download-icon" />
              <span className="app-download-text">
                <span className="app-download-small">GET IT ON</span>
                <span className="app-download-main">Google Play</span>
              </span>
            </a>
            <a href="#" className="app-download-link">
              <img src={appleIcon} alt="App Store icon" className="app-download-icon" />
              <span className="app-download-text">
                <span className="app-download-small">Download on the</span>
                <span className="app-download-main">App Store</span>
              </span>
            </a>
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
