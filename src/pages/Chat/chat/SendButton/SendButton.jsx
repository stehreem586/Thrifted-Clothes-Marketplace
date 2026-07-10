import React from 'react';
import './SendButton.css';

const SendButton = ({ onClick, disabled }) => {
  return (
    <button 
      type="submit" 
      className="send-btn" 
      disabled={disabled}
      onClick={onClick}
      aria-label="Send Message"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  );
};

export default SendButton;
