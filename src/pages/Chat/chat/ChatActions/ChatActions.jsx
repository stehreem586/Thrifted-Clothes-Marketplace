import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import './ChatActions.css';

const ChatActions = ({ onReport, onMore, moreLabel = 'Block User', otherUser }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="chat-actions">
      {/* Report button */}
      <button
        type="button"
        className="chat-action-btn"
        onClick={onReport}
        title="Report User"
        aria-label="Report User"
      >
        <ShieldAlert size={18} />
      </button>

      {/* Three-dots dropdown */}
      <div className="chat-more-wrapper" ref={dropRef}>
        <button
          type="button"
          className="chat-action-btn"
          onClick={() => setShowDropdown(v => !v)}
          aria-label="More Options"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="5" r="1.2" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
            <circle cx="12" cy="19" r="1.2" fill="currentColor"/>
          </svg>
        </button>

        {showDropdown && (
          <div className="chat-more-dropdown">
            <button
              className="chat-more-item danger"
              onClick={() => { onMore(); setShowDropdown(false); }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              {moreLabel}
            </button>
            {otherUser && (
              <button
                className="chat-more-item"
                onClick={() => { setShowDropdown(false); }}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                View Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatActions;
