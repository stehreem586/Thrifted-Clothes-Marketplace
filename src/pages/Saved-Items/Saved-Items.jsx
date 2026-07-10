import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Saved-Items.css';

// Import images
import savedImage1 from '../../assets/images/Saved-Images/saved-image1.png';
import savedImage2 from '../../assets/images/Saved-Images/saved-image2.png';
import savedImage3 from '../../assets/images/Saved-Images/saved-image3.png';
import savedImage4 from '../../assets/images/Saved-Images/saved-image4.png';
import savedImage5 from '../../assets/images/Saved-Images/saved-image5.png';
import savedImage6 from '../../assets/images/Saved-Images/saved-image6.png';
import savedImage7 from '../../assets/images/Saved-Images/saved-image7.png';
import savedImage8 from '../../assets/images/Saved-Images/saved-image8.png';

const initialSavedProducts = [
  { id: 1, title: '1990s Wool Camel Blazer', price: '$120', size: 'Size M', image: savedImage1, wishlisted: true, category: 'Vintage' },
  { id: 2, title: 'Classic Leather Low-Top', price: '$85', size: 'Size 9', image: savedImage2, wishlisted: true, category: 'Streetwear', badge: 'SUSTAINABLE' },
  { id: 3, title: 'Architectural Leather Tote', price: '$450', size: 'One Size', image: savedImage3, wishlisted: true, category: 'Luxury' },
  { id: 4, title: 'Heavyweight Alpaca Knit', price: '$180', size: 'Size L', image: savedImage4, wishlisted: true, category: 'Knitwear', badge: 'BEST SELLER' },
  { id: 5, title: 'Raw Indigo Selvedge Jeans', price: '$95', size: 'Size 30', image: savedImage5, wishlisted: true, category: 'Denim' },
  { id: 6, title: '14k Gold Pearl Drop', price: '$210', size: 'One Size', image: savedImage6, wishlisted: true, category: 'Jewelry' },
  { id: 7, title: 'Weatherproof Tech Shell', price: '$320', size: 'Size XL', image: savedImage7, wishlisted: true, category: 'Outerwear' },
  { id: 8, title: 'Sage Pleated Midi Skirt', price: '$65', size: 'Size S', image: savedImage8, wishlisted: true, category: 'Skirts' }
];

const SavedItems = () => {
  const [products, setProducts] = useState(initialSavedProducts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'price-asc', 'price-desc'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [maxPrice, setMaxPrice] = useState(500);

  const categories = ['All', 'Vintage', 'Streetwear', 'Luxury', 'Knitwear', 'Denim', 'Jewelry', 'Outerwear', 'Skirts'];
  const sizes = ['All', 'Size S', 'Size M', 'Size L', 'Size XL', 'Size 9', 'Size 30', 'One Size'];

  const sortLabel = {
    recent: 'Recently Saved',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low'
  };

  const handleWishlistToggle = (id) => {
    // Smoothly remove item from the saved list
    setProducts(products.filter(p => p.id !== id));
  };

  const handleFilterChange = (type, value) => {
    if (type === 'category') setSelectedCategory(value);
    if (type === 'size') setSelectedSize(value);
    if (type === 'maxPrice') setMaxPrice(value);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('All');
    setMaxPrice(500);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const priceNum = parseFloat(product.price.replace(/[^\d.]/g, ''));
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    const sizeMatch = selectedSize === 'All' || product.size === selectedSize;
    const priceMatch = priceNum <= maxPrice;
    return categoryMatch && sizeMatch && priceMatch;
  });

  // Sort products
  const getSortedProducts = (items) => {
    switch (sortBy) {
      case 'price-asc':
        return [...items].sort((a, b) => {
          const valA = parseFloat(a.price.replace(/[^\d.]/g, ''));
          const valB = parseFloat(b.price.replace(/[^\d.]/g, ''));
          return valA - valB;
        });
      case 'price-desc':
        return [...items].sort((a, b) => {
          const valA = parseFloat(a.price.replace(/[^\d.]/g, ''));
          const valB = parseFloat(b.price.replace(/[^\d.]/g, ''));
          return valB - valA;
        });
      case 'recent':
      default:
        return items;
    }
  };

  const sortedAndFilteredProducts = getSortedProducts(filteredProducts);

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
                <span className="filter-price-value">${maxPrice}</span>
              </div>
              <div className="price-slider-wrapper">
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  step="5"
                  value={maxPrice} 
                  onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                  className="price-range-slider"
                />
                <div className="price-labels">
                  <span>$50</span>
                  <span>$500</span>
                </div>
              </div>
            </div>
          </div>

          <div className="filter-actions">
            {(selectedCategory !== 'All' || selectedSize !== 'All' || maxPrice !== 500) && (
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
              product={product}
              variant="saved"
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
