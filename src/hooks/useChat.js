import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as chatService from '../utils/chatService';
import { isBlocked as checkIsBlocked } from '../utils/blockService';
import { supabase } from '../utils/supabaseClient';

const makeAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=1a1a2e&color=fff&size=100`;

const formatTime = (ts, fallbackMs) => {
  let date = new Date();
  if (ts?.toDate) {
    date = ts.toDate();
  } else if (fallbackMs) {
    date = new Date(fallbackMs);
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const toUiMessage = (row, currentUserId) => ({
  id: row.id,
  text: row.text,
  time: formatTime(row.timestamp, row.created_at),
  sender: row.sender_id === currentUserId ? 'me' : 'them',
  _snap: row._snap,
});

async function attachOtherUserProfile(chat, currentUserId) {
  const otherId = chat.participants?.find((id) => id !== currentUserId);
  let otherUser = null;
  let listing = null;

  try {
    if (otherId) {
      const { data } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', otherId).maybeSingle();
      otherUser = data;
    }
  } catch (e) {
    console.warn('Supabase profile fetch error:', e);
  }

  try {
    if (chat.listing_title) {
      listing = {
        id: chat.listing_id,
        title: chat.listing_title,
        price: chat.listing_price,
        image_url: chat.listing_image,
        brand: 'SELLER LISTING',
      };
    } else if (chat.listing_id) {
      const { data } = await supabase
        .from('listings')
        .select('id, title, brand, price, image_url')
        .eq('id', chat.listing_id)
        .maybeSingle();
      listing = data;
    }
  } catch (e) {
    console.warn('Supabase listing fetch error:', e);
  }

  return { ...chat, otherUser, listing, otherId };
}

const toUiConversation = (chat, currentUserId, previousMessages = []) => {
  const isMeBuyer = chat.buyer_id === currentUserId;
  const otherName = chat.otherUser?.name
    || (isMeBuyer ? (chat.seller_name || 'Seller Store') : (chat.buyer_name || 'Buyer'))
    || 'User';
  const rawAvatar = chat.otherUser?.avatar_url
    || (isMeBuyer ? chat.seller_avatar : chat.buyer_avatar);
  const otherAvatar = rawAvatar || makeAvatar(otherName);

  return {
    id: chat.id,
    user: {
      name: otherName,
      avatar: otherAvatar,
      online: false,
    },
    lastMessageText: chat.last_message || '',
    lastMessageTime: chat.last_message_at ? formatTime(chat.last_message_at) : '',
    unreadCount: chat.unreadCounts?.[currentUserId] || 0,
    product: chat.listing
      ? {
          brand: chat.listing.brand || 'VINTAGE',
          title: chat.listing.title,
          price: chat.listing.price,
          image: chat.listing.image_url || chat.listing.image,
        }
      : (chat.listing_title ? {
          brand: 'VINTAGE',
          title: chat.listing_title,
          price: chat.listing_price,
          image: chat.listing_image,
        } : null),
    messages: previousMessages,
    buyer_id: chat.buyer_id,
    seller_id: chat.seller_id,
    otherUserId: chat.otherId,
  };
};

/**
 * Real-time chat hook.
 * - startChatWithSeller: stores a local "pending" chat — NO Firestore write
 * - sendMessage: on first message in a pending chat, creates the Firestore doc then sends
 */
export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeIsBlocked, setActiveIsBlocked] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Pending chat: shown in UI before any message is sent (no Firestore doc yet)
  const [pendingChat, setPendingChat] = useState(null);
  // pendingChat shape: { sellerId, listingId, listingMeta, sellerMeta, buyerMeta, virtualConv }

  const PENDING_ID = '__pending__';

  const messageUnsubRef = useRef(null);
  const conversationsRef = useRef(conversations);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // Live chat list from Firestore
  useEffect(() => {
    if (!user) return;

    const unsub = chatService.subscribeToUserChats(user.id, async (rawChats) => {
      try {
        // Keep all valid chats (no self-chats)
        const validChats = (rawChats || []).filter(
          (c) => !(c.buyer_id && c.seller_id && c.buyer_id === c.seller_id)
        );
        const prevMessagesById = new Map(conversationsRef.current.map((c) => [c.id, c.messages]));
        const enriched = await Promise.all(validChats.map((c) => attachOtherUserProfile(c, user.id)));
        const mapped = enriched.map((c) => toUiConversation(c, user.id, prevMessagesById.get(c.id) || []));
        setConversations(mapped);

        // If active conversation is now in real list, clear pending
        if (activeConversationId === PENDING_ID) {
          // find the newly created real chat matching the pending one
          const newReal = mapped.find(
            (c) => c.buyer_id === user.id && pendingChat && c.seller_id === pendingChat.sellerId
          );
          if (newReal) {
            setActiveConversationId(newReal.id);
            setPendingChat(null);
          }
        }
      } catch (err) {
        console.error('Error processing live chats:', err);
      }
    });

    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Messages + realtime for open real chat
  useEffect(() => {
    if (!activeConversationId || activeConversationId === PENDING_ID || !user) return;
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
          if ((c.messages || []).some((m) => m.id === row.id)) return c;
          return { ...c, messages: [...(c.messages || []), toUiMessage(row, user.id)] };
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
    if (!conv || !(conv.messages || []).length || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const older = await chatService.fetchMessages(activeConversationId, {
        before: conv.messages[0]._snap,
      });
      setHasMore(older.length >= 50);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...older.map((r) => toUiMessage(r, user.id)), ...(c.messages || [])] }
            : c
        )
      );
    } finally {
      setLoadingMore(false);
    }
  }, [activeConversationId, loadingMore, hasMore, user]);

  const sendMessage = useCallback(async (text) => {
    if (!user || activeIsBlocked) return;
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    // Pending chat: create Firestore doc on first message
    if (activeConversationId === PENDING_ID && pendingChat) {
      const chat = await chatService.getOrCreateChat({
        buyerId: user.id,
        sellerId: pendingChat.sellerId,
        listingId: pendingChat.listingId,
        listingMeta: pendingChat.listingMeta,
        buyerMeta: pendingChat.buyerMeta,
        sellerMeta: pendingChat.sellerMeta,
      });
      // Send the message to the newly created chat
      await chatService.sendMessage({
        chatId: chat.id,
        senderId: user.id,
        recipientId: pendingChat.sellerId,
        text: trimmed,
      });
      // Switch to real conversation — Firestore listener will pick it up
      setActiveConversationId(chat.id);
      setPendingChat(null);
      return;
    }

    // Normal case: real existing chat
    if (!activeConversationId) return;
    const conv = conversationsRef.current.find((c) => c.id === activeConversationId);
    if (!conv?.otherUserId) return;
    await chatService.sendMessage({
      chatId: activeConversationId,
      senderId: user.id,
      recipientId: conv.otherUserId,
      text: trimmed,
    });
  }, [activeConversationId, pendingChat, user, activeIsBlocked]);

  /**
   * Called from "Chat with Seller" button.
   * Does NOT write to Firestore — only sets up a local pending conversation.
   * Firestore doc is created only when the user actually sends the first message.
   */
  const startChatWithSeller = useCallback(async (sellerId, listingId = null, listingMeta = null, sellerMeta = null) => {
    if (!user) return;
    if (user.id === sellerId) {
      alert('This is your own product listing.');
      return;
    }

    // Check if a real chat already exists with this seller+listing
    const existing = conversationsRef.current.find(
      (c) => c.buyer_id === user.id && c.seller_id === sellerId
        && (listingId ? c.otherUserId === sellerId : true)
    );
    if (existing) {
      setActiveConversationId(existing.id);
      return;
    }

    // Fetch seller profile for display (no Firestore write)
    let fetchedSellerMeta = sellerMeta;
    if (!fetchedSellerMeta) {
      try {
        const { data } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', sellerId).maybeSingle();
        if (data) {
          fetchedSellerMeta = { name: data.name, avatar: data.avatar_url };
        }
      } catch (e) {
        // ignore
      }
    }

    const buyerMeta = {
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Buyer',
      avatar: makeAvatar(user.user_metadata?.name || user.email || 'B'),
    };

    const sellerName = fetchedSellerMeta?.name || 'Seller';
    const sellerAvatar = fetchedSellerMeta?.avatar || makeAvatar(sellerName);

    // Build a virtual conversation for display ONLY (not saved to Firestore)
    const virtualConv = {
      id: PENDING_ID,
      user: { name: sellerName, avatar: sellerAvatar, online: false },
      lastMessageText: '',
      lastMessageTime: '',
      unreadCount: 0,
      product: listingMeta ? {
        brand: 'VINTAGE',
        title: listingMeta.title,
        price: listingMeta.price,
        image: listingMeta.image,
      } : null,
      messages: [],
      buyer_id: user.id,
      seller_id: sellerId,
      otherUserId: sellerId,
    };

    setPendingChat({ sellerId, listingId, listingMeta, sellerMeta: fetchedSellerMeta, buyerMeta, virtualConv });
    setActiveConversationId(PENDING_ID);
  }, [user]);

  // Build the active conversation — either a real one or the pending virtual one
  const realConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const activeConversation = activeConversationId === PENDING_ID
    ? (pendingChat?.virtualConv || null)
    : realConversation;

  // Expose all real conversations (for filtering by caller)
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
