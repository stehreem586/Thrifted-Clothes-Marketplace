import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ text, isSender }) => {
  return (
    <div className={`message-bubble-wrapper ${isSender ? 'sender' : 'recipient'}`}>
      <div className="message-bubble-text">
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;
