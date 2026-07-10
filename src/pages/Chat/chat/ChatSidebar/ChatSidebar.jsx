import React, { useState } from 'react';
import ConversationItem from '../ConversationItem/ConversationItem';
import './ChatSidebar.css';

const ChatSidebar = ({ conversations, activeId, onSelectConversation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(c =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        <h2 className="chat-sidebar-title">Messages</h2>
        <div className="chat-search-container">
          <svg className="chat-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="chat-search-input"
          />
        </div>
      </div>
      <div className="conversations-list">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conv => (
            <ConversationItem 
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelectConversation(conv.id)}
            />
          ))
        ) : (
          <div className="no-conversations">No messages found</div>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
