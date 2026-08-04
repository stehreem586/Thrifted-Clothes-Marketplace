import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient.js';
import { fetchSavedListingIds, toggleSavedListing } from '../../utils/savedFetch.js';
import { useListings } from '../../context/ListingsContext';
import { browseProducts, similarProducts } from '../../data/browseProducts';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import ReportModal from '../../components/common/ReportModal';
import { ShieldAlert } from 'lucide-react';
import './Product.css';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allMarketplaceProducts, toggleLike, incrementViews } = useListings();
  const { user, profile } = useAuth();
  const productId = parseInt(id);

  // Find product from either browse list or similar items list
  const currentProduct = 
    allMarketplaceProducts.find(p => String(p.id) === String(id)) || 
    similarProducts.find(p => String(p.id) === String(id)) || 
    allMarketplaceProducts.find(p => String(p.id) === '4') ||
    browseProducts.find(p => p.id === 4); // default to Archival Camel Wool Overcoat if not found

  const sellerInfo = currentProduct.seller || {
    name: "Elena's Archive",
    rating: '4.9 (124)',
    location: 'Milan, Italy',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
  };

  const productThumbnails = currentProduct.thumbnails || [
    { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
    { id: 2, name: 'Collar Detail', transform: 'scale(1.8)', transformOrigin: 'center 15%' },
    { id: 3, name: 'Embroidery Detail', transform: 'scale(2.2)', transformOrigin: 'center 50%' },
    { id: 4, name: 'Hem Detail', transform: 'scale(1.6)', transformOrigin: 'center 85%' }
  ];

  // Gallery state (tehreem) — this is what the thumbnails/main image below actually use
  const [activeThumbnail, setActiveThumbnail] = useState(productThumbnails[0]);

  // Saved-listings + wishlist state (main), synced from product data (tehreem)
  const [savedListingIds, setSavedListingIds] = useState([]);
  const [wishlisted, setWishlisted] = useState(currentProduct.wishlisted);
  const [isExpanded, setIsExpanded] = useState(false);

  // Contact / report modal state (main)
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [buyerMsgInput, setBuyerMsgInput] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [sellerProfile, setSellerProfile] = useState(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      const sellerId = currentProduct?.seller?.id || currentProduct?.seller_id;
      if (!sellerId) return;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(String(sellerId))) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('phone, show_phone')
          .eq('id', sellerId)
          .single();

        if (!error && data) {
          setSellerProfile(data);
        }
      } catch (e) {}
    };

    fetchSellerProfile();
  }, [currentProduct]);

  // Reset local states when product ID changes
  useEffect(() => {
    const thumbs = currentProduct.thumbnails || [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Collar Detail', transform: 'scale(1.8)', transformOrigin: 'center 15%' },
      { id: 3, name: 'Embroidery Detail', transform: 'scale(2.2)', transformOrigin: 'center 50%' },
      { id: 4, name: 'Hem Detail', transform: 'scale(1.6)', transformOrigin: 'center 85%' }
    ];
    setActiveThumbnail(thumbs[0]);
    setWishlisted(currentProduct.wishlisted);

    if (id) {
      incrementViews(id);
    }
  }, [id, currentProduct]);

  const handleWishlistToggle = () => {
    const newTarget = !wishlisted;
    setWishlisted(newTarget);
    toggleLike(id, newTarget);
    showToast(newTarget ? 'Added to Saved Items' : 'Removed from Saved Items');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleChatClick = async () => {
    if (!user) {
      if (window.confirm("You must be logged in to chat with the seller. Would you like to log in now?")) {
        navigate('/login', { state: { from: `/product/${id}` } });
      }
      return;
    }

    try {
      const getSellerId = (product) => {
        if (product.seller?.id) return product.seller.id;
        if (product.seller?.name) {
          return 'mock-seller-' + product.seller.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
        }
        return 'mock-seller-unknown';
      };

      const buyerId = user.id;
      const sellerId = getSellerId(currentProduct);
      const listingId = String(currentProduct.id);

      // Check Firestore for existing chat: WHERE listing_id = X AND participants includes current user
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('listing_id', '==', listingId),
        where('participants', 'array-contains', buyerId)
      );

      const querySnapshot = await getDocs(q);
      let chatId = null;

      // Filter on the client side to verify participants includes the seller
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.participants && data.participants.includes(sellerId)) {
          chatId = docSnap.id;
        }
      });

      if (!chatId) {
        // If no chat exists: create new document in chats collection
        const newChat = {
          participants: [buyerId, sellerId],
          listing_id: listingId,
          created_at: new Date().toISOString(),
          buyer_id: buyerId,
          buyer_name: profile?.name || user.email?.split('@')[0] || 'Interested Buyer',
          buyer_avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
          seller_id: sellerId,
          seller_name: currentProduct.seller?.name || 'Seller',
          seller_avatar: sellerInfo.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
          product_title: currentProduct.title,
          product_price: currentProduct.price,
          product_image: currentProduct.image,
          product_category: currentProduct.category || 'Vintage',
          last_message: '',
          last_message_time: new Date().toISOString()
        };

        const docRef = await addDoc(chatsRef, newChat);
        chatId = docRef.id;
      }

      // Immediately open the chat conversation screen
      navigate('/chat', { state: { activeChatId: chatId } });
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat. Please try again.");
    }
  };

  const handleBuyNow = () => {
    showToast('Secure checkout simulated! Item added to bag.');
  };

  const handleProductClick = (clickedId) => {
    navigate(`/product/${clickedId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get default metadata if product was in simple similarProducts list
  const categoryLabel = currentProduct.category || 'Vintage';
  const conditionLabel = currentProduct.condition || 'Excellent';
  const sustainabilityLabel = currentProduct.sustainability || 'High';
  const descriptionLabel = currentProduct.description || 
    'A premium selected pre-loved item, chosen for its exceptional quality and style. Responsibly sourced and curated by our community to give fashion a second life.';

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
        {/* Left Column: Thumbnails and Main Image */}
        <div className="product-visual-column">
          <div className="thumbnails-list">
            {productThumbnails.map((thumb, idx) => (
              <button
                key={thumb.id || idx}
                className={`thumbnail-btn ${activeThumbnail.id === thumb.id ? 'active' : ''}`}
                onClick={() => setActiveThumbnail(thumb)}
                type="button"
              >
                <div className="thumbnail-btn-inner" style={{ overflow: 'hidden', width: '100%', height: '100%', borderRadius: 'inherit' }}>
                  <img 
                    src={currentProduct.image} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className="thumbnail-img" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: thumb.transform,
                      transformOrigin: thumb.transformOrigin
                    }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="main-image-container" style={{ overflow: 'hidden' }}>
            <img 
              src={currentProduct.image} 
              alt={currentProduct.title} 
              className="main-display-img" 
              style={{
                transform: activeThumbnail.transform,
                transformOrigin: activeThumbnail.transformOrigin,
                transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform-origin 0.45s ease',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <button
              type="button"
              className={`product-heart-overlay ${wishlisted ? 'wishlisted' : ''}`}
              onClick={handleWishlistToggle}
              aria-label="Wishlist product"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill={wishlisted ? '#ff3b30' : 'none'} stroke={wishlisted ? '#ff3b30' : 'currentColor'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column: Details, Seller, Action Buttons */}
        <div className="product-info-column">
          <div className="product-category-tag">
            <span>{categoryLabel}</span>
          </div>

          <h1 className="product-main-title">{currentProduct.title}</h1>
          <div className="product-main-price">{currentProduct.price}</div>

          {/* Details Specifications Grid */}
          <div className="specs-card-grid">
            <div className="spec-item">
              <span className="spec-label">Size</span>
              <span className="spec-value">{currentProduct.size}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Condition</span>
              <span className="spec-value highlight-gold">{conditionLabel}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Category</span>
              <span className="spec-value">{categoryLabel}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Sustainability Impact</span>
              <span className="spec-value icon-value">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="leaf-icon">
                  <path d="M2 22c1.25-5.822 5.577-10.925 11.235-13.064C12.18 10.97 12 13.065 12 15c0 3.866 3.134 7 7 7h3v-3c0-7.732-6.268-14-14-14C4.37 5 2.18 8.847 2 13.784" />
                </svg>
                <span>{sustainabilityLabel}</span>
              </span>
            </div>
          </div>

          {/* Seller Profile Card */}
          <div 
            className="detail-seller-card" 
            onClick={() => {
              const sellerSlug = currentProduct.seller?.name ? 
                currentProduct.seller.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') : 'vintage-vibes';
              const targetSlug = sellerSlug.includes('elena') ? 'elena-archive' : sellerSlug;
              navigate(`/seller-profile/${targetSlug}`);
            }} 
            style={{ cursor: 'pointer' }}
          >
            <div className="seller-avatar-wrapper">
              <img src={sellerInfo.avatar} alt={sellerInfo.name} className="seller-avatar-img" />
            </div>
            <div className="seller-details-info">
              <div className="seller-name-row">
                <span className="seller-profile-name">{sellerInfo.name}</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#0f172a" stroke="#ffffff" strokeWidth="2" className="verified-badge">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="seller-meta-row">
                <span className="seller-rating-score">★ {sellerInfo.rating}</span>
                <span className="seller-location-text">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="loc-pin">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {sellerInfo.location}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout / Contact Action Buttons */}
          <div className="detail-buttons-group">
            <button type="button" className="btn-chat-seller" onClick={handleChatClick}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chat-bubble-icon">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Chat with Seller</span>
            </button>

            <button type="button" className="btn-buy-now" onClick={handleBuyNow}>
              Buy Now
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

          {sellerProfile?.phone && sellerProfile?.show_phone && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#e0f2fe',
              border: '1.5px solid #bae6fd',
              color: '#0369a1',
              fontWeight: '700',
              fontSize: '13.5px',
              marginTop: '16px'
            }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Seller Contact: <a href={`tel:${sellerProfile.phone}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{sellerProfile.phone}</a></span>
            </div>
          )}

          {/* Report Modal */}
          {currentProduct && (
            <ReportModal
              isOpen={showReportModal}
              onClose={() => setShowReportModal(false)}
              targetType="Listing"
              targetListing={currentProduct}
              targetUser={currentProduct.seller}
            />
          )}

          {/* Description Section */}
          <div className="detail-description-section" style={{ marginTop: '32px' }}>
            <h3 className="description-section-title">Description</h3>
            <p className="description-body-text">{descriptionLabel}</p>
          </div>
        </div>
      </div>

      {/* Similar Items Section */}
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
          {similarProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="browse"
              onWishlistToggle={(id) => showToast('Wishlist status updated')}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;
