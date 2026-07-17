import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { storefrontProducts } from '../../data/browseProducts';
import './Storefront.css';

// Custom avatar/images can also use URL or local
const elenaAvatar = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150';

const reviewsData = [
  {
    id: 1,
    author: 'Sarah Jenkins',
    rating: 5,
    date: 'June 28, 2026',
    content: 'Absolutely thrilled with the 90s silk slip dress! It came in pristine condition, folded beautifully with a lovely personalized thank you note. Fast shipping too. Elena is an amazing curator.',
    item: '90s Archival Silk Slip Dress'
  },
  {
    id: 2,
    author: 'Liam Patterson',
    rating: 5,
    date: 'May 14, 2026',
    content: 'Purchased the Cashmere Sweater. It is incredibly soft and looks exactly as described. The measurements provided were spot on. Elena makes shopping pre-loved a dream!',
    item: 'Pure Cashmere Sweater'
  },
  {
    id: 3,
    author: 'Sophia Rossi',
    rating: 5,
    date: 'April 02, 2026',
    content: 'The tailored trousers are beautiful and in flawless vintage condition. Communication was outstanding, and shipping was prompt. CuratedByElena is now one of my favorite stores.',
    item: 'Wide Leg Tailored Trousers'
  },
  {
    id: 4,
    author: 'Emma Watson',
    rating: 4,
    date: 'March 18, 2026',
    content: 'Great minimalist leather bag. Very minor scuffing on the bottom, but Elena disclosed it fully in the description. Packaging was eco-friendly which I highly appreciate. Thank you!',
    item: 'Minimalist Leather Tote'
  }
];

const Storefront = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'sold', 'reviews', 'impact'
  const [isFollowing, setIsFollowing] = useState(false);
  const [sortOption, setSortOption] = useState('latest');
  const [listingsLimit, setListingsLimit] = useState(8);
  const [toastMessage, setToastMessage] = useState('');

  // Generate 24 listings by duplicating/modifying the base 8 storefront products
  const [activeListings, setActiveListings] = useState([]);

  useEffect(() => {
    const list = [];
    // Loop 3 times to get 24 listings
    for (let i = 0; i < 3; i++) {
      storefrontProducts.forEach((prod) => {
        const uniqueId = prod.id + i * 100;
        let title = prod.title;
        let price = prod.price;
        let badge = prod.badge;

        if (i === 1) {
          title = `${title} (Selected Piece)`;
          // Reduce price slightly for variations
          const num = parseInt(price.replace(/[^\d]/g, ''));
          price = `£${Math.round(num * 0.95)}`;
          // Remove badge from variations to look clean
          badge = null;
        } else if (i === 2) {
          title = `${title} - Archival Grade`;
          // Increase price slightly
          const num = parseInt(price.replace(/[^\d]/g, ''));
          price = `£${Math.round(num * 1.1)}`;
        }

        list.push({
          ...prod,
          id: uniqueId,
          title,
          price,
          badge
        });
      });
    }
    setActiveListings(list);
  }, []);

  // Show a temporary toast message
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    showToast(isFollowing ? 'Unfollowed @elenavintage' : 'Following @elenavintage');
  };

  const handleMessageClick = () => {
    navigate('/chat', { state: { startChatWith: 'CuratedByElena' } });
  };

  // Sort listings based on option
  const getSortedListings = () => {
    const items = [...activeListings];
    if (sortOption === 'price-low') {
      return items.sort((a, b) => {
        const valA = parseInt(a.price.replace(/[^\d]/g, ''));
        const valB = parseInt(b.price.replace(/[^\d]/g, ''));
        return valA - valB;
      });
    }
    if (sortOption === 'price-high') {
      return items.sort((a, b) => {
        const valA = parseInt(a.price.replace(/[^\d]/g, ''));
        const valB = parseInt(b.price.replace(/[^\d]/g, ''));
        return valB - valA;
      });
    }
    // Default 'latest' (initial order)
    return items;
  };

  const handleLoadMore = () => {
    setListingsLimit(prev => Math.min(prev + 8, activeListings.length));
    showToast('Loaded more curated listings');
  };

  const handleProductClick = (id) => {
    // If it's a variation, map it to the original product detail screen
    const originalId = id % 100 === 0 ? id : 200 + (id % 100);
    // Wait, let's map base ids: 201-208 are elena's base product IDs in browseProducts.js.
    // So mapping is `200 + (id % 100)`. If id % 100 is 1 to 8, it maps perfectly!
    // Let's make sure it handles IDs like 201, 301, 401. Yes, id % 100 works perfectly!
    const baseId = 200 + (id % 100);
    navigate(`/product/${baseId}`);
  };

  const sortedListings = getSortedListings();

  return (
    <div className="storefront-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#1c1c1e',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Seller Header */}
      <header className="storefront-header">
        <div className="storefront-avatar-wrapper">
          <img src={elenaAvatar} alt="CuratedByElena" className="storefront-avatar-img" />
          <div className="storefront-verified-badge" title="Verified Curator">
            {/* Verification Check / Leaf Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="storefront-verified-icon">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className="storefront-info-panel">
          <div className="storefront-title-row">
            <div className="storefront-name-group">
              <h1>CuratedByElena</h1>
              <p className="storefront-handle">
                @elenavintage <span className="storefront-location-dot">•</span> London, UK
              </p>
            </div>
            
            <div className="storefront-action-buttons">
              <button 
                className={`storefront-btn-follow ${isFollowing ? 'following' : ''}`}
                onClick={handleFollowToggle}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button 
                className="storefront-btn-message"
                onClick={handleMessageClick}
              >
                Message
              </button>
            </div>
          </div>

          <p className="storefront-bio">
            Curating the best 90s minimalism and archival designer pieces. Every item is hand-picked for its longevity, fabric quality, and timeless silhouette. Promoting circular fashion, one pre-loved gem at a time.
          </p>

          <div className="storefront-stats-row">
            <div className="storefront-stat-item">
              <span className="storefront-rating-star">★</span>
              <strong>4.9</strong> <span className="storefront-reviews-count" onClick={() => setActiveTab('reviews')}>(124 Reviews)</span>
            </div>
            <div className="storefront-stat-divider"></div>
            <div className="storefront-stat-item">
              <strong>1.2k</strong> followers
            </div>
            <div className="storefront-stat-divider"></div>
            <div className="storefront-stat-item">
              <strong>850</strong> sold items
            </div>
          </div>

          <div className="storefront-tags-row">
            <span className="storefront-tag">#minimalist</span>
            <span className="storefront-tag">#90svintage</span>
            <span className="storefront-tag">#sustainability</span>
            <span className="storefront-tag">#designerarchive</span>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="storefront-tabs-container">
        <div className="storefront-tabs-inner">
          <ul className="storefront-tabs-list">
            <li 
              className={`storefront-tab-item ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              Active Listings ({activeListings.length})
            </li>
            <li 
              className={`storefront-tab-item ${activeTab === 'sold' ? 'active' : ''}`}
              onClick={() => setActiveTab('sold')}
            >
              Sold Items
            </li>
            <li 
              className={`storefront-tab-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </li>
            <li 
              className={`storefront-tab-item ${activeTab === 'impact' ? 'active' : ''}`}
              onClick={() => setActiveTab('impact')}
            >
              Sustainability Impact
            </li>
          </ul>

          {(activeTab === 'listings') && (
            <div className="storefront-sort-container">
              <span className="storefront-sort-label">Sort by:</span>
              <select 
                className="storefront-sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Tab Content */}
      <main className="storefront-tab-content-area">
        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <>
            <div className="storefront-products-grid">
              {sortedListings.slice(0, listingsLimit).map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  variant="browse"
                  hideHeart={true}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </div>

            {listingsLimit < activeListings.length && (
              <div className="storefront-load-more-wrapper">
                <button 
                  className="storefront-btn-load-more"
                  onClick={handleLoadMore}
                >
                  Load More Items
                </button>
              </div>
            )}
          </>
        )}

        {/* Sold Items Tab */}
        {activeTab === 'sold' && (
          <div className="storefront-products-grid">
            {/* Show a sub-grid of base items styled as sold */}
            {storefrontProducts.slice(0, 4).map((product) => (
              <div key={`sold-${product.id}`} className="storefront-sold-overlay-container">
                <div className="storefront-sold-tag">Sold</div>
                <ProductCard 
                  product={product}
                  variant="browse"
                  hideHeart={true}
                  onClick={() => showToast('This item is already sold!')}
                />
              </div>
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="storefront-reviews-list">
            {reviewsData.map((review) => (
              <div key={review.id} className="storefront-review-card">
                <div className="storefront-review-header">
                  <div className="storefront-review-author-info">
                    <div className="storefront-review-author-avatar">
                      {review.author.charAt(0)}
                    </div>
                    <div className="storefront-review-author-details">
                      <span className="storefront-review-author-name">{review.author}</span>
                      <span className="storefront-review-date">{review.date}</span>
                    </div>
                  </div>
                  <div className="storefront-review-rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                <p className="storefront-review-content">"{review.content}"</p>
                <div className="storefront-review-item-tag">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span>{review.item}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sustainability Impact Tab */}
        {activeTab === 'impact' && (
          <div className="storefront-sustainability-view">
            <div className="storefront-sustainability-intro">
              <h2>Elena's Circular Fashion Impact</h2>
              <p>
                Shopping vintage extends the lifecycle of quality garments, saving natural resources and keeping textiles out of landfills. Here is the cumulative impact of all purchases made from CuratedByElena.
              </p>
            </div>

            <div className="storefront-impact-grid">
              <div className="storefront-impact-card">
                <div className="storefront-impact-icon-wrapper">
                  {/* Leaf Icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="storefront-impact-icon">
                    <path d="M2 22c1.25-5.822 5.577-10.925 11.235-13.064C12.18 10.97 12 13.065 12 15c0 3.866 3.134 7 7 7h3v-3c0-7.732-6.268-14-14-14C4.37 5 2.18 8.847 2 13.784" />
                  </svg>
                </div>
                <div className="storefront-impact-value">195 kg</div>
                <div className="storefront-impact-label">CO2e Saved</div>
                <p className="storefront-impact-desc">Equivalent to driving 500 miles in an average passenger car.</p>
              </div>

              <div className="storefront-impact-card">
                <div className="storefront-impact-icon-wrapper">
                  {/* Water Droplet Icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="storefront-impact-icon">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                </div>
                <div className="storefront-impact-value">12.4k L</div>
                <div className="storefront-impact-label">Water Saved</div>
                <p className="storefront-impact-desc">Equivalent to the amount used to fill more than 80 household bathtubs.</p>
              </div>

              <div className="storefront-impact-card">
                <div className="storefront-impact-icon-wrapper">
                  {/* Recycle Icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="storefront-impact-icon">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                </div>
                <div className="storefront-impact-value">24 items</div>
                <div className="storefront-impact-label">Waste Diverted</div>
                <p className="storefront-impact-desc">Quality garments kept in circulation rather than entering the waste stream.</p>
              </div>
            </div>

            <div className="storefront-sustainability-details">
              <h3 className="storefront-details-heading">Our Sustainability Methodology</h3>
              <p className="storefront-details-text">
                Every pre-loved item represents a direct saving in manufacturing resources. By using standard life cycle assessment (LCA) values, we calculate the estimated resources saved compared to buying the same garments brand new.
              </p>
              
              <div className="storefront-details-list">
                <div className="storefront-detail-bullet">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="storefront-bullet-icon">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div className="storefront-bullet-content">
                    <h4>High-Quality Fabrics</h4>
                    <p>We prioritize natural, premium fibers (silk, wool, cashmere, thick cotton denims) which have a longer physical lifecycle and maintain look and feel over decades.</p>
                  </div>
                </div>

                <div className="storefront-detail-bullet">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="storefront-bullet-icon">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div className="storefront-bullet-content">
                    <h4>Eco-Friendly Shipments</h4>
                    <p>All storefront orders are packaged in 100% compostable mailers with recycled tissue wrap and FSC-certified paper details.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Storefront;
