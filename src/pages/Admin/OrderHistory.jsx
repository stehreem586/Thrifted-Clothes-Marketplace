import React, { useState } from 'react';
import './OrderHistory.css';

const initialOrders = [
  {
    id: '#SL-3512-V',
    title: 'Vintage Heritage Trench',
    details: 'Size M • Beige',
    buyerName: 'Eleanor Vance',
    buyerLocation: 'Paris, France',
    price: 450.00,
    date: 'Oct 28, 2023',
    status: 'Delivered',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
  },
  {
    id: '#SL-3580-L',
    title: 'Minimalist Leather Sneaker',
    details: 'Size 42 • White',
    buyerName: 'Julien Thorne',
    buyerLocation: 'Copenhagen, DK',
    price: 155.00,
    date: 'Oct 26, 2023',
    status: 'In Transit',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80'
  },
  {
    id: '#SL-3542-W',
    title: 'Hand-Painted Silk Scarf',
    details: 'OS • Forest Green',
    buyerName: 'Sophia Rossi',
    buyerLocation: 'Milan, Italy',
    price: 120.00,
    date: 'Oct 25, 2023',
    status: 'Pending',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80'
  },
  {
    id: '#SL-3345-A',
    title: 'Recycled Cashmere Knit',
    details: 'Size S • Charcoal',
    buyerName: 'Marcus Walsh',
    buyerLocation: 'London, UK',
    price: 210.00,
    date: 'Oct 23, 2023',
    status: 'Delivered',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80'
  }
];

function OrderHistory({ ordersSearch }) {
  const [orders] = useState(initialOrders);

  const filtered = orders.filter(order => {
    if (ordersSearch && ordersSearch.trim() !== '') {
      const term = ordersSearch.toLowerCase();
      return (
        order.id.toLowerCase().includes(term) ||
        order.title.toLowerCase().includes(term) ||
        order.buyerName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="view-content fade-in">
      <div className="view-heading">
        <div>
          <h1>Order History</h1>
          <p className="view-sub">Track and manage all your completed and pending sales transactions.</p>
        </div>
        <div className="heading-buttons-history-row">
          <button className="secondary-action-btn filter-action">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
          <button className="primary-action-btn csv-action">Export CSV</button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="history-metrics-row-grid">
        <div className="metrics-simple-card">
          <span className="metrics-simple-label">TOTAL REVENUE</span>
          <h3>$12,450.00</h3>
          <span className="metrics-simple-sub positive">✓ +15% from last month</span>
        </div>
        <div className="metrics-simple-card">
          <span className="metrics-simple-label">TOTAL ORDERS</span>
          <h3>142</h3>
          <span className="metrics-simple-sub">Average 4.7 per day</span>
        </div>
        <div className="metrics-simple-card">
          <span className="metrics-simple-label">AVG. ORDER VALUE</span>
          <h3>$87.60</h3>
          <span className="metrics-simple-sub">Stable trend</span>
        </div>
        <div className="metrics-simple-card">
          <span className="metrics-simple-label">PENDING SHIPPING</span>
          <h3>8</h3>
          <span className="metrics-simple-sub negative">Action required</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="listings-table-card">
        <div className="table-responsive">
          <table className="seller-table aligned-middle">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Order ID</th>
                <th style={{ width: '35%' }}>Item</th>
                <th style={{ width: '18%' }}>Buyer Info</th>
                <th style={{ width: '12%' }}>Total Price</th>
                <th style={{ width: '10%' }}>Date</th>
                <th style={{ width: '8%' }}>Status</th>
                <th style={{ width: '2%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td><span className="order-id-label">{order.id}</span></td>
                  <td>
                    <div className="product-cell">
                      <div className="product-thumbnail">
                        <img src={order.image} alt={order.title} />
                      </div>
                      <div className="product-details">
                        <span className="product-title">{order.title}</span>
                        <span className="product-subtitle">{order.details}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="buyer-cell">
                      <span className="buyer-name">{order.buyerName}</span>
                      <span className="buyer-location">{order.buyerLocation}</span>
                    </div>
                  </td>
                  <td className="price-cell"><strong>${order.price.toFixed(2)}</strong></td>
                  <td className="date-cell">{order.date}</td>
                  <td>
                    <span className={`status-pill ${
                      order.status === 'Delivered' ? 'complete-delivery' :
                      order.status === 'In Transit' ? 'transit-delivery' : 'pending-delivery'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="action-icon-btn more-btn">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer-pagination">
          <span className="showing-indicator">Showing 1-{filtered.length} of 142 orders</span>
          <div className="pagination-controls">
            <button className="pagination-btn arrow-btn" disabled>&lt;</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn arrow-btn">&gt;</button>
          </div>
        </div>
      </div>

      {/* Sustainability Tip */}
      <div className="tip-box-yellow bottom-sustainability-box">
        <div className="tip-icon-container">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" className="leaf-eco-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.12 10 9.88 10c.06 0 .12 0 .18-.01.44-.01.76-.39.71-.83-.06-.57-.09-1.15-.09-1.74 0-3.31 2.69-6 6-6 .59 0 1.17.03 1.74.09.44.05.82-.27.83-.71.01-.06.01-.12.01-.18C22 6.12 17.52 2 12 2z" />
          </svg>
        </div>
        <div className="tip-content">
          <h5>Sustainability Impact</h5>
          <p>Your sales this month have saved approximately 185kg of CO2 emissions. Keep up the great work in giving pre-loved items a second life!</p>
        </div>
      </div>

      <footer className="order-history-footer">
        <p>© 2026 SecondLife Marketplace. All rights reserved. Premium boutique management system.</p>
      </footer>
    </div>
  );
}

export default OrderHistory;
