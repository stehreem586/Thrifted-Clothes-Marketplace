/* Runs outside the React app — handles push notifications when the site
   is backgrounded or fully closed. Must live at the site root (/public). */
importScripts('https://www.gstatic.com/firebasejs/12.17.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.17.0/firebase-messaging-compat.js');

// Same values as your .env VITE_FIREBASE_* keys. Service workers can't read
// import.meta.env, so these are duplicated here — keep them in sync.
firebase.initializeApp({
  apiKey: "AIzaSyDY1qVow2tJQtdI2_00KxYfNLbVH8p99iM",
  authDomain: "thrifted-clothes-marketp-cd68c.firebaseapp.com",
  projectId: "thrifted-clothes-marketp-cd68c",
  storageBucket: "thrifted-clothes-marketp-cd68c.firebasestorage.app",
  messagingSenderId: "192463377903",
  appId: "1:192463377903:web:5252645bce6aaf338a921a"
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const senderName = payload.notification?.title || payload.data?.senderName || 'New message';
  const text = payload.notification?.body || payload.data?.text || '';
  const chatId = payload.data?.chatId || '';

  self.registration.showNotification(senderName, {
    body: text.slice(0, 60),
    icon: '/favicon.svg',
    tag: chatId ? `chat-${chatId}` : undefined,
    data: { chatId },
  });
});

// Tapping the notification opens the app directly on the chat conversation.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const chatId = event.notification.data?.chatId;
  const targetUrl = chatId ? `/chat?chatId=${chatId}` : '/chat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/chat') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
