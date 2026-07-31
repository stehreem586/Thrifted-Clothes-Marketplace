const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

// Set these once with:
//   firebase functions:secrets:set SUPABASE_URL
//   firebase functions:secrets:set SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = defineSecret('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = defineSecret('SUPABASE_SERVICE_ROLE_KEY');

async function fetchProfile(userId, supabaseUrl, serviceRoleKey) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=name,fcm_token`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  );
  const rows = await res.json();
  return rows[0] || null;
}

/**
 * Fires on every new message doc at chats/{chatId}/messages/{messageId}.
 * Sends "senderName: first 60 chars" to the OTHER participant's device,
 * with a data payload so the client can route straight to the chat.
 */
exports.onNewChatMessage = onDocumentCreated(
  {
    document: 'chats/{chatId}/messages/{messageId}',
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY],
  },
  async (event) => {
    const message = event.data?.data();
    const { chatId } = event.params;
    if (!message) return;

    const db = getFirestore();
    const chatSnap = await db.collection('chats').doc(chatId).get();
    const chat = chatSnap.data();
    if (!chat) return;

    const recipientId = chat.participants.find((id) => id !== message.sender_id);
    if (!recipientId) return;

    const supabaseUrl = SUPABASE_URL.value();
    const serviceRoleKey = SUPABASE_SERVICE_ROLE_KEY.value();

    const [senderProfile, recipientProfile] = await Promise.all([
      fetchProfile(message.sender_id, supabaseUrl, serviceRoleKey),
      fetchProfile(recipientId, supabaseUrl, serviceRoleKey),
    ]);

    const senderName = senderProfile?.name || 'New message';
    const fcmToken = recipientProfile?.fcm_token;
    if (!fcmToken) return; // user denied permission, or hasn't opened the app on this device

    const body = String(message.text || '').slice(0, 60);

    await getMessaging().send({
      token: fcmToken,
      notification: { title: senderName, body },
      data: { chatId, senderName, text: body },
      webpush: { fcmOptions: { link: `/chat?chatId=${chatId}` } },
    });
  }
);
