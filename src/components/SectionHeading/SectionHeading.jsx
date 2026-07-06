import React from 'react';
import './SectionHeading.css';

const SectionHeading = ({ title, linkText, linkUrl = '#' }) => {
  return (
    <div className="section-heading-container">
      <h2 className="section-title">
        {title} <span className="title-star">✦</span>
      </h2>
      {linkText && (
        <a href={linkUrl} className="section-link">
          {linkText} <span className="arrow">→</span>
        </a>
      )}
    </div>
  );
};

export default SectionHeading;
