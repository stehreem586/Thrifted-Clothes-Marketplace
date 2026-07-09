import React from 'react';
import './EmojiButton.css';

const EmojiButton = ({ onClick }) => {
  return (
    <button 
      type="button" 
      className="emoji-btn" 
      onClick={onClick}
      aria-label="Add Emoji"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    </button>
  );
};

export default EmojiButton;
