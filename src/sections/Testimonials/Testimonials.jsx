import React from 'react';
import './Testimonials.css';

const testimonialsData = [
  {
    id: 1,
    name: 'Ayesha S.',
    location: 'Lahore',
    quote: '"Amazing quality and super fast delivery! The jacket was exactly as described."',
    avatar: 'https://i.pravatar.cc/150?u=ayesha1'
  },
  {
    id: 2,
    name: 'Hassan K.',
    location: 'Karachi',
    quote: '"Love the concept! Finally a place where pre-loved fashion feels premium."',
    avatar: 'https://i.pravatar.cc/150?u=hassan2'
  },
  {
    id: 3,
    name: 'Maham R.',
    location: 'Islamabad',
    quote: '"The dress I ordered is beautiful and the packaging was so thoughtful."',
    avatar: 'https://i.pravatar.cc/150?u=maham3'
  },
  {
    id: 4,
    name: 'Zainab T.',
    location: 'Multan',
    quote: '"Great prices, unique pieces and excellent customer service. Highly recommended!"',
    avatar: 'https://i.pravatar.cc/150?u=zainab4'
  }
];

const StarRating = () => (
  <div className="stars">
    {[...Array(5)].map((_, i) => (
      <svg key={i} viewBox="0 0 24 24" fill="#c19358" className="star-icon">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        
        <h2 className="testimonials-title">
          What our customers say
          <svg className="title-star" viewBox="0 0 24 24" fill="#c19358">
            <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
          </svg>
        </h2>

        <div className="testimonials-slider-wrapper">
          <div className="testimonials-grid">
            {testimonialsData.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <StarRating />
                <p className="testimonial-quote">{testimonial.quote}</p>
                
                <div className="testimonial-author">
                  <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                  <div className="author-info">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-location">{testimonial.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="slider-arrow next-arrow" aria-label="Next testimonials">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
