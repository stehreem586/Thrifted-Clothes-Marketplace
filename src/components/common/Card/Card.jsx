import React from 'react';
import './Card.css';

const Card = ({ children, className = '' }) => (
  <div className={`ui-card ${className}`.trim()}>
    {children}
  </div>
);

export default Card;
