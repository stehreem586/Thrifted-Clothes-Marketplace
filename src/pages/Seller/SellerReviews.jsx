import React, { useState, useEffect, useMemo } from 'react';
import { useListings } from '../../context/ListingsContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { browseProducts } from '../../data/browseProducts';
import './SellerReviews.css';

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80';

export default function SellerReviews() {
  const { reviews: contextReviews, listings, addSellerReviewReply } = useListings();
  const { user } = useAuth();
  const [dbReviews, setDbReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState('ALL');
  const [sortBy, setSortBy] = useState('latest');
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Fetch real seller reviews from Supabase
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Step 1: fetch reviews
        const { data: rawReviews, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error || !rawReviews) {
          setLoading(false);
          return;
        }

        // Step 2: collect unique buyer IDs and order IDs
        const buyerIds = [...new Set(rawReviews.map(r => r.reviewer_id || r.buyer_id).filter(Boolean))];
        const orderIds = [...new Set(rawReviews.map(r => r.order_id).filter(Boolean))];

        // Step 3: fetch buyer profiles
        let buyerMap = {};
        if (buyerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', buyerIds);
          (profiles || []).forEach(p => { buyerMap[p.id] = p; });
        }

        // Step 4: fetch orders to get listing details
        let orderMap = {};
        if (orderIds.length > 0) {
          const { data: orderData } = await supabase
            .from('orders')
            .select('id, listing_id, listing_title, listing_image')
            .in('id', orderIds);
          (orderData || []).forEach(o => { orderMap[o.id] = o; });
        }

        // Step 5: collect all listing IDs
        const listingIds = [...new Set([
          ...rawReviews.map(r => r.listing_id),
          ...Object.values(orderMap).map(o => o.listing_id)
        ].filter(Boolean))];

        // Step 6: fetch listing images directly from listings table
        let listingMap = {};
        if (listingIds.length > 0) {
          const { data: listingData } = await supabase
            .from('listings')
            .select('id, title, image_url')
            .in('id', listingIds);
          (listingData || []).forEach(l => { listingMap[l.id] = l; });
        }

        // Step 7: map everything together
        const mapped = rawReviews.map(r => {
          const buyer = buyerMap[r.reviewer_id || r.buyer_id] || {};
          const order = orderMap[r.order_id] || {};
          const listingId = r.listing_id || order.listing_id;
          const dbListing = listingMap[listingId] || {};
          const localListing = (listings || []).find(l => String(l.id) === String(listingId)) ||
                               browseProducts.find(p => String(p.id) === String(listingId));

          const buyerName = buyer.name || r.buyer_name || 'Verified Buyer';
          const buyerAvatar = buyer.avatar_url
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(buyerName)}&background=1a1a2e&color=fff&size=100`;

          const listingTitle = dbListing.title || order.listing_title || r.listing_title || localListing?.title || 'Marketplace Item';
          const listingImage = dbListing.image_url || order.listing_image || r.listing_image || r.listingImage || localListing?.image || localListing?.image_url || DEFAULT_PRODUCT_IMAGE;

          return {
            id: r.id ? String(r.id) : `db-rev-${Date.now()}`,
            listingId: listingId || dbListing.id || order.id,
            customerName: buyerName,
            customerAvatar: buyerAvatar,
            listingImage,
            listingTitle,
            rating: parseInt(r.rating) || 5,
            comment: r.comment || '',
            date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            reply: r.reply_text ? { text: r.reply_text, date: r.reply_date || new Date().toISOString().split('T')[0] } : null
          };
        });
        setDbReviews(mapped);
      } catch (err) {
        console.warn('SellerReviews fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user, listings]);

  // Merge Supabase reviews with context reviews
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
        date: r.date || new Date().toISOString().split('T')[0],
        reply: r.reply || null
      });
    });

    return Array.from(map.values());
  }, [dbReviews, contextReviews, listings]);

  // Listing filter logic
  const filteredReviews = useMemo(() => {
    return allReviews.filter(rev => {
      if (selectedListingId !== 'ALL' && String(rev.listingId) !== String(selectedListingId)) {
        return false;
      }
      return true;
    });
  }, [allReviews, selectedListingId]);

  // Sort logic
  const sortedReviews = useMemo(() => {
    return [...filteredReviews].sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });
  }, [filteredReviews, sortBy]);

  // Metric stats
  const totalReviewsCount = allReviews.length;
  const avgRating = totalReviewsCount > 0
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : 'NA';
  const pendingRepliesCount = allReviews.filter(r => !r.reply).length;

  const handleOpenReplyModal = (review) => {
    setReplyingReviewId(review.id);
    setReplyText(review.reply ? review.reply.text : '');
  };

  const handleSendReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingReviewId) return;

    // 1. Optimistic context update
    addSellerReviewReply(replyingReviewId, replyText.trim());

    // 2. Persist to Supabase if it's a real DB review ID
    try {
      await supabase.from('reviews').update({
        reply_text: replyText.trim(),
        reply_date: new Date().toISOString().split('T')[0]
      }).eq('id', replyingReviewId);
    } catch (_) {}

    setReplyingReviewId(null);
    setReplyText('');
  };

  return (
    <div className="view-content fade-in seller-reviews-container">
      {/* View Header */}
      <div className="view-heading border-bottom">
        <div>
          <h1>Customer Reviews &amp; Feedback</h1>
          <p className="view-sub">
            Monitor ratings, inspect feedback per listing, and reply directly to buyers in real-time.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="reviews-summary-cards">
        <div className="rev-summary-card">
          <div className="rev-card-icon gold-bg">⭐</div>
          <div>
            <span className="rev-card-label">Store Average Rating</span>
            <h2 className="rev-card-val">
              {avgRating} {avgRating !== 'NA' && <span className="max-rating">/ 5.0</span>}
            </h2>
          </div>
        </div>

        <div className="rev-summary-card">
          <div className="rev-card-icon blue-bg">💬</div>
          <div>
            <span className="rev-card-label">Total Received Reviews</span>
            <h2 className="rev-card-val">{totalReviewsCount}</h2>
          </div>
        </div>

        <div className="rev-summary-card">
          <div className="rev-card-icon orange-bg">⌛</div>
          <div>
            <span className="rev-card-label">Pending Replies</span>
            <h2 className="rev-card-val">{pendingRepliesCount}</h2>
          </div>
        </div>
      </div>

      {/* Filter and Sort Row */}
      <div className="reviews-controls-row">
        <div className="control-group">
          <label htmlFor="listing-filter">Filter by Listing:</label>
          <select
            id="listing-filter"
            value={selectedListingId}
            onChange={(e) => setSelectedListingId(e.target.value)}
            className="clean-select reviews-select"
          >
            <option value="ALL">All Listings</option>
            {listings.map(item => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="clean-select reviews-select"
          >
            <option value="latest">Latest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid #cbd5e1', borderTopColor: '#c19358', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }} />
            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Loading reviews…</p>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="reviews-empty-card">
            <div className="empty-icon">⭐</div>
            <h3>No Reviews Found</h3>
            <p>No customer reviews match your selected filter options.</p>
          </div>
        ) : (
          sortedReviews.map(rev => (
            <div key={rev.id} className="review-card">
              {/* Card Header */}
              <div className="review-card-header">
                <div className="customer-info">
                  <img src={rev.customerAvatar} alt={rev.customerName} className="customer-avatar" />
                  <div>
                    <h4 className="customer-name">{rev.customerName}</h4>
                    <span className="review-date">{rev.date}</span>
                  </div>
                </div>

                <div className="rating-stars">
                  {'★'.repeat(Math.min(5, Math.max(1, rev.rating)))}
                  {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(1, rev.rating))))}
                  <span className="rating-num">({rev.rating}.0)</span>
                </div>
              </div>

              {/* Product Reference Badge */}
              <div className="review-product-badge">
                <img
                  src={rev.listingImage || DEFAULT_PRODUCT_IMAGE}
                  alt={rev.listingTitle}
                  className="rev-prod-thumb"
                  onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                />
                <span className="rev-prod-title">📦 {rev.listingTitle}</span>
              </div>

              {/* Customer Comment */}
              <p className="review-comment-text">"{rev.comment}"</p>

              {/* Seller Reply Section */}
              {rev.reply ? (
                <div className="seller-reply-box">
                  <div className="reply-header">
                    <span className="reply-author">Store Response</span>
                    <span className="reply-date">{rev.reply.date}</span>
                  </div>
                  <p className="reply-content">{rev.reply.text}</p>
                  <button
                    type="button"
                    className="edit-reply-btn"
                    onClick={() => handleOpenReplyModal(rev)}
                  >
                    ✏️ Edit Reply
                  </button>
                </div>
              ) : (
                <div className="no-reply-action">
                  <button
                    type="button"
                    className="reply-trigger-btn"
                    onClick={() => handleOpenReplyModal(rev)}
                  >
                    💬 Reply to Customer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyingReviewId && (
        <div className="seller-help-overlay" onClick={() => setReplyingReviewId(null)}>
          <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="seller-help-header">
              <h3>💬 Send Response to Customer</h3>
              <button className="seller-help-close-btn" onClick={() => setReplyingReviewId(null)}>✕</button>
            </div>
            <form onSubmit={handleSendReplySubmit}>
              <div className="seller-help-body" style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0' }}>
                  Your reply will be displayed publicly under the customer's review on your store profile.
                </p>
                <textarea
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the customer or address their questions respectfully..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div className="seller-help-footer">
                <button
                  type="button"
                  className="seller-help-close-btn"
                  onClick={() => setReplyingReviewId(null)}
                  style={{ border: 'none', background: 'transparent' }}
                >
                  Cancel
                </button>
                <button type="submit" className="seller-help-gotit-btn" style={{ background: '#c19358' }}>
                  Post Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
