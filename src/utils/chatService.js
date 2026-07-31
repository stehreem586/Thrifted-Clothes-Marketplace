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
export async function getOrCreateChat({ buyerId, sellerId, listingId = null }) {
  const chatId = buildChatId(buyerId, sellerId, listingId);
  const chatRef = doc(firestore, 'chats', chatId);
  const existing = await getDoc(chatRef);

  if (existing.exists()) {
    return { id: chatId, ...existing.data() };
  }

  const chatData = {
    participants: [buyerId, sellerId],
    buyer_id: buyerId,
    seller_id: sellerId,
    listing_id: listingId,
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
    where('participants', 'array-contains', userId),
    orderBy('last_message_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Realtime: fires whenever the user's chat list changes (new chat, new last message, unread count). */
export function subscribeToUserChats(userId, onChange) {
  const q = query(
    collection(firestore, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('last_message_at', 'desc')
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/** Paginated message fetch. Pass `before` (a Firestore doc snapshot) to load
 *  the next older page when the user scrolls up. */
export async function fetchMessages(chatId, { before = null, pageSize = MESSAGES_PAGE_SIZE } = {}) {
  const messagesRef = collection(firestore, 'chats', chatId, 'messages');
  const clauses = [orderBy('timestamp', 'desc'), limit(pageSize)];
  if (before) clauses.splice(1, 0, startAfter(before));

  const q = query(messagesRef, ...clauses);
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data(), _snap: d }));
  return rows.reverse(); // oldest-first for rendering
}

/**
 * Realtime listener for new messages only (not the initial page — that's
 * handled by fetchMessages so pagination and live updates don't fight).
 */
export function subscribeToNewMessages(chatId, onInsert) {
  const messagesRef = collection(firestore, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));

  let isFirstSnapshot = true;
  return onSnapshot(q, (snap) => {
    if (isFirstSnapshot) {
      isFirstSnapshot = false;
      return; // skip the message(s) fetchMessages already loaded
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
  const messageDoc = await addDoc(messagesRef, {
    sender_id: senderId,
    text: trimmed,
    timestamp: serverTimestamp(),
    read: false,
  });

  await updateDoc(doc(firestore, 'chats', chatId), {
    last_message: trimmed,
    last_message_at: serverTimestamp(),
    [`unreadCounts.${recipientId}`]: increment(1),
  });

  return messageDoc.id;
}

/** Call when a user opens a chat, to zero out their unread badge. */
export async function markChatRead(chatId, userId) {
  await updateDoc(doc(firestore, 'chats', chatId), {
    [`unreadCounts.${userId}`]: 0,
  });
}
