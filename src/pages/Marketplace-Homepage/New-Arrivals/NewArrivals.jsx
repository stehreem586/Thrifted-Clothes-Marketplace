import React, { useState } from 'react';
import './NewArrivals.css';

// Import images
import newArrival1 from '../../../assets/images/Marketplace-homepage/new-arrival1.png';
import newArrival2 from '../../../assets/images/Marketplace-homepage/new-arrival2.png';
import newArrival3 from '../../../assets/images/Marketplace-homepage/new-arrival3.png';
import newArrival4 from '../../../assets/images/Marketplace-homepage/new-arrival4.png';

const arrivalProducts = [
  {
    id: 1,
    brand: 'BURBERRY VINTAGE',
    title: 'Classic Heritage Trench Coat',
    price: '$450',
    size: 'Size: UK 10',
    image: newArrival1,
    category: 'Women'
  },
  {
    id: 2,
    brand: 'SAINT LAURENT',
    title: 'Wyatt Leather Boots',
    price: '$620',
    size: 'Size: US 11',
    image: newArrival2,
    category: 'Men'
  },
  {
    id: 3,
    brand: 'THE ROW',
    title: 'Silk Satin Maxi Dress',
    price: '$890',
    size: 'Size: S',
    image: newArrival3,
    category: 'Women'
  },
  {
    id: 4,
    brand: 'LORO PIANA',
    title: 'Oversized Cashmere Knit',
    price: '$550',
    size: 'Size: L',
    image: newArrival4,
    category: 'Unisex'
  }
];

export const NewArrivalCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="new-arrival-card">
      <div className="new-arrival-image-wrapper">
        <img src={product.image} alt={product.title} className="new-arrival-img" loading="lazy" />
        <button 
          type="button" 
          className={`new-arrival-heart-btn ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          aria-label="Add to Wishlist"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={isWishlisted ? '#ff3b30' : 'none'} stroke={isWishlisted ? '#ff3b30' : 'currentColor'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div className="new-arrival-details">
        <span className="new-arrival-brand">{product.brand}</span>
        <h3 className="new-arrival-title">{product.title}</h3>
        <div className="new-arrival-bottom">
          <span className="new-arrival-price">{product.price}</span>
          <span className="new-arrival-size">{product.size}</span>
        </div>
      </div>
    </div>
  );
};

const NewArrivals = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Women', 'Men', 'Unisex'];

  // Filter products based on selected pill
  const filteredProducts = activeFilter === 'All' 
    ? arrivalProducts 
    : arrivalProducts.filter(p => p.category === activeFilter);

  return (
    <section className="new-arrivals">
      <div className="new-arrivals-header">
        <div className="new-arrivals-title-area">
          <h2 className="new-arrivals-heading">New Arrivals</h2>
          <p className="new-arrivals-subtitle">The latest pre-loved treasures, just listed.</p>
        </div>
        <div className="new-arrivals-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="new-arrivals-grid">
        {filteredProducts.map((product) => (
          <NewArrivalCard key={product.id} product={product} />
        ))}
      </div>

      <div className="new-arrivals-actions">
        <button className="discover-arrivals-btn">
          Discover More Arrivals
        </button>
      </div>
    </section>
  );
};

export default NewArrivals;
