import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

const MESSAGES_PAGE_SIZE = 50;

/** Deterministic chat id: same buyer+seller+listing always resolves to the
 *  same chat document, so "find or create" never races or duplicates. */
function buildChatId(buyerId, sellerId, listingId) {
  const pair = [buyerId, sellerId].sort().join('_');
  return `${listingId || 'general'}__${pair}`;
}

/**
 * Open (or create) the chat thread for a buyer+seller+listing.
 * A buyer chatting about two different listings with the same seller gets
 * two separate threads, per spec.
 */
export async function getOrCreateChat({
  buyerId,
  sellerId,
  listingId = null,
  listingMeta = null,
  buyerMeta = null,
  sellerMeta = null,
}) {
  const chatId = buildChatId(buyerId, sellerId, listingId);
  const chatRef = doc(firestore, 'chats', chatId);
  const existing = await getDoc(chatRef);

  if (existing.exists()) {
    const existingData = existing.data();
    const updates = {};
    if (listingMeta && (!existingData.listing_title || !existingData.listing_image)) {
      if (listingMeta.title) updates.listing_title = listingMeta.title;
      if (listingMeta.price) updates.listing_price = listingMeta.price;
      if (listingMeta.image) updates.listing_image = listingMeta.image;
    }
    if (buyerMeta?.name && !existingData.buyer_name) updates.buyer_name = buyerMeta.name;
    if (buyerMeta?.avatar && !existingData.buyer_avatar) updates.buyer_avatar = buyerMeta.avatar;
    if (sellerMeta?.name && !existingData.seller_name) updates.seller_name = sellerMeta.name;
    if (sellerMeta?.avatar && !existingData.seller_avatar) updates.seller_avatar = sellerMeta.avatar;

    if (Object.keys(updates).length > 0) {
      await updateDoc(chatRef, updates);
    }
    return { id: chatId, ...existingData, ...updates };
  }

  const chatData = {
    participants: [buyerId, sellerId],
    buyer_id: buyerId,
    seller_id: sellerId,
    buyer_name: buyerMeta?.name || 'Buyer',
    buyer_avatar: buyerMeta?.avatar || null,
    seller_name: sellerMeta?.name || 'Seller Store',
    seller_avatar: sellerMeta?.avatar || null,
    listing_id: listingId,
    listing_title: listingMeta?.title || null,
    listing_price: listingMeta?.price || null,
    listing_image: listingMeta?.image || null,
    last_message: null,
    last_message_at: serverTimestamp(),
    created_at: serverTimestamp(),
    unreadCounts: { [buyerId]: 0, [sellerId]: 0 },
  };

  await setDoc(chatRef, chatData);
  return { id: chatId, ...chatData };
}

/** One-time fetch of every chat a user is part of, newest activity first. */
export async function fetchUserChats(userId) {
  const q = query(
    collection(firestore, 'chats'),
    where('participants', 'array-contains', userId)
  );
  const snap = await getDocs(q);
  const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  chats.sort((a, b) => {
    const tA = a.last_message_at?.toMillis ? a.last_message_at.toMillis() : (a.created_at?.toMillis ? a.created_at.toMillis() : Date.now());
    const tB = b.last_message_at?.toMillis ? b.last_message_at.toMillis() : (b.created_at?.toMillis ? b.created_at.toMillis() : Date.now());
    return tB - tA;
  });
  return chats;
}

/** Realtime: fires whenever the user's chat list changes. */
export function subscribeToUserChats(userId, onChange) {
  const q = query(
    collection(firestore, 'chats'),
    where('participants', 'array-contains', userId)
  );
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    chats.sort((a, b) => {
      const tA = a.last_message_at?.toMillis ? a.last_message_at.toMillis() : (a.created_at?.toMillis ? a.created_at.toMillis() : 0);
      const tB = b.last_message_at?.toMillis ? b.last_message_at.toMillis() : (b.created_at?.toMillis ? b.created_at.toMillis() : 0);
      return tB - tA;
    });
    onChange(chats);
  });
}

/** Paginated message fetch. Pass `before` (a Firestore doc snapshot) to load
 *  the next older page when the user scrolls up. */
export async function fetchMessages(chatId) {
  try {
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    const snap = await getDocs(messagesRef);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data(), _snap: d }));
    rows.sort((a, b) => {
      const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.created_at || 0);
      const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.created_at || 0);
      return tA - tB;
    });
    return rows;
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
}

/**
 * Realtime listener for new messages in the open chat.
 */
export function subscribeToNewMessages(chatId, onInsert) {
  const messagesRef = collection(firestore, 'chats', chatId, 'messages');
  let isFirstSnapshot = true;
  return onSnapshot(messagesRef, (snap) => {
    if (isFirstSnapshot) {
      isFirstSnapshot = false;
      return;
    }
    snap.docChanges().forEach((change) => {
      if (change.type === 'added') {
        onInsert({ id: change.doc.id, ...change.doc.data(), _snap: change.doc });
      }
    });
  });
}

export async function sendMessage({ chatId, senderId, recipientId, text }) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const messagesRef = collection(firestore, 'chats', chatId, 'messages');
  const now = Date.now();
  const messageDoc = await addDoc(messagesRef, {
    sender_id: senderId,
    text: trimmed,
    timestamp: serverTimestamp(),
    created_at: now,
    read: false,
  });

  await updateDoc(doc(firestore, 'chats', chatId), {
    last_message: trimmed,
    last_message_at: serverTimestamp(),
    [`unreadCounts.${recipientId}`]: increment(1),
  }).catch(() => {});

  return messageDoc.id;
}

/** Call when a user opens a chat, to zero out their unread badge. */
export async function markChatRead(chatId, userId) {
  await updateDoc(doc(firestore, 'chats', chatId), {
    [`unreadCounts.${userId}`]: 0,
  });
}
