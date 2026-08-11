import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, onMakeOffer }) => {
  if (!product || (!product.title && !product.image)) return null;

  const displayPrice = typeof product.price === 'number'
    ? `PKR ${product.price.toLocaleString()}`
    : (product.price ? (product.price.toString().startsWith('PKR') ? product.price : `PKR ${product.price}`) : '');

  return (
    <div className="chat-product-card">
      {product.image && (
        <div className="chat-product-img-container">
          <img src={product.image} alt={product.title} className="chat-product-img" />
        </div>
      )}
      <div className="chat-product-details">
        {product.brand && <span className="chat-product-brand">{product.brand}</span>}
        <h4 className="chat-product-title">{product.title || 'Product Listing'}</h4>
        {displayPrice && <span className="chat-product-price">{displayPrice}</span>}
      </div>
      {onMakeOffer && (
        <button type="button" className="chat-make-offer-btn" onClick={onMakeOffer}>
          Make Offer
        </button>
      )}
    </div>
  );
};

export default ProductCard;
