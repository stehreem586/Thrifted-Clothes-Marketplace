import React from 'react';
import ChatActions from '../ChatActions/ChatActions';
import './ChatHeader.css';

const ChatHeader = ({ user, onCall, onVideo, onMore }) => {
  if (!user) return null;

  return (
    <div className="chat-header">
      <div className="chat-header-user-info">
        <div className="chat-header-avatar-container">
          <img src={user.avatar} alt={user.name} className="chat-header-avatar" />
          {user.online && <span className="online-badge"></span>}
        </div>
        <div className="chat-header-meta">
          <h3 className="chat-header-name">{user.name}</h3>
          <span className="chat-header-status">
            {user.online ? 'Active now' : 'Offline'}
          </span>
        </div>
      </div>
      <ChatActions onCall={onCall} onVideo={onVideo} onMore={onMore} />
    </div>
  );
};

export default ChatHeader;
