import React, { useState, useMemo } from 'react';
import { useListings } from '../../context/ListingsContext';
import './OrderHistory.css';

function OrderHistory({ ordersSearch }) {
  const { orders } = useListings();
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter !== 'All' && order.status !== statusFilter) return false;
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
  }, [orders, statusFilter, ordersSearch]);

  const metrics = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);
    const count = orders.length;
    const avgVal = count > 0 ? (totalRev / count) : 0;
    const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'In Transit').length;

    return {
      totalRevenue: totalRev > 0 ? `PKR ${totalRev.toLocaleString()}` : 'N/A',
      totalOrders: count > 0 ? count : 'N/A',
      avgOrderValue: avgVal > 0 ? `PKR ${Math.round(avgVal).toLocaleString()}` : 'N/A',
      pendingShipping: pendingCount
    };
  }, [orders]);

  const handleExportCSV = () => {
    if (orders.length === 0) { alert('No order history to export.'); return; }
    const headers = ['Order ID', 'Item', 'Buyer', 'Location', 'Price', 'Date', 'Status'];
    const rows = orders.map(o => [o.id, `"${o.title}"`, `"${o.buyerName}"`, `"${o.buyerLocation}"`, o.price, o.date, o.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="view-content fade-in">
      <div className="view-heading">
        <div>
          <h1>Order History</h1>
          <p className="view-sub">Track and manage all your completed and pending sales transactions.</p>
        </div>
        <div className="heading-buttons-history-row">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="secondary-action-btn filter-action"
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#fff' }}
          >
            <option value="All">All Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="In Transit">In Transit</option>
            <option value="Pending">Pending</option>
          </select>
          <button className="primary-action-btn csv-action" onClick={handleExportCSV}>Export CSV</button>
        </div>
      </div>

      {/* Metrics Row (100% Real Dynamic Data) */}
      <div className="history-metrics-row-grid">
        <div className="metrics-simple-card">
          <span className="metrics-simple-label">TOTAL REVENUE</span>
          <h3>{metrics.totalRevenue}</h3>
          <span className="metrics-simple-sub positive">✓ Real-time sales total</span>
        </div>
        <div className="metrics-simple-card">
          <span className="metrics-simple-label">TOTAL ORDERS</span>
          <h3>{metrics.totalOrders}</h3>
          <span className="metrics-simple-sub">Processed transactions</span>
        </div>
        <div className="metrics-simple-card">
          <span className="metrics-simple-label">AVG. ORDER VALUE</span>
          <h3>{metrics.avgOrderValue}</h3>
          <span className="metrics-simple-sub">Calculated average</span>
        </div>
        <div className="metrics-simple-card">
          <span className="metrics-simple-label">PENDING SHIPPING</span>
          <h3>{metrics.pendingShipping}</h3>
          <span className={`metrics-simple-sub ${metrics.pendingShipping > 0 ? 'negative' : 'positive'}`}>
            {metrics.pendingShipping > 0 ? 'Action required' : 'All cleared'}
          </span>
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
