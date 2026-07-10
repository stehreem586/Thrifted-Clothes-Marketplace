import React from 'react';
import './Button.css';

const Button = ({ variant = 'primary', children, className = '', onClick, type = 'button' }) => {
  const cls = `btn ${variant} ${className}`.trim();
  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
