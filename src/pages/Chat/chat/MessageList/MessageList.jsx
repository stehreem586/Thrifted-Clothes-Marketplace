import React, { useEffect, useRef } from 'react';
import MessageTime from '../MessageTime/MessageTime';
import TypingIndicator from '../TypingIndicator/TypingIndicator';

const MessageList = ({ messages, showTyping, onScrollTop, myAvatar, otherAvatar, otherName }) => {
  const scrollerRef = useRef(null);
  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [safeMessages.length, showTyping]);

  const handleScroll = (e) => {
    if (onScrollTop && e.target.scrollTop < 80) {
      onScrollTop();
    }
  };

  const FALLBACK = 'https://ui-avatars.com/api/?name=U&background=1a1a2e&color=fff&size=100';

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', paddingTop: '16px', paddingBottom: '8px' }}
      >
        {safeMessages.map((msg, index) => {
          const isMe = msg.sender === 'me';
          const avatar = isMe
            ? (myAvatar || FALLBACK)
            : (otherAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName || 'U')}&background=1a1a2e&color=fff&size=100`);

          return (
            <div
              key={msg.id || index}
              style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '8px',
                marginBottom: '12px',
                padding: '0 16px',
              }}
            >
              {/* Avatar */}
              <img
                src={avatar}
                alt={isMe ? 'You' : (otherName || 'User')}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1.5px solid #e2e8f0',
                }}
              />

              {/* Bubble */}
              <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    background: isMe ? '#0f172a' : '#f1f5f9',
                    color: isMe ? '#ffffff' : '#1e293b',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '14px',
                    lineHeight: '1.45',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
                <MessageTime time={msg.time} isSender={isMe} />
              </div>
            </div>
          );
        })}
        {showTyping && <TypingIndicator />}
      </div>
    </div>
  );
};

export default MessageList;

