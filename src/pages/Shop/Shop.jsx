import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shop.css';
import ProductCard from '../../components/ProductCard/ProductCard';
import { browseProducts } from '../../data/browseProducts';

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(browseProducts);
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
              <ProductCard
                key={product.id}
                product={product}
                variant="browse"
                onWishlistToggle={toggleWishlist}
                onClick={() => navigate(`/product/${product.id}`)}
              />
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
