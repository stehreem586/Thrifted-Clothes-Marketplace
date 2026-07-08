import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">SecondLife</div>

      <div className="search">
        <input type="text" placeholder="Search thrift items..." />
        <span className="search-icon">🔍</span>
      </div>

      <div className="nav-actions">
        <a href="#" className="nav-link">
          Login
        </a>
        <span className="divider">|</span>
        <a href="#" className="nav-link">
          Signup
        </a>
        <span className="icon heart">♡</span>
        <span className="icon">🛒</span>
      </div>
    </nav>
  );
};

export default Navbar;
