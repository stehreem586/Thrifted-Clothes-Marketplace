import React, { useState, useEffect } from 'react';
import ChatSidebar from './chat/ChatSidebar/ChatSidebar';
import ChatHeader from './chat/ChatHeader/ChatHeader';
import ProductCard from './chat/ProductCard/ProductCard';
import MessageList from './chat/MessageList/MessageList';
import ChatInput from './chat/ChatInput/ChatInput';
import './Chat.css';

// Import product images for discussion
import product1 from '../../assets/images/products/vintage-leather-jacket.png';
import product2 from '../../assets/images/products/blue-straigh-jeans.png';
import product3 from '../../assets/images/products/vintage-shoulder-bag.png';

const initialConversations = [
  {
    id: 1,
    user: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      online: true
    },
    lastMessageText: 'Hi! Are you still interested in the trench coat?',
    lastMessageTime: '10:19 AM',
    unreadCount: 2,
    product: {
      brand: 'BURBERRY VINTAGE',
      title: 'Classic Heritage Trench Coat',
      price: '$450.00',
      image: product1
    },
    messages: [
      { id: 1, text: 'Hi! Are you still interested in the leather jacket?', time: '10:15 AM', sender: 'them' },
      { id: 2, text: 'Yes, is there any minor wear on the sleeves?', time: '10:18 AM', sender: 'me' },
      { id: 3, text: "Nope, it's in pristine condition. I only wore it twice!", time: '10:19 AM', sender: 'them' },
      { id: 4, text: 'Let me know if you want more close-up shots.', time: '10:19 AM', sender: 'them' }
    ]
  },
  {
    id: 2,
    user: {
      name: 'Marcus Reed',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      online: true
    },
    lastMessageText: 'Sure, let\'s do it. I\'ll change the listing price.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    product: {
      brand: 'SAINT LAURENT',
      title: 'Wyatt Leather Boots',
      price: '$620.00',
      image: product2
    },
    messages: [
      { id: 1, text: 'Hey, I can ship these out tomorrow morning if you buy today.', time: '3:20 PM', sender: 'them' },
      { id: 2, text: 'Awesome, would you accept $580?', time: '3:22 PM', sender: 'me' },
      { id: 3, text: "Sure, let's do it. I'll change the listing price.", time: '3:25 PM', sender: 'them' }
    ]
  },
  {
    id: 3,
    user: {
      name: 'Emily Watson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      online: false
    },
    lastMessageText: 'Is the sizing on this oversized or true to size?',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
    product: {
      brand: 'THE ROW',
      title: 'Silk Satin Maxi Dress',
      price: '$890.00',
      image: product3
    },
    messages: [
      { id: 1, text: 'Is the sizing on this oversized or true to size?', time: 'Yesterday', sender: 'them' }
    ]
  }
];

const Chat = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(1);
  const [showTyping, setShowTyping] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Clear unread badge when selected
  useEffect(() => {
    setConversations(prev =>
      prev.map(c => c.id === activeConversationId ? { ...c, unreadCount: 0 } : c)
    );
  }, [activeConversationId]);

  const handleSendMessage = (text) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: Date.now(),
      text,
      time: timeString,
      sender: 'me'
    };

    // Append message
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            lastMessageText: text,
            lastMessageTime: timeString,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );

    // Simulate reply after 1.5 seconds
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      const replyMsg = {
        id: Date.now() + 1,
        text: 'Sounds good! Let me know if you have any other questions.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'them'
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              lastMessageText: replyMsg.text,
              lastMessageTime: replyMsg.time,
              messages: [...c.messages, replyMsg]
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  const handleMakeOffer = () => {
    alert(`Offer made on ${activeConversation.product.title}!`);
  };

  return (
    <div className="chat-page-wrapper">
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
                onMore={() => alert('Settings menu coming soon!')}
              />
              <ProductCard 
                product={activeConversation.product}
                onMakeOffer={handleMakeOffer}
              />
              <MessageList 
                messages={activeConversation.messages} 
                showTyping={showTyping}
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
