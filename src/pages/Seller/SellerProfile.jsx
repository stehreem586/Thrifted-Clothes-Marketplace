import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import './SellerProfile.css';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
  'Peshawar', 'Quetta', 'Hyderabad', 'Faisalabad', 'Multan',
];

function SellerProfile() {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [error, setError] = useState('');

  // Stats states
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  // Populate fields
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCity(profile.city || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setShowPhone(!!profile.show_phone);
      setAvatarPreview(profile.avatar_url || null);
      setAvatarFile(null);
      setError('');
    }
  }, [profile]);

  // Fetch stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        // 1. Fetch reviews for total reviews and average rating
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('seller_id', user.id);

        if (!reviewsError && reviewsData) {
          setTotalReviews(reviewsData.length);
          if (reviewsData.length > 0) {
            const sum = reviewsData.reduce((acc, curr) => acc + (curr.rating || 0), 0);
            setAvgRating((sum / reviewsData.length).toFixed(1));
          } else {
            setAvgRating(0);
          }
        }

        // 2. Fetch sales (listings where seller_id = user.id and status = sold)
        const { count, error: salesError } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id)
          .eq('status', 'sold');

        if (!salesError) {
          setTotalSales(count || 0);
        }
      } catch (err) {
        console.error('Error fetching seller stats:', err);
      }
    };

    fetchStats();
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Display name is required'); return; }
    if (!city) { setError('Please select a city'); return; }

    setLoading(true);
    try {
      let avatar_url = profile?.avatar_url || null;

      if (avatarFile) {
        try {
          avatar_url = await uploadAvatar(avatarFile);
        } catch (avatarErr) {
          console.warn('Avatar upload skipped/failed:', avatarErr.message);
        }
      }

      // Try updating with all fields (including phone & show_phone)
      await updateProfile({
        name: name.trim(),
        city,
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        show_phone: showPhone,
        avatar_url,
      });

      setToast({ show: true, message: 'Selling profile updated successfully!', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
      if (err.message && (err.message.includes('phone') || err.message.includes('column'))) {
        setError(
          'Note: If database columns for phone number are missing, please add "phone" (text) and "show_phone" (boolean) columns to your Supabase "profiles" table. Attempting to save without them...'
        );
        // Fallback update without phone columns
        try {
          await updateProfile({
            name: name.trim(),
            city,
            bio: bio.trim() || null,
            avatar_url,
          });
          setToast({ show: true, message: 'Profile updated (phone columns missing in DB)!', type: 'warning' });
          setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
        } catch (fallbackErr) {
          setError(fallbackErr.message || 'Failed to save profile.');
        }
      } else {
        setError(err.message || 'Failed to save profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const n = profile?.name || user?.email || '';
    return n.charAt(0).toUpperCase();
  };

  return (
    <div className="view-content fade-in seller-profile-view">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`ep-toast ${toast.type === 'warning' ? 'warning' : ''}`}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast.message}
        </div>
      )}

      <div className="view-heading border-bottom">
        <div>
          <h1>View Selling Profile</h1>
          <p className="view-sub">Manage your brand storefront details, contact, and check stats.</p>
        </div>
      </div>

      {error && <div className="ep-error">{error}</div>}

      <div className="seller-profile-layout">
        {/* Left Side: Stats and Info Cards */}
        <div className="seller-profile-stats-panel">
          <div className="seller-stats-card-main">
            <h3>Storefront Performance</h3>
            <div className="seller-stats-summary-grid">
              <div className="seller-stat-summary-item">
                <span className="summary-val">{avgRating > 0 ? `★ ${avgRating}` : 'N/A'}</span>
                <span className="summary-lbl">Average Rating</span>
              </div>
              <div className="seller-stat-summary-item">
                <span className="summary-val">{totalReviews}</span>
                <span className="summary-lbl">Total Reviews</span>
              </div>
              <div className="seller-stat-summary-item">
                <span className="summary-val">{totalSales}</span>
                <span className="summary-lbl">Total Sales</span>
              </div>
            </div>
          </div>

          <div className="seller-tips-card">
            <h4>💡 Seller Success Tips</h4>
            <ul>
              <li>Keep your bio authentic and style-focused to build customer trust.</li>
              <li>Toggle "Show my phone number" to allow buyers to contact you directly on WhatsApp/SMS.</li>
              <li>Provide accurate item descriptions to maintain a high average rating.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Form (Same interface as buyer opens, but with custom fields) */}
        <div className="seller-profile-form-panel">
          <form onSubmit={handleSave} className="ep-form">
            {/* Avatar Section */}
            <div className="ep-avatar-section">
              <div className="ep-avatar-ring">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="ep-avatar-img" />
                ) : (
                  <div className="ep-avatar-initials">{getInitials()}</div>
                )}
                <label htmlFor="seller-avatar-input" className="ep-avatar-edit" title="Change photo">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </label>
                <input
                  id="seller-avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="ep-avatar-info">
                <p className="ep-avatar-name">{profile?.name || user?.email?.split('@')[0] || 'Seller Store'}</p>
                <p className="ep-avatar-hint">Tap the camera icon to upload storefront logo or photo</p>
              </div>
            </div>

            <div className="ep-divider" />

            {/* Display Name */}
            <div className="ep-field">
              <label htmlFor="ep-name" className="ep-label">
                Display Name (Store Name) <span className="ep-required">*</span>
              </label>
              <input
                id="ep-name"
                type="text"
                className="ep-input"
                placeholder="e.g. Vintage Vibes"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={50}
                required
              />
            </div>

            {/* City */}
            <div className="ep-field">
              <label htmlFor="ep-city" className="ep-label">
                City <span className="ep-required">*</span>
              </label>
              <div className="ep-select-wrapper">
                <select
                  id="ep-city"
                  className="ep-select"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                >
                  <option value="">Select your city</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg className="ep-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Phone Number */}
            <div className="ep-field">
              <label htmlFor="ep-phone" className="ep-label">
                Phone Number <span className="ep-optional">(Optional)</span>
              </label>
              <input
                id="ep-phone"
                type="tel"
                className="ep-input"
                placeholder="e.g. +92 300 1234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={20}
              />
            </div>

            {/* Enable/Disable Toggle */}
            <div className="ep-field toggle-field">
              <div className="toggle-info">
                <span className="toggle-title">Show phone number in ads</span>
                <p className="toggle-desc">Allow prospective buyers to call or WhatsApp you directly from item listings.</p>
              </div>
              <label className="switch-control">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={e => setShowPhone(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            {/* Bio */}
            <div className="ep-field">
              <label htmlFor="ep-bio" className="ep-label">
                Store Bio / Description <span className="ep-optional">(Optional)</span>
              </label>
              <textarea
                id="ep-bio"
                className="ep-textarea"
                placeholder="Tell buyers about your curated collection, shipping times, or shop rules..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={200}
                rows={4}
              />
              <span className="ep-char-count">{bio.length}/200</span>
            </div>

            {/* Email (read-only) */}
            <div className="ep-field">
              <label className="ep-label">Email Address</label>
              <input
                type="email"
                className="ep-input ep-input--readonly"
                value={user?.email || ''}
                readOnly
              />
            </div>

            {/* Save Button */}
            <button type="submit" className="ep-save-btn" disabled={loading}>
              {loading ? (
                <span className="ep-spinner" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save Store Details
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SellerProfile;
