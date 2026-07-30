import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as chatService from '../utils/chatService';
import { notifyNewMessage } from '../utils/pushNotifications';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80';

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const toUiMessage = (row, currentUserId) => ({
  id: row.id,
  text: row.text,
  time: formatTime(row.created_at),
  rawCreatedAt: row.created_at,
  sender: row.sender_id === currentUserId ? 'me' : 'them',
});

const toUiConversation = (chat, currentUserId, previousMessages = []) => ({
  id: chat.id,
  user: {
    name: chat.otherUser?.name || 'User',
    avatar: chat.otherUser?.avatar_url || FALLBACK_AVATAR,
    online: false,
  },
  lastMessageText: chat.last_message_text || 'Say hello 👋',
  lastMessageTime: chat.last_message_at ? formatTime(chat.last_message_at) : '',
  unreadCount: 0,
  product: chat.listing
    ? {
        brand: chat.listing.brand || '',
        title: chat.listing.title,
        price: chat.listing.price,
        image: chat.listing.image_url,
      }
    : { brand: 'SELLER SHOP', title: 'General Inquiry', price: '', image: chat.otherUser?.avatar_url || FALLBACK_AVATAR },
  messages: previousMessages,
  buyer_id: chat.buyer_id,
  seller_id: chat.seller_id,
});

/**
 * Drop-in replacement for the old hardcoded `initialConversations` state in
 * Chat.jsx. Returns the exact same shape the existing UI components expect,
 * backed by real Supabase Realtime data instead of mock objects.
 */
export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const messageUnsubRef = useRef(null);
  const conversationsRef = useRef(conversations);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // Load the chat list and keep it live
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadChats = async () => {
      const chats = await chatService.fetchUserChats(user.id);
      if (cancelled) return;
      setConversations((prev) => {
        const prevMessagesById = new Map(prev.map((c) => [c.id, c.messages]));
        return chats.map((c) => toUiConversation(c, user.id, prevMessagesById.get(c.id) || []));
      });
      setActiveConversationId((prevId) => prevId ?? (chats[0]?.id || null));
    };

    loadChats();
    const unsub = chatService.subscribeToUserChats(user.id, loadChats);

    return () => { cancelled = true; unsub(); };
  }, [user]);

  // Load messages + realtime subscription for whichever chat is open
  useEffect(() => {
    if (!activeConversationId || !user) return;
    messageUnsubRef.current?.();

    chatService.fetchMessages(activeConversationId).then((rows) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId ? { ...c, messages: rows.map((r) => toUiMessage(r, user.id)) } : c
        )
      );
      setHasMore(rows.length >= 50);
    });

    messageUnsubRef.current = chatService.subscribeToMessages(activeConversationId, (row) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c;
          if (c.messages.some((m) => m.id === row.id)) return c;
          return { ...c, messages: [...c.messages, toUiMessage(row, user.id)] };
        })
      );

      if (row.sender_id !== user.id) {
        const conv = conversationsRef.current.find((c) => c.id === activeConversationId);
        notifyNewMessage({
          senderName: conv?.user?.name || 'New message',
          text: row.text,
          chatId: activeConversationId,
          isTabHidden: document.hidden,
        });
      }
    });

    return () => messageUnsubRef.current?.();
  }, [activeConversationId, user]);

  const loadMoreMessages = useCallback(async () => {
    const conv = conversationsRef.current.find((c) => c.id === activeConversationId);
    if (!conv || !conv.messages.length || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const older = await chatService.fetchMessages(activeConversationId, {
        before: conv.messages[0].rawCreatedAt,
      });
      if (older.length < 50) setHasMore(false);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...older.map((r) => toUiMessage(r, user.id)), ...c.messages] }
            : c
        )
      );
    } finally {
      setLoadingMore(false);
    }
  }, [activeConversationId, loadingMore, hasMore, user]);

  const sendMessage = useCallback(async (text) => {
    if (!activeConversationId || !user) return;
    await chatService.sendMessage({ chatId: activeConversationId, senderId: user.id, text });
  }, [activeConversationId, user]);

  const startChatWithSeller = useCallback(async (sellerId, listingId = null) => {
    if (!user) return;
    const chat = await chatService.getOrCreateChat({ buyerId: user.id, sellerId, listingId });
    setActiveConversationId(chat.id);
    const chats = await chatService.fetchUserChats(user.id);
    setConversations(chats.map((c) => toUiConversation(c, user.id)));
  }, [user]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    loadMoreMessages,
    hasMore,
    startChatWithSeller,
  };
}
