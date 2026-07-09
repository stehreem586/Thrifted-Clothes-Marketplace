import React, { useState } from 'react';
import {
  Filter, Download, Star, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, Clock
} from 'lucide-react';
import './Sales.css';

const reviews = [
  {
    id: 1,
    flag: 'FLAGGED',
    flagType: 'flagged',
    flagReason: 'Flagged for Misleading Content',
    rating: 2,
    time: '2 hours ago',
    text: '"The item arrived looking completely different from the photos. It had several stains on the collar that weren\'t disclosed in the listing. Very disappointed with the premium quality claims."',
    product: 'Vintage Trench Coat',
    productId: '#1 #34-2944',
    img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=150&h=150&q=80',
    actions: ['Reject Review', 'Remove Permanently'],
  },
  {
    id: 2,
    flag: 'APPROVED',
    flagType: 'approved',
    flagReason: 'Flagged for Spam',
    rating: 5,
    time: '5 hours ago',
    text: '"Amazing experience! Love this platform so much. Check out my closet for similar vibes @fashionlens_60"',
    product: 'Gold Frame Aviators',
    productId: '#1 #34-0024',
    img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=150&h=150&q=80',
    actions: ['Restore Review', 'Remove Permanently'],
  },
  {
    id: 3,
    flag: 'FLAGGED',
    flagType: 'flagged',
    flagReason: 'Flagged for Profanity',
    rating: 1,
    time: 'Yesterday',
    text: '"The shipping took 3 weeks and the seller was completely useless. **** experience honestly. Never buying from this store again."',
    product: 'Chelsea Leather Boots',
    productId: '#1 #34-0031',
    img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=150&h=150&q=80',
    actions: ['Reject Review', 'Remove Permanently'],
  },
];

export default function Sales() {
  const [activeTab, setActiveTab] = useState('All Tags');

  return (
    <div className="sales-root">
      {/* Header */}
      <div className="sales-header">
        <div>
          <h1 className="page-title">Reviews Moderation</h1>
          <p className="page-sub">Review and act on flagged community feedback to maintain boutique quality.</p>
        </div>
        <div className="sales-header-actions">
          <button className={`sales-tab-btn ${activeTab === 'All Tags' ? 'active' : ''}`} onClick={() => setActiveTab('All Tags')}>
            <Filter size={14} /> All Tags
          </button>
          <button className="export-btn-sm">
            <Download size={14} /> Bulk Review
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="sales-stats">
        <div className="sales-stat-card">
          <p className="stat-lbl">PENDING REVIEW</p>
          <p className="stat-num">24</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{width:'45%'}}></div></div>
        </div>
        <div className="sales-stat-card">
          <p className="stat-lbl">FLAGGED TODAY</p>
          <p className="stat-num">08</p>
          <div className="stat-bar"><div className="stat-bar-fill amber" style={{width:'30%'}}></div></div>
        </div>
        <div className="sales-stat-card">
          <p className="stat-lbl">AVG. RESPONSE TIME</p>
          <p className="stat-num">1.2h</p>
          <div className="stat-bar"><div className="stat-bar-fill green" style={{width:'70%'}}></div></div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="reviews-list">
        {reviews.map(rv => (
          <div key={rv.id} className="review-card">
            <div className="review-card-top">
              <div className="review-flag-row">
                <span className={`rev-flag-badge ${rv.flagType}`}>
                  {rv.flagType === 'flagged' ? <Flag size={10} /> : <CheckCircle size={10} />}
                  {rv.flag}
                </span>
                <span className="rev-flag-reason">{rv.flagReason}</span>
              </div>
              <span className="rev-time">
                <Clock size={12} /> {rv.time}
              </span>
            </div>

            <div className="review-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < rv.rating ? '#f59e0b' : 'none'}
                  color={i < rv.rating ? '#f59e0b' : '#d1d5db'}
                />
              ))}
            </div>

            <p className="review-text">{rv.text}</p>

            <div className="review-product-row">
              <img src={rv.img} alt={rv.product} className="rev-product-img" />
              <div>
                <p className="rev-product-name">{rv.product}</p>
                <p className="rev-product-id">{rv.productId}</p>
              </div>
              <div className="rev-actions">
                <button className="rev-action-outline">{rv.actions[0]}</button>
                <button className="rev-action-danger">{rv.actions[1]}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="sales-pagination">
        <button className="pg-arrow"><ChevronLeft size={14}/></button>
        <button className="pg-active">1</button>
        <button>2</button>
        <button>3</button>
        <button className="pg-arrow"><ChevronRight size={14}/></button>
      </div>
    </div>
  );
}
