import React, { useEffect, useRef } from 'react';
import MessageBubble from '../MessageBubble/MessageBubble';
import MessageTime from '../MessageTime/MessageTime';
import TypingIndicator from '../TypingIndicator/TypingIndicator';


const MessageList = ({ messages, showTyping, onScrollTop }) => {
  const bottomRef = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: isFirstLoad.current ? 'auto' : 'smooth' });
    isFirstLoad.current = false;
  }, [messages, showTyping]);

  const handleScroll = (e) => {
    if (onScrollTop && e.target.scrollTop < 80) {
      onScrollTop();
    }
  };

  return (
    <div className="message-list-container">
      <div className="message-list-scroller" onScroll={handleScroll}>
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
