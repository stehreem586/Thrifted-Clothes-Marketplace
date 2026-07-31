import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as chatService from '../utils/chatService';
import { isBlocked as checkIsBlocked } from '../utils/blockService';
import { supabase } from '../utils/supabaseClient';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80';

const formatTime = (ts) => {
  const date = ts?.toDate ? ts.toDate() : new Date();
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const toUiMessage = (row, currentUserId) => ({
  id: row.id,
  text: row.text,
  time: formatTime(row.timestamp),
  sender: row.sender_id === currentUserId ? 'me' : 'them',
  _snap: row._snap,
});

async function attachOtherUserProfile(chat, currentUserId) {
  const otherId = chat.participants.find((id) => id !== currentUserId);
  let otherUser = null;
  let listing = null;

  if (otherId) {
    const { data } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', otherId).maybeSingle();
    otherUser = data;
  }
  if (chat.listing_id) {
    const { data } = await supabase
      .from('listings')
      .select('id, title, brand, price, image_url')
      .eq('id', chat.listing_id)
      .maybeSingle();
    listing = data;
  }

  return { ...chat, otherUser, listing, otherId };
}

const toUiConversation = (chat, currentUserId, previousMessages = []) => ({
  id: chat.id,
  user: {
    name: chat.otherUser?.name || 'User',
    avatar: chat.otherUser?.avatar_url || FALLBACK_AVATAR,
    online: false,
  },
  lastMessageText: chat.last_message || 'Say hello 👋',
  lastMessageTime: chat.last_message_at ? formatTime(chat.last_message_at) : '',
  unreadCount: chat.unreadCounts?.[currentUserId] || 0,
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
  otherUserId: chat.otherId,
});

/**
 * Real-time chat backed by Firebase Firestore. Returns the same shape the
 * Chat UI already expects, so no component markup changes.
 */
export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeIsBlocked, setActiveIsBlocked] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const messageUnsubRef = useRef(null);
  const conversationsRef = useRef(conversations);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // Live chat list
  useEffect(() => {
    if (!user) return;

    const unsub = chatService.subscribeToUserChats(user.id, async (rawChats) => {
      const prevMessagesById = new Map(conversationsRef.current.map((c) => [c.id, c.messages]));
      const enriched = await Promise.all(rawChats.map((c) => attachOtherUserProfile(c, user.id)));
      setConversations(enriched.map((c) => toUiConversation(c, user.id, prevMessagesById.get(c.id) || [])));
      setActiveConversationId((prevId) => prevId ?? (enriched[0]?.id || null));
    });

    return unsub;
  }, [user]);

  // Messages + realtime subscription for the open chat
  useEffect(() => {
    if (!activeConversationId || !user) return;
    messageUnsubRef.current?.();
    chatService.markChatRead(activeConversationId, user.id).catch(() => {});

    const activeConv = conversationsRef.current.find((c) => c.id === activeConversationId);
    if (activeConv?.otherUserId) {
      checkIsBlocked({ userId: user.id, otherId: activeConv.otherUserId }).then(setActiveIsBlocked);
    }

    chatService.fetchMessages(activeConversationId).then((rows) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId ? { ...c, messages: rows.map((r) => toUiMessage(r, user.id)) } : c
        )
      );
      setHasMore(rows.length >= 50);
    });

    messageUnsubRef.current = chatService.subscribeToNewMessages(activeConversationId, (row) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c;
          if (c.messages.some((m) => m.id === row.id)) return c;
          return { ...c, messages: [...c.messages, toUiMessage(row, user.id)] };
        })
      );
      if (row.sender_id !== user.id) {
        chatService.markChatRead(activeConversationId, user.id).catch(() => {});
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
        before: conv.messages[0]._snap,
      });
      setHasMore(older.length >= 50);
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
    if (!activeConversationId || !user || activeIsBlocked) return;
    const conv = conversationsRef.current.find((c) => c.id === activeConversationId);
    if (!conv?.otherUserId) return;
    await chatService.sendMessage({
      chatId: activeConversationId,
      senderId: user.id,
      recipientId: conv.otherUserId,
      text,
    });
  }, [activeConversationId, user, activeIsBlocked]);

  const startChatWithSeller = useCallback(async (sellerId, listingId = null) => {
    if (!user) return;
    const chat = await chatService.getOrCreateChat({ buyerId: user.id, sellerId, listingId });
    setActiveConversationId(chat.id);
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
    activeIsBlocked,
  };
}
