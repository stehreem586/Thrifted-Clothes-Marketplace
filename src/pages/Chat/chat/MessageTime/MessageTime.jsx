import React from 'react';
import './MessageTime.css';

const MessageTime = ({ time, isSender }) => {
  return (
    <div className={`message-time ${isSender ? 'sender' : 'recipient'}`}>
      {time}
    </div>
  );
};

export default MessageTime;
