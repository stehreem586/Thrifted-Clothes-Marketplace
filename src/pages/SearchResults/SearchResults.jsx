import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchResults.css';

// Import images from assets
import srImage1 from '../../assets/images/search-result/sr-image1.png';
import srImage2 from '../../assets/images/search-result/sr-image2.png';
import srImage3 from '../../assets/images/search-result/sr-image3.png';
import srImage4 from '../../assets/images/search-result/sr-image4.png';
import srImage5 from '../../assets/images/search-result/sr-image5.png';
import srImage6 from '../../assets/images/search-result/sr-image6.png';

const INITIAL_PRODUCTS = [
  {
    id: 'sr1',
    title: '90s Oversized Leather Bomber',
    price: 145,
    size: 'L',
    condition: 'Excellent Condition',
    style: 'Vintage',
    category: 'Jackets & Coats',
    badge: 'Rare Find',
    image: srImage1
  },
  {
    id: 'sr2',
    title: "Vintage Levi's Type III Trucker",
    price: 89,
    size: 'M',
    condition: 'Good Patina',
    style: 'Vintage',
    category: 'Jackets & Coats',
    image: srImage2
  },
  {
    id: 'sr3',
    title: 'Classic 80s Khaki Trench',
    price: 110,
    size: 'S',
    condition: 'Mint Condition',
    style: 'Vintage',
    category: 'Jackets & Coats',
    image: srImage3
  },
  {
    id: 'sr4',
    title: 'Retro Varsity Letterman',
    price: 75,
    size: 'XL',
    condition: 'Slightly Worn',
    style: '90s Retro',
    category: 'Jackets & Coats',
    image: srImage4
  },
  {
    id: 'sr5',
    title: '80s Neon Pop Windbreaker',
    price: 55,
    size: 'M',
    condition: 'Like New',
    style: 'Streetwear',
    category: 'Vintage Outerwear',
    image: srImage5
  },
  {
    id: 'sr6',
    title: 'Winter Shearling Denim',
    price: 120,
    size: 'L',
    condition: 'Great Condition',
    style: 'Streetwear',
    category: 'Denim Jackets',
    image: srImage6
  }
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL search query
  const query = searchParams.get('q') || 'Vintage Jacket';

  // Filters state
  const [selectedCategories, setSelectedCategories] = useState(['Jackets & Coats']);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceSliderValue, setPriceSliderValue] = useState(200);
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('Vintage');
  const [sortBy, setSortBy] = useState('Newest First');
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  // Handle wishlist toggle
  const toggleWishlist = (id) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Sync price slider with max price input if slider changes
  const handlePriceSliderChange = (e) => {
    const val = Number(e.target.value);
    setPriceSliderValue(val);
    setMaxPrice(val.toString());
  };

  // Sync maxPrice input with slider
  const handleMaxPriceInputChange = (e) => {
    const val = e.target.value;
    setMaxPrice(val);
    const num = Number(val);
    if (!isNaN(num) && num >= 0 && num <= 500) {
      setPriceSliderValue(num);
    }
  };

  // Filter categories
  const categoriesList = ['Jackets & Coats', 'Vintage Outerwear', 'Denim Jackets'];

  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setPriceSliderValue(200);
    setSelectedCondition('All');
    setSelectedStyle('All');
    setSortBy('Newest First');
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((product) => {
      // 1. Text Search matching title, style, condition, or category
      if (query && query.toLowerCase() !== 'all') {
        const lowerQuery = query.toLowerCase();
        const matchesQuery =
          product.title.toLowerCase().includes(lowerQuery) ||
          product.style.toLowerCase().includes(lowerQuery) ||
          product.category.toLowerCase().includes(lowerQuery) ||
          product.condition.toLowerCase().includes(lowerQuery);
        if (!matchesQuery) return false;
      }

      // 2. Category Filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(product.category)) {
          return false;
        }
      }

      // 3. Price Filter
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      if (product.price < min || product.price > max) {
        return false;
      }

      // 4. Condition Filter
      if (selectedCondition !== 'All') {
        const cond = product.condition.toLowerCase();
        if (selectedCondition === 'Like New') {
          // Matches "Excellent Condition", "Like New", "Mint Condition"
          if (!cond.includes('excellent') && !cond.includes('like new') && !cond.includes('mint')) {
            return false;
          }
        } else if (selectedCondition === 'Good') {
          // Matches "Good Patina", "Great Condition", "Slightly Worn"
          if (!cond.includes('good') && !cond.includes('great') && !cond.includes('worn')) {
            return false;
          }
        } else if (selectedCondition === 'Fair') {
          if (!cond.includes('fair')) {
            return false;
          }
        }
      }

      // 5. Style Filter
      if (selectedStyle !== 'All') {
        if (product.style.toLowerCase() !== selectedStyle.toLowerCase()) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sorting logic
      if (sortBy === 'Price: Low to High') {
        return a.price - b.price;
      }
      if (sortBy === 'Price: High to Low') {
        return b.price - a.price;
      }
      // "Newest First" & "Popularity" can fall back to original array ordering for mock behavior
      return 0;
    });
  }, [query, selectedCategories, minPrice, maxPrice, selectedCondition, selectedStyle, sortBy]);

  return (
    <div className="sr-page-wrapper">
      <div className="sr-page-container">
        
        {/* Breadcrumb / Title Row */}
        <div className="sr-header-row">
          <div className="sr-title-group">
            <h1 className="sr-main-title">Results for "{query}"</h1>
            <p className="sr-subtitle">
              Showing {filteredProducts.length.toLocaleString()} items found in Marketplace
            </p>
          </div>
          <div className="sr-sort-group">
            <span className="sr-sort-label">Sort by:</span>
            <div className="sr-select-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sr-sort-select"
              >
                <option value="Newest First">Newest First</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Popularity">Popularity</option>
              </select>
              <svg className="sr-chevron-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="sr-layout">
          
          {/* Left Sidebar Filters */}
          <aside className="sr-sidebar">
            
            {/* Category Filter */}
            <div className="sr-filter-section">
              <h3 className="sr-filter-title">CATEGORY</h3>
              <div className="sr-checkbox-group">
                {categoriesList.map((category) => (
                  <label key={category} className="sr-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="sr-checkbox-input"
                    />
                    <span className="sr-checkbox-custom">
                      {selectedCategories.includes(category) && (
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </span>
                    <span className="sr-checkbox-text">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="sr-filter-section">
              <h3 className="sr-filter-title">PRICE RANGE</h3>
              <div className="sr-price-inputs">
                <div className="sr-price-field">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="sr-price-input"
                  />
                </div>
                <div className="sr-price-divider">—</div>
                <div className="sr-price-field">
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={handleMaxPriceInputChange}
                    className="sr-price-input"
                  />
                </div>
              </div>
              <div className="sr-slider-container">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceSliderValue}
                  onChange={handlePriceSliderChange}
                  className="sr-price-slider"
                />
                <div className="sr-slider-track-highlight" style={{ width: `${(priceSliderValue / 500) * 100}%` }}></div>
              </div>
            </div>

            {/* Condition Filter */}
            <div className="sr-filter-section">
              <h3 className="sr-filter-title">CONDITION</h3>
              <div className="sr-badge-grid">
                {['All', 'Like New', 'Good', 'Fair'].map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setSelectedCondition(cond)}
                    className={`sr-badge-btn ${selectedCondition === cond ? 'active' : ''}`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Filter */}
            <div className="sr-filter-section">
              <h3 className="sr-filter-title">STYLE</h3>
              <div className="sr-badge-grid">
                {['Minimalist', 'Vintage', 'Streetwear', '90s Retro'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStyle(st)}
                    className={`sr-badge-btn ${selectedStyle === st ? 'active' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="sr-reset-btn"
            >
              Reset All Filters
            </button>
          </aside>

          {/* Right Product Grid */}
          <main className="sr-main">
            {filteredProducts.length === 0 ? (
              <div className="sr-no-results">
                <h3>No items match your search</h3>
                <p>Try adjusting your filters or search keywords.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="sr-no-results-btn"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="sr-grid">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlistedIds.has(product.id);
                  return (
                    <div
                      key={product.id}
                      className="sr-card"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <div className="sr-card-image-container">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="sr-card-image"
                          loading="lazy"
                        />
                        {product.badge && (
                          <span className="sr-card-badge">
                            {product.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className={`sr-card-heart-btn ${isWishlisted ? 'wishlisted' : ''}`}
                          aria-label="Wishlist item"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill={isWishlisted ? '#ff4d4f' : 'none'} stroke={isWishlisted ? '#ff4d4f' : 'currentColor'} strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                      </div>

                      <div className="sr-card-details">
                        <h4 className="sr-card-title">{product.title}</h4>
                        <p className="sr-card-meta">
                          Size: {product.size} • {product.condition}
                        </p>
                        <div className="sr-card-footer">
                          <span className="sr-card-price">${product.price}</span>
                          <span className="sr-card-view-details">View Details</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="sr-pagination">
                <button type="button" className="sr-pagination-arrow" aria-label="Previous page">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button type="button" className="sr-pagination-number active">1</button>
                <button type="button" className="sr-pagination-number">2</button>
                <button type="button" className="sr-pagination-number">3</button>
                <span className="sr-pagination-ellipsis">...</span>
                <button type="button" className="sr-pagination-number">42</button>
                <button type="button" className="sr-pagination-arrow" aria-label="Next page">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
};

export default SearchResults;
