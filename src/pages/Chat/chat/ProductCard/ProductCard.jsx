import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, onMakeOffer }) => {
  if (!product) return null;

  return (
    <div className="chat-product-card">
      <div className="chat-product-img-container">
        <img src={product.image} alt={product.title} className="chat-product-img" />
      </div>
      <div className="chat-product-details">
        <span className="chat-product-brand">{product.brand}</span>
        <h4 className="chat-product-title">{product.title}</h4>
        <span className="chat-product-price">{product.price}</span>
      </div>
      <button type="button" className="chat-make-offer-btn" onClick={onMakeOffer}>
        Make Offer
      </button>
    </div>
  );
};

export default ProductCard;
