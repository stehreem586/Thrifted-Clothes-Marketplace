import React from 'react';
import './AttachmentButton.css';

const AttachmentButton = ({ onClick }) => {
  return (
    <button 
      type="button" 
      className="attachment-btn" 
      onClick={onClick}
      aria-label="Attach File"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
      </svg>
    </button>
  );
};

export default AttachmentButton;
