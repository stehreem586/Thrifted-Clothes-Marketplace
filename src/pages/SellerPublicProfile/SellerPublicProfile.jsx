import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import ProductCard from '../../components/ProductCard/ProductCard';
import './SellerPublicProfile.css';

// Fallback mock database for preview if UUID is not found in database
const MOCK_SELLERS = {
  'vintage-vibes': {
    name: 'Vintage Vibes',
    city: 'Lahore',
    bio: 'Curating the best vintage streetwear & retro fashion in Pakistan. Quality guaranteed. Standard shipping nationwide.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    rating: 4.8,
    reviews_count: 36,
    sales_count: 23,
    phone: '+92 300 9876543',
    show_phone: true,
    listings: [
      {
        id: 101,
        title: '90s Colorblock Windbreaker',
        price: 'PKR 4,500',
        size: 'L',
        condition: 'Very Good',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80'
      },
      {
        id: 102,
        title: 'Retro Corduroy Pants',
        price: 'PKR 3,200',
        size: '32',
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80'
      },
      {
        id: 103,
        title: 'Vintage Leather Bomber Jacket',
        price: 'PKR 9,500',
        size: 'M',
        condition: 'Like New',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
      }
    ]
  },
  'elena-archive': {
    name: "Elena's Archive",
    city: 'Karachi',
    bio: 'Premium pre-loved designer clothing. Fast shipping and detailed inspections on all products.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    rating: 4.9,
    reviews_count: 124,
    sales_count: 85,
    phone: '',
    show_phone: false,
    listings: [
      {
        id: 201,
        title: 'Classic Heritage Trench Coat',
        price: 'PKR 18,500',
        size: 'M',
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
      }
    ]
  }
};

function SellerPublicProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ rating: 0, reviewsCount: 0, salesCount: 0 });
  const [activeListings, setActiveListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      
      // Determine if sellerId is a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isRealUser = uuidRegex.test(sellerId);

      if (isRealUser) {
        try {
          // 1. Fetch profile
          const { data: prof, error: profError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sellerId)
            .single();

          if (profError || !prof) {
            console.warn('Profile not found in database, checking mock.');
            loadMockData();
            return;
          }

          // 2. Fetch rating and review counts
          const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('seller_id', sellerId);

          let avgR = 0;
          let revCount = 0;
          if (!reviewsError && reviews) {
            revCount = reviews.length;
            if (revCount > 0) {
              const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
              avgR = (sum / revCount).toFixed(1);
            }
          }

          // 3. Fetch sales count (listings with status = sold)
          const { count: salesCount, error: salesError } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', sellerId)
            .eq('status', 'sold');

          // 4. Fetch active listings only
          const { data: listings, error: listingsError } = await supabase
            .from('listings')
            .select('*')
            .eq('seller_id', sellerId)
            .eq('status', 'active');

          setProfileData(prof);
          setStats({
            rating: avgR,
            reviewsCount: revCount,
            salesCount: salesError ? 0 : (salesCount || 0)
          });
          setActiveListings(listingsError ? [] : (listings || []));
        } catch (err) {
          console.error('Error loading public profile from DB:', err);
          loadMockData();
        }
      } else {
        loadMockData();
      }
      setLoading(false);
    };

    const loadMockData = () => {
      // Find matching mock or fallback to 'vintage-vibes'
      const key = MOCK_SELLERS[sellerId] ? sellerId : 'vintage-vibes';
      const mock = MOCK_SELLERS[key];

      setProfileData({
        id: key,
        name: mock.name,
        city: mock.city,
        bio: mock.bio,
        avatar_url: mock.avatar_url,
        phone: mock.phone,
        show_phone: mock.show_phone
      });

      setStats({
        rating: mock.rating,
        reviewsCount: mock.reviews_count,
        salesCount: mock.sales_count
      });

      setActiveListings(mock.listings);
    };

    loadProfileData();
  }, [sellerId]);

  const handleChatClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    // Navigate to chat and pass seller info so we can open a new thread
    navigate(`/chat?sellerId=${profileData.id}&name=${encodeURIComponent(profileData.name)}&avatar=${encodeURIComponent(profileData.avatar_url || '')}`);
  };

  if (loading) {
    return (
      <div className="profile-loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  const initials = profileData?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="public-profile-container">
      {/* Login Alert Modal for Guest Users */}
      {showLoginModal && (
        <div className="login-modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Login Required</h3>
            <p>You must be logged in to chat with sellers and make offers on listings.</p>
            <div className="modal-buttons">
              <button className="secondary-btn" onClick={() => setShowLoginModal(false)}>Cancel</button>
              <button className="primary-btn" onClick={() => navigate('/login')}>Log In</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Store Header */}
      <div className="profile-hero-card">
        <div className="profile-hero-bg"></div>
        <div className="profile-hero-details">
          <div className="profile-hero-avatar-wrapper">
            {profileData?.avatar_url ? (
              <img src={profileData.avatar_url} alt={profileData.name} className="profile-hero-avatar" />
            ) : (
              <div className="profile-hero-avatar-initials">{initials}</div>
            )}
          </div>
          <div className="profile-hero-main-info">
            <div className="profile-hero-name-row">
              <h1>{profileData?.name}</h1>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#c19358" stroke="#ffffff" strokeWidth="2" className="verified-badge">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            {profileData?.city && <p className="profile-hero-location">📍 {profileData.city}, Pakistan</p>}
            <p className="profile-hero-bio">{profileData?.bio || "No storefront bio added yet."}</p>

            {profileData?.show_phone && profileData?.phone && (
              <p className="profile-hero-phone">📞 Contact: {profileData.phone}</p>
            )}
          </div>
          <div className="profile-hero-actions">
            <button className="chat-seller-btn" onClick={handleChatClick}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat with Seller
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <span className="stat-num">{stats.rating > 0 ? `★ ${stats.rating}` : 'New Seller'}</span>
          <span className="stat-lbl">Seller Rating ({stats.reviewsCount} reviews)</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-num">{stats.salesCount}</span>
          <span className="stat-lbl">Total Items Sold</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-num">{activeListings.length}</span>
          <span className="stat-lbl">Active Listings</span>
        </div>
      </div>

      {/* Listings Section */}
      <div className="profile-listings-section">
        <h2>Active Listings ({activeListings.length})</h2>
        {activeListings.length > 0 ? (
          <div className="profile-listings-grid">
            {activeListings.map(listing => (
              <ProductCard
                key={listing.id}
                product={{
                  id: listing.id,
                  title: listing.title,
                  price: typeof listing.price === 'number' ? `PKR ${listing.price.toLocaleString()}` : listing.price,
                  size: listing.size ? `Size ${listing.size}` : '',
                  image: listing.image || listing.image_url || 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
                  wishlisted: false,
                  category: listing.category
                }}
                variant="browse"
                onClick={() => navigate(`/product/${listing.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="no-listings-card">
            <h3>No Active Listings</h3>
            <p>This seller does not have any items listed for sale currently.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerPublicProfile;
