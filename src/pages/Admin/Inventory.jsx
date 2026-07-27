import React, { useState } from 'react';
import { useListings } from '../../context/ListingsContext';
import './Inventory.css';

export default function Inventory() {
  const { listings, approveListing, rejectListing } = useListings();
  const [view, setView] = useState('Pending Requests');

  const pendingListings = listings.filter(item => item.status === 'Pending' || item.status === 'pending');
  const approvedListings = listings.filter(item => item.status === 'Approved' || item.status === 'Active' || item.status === 'approved');

  return (
    <div className="inventory-root">
      {/* Breadcrumb */}
      <p className="breadcrumb">Admin Portal / Inventory &amp; Listing Approvals</p>

      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="page-title">Listing Approval &amp; Moderation</h1>
          <p className="page-sub">Review new real-life listing requests from sellers before public marketplace display.</p>
        </div>
        <div className="inv-tabs">
          {[
            { key: 'Pending Requests', count: pendingListings.length },
            { key: 'Approved Listings', count: approvedListings.length }
          ].map(t => (
            <button
              key={t.key}
              className={`inv-tab-btn ${view === t.key ? 'active' : ''}`}
              onClick={() => setView(t.key)}
            >
              {t.key} ({t.count})
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="inv-stats">
        <div className="inv-stat">
          <p className="inv-stat-label">Pending Approval Requests</p>
          <p className="inv-stat-val" style={{ color: '#b45309' }}>{pendingListings.length}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(pendingListings.length * 20, 100)}%`, background: '#f59e0b' }}></div>
          </div>
        </div>
        <div className="inv-stat">
          <p className="inv-stat-label">Approved Live Listings</p>
          <p className="inv-stat-val" style={{ color: '#15803d' }}>{approvedListings.length}</p>
          <p className="inv-stat-hint trend-up">▲ Active on Marketplace</p>
        </div>
        <div className="inv-stat">
          <p className="inv-stat-label">Total Submissions</p>
          <p className="inv-stat-val">{listings.length}</p>
          <p className="inv-stat-hint">Across all sellers</p>
        </div>
        <div className="inv-stat">
          <p className="inv-stat-label">Admin Approval Rate</p>
          <p className="inv-stat-val">100%</p>
          <p className="inv-stat-hint green-text">Real-time status sync</p>
        </div>
      </div>

      {/* Listings table */}
      <div className="inv-table-card">
        {view === 'Pending Requests' ? (
          <table className="inv-table">
            <thead>
              <tr>
                <th>LISTING TITLE</th>
                <th>CATEGORY &amp; SIZE</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {pendingListings.length > 0 ? (
                pendingListings.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="listing-cell">
                        <img src={item.image} alt={item.title} className="listing-thumb-img" />
                        <div>
                          <p className="listing-title" style={{ fontWeight: '700' }}>{item.title}</p>
                          <p className="listing-meta">Condition: {item.condition || 'Good'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="cell-main">{item.category}</p>
                      <p className="cell-sub">Size: {item.size}</p>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>PKR {parseFloat(item.price).toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className="inv-status pending" style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontWeight: '700' }}>
                        ● Pending
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => approveListing(item.id)}
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectListing(item.id)}
                          style={{
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    🎉 No pending listing requests! All listings have been reviewed and approved.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>LISTING TITLE</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>MARKETPLACE STATE</th>
              </tr>
            </thead>
            <tbody>
              {approvedListings.length > 0 ? (
                approvedListings.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="listing-cell">
                        <img src={item.image} alt={item.title} className="listing-thumb-img" />
                        <div>
                          <p className="listing-title" style={{ fontWeight: '700' }}>{item.title}</p>
                          <p className="listing-meta">Size: {item.size}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="cell-main">{item.category}</p>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>PKR {parseFloat(item.price).toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className="inv-status approved" style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontWeight: '700' }}>
                        ● Approved
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>
                        🌐 Live on Marketplace
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No approved listings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="table-footer">
          <p>
            Showing {view === 'Pending Requests' ? pendingListings.length : approvedListings.length} total entries
          </p>
        </div>
      </div>
    </div>
  );
}
