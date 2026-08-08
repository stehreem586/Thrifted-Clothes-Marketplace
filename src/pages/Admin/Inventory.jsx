import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import './Inventory.css';

export default function Inventory() {
  const [view, setView] = useState('Pending Requests');
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [allProfiles, setAllProfiles] = useState([]);

  // Fetch ALL listings and profiles from Supabase
  const fetchAllListings = async () => {
    try {
      setLoading(true);
      const { data: profilesData } = await supabase.from('profiles').select('*');
      if (profilesData) setAllProfiles(profilesData);

      // Fetch listings WITHOUT join (join causes 400 if FK not configured in Supabase)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      let localStatuses = {};
      try {
        const rawLocal = localStorage.getItem('secondlife_seller_statuses');
        if (rawLocal) localStatuses = JSON.parse(rawLocal);
      } catch (e) {}

      if (!error && data) {
        setAllListings(data.map(item => {
          // Look up seller profile from separately fetched profiles list (no join needed)
          const sellerProf = profilesData?.find(p => String(p.id) === String(item.seller_id));

          // Resolve the seller's verification status from all available sources
          let sellerStatus;
          const localOverride = localStatuses[item.seller_id];

          if (localOverride) {
            sellerStatus = localOverride;
          } else if (sellerProf?.seller_status === 'Verified') {
            sellerStatus = 'Verified';
          } else if (sellerProf?.seller_status === 'Flagged' || sellerProf?.seller_status === 'Suspended') {
            sellerStatus = 'Flagged';
          } else if (sellerProf?.seller_status === 'Pending') {
            sellerStatus = 'Pending';
          } else if (sellerProf?.role === 'seller' && (!sellerProf?.seller_status || sellerProf?.seller_status === 'Verified')) {
            // Old-style verified sellers (role=seller, no explicit seller_status)
            sellerStatus = 'Verified';
          } else if (sellerProf?.status === 'pending') {
            sellerStatus = 'Pending';
          } else {
            sellerStatus = 'Pending';
          }

          return {
            id: item.id,
            title: item.title,
            category: item.category || 'Other',
            size: item.size || 'OS',
            price: parseFloat(item.price) || 0,
            status: (() => {
              const s = (item.status || '').toLowerCase();
              if (s === 'sold') return 'Sold';
              if (s === 'approved' || s === 'active') return 'Approved';
              if (s === 'rejected') return 'Rejected';
              if (s === 'draft') return 'Draft';
              return 'Pending';
            })(),
            condition: item.condition || 'Good',
            description: item.description || '',
            image: item.image_url || item.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80',
            seller_id: item.seller_id,
            sellerName: sellerProf?.name || 'Seller Store',
            sellerEmail: sellerProf?.email || '',
            sellerStatus: sellerStatus,
            createdAt: item.created_at
          };
        }));
      }
    } catch (err) {
      console.warn('Admin Inventory fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllListings();

    const handleStatusUpdate = () => fetchAllListings();
    window.addEventListener('sellerStatusUpdated', handleStatusUpdate);
    return () => window.removeEventListener('sellerStatusUpdated', handleStatusUpdate);
  }, []);

  const approveListing = async (id) => {
    const listingItem = allListings.find(item => String(item.id) === String(id));
    const sellerId = listingItem?.seller_id;
    const listingTitle = listingItem?.title || 'Your listing';

    // Optimistically update UI first
    setAllListings(prev =>
      prev.map(item => String(item.id) === String(id) ? { ...item, status: 'Approved' } : item)
    );
    try {
      const { data: updated, error } = await supabase
        .from('listings')
        .update({ status: 'active' })
        .eq('id', id)
        .select();

      if (error) {
        console.error('⚠️ Approve failed:', error.message);
        alert('DB Error: ' + error.message);
        fetchAllListings(); // revert
        return;
      }
      if (!updated || updated.length === 0) {
        console.error('⚠️ Approve: 0 rows affected — RLS policy blocking update');
        alert('Approve failed: Database permission denied. Make sure you are logged in as admin and RLS policies are applied.');
        fetchAllListings(); // revert
        return;
      }

      // Send verification notification to seller
      if (sellerId) {
        const sellerKey = `sellerNotifications_${sellerId}`;
        let sellerNotifs = [];
        try {
          const raw = localStorage.getItem(sellerKey);
          if (raw) sellerNotifs = JSON.parse(raw);
        } catch (e) {}
        sellerNotifs.unshift({
          id: Date.now().toString(),
          read: false,
          title: 'Listing Approved! 🎉',
          text: `Your listing "${listingTitle}" has been approved by Admin and is now live on SecondLife Marketplace.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'listing'
        });
        localStorage.setItem(sellerKey, JSON.stringify(sellerNotifs));
      }

      // Success — fire event to trigger updates across tabs/context
      window.dispatchEvent(new CustomEvent('listingStatusUpdated', { detail: { listingId: id, status: 'Approved' } }));
    } catch (err) {
      console.error('Approve exception:', err.message);
      fetchAllListings(); // revert
    }
  };

  const rejectListing = async (id) => {
    const listingItem = allListings.find(item => String(item.id) === String(id));
    const sellerId = listingItem?.seller_id;
    const listingTitle = listingItem?.title || 'Your listing';

    setAllListings(prev =>
      prev.map(item => String(item.id) === String(id) ? { ...item, status: 'Rejected' } : item)
    );
    try {
      const { data: updated, error } = await supabase
        .from('listings')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select();

      if (error) {
        console.error('⚠️ Reject failed:', error.message);
        alert('DB Error: ' + error.message);
        fetchAllListings();
        return;
      }
      if (!updated || updated.length === 0) {
        console.error('⚠️ Reject: 0 rows affected — RLS policy blocking update');
        alert('Reject failed: Database permission denied. Make sure you are logged in as admin and RLS policies are applied.');
        fetchAllListings();
        return;
      }

      // Send rejection notification to seller
      if (sellerId) {
        const sellerKey = `sellerNotifications_${sellerId}`;
        let sellerNotifs = [];
        try {
          const raw = localStorage.getItem(sellerKey);
          if (raw) sellerNotifs = JSON.parse(raw);
        } catch (e) {}
        sellerNotifs.unshift({
          id: Date.now().toString(),
          read: false,
          title: 'Listing Rejected ❌',
          text: `Your listing "${listingTitle}" was rejected by Admin review.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'listing'
        });
        localStorage.setItem(sellerKey, JSON.stringify(sellerNotifs));
      }

      window.dispatchEvent(new CustomEvent('listingStatusUpdated', { detail: { listingId: id, status: 'Rejected' } }));
    } catch (err) {
      console.error('Reject exception:', err.message);
      fetchAllListings();
    }
  };

  const pendingListings  = allListings.filter(item => item.status === 'Pending' && item.sellerStatus === 'Verified');
  const approvedListings = allListings.filter(item => item.status === 'Approved');
  const unverifiedSellerListings = allListings.filter(item => item.status === 'Pending' && item.sellerStatus !== 'Verified');

  return (
    <div className="inventory-root">
      {/* Breadcrumb */}
      <p className="breadcrumb">Admin Portal / Inventory &amp; Listing Approvals</p>

      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="page-title">Listing Approval &amp; Moderation</h1>
          <p className="page-sub">Review listing requests from verified sellers before public marketplace display.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={fetchAllListings}
            style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            ↻ Refresh
          </button>
          <div className="inv-tabs">
            {[
              { key: 'Pending Requests',  count: pendingListings.length },
              { key: 'Approved Listings', count: approvedListings.length },
              { key: 'Awaiting Seller Verification', count: unverifiedSellerListings.length }
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
          <p className="inv-stat-val">{allListings.length}</p>
          <p className="inv-stat-hint">Across all sellers</p>
        </div>
        <div className="inv-stat">
          <p className="inv-stat-label">Approval Rate</p>
          <p className="inv-stat-val">
            {allListings.length > 0
              ? `${Math.round((approvedListings.length / allListings.length) * 100)}%`
              : '0%'}
          </p>
          <p className="inv-stat-hint green-text">Real-time status sync</p>
        </div>
      </div>

      {/* Listings table */}
      <div className="inv-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <p style={{ fontSize: '16px' }}>⏳ Loading listings from database…</p>
          </div>
        ) : view === 'Pending Requests' ? (
          <table className="inv-table">
            <thead>
              <tr>
                <th>LISTING TITLE</th>
                <th>SELLER</th>
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
                        <img src={item.image} alt={item.title} className="listing-thumb-img" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <p className="listing-title" style={{ fontWeight: '700' }}>{item.title}</p>
                          <p className="listing-meta">Condition: {item.condition}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="cell-main" style={{ fontWeight: '600', fontSize: '13px' }}>{item.sellerName}</p>
                      <p className="cell-sub" style={{ fontSize: '11px', color: '#64748b' }}>{item.sellerEmail}</p>
                    </td>
                    <td>
                      <p className="cell-main">{item.category}</p>
                      <p className="cell-sub">Size: {item.size}</p>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>PKR {parseFloat(item.price).toLocaleString()}</strong>
                    </td>
                    <td>
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontWeight: '700', fontSize: '12px' }}>
                        ● Pending
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => approveListing(item.id)}
                          style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectListing(item.id)}
                          style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    🎉 No pending listing requests! All listings have been reviewed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : view === 'Awaiting Seller Verification' ? (
          <table className="inv-table">
            <thead>
              <tr>
                <th>LISTING TITLE</th>
                <th>SELLER</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>SELLER STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {unverifiedSellerListings.length > 0 ? (
                unverifiedSellerListings.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="listing-cell">
                        <img src={item.image} alt={item.title} className="listing-thumb-img" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <p className="listing-title" style={{ fontWeight: '700' }}>{item.title}</p>
                          <p className="listing-meta">Condition: {item.condition}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="cell-main" style={{ fontWeight: '600', fontSize: '13px' }}>{item.sellerName}</p>
                      <p className="cell-sub" style={{ fontSize: '11px', color: '#64748b' }}>{item.sellerEmail}</p>
                    </td>
                    <td>
                      <p className="cell-main">{item.category}</p>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>PKR {parseFloat(item.price).toLocaleString()}</strong>
                    </td>
                    <td>
                      <span style={{ background: '#fffbeb', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontWeight: '700', fontSize: '12px', border: '1px solid #fde68a' }}>
                        ⏳ Seller Pending Verification
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Verify seller in Admin Sellers tab to unlock approval
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No listings awaiting seller verification.
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
                <th>SELLER</th>
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
                        <img src={item.image} alt={item.title} className="listing-thumb-img" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <p className="listing-title" style={{ fontWeight: '700' }}>{item.title}</p>
                          <p className="listing-meta">Size: {item.size}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="cell-main" style={{ fontWeight: '600', fontSize: '13px' }}>{item.sellerName}</p>
                      <p className="cell-sub" style={{ fontSize: '11px', color: '#64748b' }}>{item.sellerEmail}</p>
                    </td>
                    <td>
                      <p className="cell-main">{item.category}</p>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>PKR {parseFloat(item.price).toLocaleString()}</strong>
                    </td>
                    <td>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontWeight: '700', fontSize: '12px' }}>
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No approved listings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="table-footer">
          <p>
            Showing {view === 'Pending Requests' ? pendingListings.length : view === 'Awaiting Seller Verification' ? unverifiedSellerListings.length : approvedListings.length} total entries
          </p>
        </div>
      </div>
    </div>
  );
}
