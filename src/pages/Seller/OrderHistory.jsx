import React, { useState, useEffect, useMemo } from 'react';
import { useListings } from '../../context/ListingsContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import './OrderHistory.css';

function OrderHistory({ ordersSearch }) {
  const { orders: contextOrders } = useListings();
  const { user } = useAuth();
  const [dbOrders, setDbOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch real orders from Supabase DB for current seller / user
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data: rawOrders, error } = await supabase
          .from('orders')
          .select('*, listings(id, title, price, image_url, category), profiles!orders_buyer_id_fkey(name, city)')
          .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (!error && rawOrders) {
          const mapped = rawOrders.map(o => {
            const listing = o.listings || {};
            const buyer = o.profiles || {};
            const itemPrice = parseFloat(o.total || listing.price || 0);

            return {
              id: o.id ? `#SL-${String(o.id).slice(0, 8)}` : '#SL-0000',
              rawId: o.id,
              title: listing.title || 'Marketplace Item',
              details: listing.category ? `Category: ${listing.category}` : 'Pre-loved thrift item',
              buyerName: buyer.name || 'Verified Buyer',
              buyerLocation: buyer.city ? `${buyer.city}, Pakistan` : 'Pakistan',
              price: itemPrice,
              date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
              status: o.status === 'confirmed' || o.status === 'Confirmed' ? 'Delivered' : (o.status || 'Delivered'),
              image: listing.image_url || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
            };
          });
          setDbOrders(mapped);
        }
      } catch (err) {
        console.warn('OrderHistory fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Combine DB orders with local context orders
  const allOrders = useMemo(() => {
    const map = new Map();
    dbOrders.forEach(o => map.set(String(o.id), o));
    (contextOrders || []).forEach(o => {
      const formattedPrice = typeof o.total === 'number' ? o.total : parseFloat(String(o.total || o.price || 0).replace(/[^0-9.]/g, '')) || 0;
      map.set(String(o.id), {
        id: o.id || '#SL-9999',
        title: o.title || 'Marketplace Item',
        details: 'Pre-loved thrift item',
        buyerName: o.buyerName || o.seller || 'Verified Buyer',
        buyerLocation: o.buyerLocation || 'Pakistan',
        price: formattedPrice,
        date: o.date || 'Recently',
        status: o.status || 'Delivered',
        image: o.image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
      });
    });
    return Array.from(map.values());
  }, [dbOrders, contextOrders]);

  const filtered = useMemo(() => {
    return allOrders.filter(order => {
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
  }, [allOrders, statusFilter, ordersSearch]);

  const metrics = useMemo(() => {
    const totalRev = allOrders.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);
    const count = allOrders.length;
    const avgVal = count > 0 ? (totalRev / count) : 0;
    const pendingCount = allOrders.filter(o => o.status === 'Pending' || o.status === 'In Transit').length;

    return {
      totalRevenue: totalRev > 0 ? `PKR ${totalRev.toLocaleString()}` : 'PKR 0',
      totalOrders: count > 0 ? count : '0',
      avgOrderValue: avgVal > 0 ? `PKR ${Math.round(avgVal).toLocaleString()}` : 'PKR 0',
      pendingShipping: pendingCount
    };
  }, [allOrders]);

  const handleExportCSV = () => {
    if (allOrders.length === 0) { alert('No order history to export.'); return; }
    const headers = ['Order ID', 'Item', 'Buyer', 'Location', 'Price (PKR)', 'Date', 'Status'];
    const rows = allOrders.map(o => [o.id, `"${o.title}"`, `"${o.buyerName}"`, `"${o.buyerLocation}"`, o.price, o.date, o.status]);
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

      {/* Orders Table or Empty State */}
      <div className="listings-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid #cbd5e1', borderTopColor: '#c19358', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }} />
            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Loading order history…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>📦</div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>No Orders Found</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              {allOrders.length === 0
                ? 'When buyers purchase your listed items, completed and pending sales will appear here.'
                : 'No sales match your search filter.'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="seller-table aligned-middle">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>Order ID</th>
                    <th style={{ width: '35%' }}>Item</th>
                    <th style={{ width: '18%' }}>Buyer Info</th>
                    <th style={{ width: '14%' }}>Total Price</th>
                    <th style={{ width: '10%' }}>Date</th>
                    <th style={{ width: '8%' }}>Status</th>
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
                      <td className="price-cell"><strong>PKR {order.price.toLocaleString()}</strong></td>
                      <td className="date-cell">{order.date}</td>
                      <td>
                        <span className={`status-pill ${
                          order.status === 'Delivered' || order.status === 'Confirmed' ? 'complete-delivery' :
                          order.status === 'In Transit' ? 'transit-delivery' : 'pending-delivery'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer-pagination">
              <span className="showing-indicator">Showing 1-{filtered.length} of {allOrders.length} orders</span>
            </div>
          </>
        )}
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
