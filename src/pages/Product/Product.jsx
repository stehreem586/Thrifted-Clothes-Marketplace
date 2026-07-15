import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { browseProducts, similarProducts } from '../../data/browseProducts';
import './Product.css';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = parseInt(id);

  // Find product from either browse list or similar items list
  const currentProduct = 
    browseProducts.find(p => p.id === productId) || 
    similarProducts.find(p => p.id === productId) || 
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

  const [activeThumbnail, setActiveThumbnail] = useState(productThumbnails[0]);
  const [wishlisted, setWishlisted] = useState(currentProduct.wishlisted);
  const [toastMessage, setToastMessage] = useState('');

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
  }, [id, currentProduct]);

  const handleWishlistToggle = () => {
    setWishlisted(!wishlisted);
    showToast(!wishlisted ? 'Added to Saved Items' : 'Removed from Saved Items');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleChatClick = () => {
    navigate('/chat', { state: { startChatWith: sellerInfo.name } });
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
          <div className="detail-seller-card" onClick={() => navigate('/storefront')} style={{ cursor: 'pointer' }}>
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
          </div>

          {/* Description Section */}
          <div className="detail-description-section">
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
