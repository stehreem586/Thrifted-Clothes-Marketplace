import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';

// All values come from your Firebase project settings (Project Settings ->
// General -> Your apps -> SDK setup and configuration). Put them in .env —
// never hardcode real keys in source.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.warn('Warning: Firebase env vars are missing. Add VITE_FIREBASE_* keys to your .env file.');
}

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);

// Messaging only works in secure/browser contexts that support it (no SSR,
// no unsupported browsers) — guard it so the app doesn't crash elsewhere.
export async function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null;
  const supported = await isMessagingSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(firebaseApp);
}
