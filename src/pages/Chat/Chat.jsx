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
  } = useChat();

  // Deep-link support: /chat?sellerId=...&listingId=... opens/creates that chat
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
                onMore={() => setShowReportModal(true)}
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
              <ChatInput onSendMessage={handleSendMessage} />
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