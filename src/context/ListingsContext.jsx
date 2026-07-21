import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { browseProducts } from '../data/browseProducts';
import { supabase } from '../utils/supabaseClient';

export const ListingsContext = createContext(null);

// Helper: get localStorage key scoped to a user
const uk = (uid, key) => (uid ? `${key}_${uid}` : null);

const loadLocal = (uid, key, fallback = []) => {
  if (!uid) return fallback;
  try {
    const raw = localStorage.getItem(uk(uid, key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocal = (uid, key, value) => {
  if (!uid) return;
  try {
    localStorage.setItem(uk(uid, key), JSON.stringify(value));
  } catch {}
};

export const ListingsProvider = ({ children }) => {
  // ── Auth user id (drives per-user data) ──
  const [userId, setUserId] = useState(null);

  // ── Core data states — start empty until user is resolved ──
  const [listings, setListings]         = useState([]);
  const [orders, setOrders]             = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Track whether initial data load for current user has run
  const loadedUidRef = useRef(null);

  // ─────────────────────────────────────────────────────────
  // 1. Resolve user identity and load their data
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadUserData = (uid) => {
      if (!uid || loadedUidRef.current === uid) return;
      loadedUidRef.current = uid;

      setListings(loadLocal(uid, 'sellerListings', []));
      setOrders(loadLocal(uid, 'sellerOrders', []));
      setNotifications(loadLocal(uid, 'sellerNotifications', [
        {
          id: 'welcome',
          title: 'Welcome to SecondLife Seller Hub 🎉',
          text: 'Your seller dashboard is live. Start listing your first item!',
          time: 'Just now',
          read: false,
          type: 'system'
        }
      ]));
      setConversations(loadLocal(uid, 'sellerConversations', []));
    };

    const clearUserData = () => {
      loadedUidRef.current = null;
      setListings([]);
      setOrders([]);
      setNotifications([]);
      setConversations([]);
    };

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) loadUserData(uid);
    });

    // Watch for login/logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) {
        loadUserData(uid);
      } else {
        clearUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─────────────────────────────────────────────────────────
  // 2. Persist to localStorage whenever data changes
  // ─────────────────────────────────────────────────────────
  useEffect(() => { saveLocal(userId, 'sellerListings', listings); }, [listings, userId]);
  useEffect(() => { saveLocal(userId, 'sellerOrders', orders); }, [orders, userId]);
  useEffect(() => { saveLocal(userId, 'sellerNotifications', notifications); }, [notifications, userId]);
  useEffect(() => { saveLocal(userId, 'sellerConversations', conversations); }, [conversations, userId]);

  // ─────────────────────────────────────────────────────────
  // 3. Sync listings FROM Supabase (once user is known)
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const fetchFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', userId);

        if (!error && data && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category || 'Other',
            size: item.size || 'OS',
            price: parseFloat(item.price) || 0,
            status: item.status === 'sold' ? 'Sold' : item.status === 'draft' ? 'Draft' : 'Active',
            views: item.views || 0,
            likes: item.likes || 0,
            condition: item.condition || 'Good',
            description: item.description || '',
            tags: Array.isArray(item.tags) ? item.tags : [],
            image: item.image_url || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
            createdAt: item.created_at || new Date().toISOString()
          }));

          // Merge — Supabase wins for shared fields, keep local extras
          setListings(prev => {
            const map = new Map();
            prev.forEach(p => map.set(String(p.id), p));
            mapped.forEach(m => map.set(String(m.id), m));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Supabase listings fetch skipped:', err.message);
      }
    };

    fetchFromSupabase();
  }, [userId]);

  // ─────────────────────────────────────────────────────────
  // 4. Notification helpers
  // ─────────────────────────────────────────────────────────
  const addNotification = (notif) => {
    setNotifications(prev => [{
      id: Date.now().toString(),
      read: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'info',
      ...notif
    }, ...prev].slice(0, 60));
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ─────────────────────────────────────────────────────────
  // 5. View / Like interactions (from buyer side)
  // ─────────────────────────────────────────────────────────
  const incrementViews = (productId) => {
    const targetId = String(productId).replace('seller-', '');
    setListings(prev => prev.map(item => {
      if (String(item.id) === targetId) {
        return { ...item, views: (parseInt(item.views) || 0) + 1 };
      }
      return item;
    }));
  };

  const toggleLike = (productId, isLikedNow) => {
    const targetId = String(productId).replace('seller-', '');
    setListings(prev => prev.map(item => {
      if (String(item.id) === targetId) {
        const newLikes = isLikedNow
          ? (parseInt(item.likes) || 0) + 1
          : Math.max(0, (parseInt(item.likes) || 0) - 1);

        if (isLikedNow) {
          setNotifications(n => [{
            id: Date.now().toString(),
            read: false,
            title: 'New Wishlist Add ❤️',
            text: `Someone added "${item.title}" to their wishlist.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'like'
          }, ...n].slice(0, 60));
        }
        return { ...item, likes: newLikes };
      }
      return item;
    }));
  };

  // ─────────────────────────────────────────────────────────
  // 6. Buyer → Seller messaging
  // ─────────────────────────────────────────────────────────
  const sendBuyerMessage = ({ productTitle, buyerName, text }) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { sender: 'buyer', text, time: timeStr };

    setConversations(prev => {
      const existing = prev.find(c => c.productTitle === productTitle);
      if (existing) {
        return prev.map(c => c.id === existing.id
          ? { ...c, lastMessage: text, time: timeStr, unread: true, messages: [...c.messages, newMsg] }
          : c
        );
      }
      return [{
        id: 'c-' + Date.now(),
        buyerName: buyerName || 'Interested Buyer',
        buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
        productTitle: productTitle || 'Item Inquiry',
        lastMessage: text,
        time: timeStr,
        unread: true,
        messages: [newMsg]
      }, ...prev];
    });

    setNotifications(prev => [{
      id: Date.now().toString(),
      read: false,
      title: 'New Message 💬',
      text: `${buyerName || 'A buyer'} asked about "${productTitle || 'your item'}"`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'message'
    }, ...prev].slice(0, 60));
  };

  // Seller replies
  const sendSellerReply = (conversationId, text) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversations(prev => prev.map(c => c.id === conversationId
      ? { ...c, lastMessage: text, time: timeStr, unread: false, messages: [...c.messages, { sender: 'seller', text, time: timeStr }] }
      : c
    ));
  };

  // ─────────────────────────────────────────────────────────
  // 7. Listing CRUD
  // ─────────────────────────────────────────────────────────
  const addListing = async (productData) => {
    const newProduct = {
      id: Date.now(),
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      ...productData
    };

    setListings(prev => [newProduct, ...prev]);

    if (productData.status === 'Active') {
      addNotification({
        title: 'Listing Published 🛍️',
        text: `"${productData.title}" is now live in the marketplace.`,
        type: 'listing'
      });
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('listings').insert([{
          title: newProduct.title,
          category: newProduct.category,
          size: newProduct.size,
          price: newProduct.price,
          status: newProduct.status?.toLowerCase() || 'active',
          condition: newProduct.condition,
          description: newProduct.description,
          tags: newProduct.tags,
          image_url: newProduct.image,
          seller_id: session.user.id
        }]);
      }
    } catch (err) {
      console.warn('Supabase insert skipped:', err.message);
    }

    return newProduct;
  };

  const updateListing = async (id, updatedFields) => {
    setListings(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('listings').update({
          title: updatedFields.title,
          price: updatedFields.price,
          category: updatedFields.category,
          status: updatedFields.status?.toLowerCase(),
          condition: updatedFields.condition,
          description: updatedFields.description,
          image_url: updatedFields.image
        }).eq('id', id).eq('seller_id', session.user.id);
      }
    } catch (err) {
      console.warn('Supabase update skipped:', err.message);
    }
  };

  const deleteListing = async (id) => {
    setListings(prev => prev.filter(item => item.id !== id));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('listings').delete().eq('id', id).eq('seller_id', session.user.id);
      }
    } catch (err) {
      console.warn('Supabase delete skipped:', err.message);
    }
  };

  // ─────────────────────────────────────────────────────────
  // 8. Merge this user's active listings into buyer marketplace
  // ─────────────────────────────────────────────────────────
  const getSellerProfile = () => {
    try {
      if (userId) {
        const saved = localStorage.getItem(`sellerProfile_${userId}`);
        if (saved) return JSON.parse(saved);
      }
      const general = localStorage.getItem('seller_profile');
      if (general) return JSON.parse(general);
    } catch (e) {}
    return {};
  };

  const sellerProf = getSellerProfile();
  const totalSalesCount = listings.filter(i => i.status === 'Sold').length + orders.length;

  const activeSellerProductsForBuyer = listings
    .filter(item => item.status === 'Active')
    .map(item => ({
      id: `seller-${item.id}`,
      originalId: item.id,
      title: item.title,
      price: `PKR ${parseFloat(item.price).toLocaleString()}`,
      numericPrice: parseFloat(item.price),
      size: item.size ? `Size ${item.size}` : 'One Size',
      image: item.image,
      wishlisted: false,
      category: item.category || 'Vintage',
      condition: item.condition || 'Good',
      sustainability: 'High',
      description: item.description || 'Curated pre-loved thrift item from a verified seller.',
      seller: {
        name: sellerProf.name || 'Verified Seller Store',
        rating: totalSalesCount > 0 ? '5.0 (Verified)' : 'New Seller',
        location: sellerProf.city ? `${sellerProf.city}, Pakistan` : 'Pakistan',
        avatar: sellerProf.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      isUserCreated: true
    }));

  const allMarketplaceProducts = [...activeSellerProductsForBuyer, ...browseProducts];

  return (
    <ListingsContext.Provider value={{
      userId,
      listings, setListings,
      orders, setOrders,
      addListing, updateListing, deleteListing,
      allMarketplaceProducts, activeSellerProductsForBuyer,
      notifications, addNotification, markNotificationRead, markAllNotificationsRead,
      conversations, setConversations, sendBuyerMessage, sendSellerReply,
      incrementViews, toggleLike,
    }}>
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error('useListings must be used within ListingsProvider');
  return ctx;
};
