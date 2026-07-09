import React from 'react';
import './MHHero.css';
import heroImage from '../../../assets/images/Marketplace-homepage/MH-Hero.png';

const MHHero = () => {
  return (
    <section className="mh-hero">
      <div className="mh-hero-card" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="mh-hero-overlay">
          <div className="mh-hero-content">
            <h1 className="mh-hero-title">
              Curated Sustainability for the Conscious Soul.
            </h1>
            <p className="mh-hero-subtitle">
              Discover a premium selection of pre-loved pieces that redefine modern elegance and environmental responsibility.
            </p>
            <button className="mh-hero-button">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MHHero;
