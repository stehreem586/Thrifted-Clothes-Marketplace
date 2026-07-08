import React from 'react';
import './WhyChooseUs.css';

const features = [
  {
    id: 1,
    title: 'Fast Shipping',
    description: 'Quick delivery all over Pakistan. Free shipping on orders above Rs. 2,500.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    )
  },
  {
    id: 2,
    title: 'Verified Quality',
    description: 'Every item is checked for quality so you get the best pre-loved pieces.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <polyline points="9 12 11 14 15 10"></polyline>
      </svg>
    )
  },
  {
    id: 3,
    title: 'Sustainable Fashion',
    description: 'Reduce waste and support a greener planet with every purchase.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1.5 2 2 4.46 2 8a10 10 0 0 1-10 10z"></path>
        <line x1="2" y1="22" x2="11" y2="13"></line>
      </svg>
    )
  }
];

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us-section">
      <div className="why-choose-us-container">
        
        <h2 className="why-choose-us-title">
          Why Shop with SecondLife? 
          <svg className="title-star" viewBox="0 0 24 24" fill="#c19358">
            <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
          </svg>
        </h2>

        <div className="features-grid">
          {features.map((feature, index) => (
            <React.Fragment key={feature.id}>
              <div className="feature-item">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <div className="feature-text">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.description}</p>
                </div>
              </div>
              
              {/* Add divider between items except after the last one */}
              {index < features.length - 1 && (
                <div className="feature-divider"></div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
