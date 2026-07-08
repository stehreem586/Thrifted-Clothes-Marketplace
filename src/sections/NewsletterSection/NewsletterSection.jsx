import React from 'react';
import './NewsletterSection.css';

const NewsletterSection = () => {
  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        
        <div className="newsletter-text">
          <h2 className="newsletter-title">Be the first to know</h2>
          <p className="newsletter-desc">
            Get updates on new arrivals, exclusive<br />offers and styling tips.
          </p>
        </div>

        <div className="newsletter-form-wrapper">
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              className="newsletter-input" 
              placeholder="Enter your email address" 
              required 
            />
            <button type="submit" className="newsletter-submit">
              Subscribe
            </button>
          </form>
        </div>

        <div className="newsletter-social">
          <a href="#" aria-label="Instagram" className="social-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="#" aria-label="Facebook" className="social-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a href="#" aria-label="TikTok" className="social-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
            </svg>
          </a>
          <a href="#" aria-label="Pinterest" className="social-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 4.3 2.7 8 6.5 9.4-.1-1-.1-2.4 0-3.4l1.3-5.3s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6 1 0 1.5.7 1.5 1.6 0 1-1.1 2.5-1.7 3.9-.5 1.1.5 2 1.6 2 1.9 0 3.4-2.4 3.4-5.3 0-2.5-1.7-4.3-4.5-4.3-3.2 0-5.2 2.4-5.2 5.1 0 1 .4 2.1.8 2.7.1.1.1.2 0 .3l-.3 1.1c-.1.2-.2.2-.4.1-1.5-.7-2.4-3.1-2.4-4.8 0-3.6 2.8-7.3 8.3-7.3 4.4 0 7.4 3.2 7.4 7.2 0 4.5-2.6 7.9-6.3 7.9-1.3 0-2.5-.7-2.9-1.5l-.8 3.1c-.3 1-1 2.3-1.5 3.1 1.2.4 2.4.6 3.7.6 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
};

export default NewsletterSection;
