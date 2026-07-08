import React, { useState, useEffect } from 'react';
import './Hero.css';
import hero1 from '../../assets/images/hero/hero-section-1.png';
import hero2 from '../../assets/images/hero/hero-section-2.png';
import hero3 from '../../assets/images/hero/hero-section-3.png';
import hero4 from '../../assets/images/hero/hero-section-4.png';

const slidesData = [
  {
    id: 1,
    title: 'Curated Vintage & Second-Hand Fashion',
    desc1: 'One-of-a-kind pieces. Affordable prices.',
    desc2: 'Better for you, better for the planet.',
    image: hero1
  },
  {
    id: 2,
    title: 'Thrifted Treasures, Timeless Style',
    desc1: 'Unique finds, unbeatable value.',
    desc2: 'Good for your closet, good for the earth.',
    image: hero2
  },
  {
    id: 3,
    title: 'Pre-Loved Fashion, Newly Discovered',
    desc1: 'Every piece has a story to tell.',
    desc2: 'Sustainable style without the price tag.',
    image: hero3
  },
  {
    id: 4,
    title: 'Vintage Finds & Secondhand Style',
    desc1: "Handpicked pieces you won't find anywhere else.",
    desc2: 'Shop smarter. Live greener.',
    image: hero4
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 5000); // Reset timer every time slide changes to prevent immediate skips after manual clicks
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <section className="hero-section">
      <div className="hero-slides-container">
        <div 
          className="hero-slides-wrapper"
          style={{ transform: `translateX(-${(currentSlide * 100) / slidesData.length}%)` }}
        >
          {slidesData.map((slide) => (
            <div key={slide.id} className="hero-slide">
              <div className="hero-copy">
                <h1>{slide.title}</h1>
                <div className="hero-subtitles">
                  <p>{slide.desc1}</p>
                  <p>{slide.desc2}</p>
                </div>
                <div className="hero-actions">
                  <button className="hero-btn primary">
                    Shop Now
                    <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="hero-media">
                <img src={slide.image} alt={slide.title} className="hero-image" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Static Footer Highlights inside Hero */}
      <div className="hero-footer">
        <div className="hero-highlights">
          <div className="highlight-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1.5 2 2 4.46 2 8a10 10 0 0 1-10 10Z"/>
              <path d="M2 22l8-8"/>
            </svg>
            <span>Sustainable</span>
          </div>
          <div className="highlight-divider"></div>
          <div className="highlight-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span>Affordable</span>
          </div>
          <div className="highlight-divider"></div>
          <div className="highlight-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12l4 6-10 13L2 9z"></path>
              <path d="M11 3 8 9l4 13 4-13-3-6"></path>
              <path d="M2 9h20"></path>
            </svg>
            <span>Unique Finds</span>
          </div>
        </div>

        {/* Slider Dots */}
        <div className="hero-dots">
          {slidesData.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
