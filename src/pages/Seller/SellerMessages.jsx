import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { blockUser, unblockUser } from '../../utils/blockService';
import ReportModal from '../../components/common/ReportModal';
import './SellerMessages.css';

const FALLBACK = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=1a1a2e&color=fff&size=100`;

function SellerMessages() {
  const { user, profile } = useAuth();
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    activeIsBlocked,
  } = useChat();

  const [replyText, setReplyText] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const bottomRef = useRef(null);
  const dropRef = useRef(null);

  // Seller conversations: only chats where I (current user) am the seller
  // i.e. a buyer messaged me about my listing
  const sellerConversations = (conversations || []).filter(
    (c) => c.seller_id === user?.id
  );

  // Auto-select first conversation
  useEffect(() => {
    if (!activeConversationId && sellerConversations.length > 0) {
      setActiveConversationId(sellerConversations[0].id);
    }
  }, [sellerConversations.length, activeConversationId]);

  const messagesRef = useRef(null);

  // Auto scroll messages container to bottom without scrolling entire page
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || activeIsBlocked) return;
    await sendMessage(replyText.trim());
    setReplyText('');
  };

  const handleBlockToggle = async () => {
    if (!user || !activeConversation?.otherUserId) return;
    if (activeIsBlocked) {
      await unblockUser({ blockerId: user.id, blockedId: activeConversation.otherUserId });
    } else {
      const confirmed = window.confirm(
        `Block ${activeConversation.user?.name}? They won't be able to message you.`
      );
      if (!confirmed) return;
      await blockUser({ blockerId: user.id, blockedId: activeConversation.otherUserId });
    }
    setShowDropdown(false);
  };

  const myAvatar = profile?.avatar_url
    || FALLBACK(profile?.name || user?.email || 'Me');

  const filtered = sellerConversations.filter(c =>
    (c.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBuyer = activeConversation?.user;

  return (
    <div className="seller-messages-page view-content fade-in">
      {/* Report Modal */}
      {activeConversation && (
        <ReportModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          targetType="Buyer"
          targetUser={activeBuyer}
          targetListing={activeConversation.product}
        />
      )}

      <div className="smsg-heading">
        <div>
          <h1>Messages</h1>
          <p className="view-sub">Conversations from buyers about your listings.</p>
        </div>
        <span className="smsg-badge">{sellerConversations.length} thread{sellerConversations.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="smsg-layout">
        {/* ── LEFT SIDEBAR ── */}
        <div className="smsg-sidebar">
          <div className="smsg-search-bar">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search buyers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="smsg-search-input"
            />
          </div>

          <div className="smsg-thread-list">
            {filtered.length === 0 ? (
              <div className="smsg-empty-sidebar">
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📭</div>
                <p>No buyer messages yet.</p>
                <span>When buyers message you about your listings, they'll appear here.</span>
              </div>
            ) : (
              filtered.map(chat => {
                const name = chat.user?.name || 'Buyer';
                const avatar = chat.user?.avatar || FALLBACK(name);
                const lastMsg = chat.lastMessageText || 'Say hello 👋';
                const time = chat.lastMessageTime || '';
                const unread = chat.unreadCount || 0;
                const isActive = chat.id === activeConversationId;

                return (
                  <div
                    key={chat.id}
                    className={`smsg-thread-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveConversationId(chat.id)}
                  >
                    <img src={avatar} alt={name} className="smsg-thread-avatar" />
                    <div className="smsg-thread-meta">
                      <div className="smsg-thread-row">
                        <span className="smsg-thread-name">{name}</span>
                        <span className="smsg-thread-time">{time}</span>
                      </div>
                      <div className="smsg-thread-row">
                        <p className="smsg-thread-last">{lastMsg}</p>
                        {unread > 0 && <span className="smsg-unread-badge">{unread}</span>}
                      </div>
                      {chat.product?.title && (
                        <span className="smsg-thread-listing">📦 {chat.product.title}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT CHAT PANE ── */}
        <div className="smsg-chat-pane">
          {!activeConversation ? (
            <div className="smsg-no-chat">
              <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#cbd5e1" strokeWidth="1.4">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>Select a conversation</h3>
              <p>Choose a buyer thread from the left to reply.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="smsg-chat-header">
                <img
                  src={activeBuyer?.avatar || FALLBACK(activeBuyer?.name)}
                  alt={activeBuyer?.name}
                  className="smsg-chat-header-avatar"
                />
                <div className="smsg-chat-header-info">
                  <h4>{activeBuyer?.name || 'Buyer'}</h4>
                  <span className="smsg-chat-header-status">Buyer</span>
                </div>

                {/* Listing tag */}
                {activeConversation.product?.title && (
                  <div className="smsg-listing-tag">
                    {activeConversation.product.image && (
                      <img src={activeConversation.product.image} alt={activeConversation.product.title} className="smsg-listing-tag-img" />
                    )}
                    <span>{activeConversation.product.title}</span>
                    {activeConversation.product.price && (
                      <strong>PKR {activeConversation.product.price?.toLocaleString?.() || activeConversation.product.price}</strong>
                    )}
                  </div>
                )}

                {/* Header actions */}
                <div className="smsg-header-actions">
                  <button
                    className="smsg-action-btn"
                    title="Report Buyer"
                    onClick={() => setShowReport(true)}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </button>

                  <div ref={dropRef} style={{ position: 'relative' }}>
                    <button
                      className="smsg-action-btn"
                      onClick={() => setShowDropdown(v => !v)}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="5" r="1.2" fill="currentColor"/>
                        <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
                        <circle cx="12" cy="19" r="1.2" fill="currentColor"/>
                      </svg>
                    </button>
                    {showDropdown && (
                      <div className="smsg-dropdown">
                        <button className="smsg-dropdown-item danger" onClick={handleBlockToggle}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                          {activeIsBlocked ? 'Unblock Buyer' : 'Block Buyer'}
                        </button>
                        <button className="smsg-dropdown-item" onClick={() => setShowDropdown(false)}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          View Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="smsg-messages-area" ref={messagesRef}>
                {/* Listing card at top if product present */}
                {activeConversation.product && (
                  <div className="smsg-listing-card-top">
                    {activeConversation.product.image && (
                      <img src={activeConversation.product.image} alt={activeConversation.product.title} className="smsg-listing-card-img" />
                    )}
                    <div className="smsg-listing-card-info">
                      <span className="smsg-listing-card-label">Listing</span>
                      <strong className="smsg-listing-card-title">{activeConversation.product.title}</strong>
                      {activeConversation.product.price && (
                        <span className="smsg-listing-card-price">
                          PKR {activeConversation.product.price?.toLocaleString?.() || activeConversation.product.price}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Message bubbles */}
                {(activeConversation.messages || []).map((msg, idx) => {
                  const isMe = msg.sender === 'me';
                  const avatar = isMe
                    ? myAvatar
                    : (activeBuyer?.avatar || FALLBACK(activeBuyer?.name));

                  return (
                    <div
                      key={msg.id || idx}
                      className={`smsg-bubble-row ${isMe ? 'mine' : 'theirs'}`}
                    >
                      <img src={avatar} alt={isMe ? 'You' : activeBuyer?.name} className="smsg-bubble-avatar" />
                      <div className="smsg-bubble-col">
                        <div className={`smsg-bubble ${isMe ? 'mine' : 'theirs'}`}>
                          {msg.text}
                        </div>
                        <span className="smsg-bubble-time">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply Input */}
              <form className="smsg-input-row" onSubmit={handleSend}>
                {activeIsBlocked ? (
                  <div className="smsg-blocked-notice">
                    You have blocked this buyer. Unblock to continue messaging.
                  </div>
                ) : (
                  <>
                    <img src={myAvatar} alt="You" className="smsg-input-avatar" />
                    <input
                      type="text"
                      className="smsg-text-input"
                      placeholder="Write a reply to buyer..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="smsg-send-btn"
                      disabled={!replyText.trim()}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerMessages;
