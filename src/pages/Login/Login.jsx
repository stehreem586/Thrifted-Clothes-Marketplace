import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// Import images from assets
import newArrival1 from '../../assets/images/Marketplace-homepage/new-arrival1.png';
import newArrival2 from '../../assets/images/Marketplace-homepage/new-arrival2.png';

function Login() {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'create'
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() === 'admin@secondlife.com') {
      localStorage.setItem('userRole', 'admin');
      window.location.href = '/admin';
    } else {
      localStorage.setItem('userRole', 'customer');
      window.location.href = '/';
    }
  };

  const handleGoogleSignIn = () => {
    localStorage.setItem('userRole', 'customer');
    window.location.href = '/';
  };

  return (
    <div className="login-page-container">
      
      {/* Floating Product Card - Bottom Left */}
      <div className="floating-product-card bottom-left">
        <div className="floating-card-image-wrapper">
          <img src={newArrival1} alt="Vintage Trench" />
        </div>
        <div className="floating-card-details">
          <span className="floating-card-title">Vintage Trench</span>
          <span className="floating-card-price">$185.00</span>
        </div>
      </div>

      {/* Floating Product Card - Top Right */}
      <div className="floating-product-card top-right">
        <div className="floating-card-image-wrapper">
          <img src={newArrival2} alt="Terrain Boots" />
        </div>
        <div className="floating-card-details">
          <span className="floating-card-title">Terrain Boots</span>
          <span className="floating-card-price">$120.00</span>
        </div>
      </div>

      {/* Centered Login Box Wrapper */}
      <div className="login-content-wrapper">
        
        {/* Brand header */}
        <header className="login-brand-header">
          <h1 className="login-brand-title">SecondLife</h1>
          <p className="login-brand-tagline">PRE-LOVED, RE-LOVED</p>
        </header>

        {/* Main Authentication Card */}
        <div className="login-card">
          
          {/* Card Tabs */}
          <div className="login-card-tabs">
            <button
              type="button"
              className={`login-card-tab ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`login-card-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create Account
            </button>
          </div>

          {/* Heading block */}
          <div className="login-heading-block">
            <h2 className="login-heading-title">
              {activeTab === 'signin' ? 'Welcome back' : 'Join SecondLife'}
            </h2>
            <p className="login-heading-subtitle">
              {activeTab === 'signin' 
                ? 'Continue your sustainable journey.' 
                : 'Start your sustainable fashion adventure.'}
            </p>
          </div>

          {/* Google SSO Button */}
          <button 
            type="button" 
            className="login-google-btn"
            onClick={handleGoogleSignIn}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Form Divider */}
          <div className="login-divider">
            <span className="login-divider-line"></span>
            <span className="login-divider-text">or</span>
            <span className="login-divider-line"></span>
          </div>

          {/* Email input & Action */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label htmlFor="login-email" className="login-form-label">
                Email Address
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="login-form-input"
              />
            </div>

            <button type="submit" className="login-continue-btn">
              Continue
            </button>
          </form>

          {/* TOS / Privacy statement */}
          <footer className="login-card-footer">
            By continuing, you agree to SecondLife's <br />
            <a href="#tos" className="login-footer-link">Terms of Service</a> and <a href="#privacy" className="login-footer-link">Privacy Policy</a>.
          </footer>
        </div>

        {/* Bottom Trust/Benefit Badges */}
        <div className="login-trust-badges">
          
          <div className="trust-badge">
            <div className="trust-badge-icon-wrapper">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className="trust-badge-text">
              <h4 className="trust-badge-title">Circular Economy</h4>
              <p className="trust-badge-desc">Give items a second life.</p>
            </div>
          </div>

          <div className="trust-badge">
            <div className="trust-badge-icon-wrapper">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 11 11 13 15 9"></polyline>
              </svg>
            </div>
            <div className="trust-badge-text">
              <h4 className="trust-badge-title">Curated Quality</h4>
              <p className="trust-badge-desc">Authenticated by our experts.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;