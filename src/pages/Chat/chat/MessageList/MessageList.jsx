import React, { useEffect, useRef } from 'react';
import MessageBubble from '../MessageBubble/MessageBubble';
import MessageTime from '../MessageTime/MessageTime';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import './MessageList.css';

const MessageList = ({ messages, showTyping }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  return (
    <div className="message-list-container">
      <div className="message-list-scroller">
        {messages.map((msg, index) => {
          const isSender = msg.sender === 'me';
          return (
            <div key={msg.id || index} className="message-item-wrapper">
              <MessageBubble text={msg.text} isSender={isSender} />
              <MessageTime time={msg.time} isSender={isSender} />
            </div>
          );
        })}
        {showTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;
