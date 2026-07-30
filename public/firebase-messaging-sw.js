importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDY1qVow2tJQtdI2_00KxYfNLbVH8p99iM",
  authDomain: "thrifted-clothes-marketp-cd68c.firebaseapp.com",
  projectId: "thrifted-clothes-marketp-cd68c",
  storageBucket: "thrifted-clothes-marketp-cd68c.firebasestorage.app",
  messagingSenderId: "192463377903",
  appId: "1:192463377903:web:5252645bce6aaf338a921a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Set up listeners for SW lifecycle events
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for notification clicks to open the app on the chat screen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const chatId = event.notification.data?.chatId;

  if (!chatId) return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If we have a tab open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus().then(() => {
            // We use navigate to redirect to the specific chat route
            return client.navigate(`/chat?activeChatId=${chatId}`);
          });
        }
      }
      // Otherwise open a new tab directly on the chat screen
      if (self.clients.openWindow) {
        return self.clients.openWindow(`/chat?activeChatId=${chatId}`);
      }
    })
  );
});

// Keep track of the active user ID and the active listener
let activeUserId = null;
let unsubscribeFirestore = null;

// Handle messages from the main application thread to sync user UIDs
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_USER') {
    activeUserId = event.data.userId;
    setupFirestoreListener(activeUserId);
  } else if (event.data && event.data.type === 'CLEAR_USER') {
    activeUserId = null;
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
  }
});

// Map of last seen message IDs/fingerprints to prevent duplicate notifications
const lastSeenMessageIds = new Set();

function setupFirestoreListener(userId) {
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }

  if (!userId) return;

  console.log('[SW] Listening to chats for user:', userId);

  // Subscribe to all chats containing the current user
  unsubscribeFirestore = db.collection('chats')
    .where('participants', 'array-contains', userId)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const chatData = change.doc.data();
        const chatId = change.doc.id;

        // If there is a message and it was not sent by the current user
        if (chatData.last_message && chatData.last_message_time) {
          const isBuyer = chatData.buyer_id === userId;
          const senderName = isBuyer ? chatData.seller_name : chatData.buyer_name;
          const text = chatData.last_message;

          // Unique key for this specific message to avoid duplicates
          const msgFingerprint = `${chatId}_${chatData.last_message_time}`;

          // Only notify if message sender is not current user and is unseen
          if (chatData.last_message_sender_id !== userId && !lastSeenMessageIds.has(msgFingerprint)) {
            lastSeenMessageIds.add(msgFingerprint);

            // Check if application is currently focused in the foreground
            self.clients.matchAll({ type: 'window' }).then((clients) => {
              const hasFocusedClient = clients.some(client => client.focused);
              if (!hasFocusedClient) {
                // Show notification in the background
                self.registration.showNotification(senderName, {
                  body: text.substring(0, 60),
                  data: { chatId: chatId },
                  icon: '/favicon.jpeg',
                  badge: '/favicon.jpeg',
                  vibrate: [200, 100, 200]
                });
              }
            });
          }
        }
      });
    }, (error) => {
      console.warn('[SW] Firestore onSnapshot failed:', error);
    });
}
