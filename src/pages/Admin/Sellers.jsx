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

  // Always start empty — Supabase fetch fills this
  const [sellerList, setSellerList] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);

  // State for all database listings to accurately count listings per seller
  const [allDbListings, setAllDbListings] = useState([]);

  // Hydrate real sellers and listings from Supabase
  useEffect(() => {
    const fetchRealSellers = async () => {
      setLoadingSellers(true);
      try {
        const adminRoles = ['admin', 'super_admin', 'moderator', 'supporter'];

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');

        const { data: dbListingsData } = await supabase
          .from('listings')
          .select('*');

        if (dbListingsData) {
          setAllDbListings(dbListingsData);
        }

        if (error || !profiles) return;

        let allProfiles = profiles;

        // Load local statuses override map
        let localStatuses = {};
        try {
          const rawLocal = localStorage.getItem('secondlife_seller_statuses');
          if (rawLocal) localStatuses = JSON.parse(rawLocal);
        } catch (e) {}

        // Extract all unique seller IDs from DB listings and Context listings
        const listingSellerIds = new Set();
        if (dbListingsData) {
          dbListingsData.forEach(l => { if (l.seller_id) listingSellerIds.add(String(l.seller_id)); });
        }
        listings.forEach(l => { if (l.seller_id) listingSellerIds.add(String(l.seller_id)); });

        // A profile is a SELLER if:
        // - role === 'seller' (already verified before)
        // - seller_status is set (explicitly marked)
        // - has listings in DB (uploaded a listing)
        // - status === 'pending' (uploaded first listing, profile update set this even if role didn't update due to RLS)
        const sellerProfiles = allProfiles.filter(p => {
          if (adminRoles.includes(p.role)) return false;
          return (
            p.role === 'seller' ||
            (p.seller_status && p.seller_status.trim() !== '') ||
            listingSellerIds.has(String(p.id)) ||
            p.status === 'pending'   // ← catches new sellers even when role update fails
          );
        });

        const map = new Map();
        sellerProfiles.forEach(p => {
          let resolvedStatus;

          if (localStatuses[p.id]) {
            // Admin override takes priority
            resolvedStatus = localStatuses[p.id];
          } else if (p.seller_status === 'Verified') {
            resolvedStatus = 'Verified';
          } else if (p.seller_status === 'Flagged' || p.seller_status === 'Suspended' || p.status === 'flagged' || p.status === 'banned' || p.status === 'suspended') {
            resolvedStatus = 'Flagged';
          } else if (p.seller_status === 'Pending' || p.status === 'pending') {
            // New sellers: status=pending means they uploaded a listing and await verification
            resolvedStatus = 'Pending';
          } else if (p.role === 'seller') {
            // Old verified seller with no explicit seller_status set
            resolvedStatus = 'Verified';
          } else {
            resolvedStatus = 'Pending';
          }

          const sellerName = p.name || p.email?.split('@')[0] || 'Seller Store';
          const realAvatar = p.avatar_url && p.avatar_url.trim() !== ''
            ? p.avatar_url
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=1a1a2e&color=fff&size=100`;

          map.set(String(p.id), {
            id: p.id,
            name: sellerName,
            email: p.email || 'seller@secondlife.com',
            city: p.city ? `${p.city}, Pakistan` : 'Pakistan',
            avatar: realAvatar,
            status: resolvedStatus,
            bio: p.bio || 'No store bio description provided.',
            phone: p.phone || '',
            show_phone: !!p.show_phone
          });
        });

        // Also include listing-based sellers not found in profiles table
        listings.forEach(l => {
          const sId = l.seller_id ? String(l.seller_id) : `seller-${l.id}`;
          if (!map.has(sId)) {
            const resolvedStatus = localStatuses[sId] || 'Pending';
            const sellerName = l.seller?.name || 'Seller Store';
            const realAvatar = l.seller?.avatar && l.seller.avatar.trim() !== '' && !l.seller.avatar.includes('unsplash')
              ? l.seller.avatar
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=1a1a2e&color=fff&size=100`;

            map.set(sId, {
              id: sId,
              name: sellerName,
              email: 'seller@secondlife.com',
              city: l.seller?.location || 'Pakistan',
              avatar: realAvatar,
              status: resolvedStatus,
              bio: 'No store bio description provided.',
              phone: l.seller?.phone || '',
              show_phone: !!l.seller?.show_phone
            });
          }
        });

        const list = Array.from(map.values());
        setSellerList(list);
      } catch (err) {
        console.warn('Real sellers fetch notice:', err.message);
      } finally {
        setLoadingSellers(false);
      }
    };

    fetchRealSellers();

    const handleStatusUpdate = () => fetchRealSellers();
    window.addEventListener('sellerStatusUpdated', handleStatusUpdate);
    return () => window.removeEventListener('sellerStatusUpdated', handleStatusUpdate);
  }, [listings]);

  // Combine listings from Supabase DB and ListingsContext dynamically for accurate total listing counts
  const sellersWithListings = sellerList.map(seller => {
    const matchedDbListings = allDbListings.filter(l => String(l.seller_id) === String(seller.id));
    const matchedContextListings = listings.filter(l =>
      String(l.seller_id) === String(seller.id) ||
      (l.seller?.name && l.seller.name.toLowerCase() === seller.name.toLowerCase()) ||
      (seller.id === 's-2' && l.isUserCreated)
    );

    // Merge and deduplicate by listing ID
    const listingMap = new Map();
    matchedDbListings.forEach(l => listingMap.set(String(l.id), l));
    matchedContextListings.forEach(l => listingMap.set(String(l.id), l));
    const sellerListings = Array.from(listingMap.values());

    const soldItems = sellerListings.filter(l => l.status === 'Sold' || l.status === 'sold');
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
      (activeTab === 'Flagged'  && (s.status === 'Flagged' || s.status === 'Suspended'));
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

  // Action: Save Edited Seller Status Permanently to Supabase DB & Local Cache
  const handleSaveEditSubmit = async (e) => {
    e.preventDefault();
    if (!editSeller) return;

    const newStatus = editStatus;
    const targetId = editSeller.id;

    // 1. Update local state immediately
    setSellerList(prev => prev.map(s => s.id === targetId ? { ...s, status: newStatus } : s));

    // 2. Persist to localStorage for instant cross-tab fallback
    try {
      let localStatuses = {};
      const rawLocal = localStorage.getItem('secondlife_seller_statuses');
      if (rawLocal) localStatuses = JSON.parse(rawLocal);
      localStatuses[targetId] = newStatus;
      localStorage.setItem('secondlife_seller_statuses', JSON.stringify(localStatuses));
    } catch (e) {}

    // 3. Persist permanently to Supabase DB `profiles` table
    try {
      const dbStatusValue = newStatus === 'Flagged' ? 'flagged' : newStatus === 'Pending' ? 'pending' : 'active';
      const dbRole = newStatus === 'Verified' ? 'seller' : 'seller';

      // Primary update: update standard Supabase profiles columns (role, status)
      const { error: primaryErr } = await supabase
        .from('profiles')
        .update({
          role: dbRole,
          status: dbStatusValue
        })
        .eq('id', targetId);

      if (primaryErr) {
        console.error('⚠️ Profile status update error:', primaryErr.message);
      }

      // Secondary update: update custom seller_status column (if column exists in schema)
      try {
        await supabase
          .from('profiles')
          .update({ seller_status: newStatus })
          .eq('id', targetId);
      } catch (_) {}
    } catch (err) {
      console.error('Supabase seller status update error:', err.message);
    }

    // 4. Notify ALL components — Inventory re-fetches and shows listings from this seller
    window.dispatchEvent(new CustomEvent('sellerStatusUpdated', {
      detail: { sellerId: targetId, status: newStatus }
    }));

    // 5. Also fire listingStatusUpdated so Inventory tab refreshes listing queue
    window.dispatchEvent(new CustomEvent('listingStatusUpdated', {
      detail: { sellerId: targetId, sellerStatus: newStatus }
    }));

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
          <p className="sstat-big">{allDbListings.length}</p>
          <p className="sstat-hint">From Supabase DB</p>
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
            {[
              { label: 'All Sellers', count: sellersWithListings.length },
              { label: 'Verified',    count: sellersWithListings.filter(s => s.status === 'Verified').length },
              { label: 'Pending',     count: sellersWithListings.filter(s => s.status === 'Pending').length },
              { label: 'Flagged',     count: sellersWithListings.filter(s => s.status === 'Flagged' || s.status === 'Suspended').length },
            ].map(({ label, count }) => (
              <button
                key={label}
                className={`tab-btn ${activeTab === label ? 'active' : ''}`}
                onClick={() => setActiveTab(label)}
              >
                {label}
                <span style={{
                  marginLeft: '6px', background: activeTab === label ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: activeTab === label ? 'inherit' : '#64748b',
                  borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700'
                }}>
                  {count}
                </span>
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
            ) : loadingSellers ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTop: '3px solid #c19358', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: '13px' }}>Loading sellers from Supabase…</span>
                  </div>
                </td>
              </tr>
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

              {viewSeller.phone && viewSeller.show_phone && (
                <div style={{
                  background: '#e0f2fe',
                  border: '1.5px solid #bae6fd',
                  color: '#0369a1',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '700',
                  fontSize: '13.5px'
                }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Seller Contact Info: <a href={`tel:${viewSeller.phone}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{viewSeller.phone}</a></span>
                </div>
              )}

              {/* Seller's Submitted Items Preview */}
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Store Listings ({viewSeller.items.length})</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {viewSeller.items.length > 0 ? (
                  viewSeller.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <img src={item.image_url || item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&q=80'} alt={item.title} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
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
