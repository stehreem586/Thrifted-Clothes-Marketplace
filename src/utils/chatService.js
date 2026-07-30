import { supabase } from './supabaseClient';

const MESSAGES_PAGE_SIZE = 50;

/**
 * Find an existing chat between a buyer and seller (optionally scoped to a
 * listing), or create one. Safe to call every time a user opens a chat.
 */
export async function getOrCreateChat({ buyerId, sellerId, listingId = null }) {
  const { data: existing, error: findErr } = await supabase
    .from('chats')
    .select('*')
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .eq('listing_id', listingId)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('chats')
    .insert([{ buyer_id: buyerId, seller_id: sellerId, listing_id: listingId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * All chats a user is part of, with the other participant's profile and
 * (if any) the listing being discussed attached.
 */
export async function fetchUserChats(userId) {
  const { data: chats, error } = await supabase
    .from('chats')
    .select('*, listing:listings(id, title, brand, price, image_url)')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  if (!chats?.length) return [];

  const otherUserIds = [...new Set(
    chats.map((c) => (c.buyer_id === userId ? c.seller_id : c.buyer_id))
  )];

  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', otherUserIds);

  if (profileErr) throw profileErr;
  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  return chats.map((chat) => ({
    ...chat,
    otherUser: profileMap.get(chat.buyer_id === userId ? chat.seller_id : chat.buyer_id) || null,
  }));
}

/**
 * Paginated message fetch, newest-first from the DB, returned oldest-first
 * for easy rendering. Pass `before` (an ISO timestamp) to load older pages.
 */
export async function fetchMessages(chatId, { before = null, limit = MESSAGES_PAGE_SIZE } = {}) {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reverse();
}

export async function sendMessage({ chatId, senderId, text }) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert([{ chat_id: chatId, sender_id: senderId, text: trimmed }])
    .select()
    .single();

  if (error) throw error;

  // Keep the sidebar preview in sync
  await supabase
    .from('chats')
    .update({ last_message_text: trimmed, last_message_at: data.created_at })
    .eq('id', chatId);

  return data;
}

/** Realtime: fires whenever a new message lands in this chat. */
export function subscribeToMessages(chatId, onInsert) {
  const channel = supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/** Realtime: fires whenever any of the user's chats change (new chat, new last message). */
export function subscribeToUserChats(userId, onChange) {
  const channel = supabase
    .channel(`user-chats:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chats', filter: `buyer_id=eq.${userId}` },
      onChange
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chats', filter: `seller_id=eq.${userId}` },
      onChange
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
