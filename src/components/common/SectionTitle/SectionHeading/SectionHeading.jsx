import React from 'react';
import './SectionHeading.css';

const SectionHeading = ({ title, linkText, onLinkClick }) => {
  return (
    <div className="section-heading-container">
      <h2 className="section-title">
        {title}
        <svg className="title-star" viewBox="0 0 24 24" fill="#c19358" width="18" height="18" style={{ marginLeft: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
          <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
        </svg>
      </h2>
      {linkText && (
        <button type="button" className="section-link" onClick={onLinkClick}>
          {linkText} <span className="arrow">→</span>
        </button>
      )}
    </div>
  );
};

export default SectionHeading;
