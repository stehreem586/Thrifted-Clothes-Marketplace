import React, { useState } from 'react';
import { useListings } from '../../context/ListingsContext';
import { useAuth } from '../../context/AuthContext';
import './Inventory.css';

const popularTagList = ['90s fashion', 'Sustainable', 'Cotton', 'Vintage', 'Minimalist'];
const ITEMS_PER_PAGE = 4;

function Inventory({ inventorySearch, onNavigateToProfile }) {
  const { listings, addListing, updateListing, deleteListing } = useListings();
  const { profile } = useAuth();
  const [inventoryMode, setInventoryMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingListing, setEditingListing] = useState(null);
  const [listingFilter, setListingFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newly Listed');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [previewProduct, setPreviewProduct] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showProfileRequiredModal, setShowProfileRequiredModal] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCondition, setFormCondition] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSize, setFormSize] = useState('');
  const [formTags, setFormTags] = useState([]);
  const [formImage, setFormImage] = useState('');

  // Gate Check: Profile + Phone Verification
  const isProfileComplete = () => {
    return !!(profile?.name && profile?.city && profile?.phone);
  };

  const handleOpenCreate = () => {
    if (!isProfileComplete()) {
      setShowProfileRequiredModal(true);
      return;
    }
    setEditingListing(null);
    setFormTitle(''); setFormCategory(''); setFormCondition('');
    setFormDescription(''); setFormPrice(''); setFormSize('');
    setFormTags(['Sustainable']); setFormImage('');
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
    setFormImage(product.image || '');
    setInventoryMode('edit');
  };

  const handleDeleteListing = (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      deleteListing(id);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
    if (!isProfileComplete()) {
      setShowProfileRequiredModal(true);
      return;
    }
    if (!formTitle || !formPrice) { alert('Please fill out Title and Price fields.'); return; }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum)) { alert('Price must be a valid number.'); return; }
    const imageToUse = formImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';

    if (inventoryMode === 'create') {
      await addListing({
        title: formTitle,
        category: formCategory || 'Other',
        size: formSize || 'OS',
        price: priceNum,
        status,
        condition: formCondition || 'Good',
        description: formDescription,
        tags: formTags,
        image: imageToUse
      });
    } else if (inventoryMode === 'edit' && editingListing) {
      await updateListing(editingListing.id, {
        title: formTitle,
        category: formCategory,
        size: formSize,
        price: priceNum,
        status: status === 'Draft' ? 'Draft' : 'Active',
        condition: formCondition,
        description: formDescription,
        tags: formTags,
        image: imageToUse
      });
    }
    setInventoryMode('list');
    setEditingListing(null);
  };

  const activeCount = listings.filter(i => i.status === 'Active').length;
  const soldCount   = listings.filter(i => i.status === 'Sold').length;
  const draftCount  = listings.filter(i => i.status === 'Draft').length;

  const filteredListings = listings.filter(item => {
    if (listingFilter === 'Active' && item.status !== 'Active') return false;
    if (listingFilter === 'Sold'   && item.status !== 'Sold')   return false;
    if (listingFilter === 'Drafts' && item.status !== 'Draft')  return false;
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

        {/* Filter & Sort */}
        <div className="filter-sort-row">
          <div className="tab-filters">
            {[['All', listings.length], ['Active', activeCount], ['Sold', soldCount], ['Drafts', draftCount]].map(([label, count]) => (
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
                        product.status === 'Active' ? 'active-listing' :
                        product.status === 'Sold'   ? 'sold-listing'   : 'draft-listing'
                      }`}>{product.status}</span>
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
            <h3>Photos</h3>
            <p className="photos-card-sub">Upload up to 6 high-quality photos. Show all details and labels.</p>
            <div className="cover-photo-upload-box">
              {formImage ? (
                <div className="uploaded-cover-preview">
                  <img src={formImage} alt="Uploaded Cover" />
                  <button className="remove-image-badge" onClick={() => setFormImage('')} type="button">✕</button>
                </div>
              ) : (
                <label htmlFor="cover-photo-file" className="upload-placeholder-content" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="camera-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <span>+ Upload Cover Photo</span>
                  <input
                    id="cover-photo-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>

              )}
            </div>
            <div className="small-photos-grid">
              {['Detail', 'Label', 'Flaws', 'Fit'].map(label => (
                <div key={label} className="small-photo-upload-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>{label}</span>
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
              <label className="form-label">Simulation - Image URL (Optional)</label>
              <input type="text" placeholder="Or enter image URL here..." className="form-input-text"
                value={formImage} onChange={e => setFormImage(e.target.value)} />
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
                {inventoryMode === 'create' ? 'Publish Listing' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
