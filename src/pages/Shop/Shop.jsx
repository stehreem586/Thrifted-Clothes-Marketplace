import React, { useState } from 'react';
import './Shop.css';

// Import images
import card1 from '../../assets/images/Browse-Marketplace/card-1.png';
import card2 from '../../assets/images/Browse-Marketplace/card-2.png';
import card3 from '../../assets/images/Browse-Marketplace/card-3.png';
import card4 from '../../assets/images/Browse-Marketplace/card-4.png';
import card5 from '../../assets/images/Browse-Marketplace/card-5.png';
import card6 from '../../assets/images/Browse-Marketplace/card-6.png';
import card7 from '../../assets/images/Browse-Marketplace/card-7.png';
import card8 from '../../assets/images/Browse-Marketplace/card-8.png';

const initialProducts = [
  { id: 1, title: '90s Oversized Denim Jacket', price: '$85.00', size: 'Size M', image: card1, wishlisted: false },
  { id: 2, title: 'Hand-Painted Italian Silk Scarf', price: '$120.00', size: 'One Size', image: card2, wishlisted: true },
  { id: 3, title: 'Classic Mahogany Loafers', price: '$145.00', size: 'Size 9', image: card3, wishlisted: false },
  { id: 4, title: 'Minimalist Wool Trench Coat', price: '$210.00', size: 'Size L', image: card4, wishlisted: false },
  { id: 5, title: 'Retro Canvas Camera Bag', price: '$55.00', size: 'Accessory', image: card5, wishlisted: false },
  { id: 6, title: 'Gold Rim Aviator Sunglasses', price: '$40.00', size: 'One Size', image: card6, wishlisted: false },
  { id: 7, title: 'Checked Mohair Knit Sweater', price: '$95.00', size: 'Size S', image: card7, wishlisted: false },
  { id: 8, title: 'Vintage Heirloom Watch', price: '$320.00', size: 'Excellent', image: card8, wishlisted: false }
];

const Shop = () => {
  const [products, setProducts] = useState(initialProducts);
  const [selectedCity, setSelectedCity] = useState('New York, NY');
  const [selectedSize, setSelectedSize] = useState('XS');
  const [selectedCategory, setSelectedCategory] = useState('Vintage');
  const [priceRange, setPriceRange] = useState(500);
  const [conditions, setConditions] = useState({
    excellent: true,
    veryGood: false,
    good: false,
    fair: false
  });
  const [sortBy, setSortBy] = useState('Newest Arrivals');

  const toggleWishlist = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, wishlisted: !p.wishlisted } : p));
  };

  const handleConditionChange = (key) => {
    setConditions({ ...conditions, [key]: !conditions[key] });
  };

  const resetFilters = () => {
    setSelectedCity('New York, NY');
    setSelectedSize('XS');
    setSelectedCategory('Vintage');
    setPriceRange(500);
    setConditions({
      excellent: true,
      veryGood: false,
      good: false,
      fair: false
    });
    setSortBy('Newest Arrivals');
  };

  return (
    <div className="shop-page-container">
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
                <option value="New York, NY">New York, NY</option>
                <option value="Los Angeles, CA">Los Angeles, CA</option>
                <option value="Chicago, IL">Chicago, IL</option>
                <option value="London, UK">London, UK</option>
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
                  className={`pill-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
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
              {['Streetwear', 'Vintage', 'Luxury', 'Accessories', 'Shoes'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
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
              <span className="price-value-label">$0 - ${priceRange}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1000" 
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

          {/* Reset button */}
          <button 
            type="button" 
            className="reset-filters-btn"
            onClick={resetFilters}
          >
            Reset All Filters
          </button>
        </aside>

        {/* Products Grid Column */}
        <main className="shop-main-content">
          <div className="shop-header-row">
            <div className="shop-title-area">
              <h1 className="shop-main-title">Vintage Wear</h1>
              <p className="shop-subtitle">Discover 2,430 unique pre-loved treasures from across the country.</p>
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
                  <option value="Popularity">Popularity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="browse-products-grid">
            {products.map((product) => (
              <div key={product.id} className="browse-product-card">
                <div className="browse-product-img-wrapper">
                  <img src={product.image} alt={product.title} className="browse-product-img" loading="lazy" />
                  <button
                    type="button"
                    className={`browse-heart-btn ${product.wishlisted ? 'wishlisted' : ''}`}
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Wishlist Item"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={product.wishlisted ? '#ff3b30' : 'none'} stroke={product.wishlisted ? '#ff3b30' : 'currentColor'} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <div className="browse-product-details">
                  <h3 className="browse-product-title">{product.title}</h3>
                  <div className="browse-product-meta-row">
                    <span className="browse-product-price">{product.price}</span>
                    <span className="browse-product-size">{product.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="load-more-container">
            <button type="button" className="load-more-btn">
              Load More Items
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;
