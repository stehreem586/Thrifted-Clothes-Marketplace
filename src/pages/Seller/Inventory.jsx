import React, { useState } from 'react';
import './Inventory.css';

const initialProducts = [
  {
    id: 1,
    title: 'Vintage Wool Trench Coat',
    category: 'Outerwear',
    size: 'M',
    price: 85.00,
    status: 'Active',
    views: '1.2k',
    likes: 45,
    condition: 'Good',
    description: 'Beautiful vintage wool trench coat. Perfect for winter layers. Very warm and cozy, standard medium fit.',
    tags: ['Vintage', 'Sustainable', 'Outerwear'],
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
  },
  {
    id: 2,
    title: 'Handcrafted Leather Loafers',
    category: 'Footwear',
    size: '10',
    price: 120.00,
    status: 'Sold',
    views: '842',
    likes: 29,
    condition: 'Like New',
    description: 'Genuine leather loafers, hand-stitched. Only worn twice, excellent condition.',
    tags: ['Sustainable', 'Leather', 'Footwear'],
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80'
  },
  {
    id: 3,
    title: 'Organic Cotton Shopper',
    category: 'Accessories',
    size: 'OS',
    price: 18.00,
    status: 'Draft',
    views: 'N/A',
    likes: 'N/A',
    condition: 'New with tags',
    description: '100% organic cotton tote bag. Durable and perfect for everyday shopping.',
    tags: ['Cotton', 'Sustainable'],
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80'
  },
  {
    id: 4,
    title: 'Reclaimed Denim Jacket',
    category: 'Streetwear',
    size: 'L',
    price: 65.00,
    status: 'Active',
    views: '3.1k',
    likes: 92,
    condition: 'Good',
    description: 'Classic denim jacket with custom patch details. Relaxed fit.',
    tags: ['90s fashion', 'Vintage', 'Sustainable'],
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=80'
  }
];

const popularTagList = ['90s fashion', 'Sustainable', 'Cotton', 'Vintage', 'Minimalist'];

function Inventory({ inventorySearch }) {
  const [inventoryMode, setInventoryMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [listings, setListings] = useState(initialProducts);
  const [editingListing, setEditingListing] = useState(null);
  const [listingFilter, setListingFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newly Listed');

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCondition, setFormCondition] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSize, setFormSize] = useState('');
  const [formTags, setFormTags] = useState([]);
  const [formImage, setFormImage] = useState('');

  const handleOpenCreate = () => {
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
      setListings(listings.filter(item => item.id !== id));
    }
  };

  const handleToggleTag = (tag) => {
    if (formTags.includes(tag)) {
      setFormTags(formTags.filter(t => t !== tag));
    } else {
      setFormTags([...formTags, tag]);
    }
  };

  const handleFormSubmit = (e, status) => {
    e.preventDefault();
    if (!formTitle || !formPrice) { alert('Please fill out Title and Price fields.'); return; }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum)) { alert('Price must be a valid number.'); return; }
    const imageToUse = formImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';

    if (inventoryMode === 'create') {
      const newProduct = {
        id: Date.now(), title: formTitle, category: formCategory || 'Other',
        size: formSize || 'OS', price: priceNum, status,
        views: status === 'Draft' ? 'N/A' : '0',
        likes: status === 'Draft' ? 'N/A' : '0',
        condition: formCondition || 'Good', description: formDescription,
        tags: formTags, image: imageToUse
      };
      setListings([newProduct, ...listings]);
    } else if (inventoryMode === 'edit' && editingListing) {
      setListings(listings.map(item =>
        item.id === editingListing.id
          ? { ...item, title: formTitle, category: formCategory, size: formSize, price: priceNum,
              status: status === 'Draft' ? 'Draft' : 'Active', condition: formCondition,
              description: formDescription, tags: formTags, image: imageToUse }
          : item
      ));
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

  /* ────────── LIST VIEW ────────── */
  if (inventoryMode === 'list') {
    return (
      <div className="view-content fade-in">
        <div className="view-heading border-bottom">
          <div>
            <h1>Listing Management</h1>
            <p className="view-sub">Track, edit, and organize your sustainable collection.</p>
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
                onClick={() => setListingFilter(label)}>
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
                {filteredListings.length > 0 ? filteredListings.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-thumbnail"><img src={product.image} alt={product.title} /></div>
                        <div className="product-details">
                          <span className="product-title">{product.title}</span>
                          <span className="product-subtitle">Size {product.size} • {product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="price-cell"><strong>${product.price.toFixed(2)}</strong></td>
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
                          <span className="stat-indicator-item" title="Views">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                            {product.views}
                          </span>
                          <span className="stat-indicator-item" title="Likes">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {product.likes}
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions-cell">
                        {product.status === 'Sold' ? (
                          <button className="action-icon-btn view-btn" title="View details">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        ) : (
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
                        <button className="action-icon-btn more-btn">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="empty-state-row">No listings found matching the criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer-pagination">
            <span className="showing-indicator">Showing 1-{filteredListings.length} of {listings.length} listings</span>
            <div className="pagination-controls">
              <button className="pagination-btn arrow-btn" disabled>&lt;</button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <button className="pagination-btn arrow-btn">&gt;</button>
            </div>
          </div>
        </div>

        {/* Bottom Metric Cards */}
        <div className="dashboard-cards-bottom-row">
          <div className="metric-card-styled">
            <div className="metric-card-icon-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="metric-icon-color">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Revenue This Month</span>
            </div>
            <div className="metric-value-block">
              <h3>$1,240.50</h3>
              <span className="metric-sublabel positive">+12% from last month</span>
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
              <h3>42 kg CO2</h3>
              <span className="metric-sublabel">35% of annual goal</span>
              <div className="metric-horizontal-bar">
                <div className="metric-bar-fill" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>

          <div className="promo-card-dark">
            <div className="promo-card-content">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" className="promo-lightning-icon">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <h4>Quick Promotion</h4>
              <p>Boost your visibility by 200% with SecondLife Plus.</p>
              <button className="promo-action-btn">Learn More</button>
            </div>
          </div>
        </div>
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
                <div className="upload-placeholder-content" onClick={() => {
                  const url = prompt('Enter a valid image URL to simulate file upload:');
                  if (url) setFormImage(url);
                }}>
                  <div className="camera-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <span>+ Cover Photo</span>
                </div>
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
