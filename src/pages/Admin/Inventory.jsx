import React, { useState } from 'react';
import './Inventory.css';

const flaggedListings = [
  {
    id: 1,
    title: "Vintage 90s Leather Biker…",
    listingId: '#1 #45-4001',
    rating: '4.5/5',
    seller: '@lxvintagekoft',
    sellerType: 'Top Seller',
    reason: 'COUNTERFEIT',
    reasonColor: 'red',
    reporter: '@brandwatch_ai',
    reporterType: 'Trusted Reporter',
    status: 'Pending',
    img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    id: 2,
    title: 'Hand-repaired Eco Denim',
    listingId: '#1 #45-9922',
    rating: '4/5',
    seller: '@earthy_threads',
    sellerType: 'Standard',
    reason: 'INCORRECT CATEGORY',
    reasonColor: 'orange',
    reporter: '@denim_enthusi ast',
    reporterType: 'Standard User',
    status: 'Reviewing',
    img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    id: 3,
    title: 'Mulberry Silk Scarf',
    listingId: '',
    rating: '2.3/5',
    seller: '@silk_stories',
    sellerType: 'Standard',
    reason: 'INAPPROPRIATE IMAGES',
    reasonColor: 'gray',
    reporter: '@safety_bot',
    reporterType: 'Auto-Flag System',
    status: 'Flagged',
    img: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=150&h=150&q=80',
  },
];

export default function Inventory() {
  const [view, setView] = useState('All Reports');

  return (
    <div className="inventory-root">
      {/* Breadcrumb */}
      <p className="breadcrumb">Inventory / Moderation Queue</p>

      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="page-title">Flagged Queue</h1>
          <p className="page-sub">Review and manage reported listings from the community.</p>
        </div>
        <div className="inv-tabs">
          {['All Reports', 'Critical'].map(t => (
            <button
              key={t}
              className={`inv-tab-btn ${view === t ? 'active' : ''}`}
              onClick={() => setView(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="inv-stats">
        <div className="inv-stat">
          <p className="inv-stat-label">Pending Reviews</p>
          <p className="inv-stat-val">124</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '60%' }}></div>
          </div>
        </div>
        <div className="inv-stat">
          <p className="inv-stat-label">Avg. Response Time</p>
          <p className="inv-stat-val">4.2h</p>
          <p className="inv-stat-hint trend-up">▲ 12% from yesterday</p>
        </div>
        <div className="inv-stat">
          <p className="inv-stat-label">Listings Removed</p>
          <p className="inv-stat-val">14</p>
          <p className="inv-stat-hint">Last 24 hours</p>
        </div>
        <div className="inv-stat">
          <p className="inv-stat-label">Moderator Score</p>
          <p className="inv-stat-val">98%</p>
          <p className="inv-stat-hint green-text">High accuracy</p>
        </div>
      </div>

      {/* Listings table */}
      <div className="inv-table-card">
        <table className="inv-table">
          <thead>
            <tr>
              <th>LISTING TITLE</th>
              <th>SELLER</th>
              <th>REPORT REASON</th>
              <th>REPORTER</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {flaggedListings.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="listing-cell">
                    <img src={item.img} alt={item.title} className="listing-thumb-img" />
                    <div>
                      <p className="listing-title">{item.title}</p>
                      <p className="listing-meta">{item.listingId} · Rating: {item.rating}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="cell-main">{item.seller}</p>
                  <p className="cell-sub">{item.sellerType}</p>
                </td>
                <td>
                  <span className={`reason-tag ${item.reasonColor}`}>{item.reason}</span>
                </td>
                <td>
                  <p className="cell-main">{item.reporter}</p>
                  <p className="cell-sub">{item.reporterType}</p>
                </td>
                <td>
                  <span className={`inv-status ${item.status.toLowerCase()}`}>
                    {item.status === 'Pending' && '● '}
                    {item.status === 'Reviewing' && '● '}
                    {item.status === 'Flagged' && '● '}
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <p>Showing 1–10 of 124 results</p>
          <div className="pagination">
            <button className="pg-active">1</button>
            <button>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
