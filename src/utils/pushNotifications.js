import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from './firebaseClient';
import { supabase } from './supabaseClient';

// Generate this in Firebase Console -> Project Settings -> Cloud Messaging
// -> Web configuration -> Web Push certificates, then put it in .env.
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const isSupported = () => typeof window !== 'undefined' && 'Notification' in window;

/**
 * Request notification permission on first app open, then register the FCM
 * token against the current user's profile so a backend function can target
 * them. Never silently skips the prompt — always asks if permission is
 * still "default". Safe to call every app load; it no-ops once decided.
 */
export async function requestNotificationPermission(userId) {
  if (!isSupported()) return 'unsupported';

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') return permission; // chat still works, just no push

  const messaging = await getFirebaseMessaging();
  if (!messaging || !VAPID_KEY) return permission;

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
    if (token && userId) {
      await supabase.from('profiles').update({ fcm_token: token }).eq('id', userId);
    }
  } catch (err) {
    console.warn('FCM token registration failed:', err);
  }

  return permission;
}

/**
 * Foreground listener: FCM's own background handling (service worker) only
 * fires when the tab isn't focused. When the tab IS open and focused, FCM
 * delivers the message to this callback instead of showing a system
 * notification automatically — so we show one ourselves, matching the
 * "title = sender name, body = first 60 chars" spec.
 */
export function listenForForegroundMessages(onMessageReceived) {
  let unsubscribe = () => {};
  getFirebaseMessaging().then((messaging) => {
    if (!messaging) return;
    unsubscribe = onMessage(messaging, (payload) => {
      const senderName = payload.notification?.title || payload.data?.senderName || 'New message';
      const text = payload.notification?.body || payload.data?.text || '';
      const chatId = payload.data?.chatId;

      onMessageReceived?.({ senderName, text, chatId });

      if (Notification.permission === 'granted') {
        const notification = new Notification(senderName, {
          body: text.slice(0, 60),
          icon: '/favicon.svg',
          tag: chatId ? `chat-${chatId}` : undefined,
        });
        notification.onclick = () => {
          window.focus();
          if (chatId) window.location.href = `/chat?chatId=${chatId}`;
          notification.close();
        };
      }
    });
  });
  return () => unsubscribe();
}
