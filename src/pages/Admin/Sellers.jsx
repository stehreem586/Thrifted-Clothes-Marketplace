import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, CheckCircle, Clock, AlertTriangle, Eye, Edit2, X, Store as StoreIcon } from 'lucide-react';
import { useListings } from '../../context/ListingsContext';
import { supabase } from '../../utils/supabaseClient';
import './Sellers.css';

export default function Sellers() {
  const { listings, reviews, approveListing, rejectListing } = useListings();
  const [activeTab, setActiveTab] = useState('All Sellers');
  const [search, setSearch] = useState('');
  
  // Modals state
  const [viewSeller, setViewSeller] = useState(null);
  const [editSeller, setEditSeller] = useState(null);
  const [editStatus, setEditStatus] = useState('Verified');
  const [editStatusValue, setEditStatusValue] = useState('Verified');

  // Dynamic Real Sellers State (loaded from Supabase profiles or published listings)
  const [sellerList, setSellerList] = useState(() => {
    try {
      const saved = localStorage.getItem('secondlife_admin_sellers');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Hydrate real sellers from Supabase & active listings
  useEffect(() => {
    const fetchRealSellers = async () => {
      try {
        const { data: dbProfiles, error } = await supabase
          .from('profiles')
          .select('*')
          .or('role.eq.seller,role.eq.merchant');

        const map = new Map();

        // Add sellers from DB
        if (!error && dbProfiles && dbProfiles.length > 0) {
          dbProfiles.forEach(p => {
            map.set(p.id, {
              id: p.id,
              name: p.name || p.email?.split('@')[0] || 'Seller Store',
              email: p.email || 'seller@secondlife.com',
              city: p.city ? `${p.city}, Pakistan` : 'Pakistan',
              avatar: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
              status: 'Verified',
              bio: p.bio || 'No store bio description provided.'
            });
          });
        }

        // Add any users who have published listings
        listings.forEach(l => {
          const sId = l.seller_id || `seller-${l.id}`;
          if (!map.has(sId)) {
            map.set(sId, {
              id: sId,
              name: l.seller?.name || 'Verified Seller',
              email: 'seller@secondlife.com',
              city: l.seller?.location || 'Pakistan',
              avatar: l.seller?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
              status: 'Verified',
              bio: 'No store bio description provided.'
            });
          }
        });

        if (map.size > 0) {
          setSellerList(Array.from(map.values()));
        }
      } catch (err) {
        console.warn('Real sellers fetch notice:', err.message);
      }
    };

    fetchRealSellers();
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem('secondlife_admin_sellers', JSON.stringify(sellerList));
    } catch (e) {}
  }, [sellerList]);

  // Combine listings with seller records dynamically
  const sellersWithListings = sellerList.map(seller => {
    const sellerListings = listings.filter(l =>
      l.seller_id === seller.id ||
      l.seller?.name?.toLowerCase() === seller.name.toLowerCase() ||
      (seller.id === 's-2' && l.isUserCreated)
    );
    const soldItems = sellerListings.filter(l => l.status === 'Sold');
    const totalSalesNum = soldItems.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);

    // Calculate rating dynamically based on listings reviews
    const sellerListingIds = sellerListings.map(l => String(l.id));
    const sellerReviews = reviews ? reviews.filter(r => sellerListingIds.includes(String(r.listingId))) : [];
    const avgRating = sellerReviews.length > 0
      ? (sellerReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / sellerReviews.length).toFixed(1)
      : 'NA';

    return {
      ...seller,
      listingsCount: sellerListings.length,
      totalSales: totalSalesNum > 0 ? `PKR ${totalSalesNum.toLocaleString()}` : 'PKR 0',
      items: sellerListings,
      rating: avgRating
    };
  });

  // Filter logic
  const filtered = sellersWithListings.filter(s => {
    const matchTab =
      activeTab === 'All Sellers' ||
      (activeTab === 'Verified' && s.status === 'Verified') ||
      (activeTab === 'Pending'  && s.status === 'Pending')  ||
      (activeTab === 'Flagged'  && s.status === 'Flagged');
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // Action: Open Edit Seller Modal
  const handleOpenEdit = (seller) => {
    setEditSeller(seller);
    setEditStatus(seller.status || 'Verified');
  };

  // Action: Save Edited Seller Status
  const handleSaveEditSubmit = (e) => {
    e.preventDefault();
    if (!editSeller) return;

    setSellerList(prev => prev.map(s => s.id === editSeller.id ? {
      ...s,
      status: editStatus,
    } : s));

    setEditSeller(null);
  };

  const pendingSellersCount = sellerList.filter(s => s.status === 'Pending').length;
  const verifiedSellersCount = sellerList.filter(s => s.status === 'Verified').length;

  const ratedSellers = sellersWithListings.filter(s => s.rating !== 'NA');
  const overallAvgRating = ratedSellers.length > 0
    ? (ratedSellers.reduce((sum, s) => sum + parseFloat(s.rating), 0) / ratedSellers.length).toFixed(1)
    : 'NA';

  return (
    <div className="sellers-root">
      {/* Header */}
      <div className="sellers-header">
        <div>
          <h1 className="page-title">Seller Management &amp; Store Requests</h1>
          <p className="page-sub">Review official seller requests, inspect store profiles, and manage verification status.</p>
        </div>
      </div>

      {/* Dynamic Stat cards (Payout stats cut as requested) */}
      <div className="sellers-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="sstat-card">
          <p className="sstat-label">PENDING SELLER REQUESTS</p>
          <p className="sstat-big" style={{ color: '#b45309' }}>{pendingSellersCount}</p>
          <p className="sstat-hint trend-up">▲ Action Required</p>
        </div>
        <div className="sstat-card">
          <p className="sstat-label">ACTIVE VERIFIED SELLERS</p>
          <p className="sstat-big" style={{ color: '#15803d' }}>{verifiedSellersCount}</p>
          <p className="sstat-hint">Active Storefronts</p>
        </div>
        <div className="sstat-card">
          <p className="sstat-label">TOTAL STORE LISTINGS</p>
          <p className="sstat-big">{listings.length}</p>
          <p className="sstat-hint">Submitted Items</p>
        </div>
        <div className="sstat-card">
          <p className="sstat-label">AVG. SELLER RATING</p>
          <p className="sstat-big">{overallAvgRating}</p>
          <div className="stars" style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 'bold' }}>
            {overallAvgRating === 'NA' ? 'No Ratings Yet' : '★'.repeat(Math.round(parseFloat(overallAvgRating)))}
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="sellers-table-card">
        <div className="sellers-table-top">
          <p className="section-label">Official Seller Records</p>
          <div className="tab-row">
            {['All Sellers', 'Verified', 'Pending', 'Flagged'].map(t => (
              <button
                key={t}
                className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
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

        {/* Sellers Table without Payout Info column */}
        <table className="sellers-table">
          <thead>
            <tr>
              <th>SELLER / STORE IDENTITY</th>
              <th>STATUS</th>
              <th>TOTAL LISTINGS</th>
              <th>TOTAL SALES</th>
              <th>RATING</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="seller-identity">
                      <img src={s.avatar} alt={s.name} className="seller-avatar-img" />
                      <div>
                        <p className="seller-name">{s.name}</p>
                        <p className="seller-email">{s.email} • {s.city}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${s.status.toLowerCase()}`}>
                      {s.status === 'Verified' && <CheckCircle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                      {s.status === 'Pending'  && <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                      {s.status === 'Flagged'  && <AlertTriangle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                      {s.status}
                    </span>
                  </td>
                  <td>{s.listingsCount} item(s)</td>
                  <td className="bold-cell">{s.totalSales}</td>
                  <td>
                    <span className="rating-val">
                      {s.rating === 'NA' ? 'NA' : `★ ${s.rating}`}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      {/* View Store Profile Button */}
                      <button
                        type="button"
                        className="row-btn"
                        title="View Seller Store Profile"
                        onClick={() => setViewSeller(s)}
                      >
                        <Eye size={15} />
                      </button>

                      {/* Edit Status & Store Button */}
                      <button
                        type="button"
                        className="row-btn"
                        title="Edit Seller Status"
                        onClick={() => handleOpenEdit(s)}
                      >
                        <Edit2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No seller accounts match your search filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <p>Showing {filtered.length} of {sellerList.length} total sellers</p>
        </div>
      </div>

      {/* ── View Seller Store Profile Modal ── */}
      {viewSeller && (
        <div className="seller-help-overlay" onClick={() => setViewSeller(null)}>
          <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="seller-help-header">
              <h3><StoreIcon size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Seller Store Profile</h3>
              <button className="seller-help-close-btn" onClick={() => setViewSeller(null)}>✕</button>
            </div>
            <div className="seller-help-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                <img src={viewSeller.avatar} alt={viewSeller.name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{viewSeller.name}</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{viewSeller.email} • 📍 {viewSeller.city}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span className={`status-pill ${viewSeller.status.toLowerCase()}`}>{viewSeller.status}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>
                      {viewSeller.rating === 'NA' ? 'No Ratings Yet' : `★ ${viewSeller.rating} Rating`}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Store Description / Bio</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#334155' }}>{viewSeller.bio || 'No store bio description provided.'}</p>
              </div>

              {/* Seller's Submitted Items Preview */}
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Store Listings ({viewSeller.items.length})</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {viewSeller.items.length > 0 ? (
                  viewSeller.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <img src={item.image} alt={item.title} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.title}</p>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>PKR {parseFloat(item.price).toLocaleString()} • {item.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>No specific items submitted yet.</p>
                )}
              </div>
            </div>
            <div className="seller-help-footer">
              <button className="seller-help-gotit-btn" onClick={() => setViewSeller(null)}>Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Seller Status Modal ── */}
      {editSeller && (
        <div className="seller-help-overlay" onClick={() => setEditSeller(null)}>
          <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="seller-help-header">
              <h3>✏️ Edit Seller Status &amp; Store Details</h3>
              <button className="seller-help-close-btn" onClick={() => setEditSeller(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEditSubmit}>
              <div className="seller-help-body" style={{ padding: '20px' }}>
                              <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Verification Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="Verified">Verified (Active Storefront)</option>
                    <option value="Pending">Pending Verification</option>
                    <option value="Flagged">Flagged / Suspended</option>
                  </select>
                </div>
              </div>
              <div className="seller-help-footer">
                <button type="button" className="seller-help-close-btn" onClick={() => setEditSeller(null)} style={{ border: 'none', background: 'transparent' }}>
                  Cancel
                </button>
                <button type="submit" className="seller-help-gotit-btn" style={{ background: '#c19358' }}>
                  Save Status Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
