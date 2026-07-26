import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Shop.css';
import ProductCard from '../../components/ProductCard/ProductCard';
import { fetchActiveListings } from '../../utils/listingsFetch.js';
import { useAuth } from '../../context/AuthContext';
import { fetchSavedListingIds, toggleSavedListing } from '../../utils/savedFetch.js';

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQueryParam = searchParams.get('q') || '';
  const { user } = useAuth();

  // Active listings states
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Saved listings state for hearts display
  const [savedListingIds, setSavedListingIds] = useState([]);

  useEffect(() => {
    const loadSavedIds = async () => {
      if (user?.id) {
        const ids = await fetchSavedListingIds(user.id);
        setSavedListingIds(ids);
      } else {
        setSavedListingIds([]);
      }
    };
    loadSavedIds();
  }, [user]);

  const handleWishlistToggle = async (listingId) => {
    if (!user) {
      if (window.confirm("You must be logged in to save listings to your wishlist. Would you like to log in now?")) {
        navigate('/login');
      }
      return;
    }
    
    const isSaved = savedListingIds.includes(String(listingId));
    const success = await toggleSavedListing(user.id, listingId, !isSaved);
    if (success) {
      setSavedListingIds(prev => 
        isSaved 
          ? prev.filter(id => id !== String(listingId)) 
          : [...prev, String(listingId)]
      );
    }
  };

  // Local/Temporary Filter States (Sidebar selections before clicking Apply)
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState([]); 
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [priceRange, setPriceRange] = useState(10000); 
  const [conditions, setConditions] = useState({
    excellent: false,
    veryGood: false,
    good: false,
    fair: false
  });
  
  // Committed Filter States (applied to Supabase query)
  const [activeFilters, setActiveFilters] = useState({
    city: 'All',
    sizes: [],
    categories: [],
    maxPrice: 10000,
    conditions: [],
    search: searchQueryParam
  });

  const [sortBy, setSortBy] = useState('Newest Arrivals');

  // Load listings from Supabase using committed active filters
  const loadListings = async (pageNum, isLoadMore = false, filtersToUse = activeFilters) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = {
        city: filtersToUse.city,
        sizes: filtersToUse.sizes,
        categories: filtersToUse.categories,
        maxPrice: filtersToUse.maxPrice,
        conditions: filtersToUse.conditions,
        search: filtersToUse.search
      };

      const result = await fetchActiveListings(pageNum, 20, params);
      
      if (isLoadMore) {
        setListings(prev => {
          const existingIds = new Set(prev.map(item => String(item.id)));
          const uniqueNew = result.listings.filter(item => !existingIds.has(String(item.id)));
          return [...prev, ...uniqueNew];
        });
      } else {
        setListings(result.listings);
      }
      setHasMore(result.hasMore);
      setError(null);
    } catch (err) {
      console.error('Error loading listings:', err);
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Sync searchQueryParam from URL to active filters and trigger fetch
  useEffect(() => {
    setPage(1);
    setActiveFilters(prev => {
      const updated = { ...prev, search: searchQueryParam };
      loadListings(1, false, updated);
      return updated;
    });
  }, [searchQueryParam]);

  // Load More Handler (passes currently active/committed filters)
  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadListings(nextPage, true, activeFilters);
    }
  };

  // Toggle handlers for local sidebar selections
  const handleSizeClick = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleConditionChange = (key) => {
    setConditions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Apply filters: commit local sidebar state to query filters and trigger fetch
  const applyFilters = () => {
    setPage(1);

    const activeConds = Object.entries(conditions)
      .filter(([_, val]) => val)
      .map(([key]) => {
        if (key === 'excellent') return 'Like New';
        if (key === 'veryGood') return 'Very Good';
        if (key === 'good') return 'Good Condition';
        if (key === 'fair') return 'Fair Condition';
        return key;
      });

    const activeParams = {
      city: selectedCity,
      sizes: selectedSizes,
      categories: selectedCategories,
      maxPrice: priceRange,
      conditions: activeConds,
      search: searchQueryParam // preserve the URL search query
    };

    setActiveFilters(activeParams);
    loadListings(1, false, activeParams);
  };

  // Clear all filters: reset local selections, committed parameters (preserving search query), and reload feed
  const handleClearAll = () => {
    setSelectedCity('All');
    setSelectedSizes([]);
    setSelectedCategories([]);
    setPriceRange(10000);
    setConditions({
      excellent: false,
      veryGood: false,
      good: false,
      fair: false
    });
    
    const cleared = {
      city: 'All',
      sizes: [],
      categories: [],
      maxPrice: 10000,
      conditions: [],
      search: searchQueryParam // preserve the URL search query
    };
    setActiveFilters(cleared);
    setPage(1);
    loadListings(1, false, cleared);
  };

  // Sort Listings in memory
  const sortedProducts = [...listings].sort((a, b) => {
    if (sortBy === 'Price: Low to High') {
      return a.price - b.price;
    } else if (sortBy === 'Price: High to Low') {
      return b.price - a.price;
    } else {
      // Newest Arrivals
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  // Get header title based on active/committed categories
  const getHeaderTitle = () => {
    if (activeFilters.categories && activeFilters.categories.length > 0) {
      return activeFilters.categories.join(', ');
    }
    return 'Shop All';
  };

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, idx) => (
      <div className="browse-product-card skeleton-card" key={idx} style={{ opacity: 0.7 }}>
        <div className="browse-product-img-wrapper skeleton-shimmer" style={{ background: '#f2f2f7', aspectRatio: '1 / 1' }}></div>
        <div className="browse-product-details" style={{ padding: '16px' }}>
          <div style={{ height: '12px', width: '60px', background: '#f2f2f7', borderRadius: '4px', marginBottom: '8px' }}></div>
          <div style={{ height: '16px', width: '80%', background: '#f2f2f7', borderRadius: '4px', marginBottom: '8px' }}></div>
          <div style={{ height: '12px', width: '40%', background: '#f2f2f7', borderRadius: '4px', marginBottom: '8px' }}></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="shop-page-container">
      <style>{`
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f2f2f7 25%, #e5e5ea 37%, #f2f2f7 63%);
          background-size: 400% 100%;
          animation: skeleton-shimmer-anim 1.4s ease infinite;
        }
        @keyframes skeleton-shimmer-anim {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pill-btn.active {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
      `}</style>

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fff2f2',
          border: '1px solid #ffccc7',
          color: '#ff4d4f',
          borderRadius: '8px',
          marginBottom: '24px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          {/* City */}
          <div className="filter-group">
            <label className="filter-label">City</label>
            <div className="select-wrapper">
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Cities</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </select>
            </div>
          </div>

          {/* Size */}
          <div className="filter-group">
            <label className="filter-label">Size</label>
            <div className="pills-grid">
              {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                <button
                  key={size}
                  type="button"
                  className={`pill-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                  onClick={() => handleSizeClick(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <div className="pills-flex">
              {['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories', 'Bags', 'Other'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`pill-btn ${selectedCategories.includes(cat) ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <div className="filter-header-row">
              <label className="filter-label">Price Range</label>
              <span className="price-value-label">Rs. 0 - Rs. {priceRange.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10000" 
              step="100"
              value={priceRange} 
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="price-slider"
            />
          </div>

          {/* Condition */}
          <div className="filter-group">
            <label className="filter-label">Condition</label>
            <div className="checkbox-list">
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={conditions.excellent} 
                  onChange={() => handleConditionChange('excellent')} 
                />
                <span>Excellent (Like New)</span>
              </label>
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={conditions.veryGood} 
                  onChange={() => handleConditionChange('veryGood')} 
                />
                <span>Very Good</span>
              </label>
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={conditions.good} 
                  onChange={() => handleConditionChange('good')} 
                />
                <span>Good</span>
              </label>
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={conditions.fair} 
                  onChange={() => handleConditionChange('fair')} 
                />
                <span>Fair</span>
              </label>
            </div>
          </div>

          {/* Action buttons (Apply & Clear) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <button 
              type="button" 
              className="apply-filters-sidebar-btn"
              onClick={applyFilters}
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: '#1c1c1e',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                width: '100%',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2c2c2e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1c1c1e'}
            >
              Apply Filters
            </button>
            <button 
              type="button" 
              className="clear-all-sidebar-btn"
              onClick={handleClearAll}
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5ea',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#8e8e93',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f2f2f7';
                e.target.style.color = '#1c1c1e';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.color = '#8e8e93';
              }}
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Products Grid Column */}
        <main className="shop-main-content">
          <div className="shop-header-row">
            <div className="shop-title-area">
              <h1 className="shop-main-title">{getHeaderTitle()}</h1>
              <p className="shop-subtitle">Discover unique pre-loved treasures from across Pakistan.</p>
            </div>
            <div className="sort-by-container">
              <span className="sort-by-label">SORT BY</span>
              <div className="select-wrapper sort-select-wrapper">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="Newest Arrivals">Newest Arrivals</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Result Count Indicator */}
          {searchQueryParam && !loading && (
            <div style={{
              marginBottom: '24px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              color: '#8e8e93',
              fontWeight: '600'
            }}>
              {sortedProducts.length > 0 ? (
                <span>Showing <strong>{sortedProducts.length}</strong> results for "<strong>{searchQueryParam}</strong>"</span>
              ) : (
                <span>No results found for "<strong>{searchQueryParam}</strong>". Try different keywords.</span>
              )}
            </div>
          )}

          {/* Grid or Skeletons / Empty states */}
          {loading && listings.length === 0 ? (
            <div className="browse-products-grid">
              {renderSkeletons()}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '80px 24px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #e5e5ea',
              marginTop: '24px',
              justifyContent: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#c19358" strokeWidth="1.5" style={{ marginBottom: '20px', opacity: 0.8 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 15h8" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
              </svg>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '600', color: '#1c1c1e', margin: '0 0 8px 0' }}>
                {searchQueryParam 
                  ? `No listings found for "${searchQueryParam}". Try different keywords.` 
                  : 'No listings yet. Be the first to sell something!'}
              </p>
            </div>
          ) : (
            <>
              <div className="browse-products-grid">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      image: product.image_url,
                      price: `Rs. ${product.price.toLocaleString()}`,
                      wishlisted: savedListingIds.includes(String(product.id))
                    }}
                    variant="browse"
                    onWishlistToggle={handleWishlistToggle}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>

              {/* Load More Button matching original UI */}
              {hasMore && (
                <div className="load-more-container">
                  <button 
                    type="button" 
                    className="load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Items'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
