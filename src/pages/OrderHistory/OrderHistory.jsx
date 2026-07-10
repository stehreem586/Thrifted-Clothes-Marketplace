import React, { useState } from 'react';
import './OrderHistory.css';
import img1 from '../../assets/images/products/vintage-shoulder-bag.png';
import img2 from '../../assets/images/products/minimal-white-sneakers.png';
import img3 from '../../assets/images/products/vintage-leather-jacket.png';

const initialOrders = [
  { id: '#SL-98231', title: 'Vintage Burberry Trench', seller: '@clara_archives', date: 'Oct 24, 2023', total: 345.0, status: 'Shipped', image: img3 },
  { id: '#SL-98004', title: 'Common Projects Achilles', seller: '@minimalist_jon', date: 'Oct 12, 2023', total: 180.0, status: 'Delivered', image: img2 },
  { id: '#SL-98552', title: 'Handmade Leather Satchel', seller: '@artisan_leather', date: 'Oct 28, 2023', total: 125.0, status: 'Pending', image: img1 }
];

const StatusPill = ({ status }) => (
  <span className={`oh-status-pill ${status.toLowerCase()}`}>{status}</span>
);

const OrderRow = ({ order }) => (
  <tr>
    <td className="oh-order-id">{order.id}</td>
    <td className="oh-item">
      <div className="oh-product-cell">
        <div className="oh-product-thumb">
          <img src={order.image} alt={order.title} />
        </div>
        <div className="oh-product-info">
          <div className="oh-product-title">{order.title}</div>
        </div>
      </div>
    </td>
    <td className="oh-seller">{order.seller}</td>
    <td className="oh-date">{order.date}</td>
    <td className="oh-total">${order.total.toFixed(2)}</td>
    <td className="oh-status"><StatusPill status={order.status} /></td>
    <td className="oh-actions">
      <button className="oh-btn secondary">View Details</button>
    </td>
  </tr>
);

const OrderHistory = () => {
  const [orders] = useState(initialOrders);

  return (
    <div className="oh-page container">
      <div className="oh-header">
        <div>
          <h1>My Orders</h1>
          <p className="oh-sub">Track and manage your sustainable purchases.</p>
        </div>
        <div className="oh-header-actions">
          <button className="oh-btn outline">Filter</button>
          <button className="oh-btn primary">Export</button>
        </div>
      </div>

      <section className="oh-metrics">
        <div className="oh-metrics-left card">
          <div className="oh-impact-header">
            <div className="oh-impact-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.98.58 3.82 1.56 5.36C7.35 20.96 12 22 12 22s4.65-1.04 8.44-4.64A11.98 11.98 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
                <path d="M12 6s2 1.5 2 4-2 4-2 4"/>
              </svg>
            </div>
            <div className="oh-impact-title">Sustainability Impact</div>
          </div>
          <p className="oh-metrics-desc">Your choice to buy pre-loved has actively reduced landfill waste and CO2 emissions. Here's your contribution this year.</p>

          <div className="oh-impact-goal-row">
            <div className="oh-impact-goal-label">2024 Impact Goal</div>
            <div className="oh-impact-percent">75%</div>
          </div>

          <div className="oh-progress-row">
            <div className="oh-progress-bar">
              <div className="oh-progress-filled" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
        <div className="oh-metrics-right">
          <div className="oh-small-card">
            <div className="oh-small-value">14kg</div>
            <div className="oh-small-label">CO2 Saved</div>
          </div>
          <div className="oh-small-card">
            <div className="oh-small-value">8</div>
            <div className="oh-small-label">Items Saved</div>
          </div>
        </div>
      </section>

      <section className="oh-table card">
        <table className="oh-table-inner">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Item</th>
              <th>Seller</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => <OrderRow key={o.id} order={o} />)}
          </tbody>
        </table>

        <div className="oh-table-footer">
          <div className="oh-showing">Showing {orders.length} of 24 orders</div>
          <div className="oh-pagination">
            <button className="oh-page-btn">&lt;</button>
            <button className="oh-page-btn active">1</button>
            <button className="oh-page-btn">2</button>
            <button className="oh-page-btn">3</button>
            <button className="oh-page-btn">&gt;</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderHistory;
