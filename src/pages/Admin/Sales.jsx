import React, { useState, useEffect, useMemo } from 'react';
import { Star, ChevronLeft, ChevronRight, Flag, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useListings } from '../../context/ListingsContext';
import { supabase } from '../../utils/supabaseClient';
import { browseProducts } from '../../data/browseProducts';
import './Sales.css';

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80';

export default function Sales() {
  const { reviews: contextReviews, listings, addSellerReviewReply, setReviews } = useListings();
  const [dbReviews, setDbReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [replyModalId, setReplyModalId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState(null);

  // Fetch all reviews from Supabase for admin review moderation
  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const { data: rawReviews } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (!rawReviews) return;

        const buyerIds = [...new Set(rawReviews.map(r => r.reviewer_id || r.buyer_id).filter(Boolean))];
        const orderIds = [...new Set(rawReviews.map(r => r.order_id).filter(Boolean))];

        let buyerMap = {};
        if (buyerIds.length > 0) {
          const { data: profiles } = await supabase.from('profiles').select('id, name, avatar_url').in('id', buyerIds);
          (profiles || []).forEach(p => { buyerMap[p.id] = p; });
        }

        let orderMap = {};
        if (orderIds.length > 0) {
          const { data: orderData } = await supabase.from('orders').select('id, listing_id, listing_title, listing_image').in('id', orderIds);
          (orderData || []).forEach(o => { orderMap[o.id] = o; });
        }

        const listingIds = [...new Set([
          ...rawReviews.map(r => r.listing_id),
          ...Object.values(orderMap).map(o => o.listing_id)
        ].filter(Boolean))];

        let listingMap = {};
        if (listingIds.length > 0) {
          const { data: lData } = await supabase.from('listings').select('id, title, image_url').in('id', listingIds);
          (lData || []).forEach(l => { listingMap[l.id] = l; });
        }

        const mapped = rawReviews.map(r => {
          const buyer = buyerMap[r.reviewer_id || r.buyer_id] || {};
          const order = orderMap[r.order_id] || {};
          const listingId = r.listing_id || order.listing_id;
          const dbListing = listingMap[listingId] || {};
          const localListing = (listings || []).find(l => String(l.id) === String(listingId)) ||
                               browseProducts.find(p => String(p.id) === String(listingId));

          const buyerName = buyer.name || r.buyer_name || 'Verified Buyer';
          const buyerAvatar = buyer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(buyerName)}&background=1a1a2e&color=fff&size=100`;

          const listingTitle = dbListing.title || order.listing_title || r.listing_title || localListing?.title || 'Marketplace Item';
          const listingImage = dbListing.image_url || order.listing_image || r.listing_image || r.listingImage || localListing?.image || localListing?.image_url || DEFAULT_PRODUCT_IMAGE;

          return {
            id: String(r.id),
            listingId: listingId || dbListing.id || order.id,
            customerName: buyerName,
            customerAvatar: buyerAvatar,
            listingImage,
            listingTitle,
            rating: parseInt(r.rating) || 5,
            comment: r.comment || '',
            date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : 'Recent',
            reply: r.reply_text ? { text: r.reply_text, date: r.reply_date || new Date().toISOString().split('T')[0] } : null
          };
        });

        setDbReviews(mapped);
      } catch (err) {
        console.warn('Admin Sales reviews fetch warning:', err.message);
      }
    };

    fetchAllReviews();
  }, [listings]);

  // Combine DB reviews with context reviews
  const allReviews = useMemo(() => {
    const map = new Map();
    dbReviews.forEach(r => map.set(String(r.id), r));

    (contextReviews || []).forEach(r => {
      const custName = r.customerName || r.buyerName || 'Verified Buyer';
      const custAvatar = r.customerAvatar || r.buyerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(custName)}&background=1a1a2e&color=fff&size=100`;

      const matchedListing = (listings || []).find(l => String(l.id) === String(r.listingId || r.listing_id)) ||
                             browseProducts.find(p => String(p.id) === String(r.listingId || r.listing_id));

      const prodTitle = r.listingTitle || r.title || matchedListing?.title || 'Marketplace Item';
      const prodImg = r.listingImage || r.image_url || r.image || matchedListing?.image || matchedListing?.image_url || DEFAULT_PRODUCT_IMAGE;

      map.set(String(r.id), {
        id: String(r.id),
        listingId: r.listingId,
        customerName: custName,
        customerAvatar: custAvatar,
        listingImage: prodImg,
        listingTitle: prodTitle,
        rating: parseInt(r.rating) || 5,
        comment: r.comment || '',
        date: r.date || 'Recent',
        reply: r.reply || null
      });
    });

    return Array.from(map.values());
  }, [dbReviews, contextReviews, listings]);

  // Filter tabs: All, Flagged (rating <= 2), Approved (replied or >=4 star)
  const filtered = allReviews.filter(rv => {
    if (activeTab === 'Flagged') return rv.rating <= 2;
    if (activeTab === 'Approved') return rv.rating >= 4 || rv.reply;
    if (activeTab === 'Pending') return !rv.reply;
    return true;
  });

  const pendingCount  = allReviews.filter(rv => !rv.reply).length;
  const flaggedCount  = allReviews.filter(rv => rv.rating <= 2).length;
  const avgRating     = allReviews.length > 0
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : '—';

  const handleReplySubmit = (reviewId) => {
    if (!replyText.trim()) return;
    addSellerReviewReply(reviewId, replyText.trim());
    setReplyText('');
    setReplyModalId(null);
  };

  const handleRemove = (reviewId) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setRemoveConfirm(null);
  };

  const renderStars = (count) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < count ? '#f59e0b' : 'none'}
        color={i < count ? '#f59e0b' : '#d1d5db'}
      />
    ));

  return (
    <div className="sales-root">
      {/* Header */}
      <div className="sales-header">
        <div>
          <h1 className="page-title">Reviews Moderation</h1>
          <p className="page-sub">
            Real-time review feed across all seller listings. Approve, flag, reply or remove reviews.
          </p>
        </div>
        <div className="sales-header-actions">
          {['All', 'Approved', 'Flagged', 'Pending'].map(tab => (
            <button
              key={tab}
              className={`sales-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Flagged' && flaggedCount > 0 &&
                <span style={{ marginLeft: '6px', background: '#fee2e2', color: '#991b1b', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                  {flaggedCount}
                </span>
              }
              {tab === 'Pending' && pendingCount > 0 &&
                <span style={{ marginLeft: '6px', background: '#fef3c7', color: '#92400e', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                  {pendingCount}
                </span>
              }
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Stats */}
      <div className="sales-stats">
        <div className="sales-stat-card">
          <p className="stat-lbl">TOTAL REVIEWS</p>
          <p className="stat-num">{allReviews.length}</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${Math.min(100, allReviews.length * 20)}%` }}></div></div>
        </div>
        <div className="sales-stat-card">
          <p className="stat-lbl">FLAGGED REVIEWS</p>
          <p className="stat-num">{flaggedCount}</p>
          <div className="stat-bar"><div className="stat-bar-fill amber" style={{ width: `${Math.min(100, flaggedCount * 25)}%` }}></div></div>
        </div>
        <div className="sales-stat-card">
          <p className="stat-lbl">AVG. RATING</p>
          <p className="stat-num">{avgRating}</p>
          <div className="stat-bar"><div className="stat-bar-fill green" style={{ width: `${avgRating !== '—' ? (avgRating / 5) * 100 : 0}%` }}></div></div>
        </div>
        <div className="sales-stat-card">
          <p className="stat-lbl">PENDING REPLIES</p>
          <p className="stat-num">{pendingCount}</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${Math.min(100, pendingCount * 20)}%`, background: '#a78bfa' }}></div></div>
        </div>
      </div>

      {/* Real Reviews List */}
      <div className="reviews-list">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
            <p style={{ fontWeight: '700', fontSize: '16px', color: '#334155', margin: 0 }}>
              {activeTab === 'All' ? 'No reviews yet' : `No ${activeTab.toLowerCase()} reviews`}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
              Reviews submitted by buyers will appear here automatically.
            </p>
          </div>
        ) : (
          filtered.map(rv => {
            const isFlagged = rv.rating <= 2;
            return (
              <div key={rv.id} className="review-card">
                {/* Top Row */}
                <div className="review-card-top">
                  <div className="review-flag-row">
                    <span className={`rev-flag-badge ${isFlagged ? 'flagged' : 'approved'}`}>
                      {isFlagged ? <Flag size={10} /> : <CheckCircle size={10} />}
                      {isFlagged ? 'FLAGGED' : 'APPROVED'}
                    </span>
                    {rv.reply && (
                      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={11} /> Replied
                      </span>
                    )}
                  </div>
                  <span className="rev-time">
                    <Clock size={12} /> {rv.date || 'Recent'}
                  </span>
                </div>

                {/* Reviewer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <img
                    src={rv.customerAvatar}
                    alt={rv.customerName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{rv.customerName}</p>
                    <div className="review-stars">{renderStars(rv.rating)}</div>
                  </div>
                </div>

                {/* Review text */}
                <p className="review-text">"{rv.comment}"</p>

                {/* Seller Reply (if any) */}
                {rv.reply && (
                  <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
                    padding: '10px 14px', marginBottom: '12px', fontSize: '13px'
                  }}>
                    <p style={{ margin: 0, fontWeight: '700', color: '#15803d', fontSize: '12px', marginBottom: '4px' }}>
                      ↩ Seller Reply
                    </p>
                    <p style={{ margin: 0, color: '#166534' }}>{rv.reply.text}</p>
                  </div>
                )}

                {/* Product + Actions */}
                <div className="review-product-row">
                  <img
                    src={rv.listingImage || DEFAULT_PRODUCT_IMAGE}
                    alt={rv.listingTitle}
                    className="rev-product-img"
                    onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                  />
                  <div style={{ flex: 1 }}>
                    <p className="rev-product-name">{rv.listingTitle || 'Listing'}</p>
                  </div>
                  <div className="rev-actions">
                    {!rv.reply && (
                      <button
                        className="rev-action-outline"
                        onClick={() => { setReplyModalId(rv.id); setReplyText(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <MessageSquare size={12} /> Reply
                      </button>
                    )}
                    <button
                      className="rev-action-danger"
                      onClick={() => setRemoveConfirm(rv.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination footer */}
      {filtered.length > 0 && (
        <div className="sales-pagination">
          <p style={{ fontSize: '13px', color: '#64748b' }}>Showing {filtered.length} of {allReviews.length} review(s)</p>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalId && (
        <div className="seller-help-overlay" onClick={() => setReplyModalId(null)}>
          <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="seller-help-header">
              <h3>✏️ Reply to Review</h3>
              <button className="seller-help-close-btn" onClick={() => setReplyModalId(null)}>✕</button>
            </div>
            <div className="seller-help-body" style={{ padding: '20px' }}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write your reply to the customer…"
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box'
                }}
              />
            </div>
            <div className="seller-help-footer">
              <button className="seller-help-close-btn" style={{ border: 'none', background: 'transparent' }} onClick={() => setReplyModalId(null)}>
                Cancel
              </button>
              <button
                className="seller-help-gotit-btn"
                style={{ background: '#c19358' }}
                onClick={() => handleReplySubmit(replyModalId)}
                disabled={!replyText.trim()}
              >
                Submit Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm Modal */}
      {removeConfirm && (
        <div className="seller-help-overlay" onClick={() => setRemoveConfirm(null)}>
          <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="seller-help-header">
              <h3>🗑️ Remove Review</h3>
              <button className="seller-help-close-btn" onClick={() => setRemoveConfirm(null)}>✕</button>
            </div>
            <div className="seller-help-body" style={{ padding: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155' }}>
                Are you sure you want to permanently remove this review? This action cannot be undone.
              </p>
            </div>
            <div className="seller-help-footer">
              <button className="seller-help-close-btn" style={{ border: 'none', background: 'transparent' }} onClick={() => setRemoveConfirm(null)}>
                Cancel
              </button>
              <button
                className="seller-help-gotit-btn"
                style={{ background: '#ef4444' }}
                onClick={() => handleRemove(removeConfirm)}
              >
                Remove Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
