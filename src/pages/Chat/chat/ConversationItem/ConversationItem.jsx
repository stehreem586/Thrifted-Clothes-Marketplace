import React from 'react';
import './ConversationItem.css';

const ConversationItem = ({ conversation, isActive, onClick }) => {
  if (!conversation) return null;
  const userObj = conversation.user || { name: 'User', avatar: 'https://ui-avatars.com/api/?name=U' };

  return (
    <div 
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="conversation-avatar-wrapper">
        <img src={userObj.avatar} alt={userObj.name} className="conversation-avatar" />
        {userObj.online && <span className="conversation-online-indicator"></span>}
      </div>
      <div className="conversation-meta">
        <div className="conversation-meta-row">
          <h4 className="conversation-user-name">{userObj.name}</h4>
          <span className="conversation-time">{conversation.lastMessageTime}</span>
        </div>
        <div className="conversation-meta-row">
          <p className="conversation-last-msg">{conversation.lastMessageText}</p>
          {conversation.unreadCount > 0 && (
            <span className="conversation-unread-badge">{conversation.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
