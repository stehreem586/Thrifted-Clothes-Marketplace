import React from 'react';
import heroImg from '../../assets/images/hero/hero.png';
import './Hero.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <span className="eyebrow">Discover thrifted style</span>
        <h1>Shop vintage fashion with modern comfort.</h1>
        <p>
          Browse trending finds, handcrafted categories, and premium thrift deals made just for you.
        </p>
        <div className="hero-actions">
          <button className="hero-btn primary">Shop Now</button>
          <button className="hero-btn secondary">Browse Categories</button>
        </div>
      </div>
      <div className="hero-media">
        <img src={heroImg} alt="Hero thrift fashion" className="hero-image" />
      </div>
    </section>
  );
};

export default HeroSection;
