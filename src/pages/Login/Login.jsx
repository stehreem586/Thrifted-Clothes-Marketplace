import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [loginType, setLoginType] = useState('customer'); // default to customer
  const [email, setEmail] = useState('customer@secondlife.com');
  const [password, setPassword] = useState('••••••••');
  const navigate = useNavigate();

  const handleTabChange = (type) => {
    setLoginType(type);
    if (type === 'customer') {
      setEmail('customer@secondlife.com');
    } else {
      setEmail('admin@secondlife.com');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loginType === 'customer') {
      localStorage.setItem('userRole', 'customer');
      window.location.href = '/';
    } else {
      localStorage.setItem('userRole', 'admin');
      window.location.href = '/admin';
    }
  };

  return (
    <div className="merchant-login-container">
      {/* Brand logo at the top */}
      <div className="login-logo-header">
        <h1>SecondLife</h1>
        <p className="logo-subtext">Marketplace Portal</p>
      </div>

      {/* Main card */}
      <div className="merchant-login-card">
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab-btn ${loginType === 'customer' ? 'active' : ''}`}
            onClick={() => handleTabChange('customer')}
          >
            Customer
          </button>
          <button
            type="button"
            className={`login-tab-btn ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabChange('admin')}
          >
            Merchant / Admin
          </button>
        </div>

        <h2>Welcome back</h2>
        <p className="card-instructions">
          Please enter your credentials to access your account.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email Address */}
          <div className="login-input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@secondlife.com"
              required
            />
          </div>

          {/* Password with Forgot? link */}
          <div className="login-input-group">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <a href="#forgot" className="forgot-link">Forgot?</a>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Stay signed in */}
          <div className="login-checkbox-row">
            <input type="checkbox" id="remember" defaultChecked />
            <label htmlFor="remember">Stay signed in for 30 days</label>
          </div>

          {/* Action button */}
          <button type="submit" className="login-submit-btn">
            <span>{loginType === 'customer' ? 'Sign in as Customer' : 'Sign in to Dashboard'}</span>
            <span className="arrow-symbol">→</span>
          </button>
        </form>

        {/* Footer link inside card */}
        <p className="card-footer-text">
          Don't have a merchant account? <a href="#apply" className="apply-link">Apply here</a>
        </p>
      </div>

      {/* Trust & Sustainability badges below card */}
      <div className="login-trust-badges">
        <div className="badge-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Secure Connection</span>
        </div>
        <span className="badge-divider">•</span>
        <div className="badge-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.12 10 9.88 10c.06 0 .12 0 .18-.01.44-.01.76-.39.71-.83-.06-.57-.09-1.15-.09-1.74 0-3.31 2.69-6 6-6 .59 0 1.17.03 1.74.09.44.05.82-.27.83-.71.01-.06.01-.12.01-.18C22 6.12 17.52 2 12 2z"></path>
          </svg>
          <span>Sustainability Cloud</span>
        </div>
      </div>

      {/* Copyright line */}
      <p className="login-copyright-text">
        © 2026 SECONDLIFE CLOTHES MARKETPLACE PTY LTD
      </p>
    </div>
  );
}

export default Login;