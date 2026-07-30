const isSupported = () => typeof window !== 'undefined' && 'Notification' in window;

/**
 * Request notification permission once. Call this on first app load.
 * Never silently skips it — always prompts if permission is still "default".
 */
export async function requestNotificationPermission() {
  if (!isSupported()) return 'unsupported';
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

/**
 * Show a browser notification for a new chat message.
 * Only fires when the tab is backgrounded (matches "app in background/closed"
 * behavior for a website). If permission was denied, chat still works —
 * this just no-ops.
 */
export function notifyNewMessage({ senderName, text, chatId, isTabHidden }) {
  if (!isSupported() || Notification.permission !== 'granted') return;
  if (!isTabHidden) return;

  const notification = new Notification(senderName, {
    body: text.slice(0, 60),
    icon: '/favicon.svg',
    tag: `chat-${chatId}`,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = `/chat?chatId=${chatId}`;
    notification.close();
  };
}
