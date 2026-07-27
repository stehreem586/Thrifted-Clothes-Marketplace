import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient.js';
import { fetchSavedListingIds, toggleSavedListing } from '../../utils/savedFetch.js';
import { useListings } from '../../context/ListingsContext';
import ReportModal from '../../components/common/ReportModal';
import { ShieldAlert } from 'lucide-react';
import './Product.css';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendBuyerMessage } = useListings();

  const [listing, setListing] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery slider state
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [savedListingIds, setSavedListingIds] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [buyerMsgInput, setBuyerMsgInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Fetch Listing Details on mount and when id changes
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setActivePhotoIdx(0);

        // 1. Fetch listing details
        const { data: item, error: itemError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (itemError) throw itemError;
        if (!item) throw new Error('Listing not found');

        // 2. Fetch seller profile details
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, city, avatar_url, rating, sales_count')
          .eq('id', item.seller_id)
          .single();

        const mappedListing = {
          ...item,
          price: parseFloat(item.price) || 0,
          seller: {
            id: profileData?.id,
            name: profileData?.name || 'Verified Seller',
            city: profileData?.city || 'Pakistan',
            avatar: profileData?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            rating: profileData?.rating || '4.8',
            salesCount: profileData?.sales_count || 0
          }
        };

        setListing(mappedListing);

        // 3. Fetch similar active items from same category
        if (item.category) {
          const { data: similar, error: similarError } = await supabase
            .from('listings')
            .select('*')
            .ilike('status', 'active')
            .eq('category', item.category)
            .neq('id', id)
            .limit(4);

          if (!similarError && similar) {
            setSimilarItems(similar);
          }
        }
        // 4. Fetch wishlist state if user is logged in
        if (user?.id) {
          const ids = await fetchSavedListingIds(user.id);
          setSavedListingIds(ids);
          setWishlisted(ids.includes(String(id)));
        } else {
          setSavedListingIds([]);
          setWishlisted(false);
        }
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id, user]);

  const handleWishlistToggle = async (targetId) => {
    if (!user) {
      if (window.confirm("You must be logged in to save listings to your wishlist. Would you like to log in now?")) {
        navigate('/login');
      }
      return;
    }

    const cleanId = (typeof targetId === 'string' || typeof targetId === 'number') ? targetId : id;
    const targetStr = String(cleanId);
    const isSaved = savedListingIds.includes(targetStr);
    const success = await toggleSavedListing(user.id, targetStr, !isSaved);
    if (success) {
      setSavedListingIds(prev => 
        isSaved 
          ? prev.filter(x => x !== targetStr)
          : [...prev, targetStr]
      );
      if (targetStr === String(id)) {
        setWishlisted(!isSaved);
      }
      showToast(!isSaved ? 'Added to Saved Items & Liked ❤️' : 'Removed from Saved Items');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleChatClick = () => {
    if (listing?.status?.toLowerCase() === 'sold') return;
    setShowMessageModal(true);
  };

  const handleSendBuyerText = (e) => {
    e.preventDefault();
    if (!buyerMsgInput.trim() || !listing) return;
    sendBuyerMessage({
      productTitle: listing.title,
      buyerName: 'Buyer Customer',
      text: buyerMsgInput.trim()
    });
    setBuyerMsgInput('');
    setShowMessageModal(false);
    showToast('Message sent to seller! Check Seller Inbox 💬');
  };

  const handleProductClick = (clickedId) => {
    navigate(`/product/${clickedId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Condition Color Code Mapper
  const getConditionStyle = (cond) => {
    const c = cond?.toLowerCase() || '';
    if (c.includes('new') || c.includes('tags')) return { bg: '#e8f5e9', text: '#2e7d32' }; // Green
    if (c.includes('like new') || c.includes('excellent')) return { bg: '#e3f2fd', text: '#1565c0' }; // Blue
    if (c.includes('good')) return { bg: '#fffde7', text: '#fbc02d' }; // Yellow
    if (c.includes('fair')) return { bg: '#f5f5f5', text: '#616161' }; // Grey
    return { bg: '#f2f2f7', text: '#1c1c1e' }; // Default
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(193, 147, 88, 0.2)',
          borderTopColor: '#c19358',
          borderRadius: '50%',
          animation: 'ptr-spin 0.8s linear infinite'
        }}></div>
        <style>{`@keyframes ptr-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h2 style={{ color: '#ff3b30' }}>Error Loading Listing</h2>
        <p style={{ color: '#8e8e93', margin: '8px 0 24px 0' }}>{error || 'The listing could not be found or has been deleted.'}</p>
        <button 
          onClick={() => navigate('/shop')} 
          style={{ background: '#1c1c1e', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}
        >
          Go Back to Browse
        </button>
      </div>
    );
  }

  // Handle photos list (fallback if no multi images field)
  const photos = listing.image_urls || (listing.images ? (Array.isArray(listing.images) ? listing.images : [listing.images]) : [listing.image_url]).filter(Boolean);
  const condStyle = getConditionStyle(listing.condition);
  const isSold = listing.status?.toLowerCase() === 'sold';
  const categoryLabel = listing.category || 'Vintage';
  const dateFormatted = listing.created_at ? new Date(listing.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently';

  return (
    <div className="product-page-wrapper">
      {/* Toast popup */}
      {toastMessage && (
        <div className="product-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main product detail section */}
      <div className="product-detail-layout">
        {/* Left Column: Photos Gallery slider with Dot Indicators & Sold Overlay */}
        <div className="product-visual-column">
          <div 
            className="photo-gallery-slider"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              borderRadius: '12px',
              backgroundColor: '#f2f2f7'
            }}
          >
            {/* Swipeable images track */}
            <div 
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                transform: `translateX(-${activePhotoIdx * 100}%)`,
                transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              {photos.map((photo, index) => (
                <img 
                  key={index} 
                  src={photo} 
                  alt={`${listing.title} view ${index + 1}`} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    flexShrink: 0
                  }} 
                />
              ))}
            </div>

            {/* Dot Indicators */}
            {photos.length > 1 && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 10
                }}
              >
                {photos.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActivePhotoIdx(index)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: activePhotoIdx === index ? '#1c1c1e' : 'rgba(28, 28, 30, 0.3)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    aria-label={`Show photo ${index + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Sold Banner Overlay */}
            {isSold && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 15
                }}
              >
                <span 
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    backgroundColor: '#ff3b30',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Sold
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details, Seller, Action Buttons */}
        <div className="product-info-column">
          <div className="product-category-tag">
            <span>{categoryLabel}</span>
          </div>

          <h1 className="product-main-title">{listing.title}</h1>
          <div className="product-main-price" style={{ fontWeight: '750' }}>Rs. {listing.price.toLocaleString()}</div>

          {/* Details Specifications Grid */}
          <div className="specs-card-grid">
            <div className="spec-item">
              <span className="spec-label">Size</span>
              <span className="spec-value">{listing.size || 'OS'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Condition</span>
              <span 
                className="spec-value"
                style={{
                  backgroundColor: condStyle.bg,
                  color: condStyle.text,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}
              >
                {listing.condition}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Category</span>
              <span className="spec-value">{categoryLabel}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Date Listed</span>
              <span className="spec-value">{dateFormatted}</span>
            </div>
          </div>

          {/* Seller Profile Card (Navigates on tap) */}
          <div 
            className="detail-seller-card" 
            onClick={() => {
              if (listing.seller?.id) {
                navigate(`/seller-profile/${listing.seller.id}`);
              }
            }} 
            style={{ cursor: 'pointer' }}
          >
            <div className="seller-avatar-wrapper">
              <img src={listing.seller.avatar} alt={listing.seller.name} className="seller-avatar-img" />
            </div>
            <div className="seller-details-info">
              <div className="seller-name-row">
                <span className="seller-profile-name">{listing.seller.name}</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#0f172a" stroke="#ffffff" strokeWidth="2" className="verified-badge">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="seller-meta-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="seller-rating-score" style={{ color: '#ffcc00' }}>★ {listing.seller.rating}</span>
                <span style={{ backgroundColor: '#f2f2f7', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', color: '#1c1c1e' }}>
                  {listing.seller.salesCount} sales
                </span>
                <span className="seller-location-text">
                  📍 {listing.seller.city}
                </span>
              </div>
            </div>
          </div>

          {/* Save & Contact Action Buttons */}
          <div className="detail-buttons-group" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '24px' }}>
            <button 
              type="button" 
              className={`save-btn ${wishlisted ? 'wishlisted' : ''}`}
              onClick={handleWishlistToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                border: '1px solid #e5e5ea',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                color: wishlisted ? '#ff3b30' : '#8e8e93',
                transition: 'all 0.2s',
                padding: 0
              }}
              aria-label="Save listing"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill={wishlisted ? '#ff3b30' : 'none'} stroke={wishlisted ? '#ff3b30' : 'currentColor'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <button 
              type="button" 
              className="btn-chat-seller" 
              onClick={handleChatClick}
              disabled={isSold}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '48px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isSold ? '#c7c7cc' : '#1c1c1e',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '14.5px',
                cursor: isSold ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chat-bubble-icon">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Chat with Seller</span>
            </button>

            <button
              type="button"
              className="save-btn"
              onClick={() => setShowReportModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
                backgroundColor: '#fff5f5',
                cursor: 'pointer',
                color: '#dc2626',
                transition: 'all 0.2s',
                padding: 0
              }}
              title="Report Listing"
              aria-label="Report Listing"
            >
              <ShieldAlert size={20} />
            </button>
          </div>

          {/* Report Modal */}
          {listing && (
            <ReportModal
              isOpen={showReportModal}
              onClose={() => setShowReportModal(false)}
              targetType="Listing"
              targetListing={listing}
              targetUser={listing.seller}
            />
          )}

          {/* Description Section with expandable Read More limit */}
          <div className="detail-description-section" style={{ marginTop: '32px' }}>
            <h3 className="description-section-title">Description</h3>
            <p 
              className="description-body-text"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: isExpanded ? 'unset' : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.6',
                color: '#1c1c1e',
                fontSize: '14.5px',
                whiteSpace: 'pre-line',
                margin: 0
              }}
            >
              {listing.description || 'No description provided.'}
            </p>
            {listing.description && (listing.description.split('\n').length > 3 || listing.description.length > 150) ? (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c19358',
                  fontWeight: '600',
                  padding: '4px 0',
                  marginTop: '8px',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Similar Items Section */}
      {similarItems.length > 0 && (
        <div className="similar-items-section">
          <div className="similar-header-row">
            <div className="similar-title-group">
              <h2 className="similar-main-title">Similar Items</h2>
              <p className="similar-subtitle">More pre-loved treasures you might enjoy.</p>
            </div>
            <Link to="/shop" className="browse-all-category-link">
              Browse all {categoryLabel}
            </Link>
          </div>

          <div className="similar-products-grid">
            {similarItems.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  image: product.image_url,
                  price: `Rs. ${product.price.toLocaleString()}`,
                  wishlisted: savedListingIds.includes(String(product.id))
                }}
                variant="browse"
                onWishlistToggle={handleWishlistToggle}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* ── Message Seller Modal Overlay ── */}
      {showMessageModal && (
        <div className="seller-help-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.45)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 10000
        }} onClick={() => setShowMessageModal(false)}>
          <div className="seller-help-modal" style={{
            background: '#ffffff', borderRadius: '12px', width: '90%', maxWidth: '440px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div className="seller-help-header" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', background: '#0f172a', color: '#ffffff'
            }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '16px' }}>✉️ Message Seller</h3>
              <button className="seller-help-close-btn" style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer' }} onClick={() => setShowMessageModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSendBuyerText} style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.4' }}>
                Inquire about <strong>{listing.title}</strong> directly from the seller:
              </p>
              <textarea
                placeholder="Type your inquiry message (e.g. Is price negotiable? Can you deliver to Lahore?)..."
                value={buyerMsgInput}
                onChange={e => setBuyerMsgInput(e.target.value)}
                style={{
                  width: '100%', height: '100px', padding: '10px 12px', borderRadius: '8px',
                  border: '1.5px solid #cbd5e1', fontSize: '13.5px', resize: 'none', marginBottom: '16px'
                }}
                required
                autoFocus
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  style={{ background: 'transparent', border: 'none', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#1e293b', color: '#ffffff', border: 'none', padding: '8px 16px',
                    borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
