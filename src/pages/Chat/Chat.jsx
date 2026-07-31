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
  // Must be logged in to start a chat — this route is already behind
  // ProtectedRoute, so a guest is redirected to login before reaching here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get('sellerId');
    const listingId = params.get('listingId');
    if (sellerId && user) {
      startChatWithSeller(sellerId, listingId || null);
    }
  }, [user, startChatWithSeller]);

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

  const handleMakeOffer = () => {
    alert(`Offer made on ${activeConversation.product.title}!`);
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
      alert('You have blocked this user. They can no longer message you.');
    }
  };

  return (
    <div className="chat-page-wrapper">
      {activeConversation && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="User / Chat Partner"
          targetUser={activeConversation.user}
          targetListing={activeConversation.product}
        />
      )}

      <div className="chat-container-box">
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelectConversation={setActiveConversationId}
        />
        <div className="chat-window">
          {activeConversation ? (
            <>
              <ChatHeader
                user={activeConversation.user}
                onCall={() => alert('Voice call feature is coming soon!')}
                onVideo={() => alert('Video call feature is coming soon!')}
                onReport={() => setShowReportModal(true)}
                onMore={handleBlockToggle}
              />
              <ProductCard
                product={activeConversation.product}
                onMakeOffer={handleMakeOffer}
              />
              <MessageList
                messages={activeConversation.messages}
                showTyping={false}
                onScrollTop={loadMoreMessages}
              />
              {activeIsBlocked ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                  You can't message this user right now.
                </div>
              ) : (
                <ChatInput onSendMessage={handleSendMessage} />
              )}
            </>
          ) : (
            <div className="no-chat-selected">
              <h3>Select a message thread</h3>
              <p>Choose a conversation from the list to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
