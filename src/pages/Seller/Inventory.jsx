import React, { useState } from 'react';
import { useListings } from '../../context/ListingsContext';
import { useAuth } from '../../context/AuthContext';
import './Inventory.css';

const popularTagList = ['90s fashion', 'Sustainable', 'Cotton', 'Vintage', 'Minimalist'];
const ITEMS_PER_PAGE = 4;

function Inventory({ inventorySearch, onNavigateToProfile }) {
  const { listings, addListing, updateListing, deleteListing } = useListings();
  const { profile, user } = useAuth();
  const [inventoryMode, setInventoryMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingListing, setEditingListing] = useState(null);
  const [listingFilter, setListingFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newly Listed');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [previewProduct, setPreviewProduct] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showProfileRequiredModal, setShowProfileRequiredModal] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCondition, setFormCondition] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSize, setFormSize] = useState('');
  const [formTags, setFormTags] = useState([]);
  const [formImages, setFormImages] = useState(['', '', '', '', '', '']); // 6 slots: index 0 = main

  // Gate Check: Profile + Phone Verification
  const isProfileComplete = () => {
    return !!(profile?.name && profile?.city && profile?.phone);
  };

  const handleOpenCreate = () => {
    setEditingListing(null);
    setFormTitle(''); setFormCategory(''); setFormCondition('');
    setFormDescription(''); setFormPrice(''); setFormSize('');
    setFormTags(['Sustainable']); setFormImages(['', '', '', '', '', '']);
    setInventoryMode('create');
  };

  const handleOpenEdit = (product) => {
    setEditingListing(product);
    setFormTitle(product.title || '');
    setFormCategory(product.category || '');
    setFormCondition(product.condition || '');
    setFormDescription(product.description || '');
    setFormPrice(product.price ? product.price.toString() : '');
    setFormSize(product.size || '');
    setFormTags(product.tags || []);
    // Populate images array: use product.images if available, else put product.image in slot 0
    const existingImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : []);
    const imgSlots = ['', '', '', '', '', ''];
    existingImages.slice(0, 6).forEach((img, idx) => { imgSlots[idx] = img || ''; });
    setFormImages(imgSlots);
    setInventoryMode('edit');
  };

  const handleDeleteListing = (id) => {
    setDeleteConfirmationId(id);
  };

  const handleFileUpload = (e, slotIndex) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImages(prev => {
          const updated = [...prev];
          updated[slotIndex] = reader.result;
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (slotIndex) => {
    setFormImages(prev => {
      const updated = [...prev];
      updated[slotIndex] = '';
      return updated;
    });
  };

  const handleToggleTag = (tag) => {
    if (formTags.includes(tag)) {
      setFormTags(formTags.filter(t => t !== tag));
    } else {
      setFormTags([...formTags, tag]);
    }
  };

  const handleFormSubmit = async (e, status) => {
    e.preventDefault();
    if (!formTitle || !formPrice) { alert('Please fill out Title and Price fields.'); return; }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum)) { alert('Price must be a valid number.'); return; }

    const filledImages = formImages.filter(img => img && img.trim() !== '');
    const mainImage = filledImages[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';

    if (inventoryMode === 'create') {
      await addListing({
        title: formTitle,
        category: formCategory || 'Other',
        size: formSize || 'OS',
        price: priceNum,
        status: status === 'Draft' ? 'Draft' : 'Pending',
        condition: formCondition || 'Good',
        description: formDescription,
        tags: formTags,
        image: mainImage,
        images: filledImages
      });
    } else if (inventoryMode === 'edit' && editingListing) {
      const nextStatus = status === 'Draft'
        ? 'Draft'
        : (editingListing.status === 'Draft' ? 'Pending' : editingListing.status || 'Pending');
      await updateListing(editingListing.id, {
        title: formTitle,
        category: formCategory,
        size: formSize,
        price: priceNum,
        status: nextStatus,
        condition: formCondition,
        description: formDescription,
        tags: formTags,
        image: mainImage,
        images: filledImages
      });
    }
    setInventoryMode('list');
    setEditingListing(null);
  };

  const pendingCount  = listings.filter(i => i.status === 'Pending').length;
  const approvedCount = listings.filter(i => i.status === 'Approved' || i.status === 'Active').length;
  const soldCount     = listings.filter(i => i.status === 'Sold').length;
  const draftCount    = listings.filter(i => i.status === 'Draft').length;

  const filteredListings = listings.filter(item => {
    if (listingFilter === 'Pending'  && item.status !== 'Pending')  return false;
    if (listingFilter === 'Approved' && (item.status !== 'Approved' && item.status !== 'Active')) return false;
    if (listingFilter === 'Sold'     && item.status !== 'Sold')     return false;
    if (listingFilter === 'Drafts'   && item.status !== 'Draft')    return false;
    if (inventorySearch && inventorySearch.trim() !== '') {
      const term = inventorySearch.toLowerCase();
      return item.title.toLowerCase().includes(term) || item.category.toLowerCase().includes(term);
    }
    return true;
  });

  // Pagination Math (4 products per screen)
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getSellerStatus = () => {
    try {
      const raw = localStorage.getItem('secondlife_seller_statuses');
      if (raw && user?.id) {
        const map = JSON.parse(raw);
        if (map[user.id]) return map[user.id];
      }
    } catch(e) {}
    return profile?.seller_status || (profile?.status === 'flagged' || profile?.status === 'suspended' ? 'Suspended' : profile?.status === 'pending' ? 'Pending' : 'Verified');
  };
  const currentSellerStatus = getSellerStatus();

  /* ────────── LIST VIEW ────────── */
  if (inventoryMode === 'list') {
    return (
      <div className="view-content fade-in">
        <div className="view-heading border-bottom">
          <div>
            <h1>Listing Management</h1>
            <p className="view-sub">Track, edit, and organize your sustainable collection (4 products per screen).</p>
          </div>
          <button className="primary-action-btn" onClick={handleOpenCreate}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New Listing
          </button>
        </div>

        {/* Dynamic Seller Status Alert Banner */}
        {currentSellerStatus === 'Pending' && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px 20px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px', color: '#92400e' }}>
            <span style={{ fontSize: '24px' }}>⏳</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#b45309' }}>Seller Verification Pending Admin Approval</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', lineHeight: '1.4', color: '#78350f' }}>
                Your seller verification request is under review by Admin. You can create listings, but they will not be listed publicly on the marketplace until your account is verified by Admin.
              </p>
            </div>
          </div>
        )}

        {(currentSellerStatus === 'Suspended' || currentSellerStatus === 'Flagged') && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px 20px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px', color: '#991b1b' }}>
            <span style={{ fontSize: '24px' }}>🚫</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>Seller Account Suspended / Flagged</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', lineHeight: '1.4', color: '#7f1d1d' }}>
                Your seller account has been suspended by Admin. Your listings are currently unlisted from the public marketplace.
              </p>
            </div>
          </div>
        )}

        {/* Filter & Sort */}
        <div className="filter-sort-row">
          <div className="tab-filters">
            {[['All', listings.length], ['Pending', pendingCount], ['Approved', approvedCount], ['Sold', soldCount], ['Drafts', draftCount]].map(([label, count]) => (
              <button key={label} className={`filter-tab ${listingFilter === label ? 'active' : ''}`}
                onClick={() => { setListingFilter(label); setCurrentPage(1); }}>
                {label} <span className="tab-count">{count}</span>
              </button>
            ))}
          </div>
          <div className="sort-selector">
            <label>Sort by:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="clean-select">
              <option>Newly Listed</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="listings-table-card">
          <div className="table-responsive">
            <table className="seller-table aligned-middle">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Product</th>
                  <th style={{ width: '15%' }}>Price</th>
                  <th style={{ width: '15%' }}>Status</th>
                  <th style={{ width: '15%' }}>Stats</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedListings.length > 0 ? paginatedListings.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell" onClick={() => setPreviewProduct(product)} style={{ cursor: 'pointer' }}>
                        <div className="product-thumbnail"><img src={product.image} alt={product.title} /></div>
                        <div className="product-details">
                          <span className="product-title" style={{ fontWeight: '600', color: '#0f172a' }}>{product.title}</span>
                          <span className="product-subtitle">Size {product.size} • {product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="price-cell"><strong>PKR {parseFloat(product.price).toLocaleString()}</strong></td>
                    <td>
                      <span className={`status-pill ${
                        product.status === 'Pending'  ? 'pending-listing'  :
                        (product.status === 'Approved' || product.status === 'Active') ? 'active-listing' :
                        product.status === 'Sold'      ? 'sold-listing'     : 'draft-listing'
                      }`} style={{
                        background: product.status === 'Pending' ? '#fef3c7' : undefined,
                        color: product.status === 'Pending' ? '#b45309' : undefined
                      }}>{product.status || 'Pending'}</span>
                    </td>
                    <td>
                      {product.status === 'Draft' ? (
                        <span className="stats-text gray-text">N/A</span>
                      ) : (
                        <div className="stats-indicators">
                          <span className="stat-indicator-item" title="Real Views">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                            {product.views || 0}
                          </span>
                          <span className="stat-indicator-item" title="Real Likes">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {product.likes || 0}
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions-cell">
                        <button className="action-icon-btn view-btn" onClick={() => setPreviewProduct(product)} title="View item details">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {product.status !== 'Sold' && (
                          <>
                            <button className="action-icon-btn edit-btn" onClick={() => handleOpenEdit(product)} title="Edit listing">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button className="action-icon-btn delete-btn" onClick={() => handleDeleteListing(product.id)} title="Delete listing">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="empty-state-row">No listings found matching the criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Dynamic 4-Items-Per-Screen Pagination */}
          <div className="table-footer-pagination">
            <span className="showing-indicator">
              Showing {filteredListings.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredListings.length)} of {filteredListings.length} listings
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn arrow-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="pagination-btn arrow-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Metric Cards — Real Dynamic Data */}
        <div className="dashboard-cards-bottom-row">
          <div className="metric-card-styled">
            <div className="metric-card-icon-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="metric-icon-color">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Revenue This Month</span>
            </div>
            <div className="metric-value-block">
              {(() => {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                // orders is not in scope here, use listings sold count as proxy
                const soldThisMonth = listings.filter(l => l.status === 'Sold' && l.createdAt && new Date(l.createdAt).getTime() >= startOfMonth);
                const totalRevMonth = soldThisMonth.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
                return (
                  <>
                    <h3>{totalRevMonth > 0 ? `PKR ${totalRevMonth.toLocaleString()}` : 'N/A'}</h3>
                    <span className="metric-sublabel positive">{soldThisMonth.length} item(s) sold this month</span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="metric-card-styled">
            <div className="metric-card-icon-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="metric-icon-color">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>Sustainability Impact</span>
            </div>
            <div className="metric-value-block">
              {(() => {
                const soldCount = listings.filter(l => l.status === 'Sold').length;
                const co2Saved = soldCount * 3.2; // avg 3.2kg CO2 saved per thrifted item
                const goalPct = Math.min(Math.round((co2Saved / 120) * 100), 100);
                return (
                  <>
                    <h3>{co2Saved > 0 ? `${co2Saved.toFixed(1)} kg CO2` : 'N/A'}</h3>
                    <span className="metric-sublabel">{goalPct}% of annual goal</span>
                    <div className="metric-horizontal-bar">
                      <div className="metric-bar-fill" style={{ width: `${goalPct}%` }}></div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="promo-card-dark">
            <div className="promo-card-content">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" className="promo-lightning-icon">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <h4>Quick Promotion</h4>
              <p>Boost your visibility by 200% with SecondLife Plus.</p>
              <button className="promo-action-btn" onClick={() => setShowPromoModal(true)}>Learn More</button>
            </div>
          </div>
        </div>

        {/* ── Product Preview Modal ── */}
        {previewProduct && (
          <div className="seller-help-overlay" onClick={() => setPreviewProduct(null)}>
            <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
              <div className="seller-help-header">
                <h3>Product Details</h3>
                <button className="seller-help-close-btn" onClick={() => setPreviewProduct(null)}>✕</button>
              </div>
              <div className="seller-help-body" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <img src={previewProduct.image} alt={previewProduct.title} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px' }} />
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>{previewProduct.title}</h3>
                    <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '14px' }}>
                      Category: <strong>{previewProduct.category}</strong> | Size: <strong>{previewProduct.size}</strong>
                    </p>
                    <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '14px' }}>
                      Condition: <strong>{previewProduct.condition}</strong>
                    </p>
                    <h4 style={{ margin: '6px 0 0 0', color: '#c19358', fontSize: '18px' }}>
                      PKR {parseFloat(previewProduct.price).toLocaleString()}
                    </h4>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Description</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#334155' }}>
                    {previewProduct.description || 'No detailed description provided.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#475569' }}>
                  <span>Status: <strong className={`status-pill ${previewProduct.status === 'Active' ? 'active-listing' : 'draft-listing'}`}>{previewProduct.status}</strong></span>
                  <span>Real Views: <strong>{previewProduct.views || 0}</strong></span>
                  <span>Real Likes: <strong>{previewProduct.likes || 0}</strong></span>
                </div>
              </div>
              <div className="seller-help-footer">
                <button className="seller-help-gotit-btn" onClick={() => setPreviewProduct(null)}>Close Preview</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SecondLife Plus Promo Modal ── */}
        {showPromoModal && (
          <div className="seller-help-overlay" onClick={() => setShowPromoModal(false)}>
            <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
              <div className="seller-help-header">
                <h3>⚡ SecondLife Plus</h3>
                <button className="seller-help-close-btn" onClick={() => setShowPromoModal(false)}>✕</button>
              </div>
              <div className="seller-help-body" style={{ padding: '24px 16px' }}>
                <div style={{ width: '60px', height: '60px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#d97706' }}>
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>SecondLife Plus Promotion</h3>
                <span style={{ display: 'inline-block', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', marginBottom: '12px' }}>
                  Coming Soon 🚀
                </span>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                  We are building SecondLife Plus to give featured placement to top seller listings, increasing views by over 200%. Stay tuned!
                </p>
              </div>
              <div className="seller-help-footer">
                <button className="seller-help-gotit-btn" onClick={() => setShowPromoModal(false)}>Got it</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Custom Professional Delete Confirmation Modal ── */}
        {deleteConfirmationId && (
          <div className="seller-help-overlay" onClick={() => setDeleteConfirmationId(null)}>
            <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '24px', textAlign: 'center' }}>
              <div style={{ color: '#dc2626', marginBottom: '16px' }}>
                <svg style={{ margin: '0 auto' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Delete Listing permanently?</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                Are you sure you want to delete this listing? This action cannot be undone and it will be deleted permanently from the database.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  style={{
                    padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                    background: '#fff', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer'
                  }}
                  onClick={() => setDeleteConfirmationId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{
                    padding: '10px 20px', borderRadius: '10px', border: 'none',
                    background: '#dc2626', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}
                  onClick={() => {
                    deleteListing(deleteConfirmationId);
                    setDeleteConfirmationId(null);
                  }}
                >
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Profile Setup & Phone Verification Required Modal ── */}
        {showProfileRequiredModal && (
          <div className="seller-help-overlay" onClick={() => setShowProfileRequiredModal(false)}>
            <div className="seller-help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
              <div className="seller-help-header">
                <h3>⚠️ Profile & Phone Verification Required</h3>
                <button className="seller-help-close-btn" onClick={() => setShowProfileRequiredModal(false)}>✕</button>
              </div>
              <div className="seller-help-body" style={{ padding: '20px' }}>
                <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                  To maintain buyer trust and start listing items on SecondLife Marketplace, you must first complete your mandatory seller details:
                </p>
                <ul style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px', lineHeight: '1.8', margin: '0 0 16px 0' }}>
                  <li><strong>Store Name</strong> (Required)</li>
                  <li><strong>City Location</strong> (Required)</li>
                  <li><strong>Verified Phone Number via OTP</strong> (Required)</li>
                </ul>
                <p style={{ fontSize: '13px', color: '#d97706', background: '#fffbeb', padding: '10px', borderRadius: '6px', border: '1px solid #fde68a', margin: 0 }}>
                  Please complete your store details to unlock item listing privileges.
                </p>
              </div>
              <div className="seller-help-footer" style={{ justifyContent: 'space-between' }}>
                <button className="seller-help-close-btn" style={{ fontSize: '14px', border: 'none', background: 'transparent' }} onClick={() => setShowProfileRequiredModal(false)}>Cancel</button>
                <button
                  className="seller-help-gotit-btn"
                  onClick={() => {
                    setShowProfileRequiredModal(false);
                    if (onNavigateToProfile) onNavigateToProfile();
                  }}
                >
                  Complete Store Profile Now ➔
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ────────── CREATE / EDIT VIEW ────────── */
  return (
    <div className="view-content fade-in">
      <div className="view-heading">
        <div>
          <button className="back-link-btn" onClick={() => setInventoryMode('list')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Inventory
          </button>
          <h1 style={{ marginTop: '10px' }}>
            {inventoryMode === 'create' ? 'Create New Listing' : 'Edit Listing'}
          </h1>
          <p className="view-sub">Share your pre-loved piece with the SecondLife community.</p>
        </div>
      </div>

      <div className="listing-form-layout">
        {/* Left: Photos */}
        <div className="form-left-col">
          <div className="photos-upload-card">
            <h3>Photos <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>({formImages.filter(i => i).length}/6 uploaded)</span></h3>
            <p className="photos-card-sub">Upload up to 6 photos. First photo is your main cover image.</p>

            {/* Main cover photo — slot 0 */}
            <div className="cover-photo-upload-box">
              {formImages[0] ? (
                <div className="uploaded-cover-preview">
                  <img src={formImages[0]} alt="Cover" />
                  <button className="remove-image-badge" onClick={() => handleRemoveImage(0)} type="button">✕</button>
                  <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: '#0f172a', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '8px' }}>MAIN</span>
                </div>
              ) : (
                <label htmlFor="cover-photo-file-0" className="upload-placeholder-content" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div className="camera-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <span>+ Main Cover Photo</span>
                  <input id="cover-photo-file-0" type="file" accept="image/*" onChange={e => handleFileUpload(e, 0)} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Additional 5 image slots */}
            <div className="small-photos-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '12px' }}>
              {[1, 2, 3, 4, 5].map(slotIdx => (
                <div key={slotIdx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1.5px dashed #cbd5e1', background: '#f8fafc' }}>
                  {formImages[slotIdx] ? (
                    <>
                      <img src={formImages[slotIdx]} alt={`Photo ${slotIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(slotIdx)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                      >✕</button>
                    </>
                  ) : (
                    <label htmlFor={`photo-slot-${slotIdx}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '4px' }}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '600' }}>Photo {slotIdx + 1}</span>
                      <input id={`photo-slot-${slotIdx}`} type="file" accept="image/*" onChange={e => handleFileUpload(e, slotIdx)} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="tip-box-yellow">
            <div className="tip-icon-container">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="tip-content">
              <h5>Sustainability Tip</h5>
              <p>Listing items with at least 4 photos increases your chances of selling by 25%.</p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="form-right-col">
          <form className="item-details-form-card" onSubmit={(e) => handleFormSubmit(e, 'Active')}>
            <h3>Item Details</h3>

            <div className="form-group-block">
              <label className="form-label">Title</label>
              <input type="text" placeholder="e.g. Vintage 90s Oversized Wool Blazer" className="form-input-text"
                value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
            </div>

            <div className="form-inputs-row">
              <div className="form-group-block flex-1">
                <label className="form-label">Category</label>
                <select className="form-select-input" value={formCategory} onChange={e => setFormCategory(e.target.value)} required>
                  <option value="">Select Category</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Bottoms">Bottoms</option>
                </select>
              </div>
              <div className="form-group-block flex-1">
                <label className="form-label">Condition</label>
                <select className="form-select-input" value={formCondition} onChange={e => setFormCondition(e.target.value)} required>
                  <option value="">Select Condition</option>
                  <option value="New with tags">New with tags</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Well Loved">Well Loved</option>
                </select>
              </div>
            </div>

            <div className="form-group-block">
              <label className="form-label">Description</label>
              <textarea placeholder="Tell the story of this piece. Include measurements, fabric details..." className="form-textarea-input"
                value={formDescription} onChange={e => setFormDescription(e.target.value)} rows="4" />
            </div>

            <div className="form-inputs-row">
              <div className="form-group-block flex-1">
                <label className="form-label">Price ($)</label>
                <input type="text" placeholder="$ 0.00" className="form-input-text"
                  value={formPrice} onChange={e => setFormPrice(e.target.value)} required />
              </div>
              <div className="form-group-block flex-1">
                <label className="form-label">Size</label>
                <select className="form-select-input" value={formSize} onChange={e => setFormSize(e.target.value)} required>
                  <option value="">Select Size</option>
                  {['XS','S','M','L','XL','10','42','OS'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group-block">
              <label className="form-label">Cover Image URL (Optional)</label>
              <input type="text" placeholder="Paste image URL as alternative to uploading..." className="form-input-text"
                value={formImages[0]} onChange={e => {
                  const updated = [...formImages];
                  updated[0] = e.target.value;
                  setFormImages(updated);
                }} />
            </div>

            <div className="form-group-block">
              <label className="form-label">Popular Tags</label>
              <div className="form-tags-row-chips">
                {popularTagList.map(tag => (
                  <button key={tag} type="button"
                    className={`tag-selection-chip ${formTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => handleToggleTag(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-buttons-action-row">
              <button type="button" className="draft-action-btn" onClick={e => handleFormSubmit(e, 'Draft')}>Save Draft</button>
              <button type="submit" className="publish-action-btn">
                {inventoryMode === 'create' 
                  ? 'Publish Listing' 
                  : (editingListing?.status === 'Draft' ? 'Publish Listing' : 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
