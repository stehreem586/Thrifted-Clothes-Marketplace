import React, { useState, useEffect } from 'react';
import ChatSidebar from './chat/ChatSidebar/ChatSidebar';
import ChatHeader from './chat/ChatHeader/ChatHeader';
import ProductCard from './chat/ProductCard/ProductCard';
import MessageList from './chat/MessageList/MessageList';
import ChatInput from './chat/ChatInput/ChatInput';
import ReportModal from '../../components/common/ReportModal';
import { useModeration } from '../../context/ModerationContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { blockUser, unblockUser } from '../../utils/blockService';
import './Chat.css';

const Chat = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const { scanTextForViolations, submitUserReport } = useModeration();
  const { user, profile } = useAuth();

  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    loadMoreMessages,
    startChatWithSeller,
    activeIsBlocked,
  } = useChat();

  // Deep-link support: /chat?sellerId=...&listingId=... opens/creates that chat.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get('sellerId');
    const listingId = params.get('listingId');
    const title = params.get('title');
    const price = params.get('price');
    const image = params.get('image');

    if (sellerId && user) {
      if (sellerId === user.id) {
        return;
      }
      const listingMeta = title ? { title, price, image } : null;
      startChatWithSeller(sellerId, listingId || null, listingMeta);
    }
  }, [user, startChatWithSeller]);

  // Buyer conversations: only chats where I am the buyer, not the seller
  const buyerConversations = (conversations || []).filter(
    (c) => c.buyer_id === user?.id && c.seller_id !== user?.id
  );

  // Include pending chat at top of sidebar
  const sidebarConversations = activeConversationId === '__pending__' && activeConversation
    ? [activeConversation, ...buyerConversations]
    : buyerConversations;

  // Inline active ID — no useEffect needed, eliminates first-click flicker
  const effectiveActiveId = activeConversationId
    || (buyerConversations.length > 0 ? buyerConversations[0].id : null);

  // Sync into hook state if it was null
  useEffect(() => {
    if (!activeConversationId && buyerConversations.length > 0) {
      setActiveConversationId(buyerConversations[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerConversations.length]);

  // Use the conversation matching effectiveActiveId for display
  const displayConversation = activeConversationId === '__pending__'
    ? activeConversation
    : (conversations.find((c) => c.id === effectiveActiveId) || null);

  const handleSendMessage = async (text) => {
    const violation = scanTextForViolations(text);
    await sendMessage(text);

    if (violation && activeConversation) {
      console.warn('System Scanner Flagged Message:', violation);
      submitUserReport({
        reportType: violation.type,
        description: `[System Auto-Detected Flag] ${violation.reason}`,
        reporter: { name: 'System Auto-Guardian', username: '@System_Bot' },
        accused: { name: profile?.name || 'Current User', username: `@${profile?.name || 'User'}` },
        listing: activeConversation.product,
        messageId: `${activeConversation.id}-${Date.now()}`
      });
    }
  };

  const handleBlockToggle = async () => {
    if (!user || !activeConversation?.otherUserId) return;
    if (activeIsBlocked) {
      await unblockUser({ blockerId: user.id, blockedId: activeConversation.otherUserId });
    } else {
      const confirmed = window.confirm(
        `Block ${activeConversation.user.name}? They will no longer be able to message you.`
      );
      if (!confirmed) return;
      await blockUser({ blockerId: user.id, blockedId: activeConversation.otherUserId });
      alert('You have blocked this seller. They can no longer message you.');
    }
  };

  // My real avatar
  const myAvatar = profile?.avatar_url
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user?.email || 'Me')}&background=c19358&color=fff&size=100`;

  return (
    <div className="chat-page-wrapper">
      {activeConversation && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="Seller"
          targetUser={activeConversation.user}
          targetListing={activeConversation.product}
        />
      )}

      <div className="chat-container-box">
        <ChatSidebar
          conversations={sidebarConversations}
          activeId={activeConversationId}
          onSelectConversation={setActiveConversationId}
        />
        <div className="chat-window" style={{ overflow: 'hidden' }}>
          {displayConversation ? (
            <>
              <ChatHeader
                user={displayConversation.user}
                onReport={() => setShowReportModal(true)}
                onMore={handleBlockToggle}
                moreLabel={activeIsBlocked ? 'Unblock Seller' : 'Block Seller'}
              />
              {displayConversation.product && (
                <ProductCard
                  product={displayConversation.product}
                  onMakeOffer={null}
                />
              )}
              <MessageList
                messages={displayConversation.messages}
                showTyping={false}
                onScrollTop={loadMoreMessages}
                myAvatar={myAvatar}
                otherAvatar={displayConversation.user?.avatar}
                otherName={displayConversation.user?.name}
              />
              {activeIsBlocked ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '14px', flexShrink: 0 }}>
                  You have blocked this seller. You can't message them.
                </div>
              ) : (
                <ChatInput onSendMessage={handleSendMessage} />
              )}
            </>
          ) : (
            <div className="no-chat-selected">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>Your Messages</h3>
              <p>Click "Chat with Seller" on any listing to start a conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
