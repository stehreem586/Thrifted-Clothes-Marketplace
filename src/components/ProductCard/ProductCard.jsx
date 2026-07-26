import React from 'react';
import './ProductCard.css';

const ProductCard = ({ 
  product, 
  variant = 'default', // 'default' (home), 'browse', 'saved'
  onClick, 
  onWishlistToggle, 
  onAddToCart,
  hideHeart = false
}) => {
  if (!product) return null;

  const { title, price, size, image, wishlisted, category, badge } = product;

  const handleCardClick = (e) => {
    // Only trigger if they didn't click interactive buttons
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    onClick?.();
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onWishlistToggle?.(product.id);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  if (variant === 'saved') {
    const isSold = product.status?.toLowerCase() === 'sold';
    const displayBadge = isSold ? 'SOLD' : badge;

    return (
      <div 
        className="saved-product-card" 
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleCardClick(e)}
      >
        <div className="saved-product-img-wrapper">
          <img src={image} alt={title} className="saved-product-img" loading="lazy" />
          
          {displayBadge && (
            <span 
              className={`saved-product-badge badge-${displayBadge.toLowerCase().replace(/\s+/g, '-')}`}
              style={displayBadge === 'SOLD' ? { backgroundColor: '#ff3b30', color: '#ffffff' } : {}}
            >
              {displayBadge}
            </span>
          )}

          <button
            type="button"
            className="saved-heart-btn"
            onClick={handleWishlistClick}
            aria-label="Remove from Saved"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#ff3b30" stroke="#ff3b30" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        
        <div className="saved-product-details">
          {category && <span className="saved-product-category">{category}</span>}
          <h3 className="saved-product-title" title={title}>{title}</h3>
          <div className="saved-product-meta-row">
            <span className="saved-product-price">{price}</span>
            {size && <span className="saved-product-size">{size}</span>}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'browse') {
    return (
      <div 
        className="browse-product-card"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleCardClick(e)}
      >
        <div className="browse-product-img-wrapper">
          <img src={image} alt={title} className="browse-product-img" loading="lazy" />
          
          {badge && (
            <span className={`browse-product-badge badge-${badge.toLowerCase().replace(/\s+/g, '-')}`}>
              {badge}
            </span>
          )}

          {!hideHeart && (
            <button
              type="button"
              className={`browse-heart-btn ${wishlisted ? 'wishlisted' : ''}`}
              onClick={handleWishlistClick}
              aria-label="Wishlist Item"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill={wishlisted ? '#ff3b30' : 'none'} stroke={wishlisted ? '#ff3b30' : 'currentColor'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          )}
        </div>
        <div className="browse-product-details">
          {product.seller_city && <span className="browse-product-city" style={{ fontSize: '11.5px', color: '#c19358', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '500' }}>📍 {product.seller_city}</span>}
          <h3 className="browse-product-title" title={title} style={{ margin: '0 0 10px 0', fontSize: '14.5px', fontWeight: '600', color: '#1c1c1e', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px', lineHeight: '1.4' }}>{title}</h3>
          <div className="browse-product-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid #f2f2f7', paddingTop: '10px' }}>
            <span className="browse-product-price" style={{ fontWeight: '700', fontSize: '15.5px', color: '#1c1c1e' }}>{price}</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {size && <span className="browse-product-size" style={{ background: '#f2f2f7', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', color: '#1c1c1e' }}>{size}</span>}
              {product.seller_name && <span className="browse-product-seller" style={{ fontSize: '11.5px', color: '#8e8e93', fontWeight: '500' }}>By {product.seller_name}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default home/trending variant
  return (
    <div 
      className="product-card" 
      onClick={handleCardClick}
      role="button" 
      tabIndex={0} 
      onKeyPress={(e) => e.key === 'Enter' && handleCardClick(e)}
    >
      <div className="product-image-container">
        <img src={image} alt={title} className="product-image" loading="lazy" />
        <button 
          className={`heart-button ${wishlisted ? 'wishlisted' : ''}`} 
          aria-label="Add to wishlist" 
          type="button"
          onClick={handleWishlistClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? '#ff4d4f' : 'none'} stroke={wishlisted ? '#ff4d4f' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div className="product-details">
        <h3 className="product-title" title={title}>{title}</h3>
        <p className="product-price">{price}</p>
        <button 
          className="add-to-cart-btn" 
          type="button"
          onClick={handleAddToCartClick}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

