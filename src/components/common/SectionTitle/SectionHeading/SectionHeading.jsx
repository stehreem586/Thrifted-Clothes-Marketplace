import React from 'react';
import './SectionHeading.css';

const SectionHeading = ({ title, linkText, onLinkClick }) => {
  return (
    <div className="section-heading-container">
      <h2 className="section-title">{title}</h2>
      {linkText && (
        <button type="button" className="section-link" onClick={onLinkClick}>
          {linkText} <span className="arrow">→</span>
        </button>
      )}
    </div>
  );
};

export default SectionHeading;
