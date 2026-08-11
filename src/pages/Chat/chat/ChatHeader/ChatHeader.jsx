import React from 'react';
import ChatActions from '../ChatActions/ChatActions';
import './ChatHeader.css';

const ChatHeader = ({ user, onReport, onMore, moreLabel }) => {
  if (!user) return null;

  return (
    <div className="chat-header">
      <div className="chat-header-user-info">
        <div className="chat-header-avatar-container">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=1a1a2e&color=fff&size=100`}
            alt={user.name}
            className="chat-header-avatar"
          />
          {user.online && <span className="online-badge"></span>}
        </div>
        <div className="chat-header-meta">
          <h3 className="chat-header-name">{user.name}</h3>
          <span className="chat-header-status">
            {user.online ? 'Active now' : 'Offline'}
          </span>
        </div>
      </div>
      <ChatActions
        onReport={onReport}
        onMore={onMore}
        moreLabel={moreLabel}
        otherUser={user}
      />
    </div>
  );
};

export default ChatHeader;
