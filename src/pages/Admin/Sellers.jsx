import React, { useState } from 'react';
import { SlidersHorizontal, FileText, CheckCircle, Clock, AlertTriangle, Eye, Edit2 } from 'lucide-react';
import './Sellers.css';

const sellers = [
  {
    id: 1,
    name: 'Julian Vintages',
    email: 'julian@vintagemarket.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
    status: 'Verified',
    listings: 154,
    totalSales: '$14,290.00',
    rating: 4.9,
    payoutInfo: 'Next: Oct 14, 2023 · $1,120.45',
    color: '#6366f1',
  },
  {
    id: 2,
    name: 'Modern Archive',
    email: 'contact@modernarchive.co',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    status: 'Pending',
    listings: 12,
    totalSales: '$840.00',
    rating: 4.6,
    payoutInfo: 'Verification Required',
    color: '#f59e0b',
  },
  {
    id: 3,
    name: 'Studio Noir',
    email: 'studio@noir-shop.fr',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    status: 'Verified',
    listings: 312,
    totalSales: '$69,400.00',
    rating: 4.7,
    payoutInfo: 'Next: Oct 28, 2023 · $4,320.00',
    color: '#10b981',
  },
  {
    id: 4,
    name: 'QuickResale',
    email: 'user932@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    status: 'Flagged',
    listings: 4,
    totalSales: '$120.00',
    rating: 1.2,
    payoutInfo: 'Payouts Suspended',
    color: '#ef4444',
  },
  {
    id: 5,
    name: 'Desert Rose',
    email: 'hello@desertrose.co',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    status: 'Verified',
    listings: 89,
    totalSales: '$7,820.00',
    rating: 4.8,
    payoutInfo: 'Next: Nov 01, 2023 · $890.00',
    color: '#ec4899',
  },
];

const tabs = ['All Sellers', 'Verified', 'Flagged'];

export default function Sellers() {
  const [activeTab, setActiveTab] = useState('All Sellers');
  const [search, setSearch] = useState('');

  const filtered = sellers.filter(s => {
    const matchTab =
      activeTab === 'All Sellers' ||
      (activeTab === 'Verified' && s.status === 'Verified') ||
      (activeTab === 'Flagged' && s.status === 'Flagged');
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="sellers-root">
      {/* Header */}
      <div className="sellers-header">
        <div>
          <h1 className="page-title">Seller Management</h1>
          <p className="page-sub">Oversee seller performance, verification, and compliance.</p>
        </div>
        <div className="sellers-actions">
          <button className="outline-btn"><SlidersHorizontal size={14} style={{ marginRight: '6px' }} /> Filters</button>
          <button className="export-btn-sm"><FileText size={14} style={{ marginRight: '6px' }} /> Export Report</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="sellers-stats">
        <div className="sstat-card">
          <p className="sstat-label">PENDING VERIFICATION</p>
          <p className="sstat-big">42</p>
          <p className="sstat-hint trend-up">▲ 13% this week</p>
        </div>
        <div className="sstat-card">
          <p className="sstat-label">ACTIVE SELLERS</p>
          <p className="sstat-big">1,284</p>
          <p className="sstat-hint">Global scale</p>
        </div>
        <div className="sstat-card">
          <p className="sstat-label">AVG. SELLER RATING</p>
          <p className="sstat-big">4.8</p>
          <div className="stars">{'★★★★★'}</div>
        </div>
        <div className="sstat-card">
          <p className="sstat-label">PAYOUTS QUEUED</p>
          <p className="sstat-big payout">$12,405</p>
          <p className="sstat-hint">Due to 34h</p>
        </div>
      </div>

      {/* Records */}
      <div className="sellers-table-card">
        <div className="sellers-table-top">
          <p className="section-label">Seller Records</p>
          <div className="tab-row">
            {tabs.map(t => (
              <button
                key={t}
                className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
                {t === 'Verified' && <span className="tab-badge verified">1342</span>}
                {t === 'Flagged' && <span className="tab-badge flagged">4</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="sellers-search-bar">
          <input
            type="text"
            placeholder="Search sellers by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <table className="sellers-table">
          <thead>
            <tr>
              <th>SELLER IDENTITY</th>
              <th>STATUS</th>
              <th>LISTINGS</th>
              <th>TOTAL SALES</th>
              <th>RATING</th>
              <th>PAYOUT INFO</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="seller-identity">
                    <img src={s.avatar} alt={s.name} className="seller-avatar-img" />
                    <div>
                      <p className="seller-name">{s.name}</p>
                      <p className="seller-email">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${s.status.toLowerCase()}`}>
                    {s.status === 'Verified' && <CheckCircle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {s.status === 'Pending' && <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {s.status === 'Flagged' && <AlertTriangle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {s.status}
                  </span>
                </td>
                <td>{s.listings}</td>
                <td className="bold-cell">{s.totalSales}</td>
                <td>
                  <span className="rating-val">★ {s.rating}</span>
                </td>
                <td className={`payout-cell ${s.status === 'Flagged' ? 'suspended' : ''}`}>
                  {s.payoutInfo}
                </td>
                <td>
                  <div className="row-actions">
                    <button className="row-btn"><Eye size={14} /></button>
                    <button className="row-btn"><Edit2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <p>Showing 1–10 of 1284 sellers</p>
          <div className="pagination">
            <button>‹</button>
            <button className="pg-active">1</button>
            <button>2</button>
            <button>3</button>
            <span>…</span>
            <button>129</button>
            <button>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
