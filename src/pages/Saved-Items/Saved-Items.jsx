import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { fetchSavedListingsDetails, toggleSavedListing } from '../../utils/savedFetch.js';
import './Saved-Items.css';

const SavedItems = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'price-asc', 'price-desc'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [maxPrice, setMaxPrice] = useState(10000);

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories', 'Bags', 'Other'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL'];

  const sortLabel = {
    recent: 'Recently Saved',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low'
  };

  // Fetch saved items from Supabase
  const loadSavedItems = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await fetchSavedListingsDetails(user.id);
      setProducts(items);
    } catch (err) {
      console.error('Failed to load saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedItems();
  }, [user]);

  const handleWishlistToggle = async (id) => {
    if (!user) return;
    // Remove listing row from database
    const success = await toggleSavedListing(user.id, id, false);
    if (success) {
      // Smoothly remove item from the saved list locally
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === 'category') setSelectedCategory(value);
    if (type === 'size') setSelectedSize(value);
    if (type === 'maxPrice') setMaxPrice(value);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('All');
    setMaxPrice(10000);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const priceNum = parseFloat(product.price) || 0;
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    
    // Normalize size checking
    const sizeVal = product.size?.toUpperCase() || '';
    const targetSize = selectedSize === 'All' ? 'All' : selectedSize.toUpperCase();
    const sizeMatch = targetSize === 'All' || sizeVal.includes(targetSize);
    
    const priceMatch = priceNum <= maxPrice;
    return categoryMatch && sizeMatch && priceMatch;
  });

  // Sort products
  const getSortedProducts = (items) => {
    switch (sortBy) {
      case 'price-asc':
        return [...items].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...items].sort((a, b) => b.price - a.price);
      case 'recent':
      default:
        return items;
    }
  };

  const sortedAndFilteredProducts = getSortedProducts(filteredProducts);

  if (!user) {
    return (
      <div className="saved-page-container">
        <div className="saved-empty-state">
          <div className="empty-icon-container">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2>My Saved Items</h2>
          <p>Please log in to view and save items in your wishlist!</p>
          <Link to="/login" className="browse-marketplace-btn">
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(193, 147, 88, 0.2)',
          borderTopColor: '#c19358',
          borderRadius: '50%',
          animation: 'ptr-spin 0.8s linear infinite'
        }}></div>
        <style>{`@keyframes ptr-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="saved-page-container">
      {/* Header section */}
      <div className="saved-items-header">
        <div className="saved-items-title-section">
          <h1 className="saved-items-title">My Saved Items</h1>
          <p className="saved-items-count">
            {products.length} {products.length === 1 ? 'item' : 'items'} favorited for later
          </p>
        </div>

        {products.length > 0 && (
          <div className="saved-items-controls">
            {/* Filter Toggle Button */}
            <button 
              className={`control-btn filter-btn ${isFilterOpen ? 'active' : ''}`} 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              type="button"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <span>Filter</span>
            </button>

            {/* Sort Dropdown */}
            <div className="sort-dropdown-container">
              <button 
                className="control-btn sort-btn" 
                onClick={() => setIsSortOpen(!isSortOpen)}
                type="button"
              >
                <span>Sort: {sortLabel[sortBy]}</span>
                <svg className={`chevron-icon ${isSortOpen ? 'open' : ''}`} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              
              {isSortOpen && (
                <>
                  <div className="sort-dropdown-backdrop" onClick={() => setIsSortOpen(false)} />
                  <div className="sort-dropdown-menu">
                    {Object.entries(sortLabel).map(([key, label]) => (
                      <button 
                        key={key} 
                        className={`dropdown-item ${sortBy === key ? 'selected' : ''}`}
                        onClick={() => {
                          setSortBy(key);
                          setIsSortOpen(false);
                        }}
                        type="button"
                      >
                        {label}
                        {sortBy === key && (
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Filter Panel */}
      {products.length > 0 && isFilterOpen && (
        <div className="saved-items-filter-bar">
          <div className="filter-grid">
            <div className="filter-section">
              <span className="filter-section-title">Category</span>
              <div className="filter-options-scroll">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    className={`filter-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleFilterChange('category', cat)}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-section">
              <span className="filter-section-title">Size</span>
              <div className="filter-options-scroll">
                {sizes.map(sz => (
                  <button 
                    key={sz} 
                    className={`filter-pill-btn ${selectedSize === sz ? 'active' : ''}`}
                    onClick={() => handleFilterChange('size', sz)}
                    type="button"
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-section price-filter">
              <div className="filter-section-title-row">
                <span className="filter-section-title">Max Price</span>
                <span className="filter-price-value">Rs. {maxPrice.toLocaleString()}</span>
              </div>
              <div className="price-slider-wrapper">
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="100"
                  value={maxPrice} 
                  onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                  className="price-range-slider"
                />
                <div className="price-labels">
                  <span>Rs. 0</span>
                  <span>Rs. 10,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="filter-actions">
            {(selectedCategory !== 'All' || selectedSize !== 'All' || maxPrice !== 10000) && (
              <button className="clear-all-btn" onClick={clearFilters} type="button">
                Clear Filters
              </button>
            )}
            <button className="apply-btn" onClick={() => setIsFilterOpen(false)} type="button">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Grid or Empty State */}
      {products.length === 0 ? (
        <div className="saved-empty-state">
          <div className="empty-icon-container">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2>Your Saved List is Empty</h2>
          <p>Tap the heart icon on any pre-loved clothing items to save them here for later!</p>
          <Link to="/shop" className="browse-marketplace-btn">
            Browse Marketplace
          </Link>
        </div>
      ) : sortedAndFilteredProducts.length === 0 ? (
        <div className="saved-empty-state no-results">
          <h3>No matching saved items found</h3>
          <p>Try resetting or adjusting your filter criteria.</p>
          <button className="browse-marketplace-btn reset-btn" onClick={clearFilters} type="button">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="saved-items-grid">
          {sortedAndFilteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                image: product.image_url,
                price: `Rs. ${product.price.toLocaleString()}`
              }}
              variant="saved"
              onWishlistToggle={handleWishlistToggle}
              onClick={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
