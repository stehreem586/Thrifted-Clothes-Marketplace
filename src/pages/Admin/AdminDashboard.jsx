import React, { useState } from 'react';
import { DollarSign, Users, Store, TrendingUp, TrendingDown, Layers, FileText } from 'lucide-react';
import './AdminDashboard.css';

/* ── Mock data ── */
const recentTransactions = [
  {
    id: 1,
    product: '90s Oversized Trench',
    img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=150&h=150&q=80',
    seller: '@urban_vintage',
    amount: '$245.00',
    status: 'COMPLETED',
    time: '2 mins ago',
  },
  {
    id: 2,
    product: 'Designer Leather Boots',
    img: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=150&h=150&q=80',
    seller: '@luxe_resale',
    amount: '$510.00',
    status: 'PENDING',
    time: '15 mins ago',
  },
  {
    id: 3,
    product: 'Vintage Levi Denim Jacket',
    img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=150&h=150&q=80',
    seller: '@denim_hub',
    amount: '$89.00',
    status: 'COMPLETED',
    time: '38 mins ago',
  },
  {
    id: 4,
    product: 'Silk Evening Blouse',
    img: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=150&h=150&q=80',
    seller: '@silk_stories',
    amount: '$175.00',
    status: 'REFUNDED',
    time: '1 hr ago',
  },
];

const topCategories = [
  { name: 'Vintage', pct: 42, color: '#1a1a2e', width: '82%' },
  { name: 'Streetwear', pct: 38, color: '#374151', width: '72%' },
  { name: 'Designer', pct: 27, color: '#6b7280', width: '52%' },
  { name: 'Art', pct: 15, color: '#d1d5db', width: '28%' },
];

/* Simple SVG line chart */
function MiniChart() {
  const gmvPoints = [5000, 12000, 9000, 18000, 14000, 22000, 28000, 25000, 32000];
  const signupPoints = [8000, 10000, 11500, 10000, 12000, 14000, 13000, 15000, 17000];
  const w = 420, h = 140;
  const maxV = 35000;
  const xs = gmvPoints.map((_, i) => (i / (gmvPoints.length - 1)) * w);
  const toY = v => h - (v / maxV) * h;
  const polyline = pts => xs.map((x, i) => `${x},${toY(pts[i])}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 140 }}>
      <polyline
        points={polyline(gmvPoints)}
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={polyline(signupPoints)}
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeDasharray="6 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState('Last 30 Days');

  return (
    <div className="dash-root">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Overview</h1>
          <p className="dash-sub">Real-time performance metrics for SecondLife.</p>
        </div>
        <div className="dash-header-actions">
          <button
            className={`period-btn ${period === 'Last 30 Days' ? 'active' : ''}`}
            onClick={() => setPeriod('Last 30 Days')}
          >
            Last 30 Days
          </button>
          <button className="export-btn"><FileText size={14} style={{ marginRight: '6px' }} /> Export Report</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-stats-row">
        <div className="stat-card yellow">
          <div className="stat-icon-wrapper"><DollarSign size={20} color="#b45309" /></div>
          <div className="stat-body">
            <p className="stat-label">GROSS MERCHANDISE VALUE</p>
            <p className="stat-value">$142,590.00</p>
          </div>
          <span className="stat-badge up"><TrendingUp size={11} /> 12.4%</span>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon-wrapper"><Users size={20} color="#1d4ed8" /></div>
          <div className="stat-body">
            <p className="stat-label">TOTAL USERS</p>
            <p className="stat-value">24,812</p>
          </div>
          <span className="stat-badge up"><TrendingUp size={11} /> 8.1%</span>
        </div>
        <div className="stat-card green">
          <div className="stat-icon-wrapper"><Store size={20} color="#047857" /></div>
          <div className="stat-body">
            <p className="stat-label">ACTIVE SELLERS</p>
            <p className="stat-value">3,405</p>
          </div>
          <span className="stat-badge neutral">— 0.0%</span>
        </div>
        <div className="stat-card snapshot">
          <p className="stat-label">LISTINGS SNAPSHOT</p>
          <div className="snapshot-row">
            <span className="snap-label">Active</span>
            <span className="snap-val">12,402</span>
          </div>
          <div className="snapshot-bar-outer">
            <div className="snapshot-bar-inner" style={{ width: '75%' }}></div>
          </div>
          <div className="snapshot-row">
            <span className="snap-label">Sold</span>
            <span className="snap-val">8,190</span>
          </div>
          <div className="snapshot-bar-outer">
            <div className="snapshot-bar-inner gold" style={{ width: '52%' }}></div>
          </div>
        </div>
      </div>

      {/* Chart + Top Categories */}
      <div className="dash-middle-row">
        <div className="chart-card">
          <div className="chart-header">
            <p className="chart-title">GMV &amp; Signups Over Time</p>
            <div className="chart-legend">
              <span className="leg-dot dark"></span><span>GMV</span>
              <span className="leg-dot gray"></span><span>Signups</span>
            </div>
          </div>
          <div className="chart-area">
            <MiniChart />
          </div>
          <div className="chart-weeks">
            {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'].map(w => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="chart-insights">
            {topCategories.slice(0, 2).map(c => (
              <span key={c.name} className="insight-chip">
                🏷️ {c.name} {c.pct}%
              </span>
            ))}
          </div>
        </div>

        <div className="top-categories-card">
          <p className="chart-title">Top Categories</p>
          <div className="cat-list">
            {topCategories.map(cat => (
              <div key={cat.name} className="cat-row">
                <span className="cat-name">{cat.name}</span>
                <div className="cat-bar-outer">
                  <div
                    className="cat-bar-inner"
                    style={{ width: cat.width, background: cat.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-card">
        <div className="tx-header">
          <p className="chart-title">Recent Transactions</p>
          <button className="view-all-btn">View All</button>
        </div>
        <table className="tx-table">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>SELLER</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map(tx => (
              <tr key={tx.id}>
                <td>
                  <div className="tx-product">
                    <img src={tx.img} alt={tx.product} className="tx-product-img" />
                    <span>{tx.product}</span>
                  </div>
                </td>
                <td className="tx-seller">{tx.seller}</td>
                <td className="tx-amount">{tx.amount}</td>
                <td>
                  <span className={`tx-status ${tx.status.toLowerCase()}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="tx-time">{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

