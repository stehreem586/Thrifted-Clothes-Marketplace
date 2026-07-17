import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../../assets/images/logo/logo.png';
import footerLogoImg from '../../../assets/images/footer-logo.png';
import './Logo.css';

const Logo = ({ size = 'medium', variant = 'default', className = '' }) => {
  const logoSrc = variant === 'footer' ? footerLogoImg : logoImg;

  return (
    <Link to="/" className={`brand-logo-link ${size} ${variant} ${className}`}>
      <div className="brand-logo-image-wrapper">
        <img src={logoSrc} alt="SecondLife Logo" className="brand-logo-img" />
      </div>
      <div className="brand-logo-text">
        <span className="brand-logo-name">SecondLife</span>
        <span className="brand-logo-tagline">REUSE. RESTYLE. RELIVE.</span>
      </div>
    </Link>
  );
};

export default Logo;
