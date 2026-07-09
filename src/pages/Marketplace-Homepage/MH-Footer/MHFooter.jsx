import React from 'react';
import { Link } from 'react-router-dom';
import './MHFooter.css';

const MHFooter = () => {
  return (
    <footer className="mh-footer">
      <div className="mh-footer-container">
        {/* Left column */}
        <div className="mh-footer-info">
          <h2 className="mh-footer-brand">SecondLife</h2>
          <p className="mh-footer-tagline">
            Elevating the secondhand experience through curated quality and a commitment to circular fashion.
          </p>
          <p className="mh-footer-copyright">
            © 2024 SecondLife. Pre-loved, Re-lived.
          </p>
        </div>

        {/* Right column links */}
        <div className="mh-footer-links-wrapper">
          {/* Column 2 */}
          <div className="mh-footer-col">
            <h3 className="mh-footer-col-title">Marketplace</h3>
            <ul className="mh-footer-list">
              <li><Link to="/shop">Marketplace</Link></li>
              <li><Link to="/">New Arrivals</Link></li>
              <li><a href="#sell">Sell with Us</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="mh-footer-col">
            <h3 className="mh-footer-col-title">Company</h3>
            <ul className="mh-footer-list">
              <li><a href="#guidelines">Community Guidelines</a></li>
              <li><a href="#impact">Sustainability Impact</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="mh-footer-col">
            <h3 className="mh-footer-col-title">Support</h3>
            <ul className="mh-footer-list">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MHFooter;
