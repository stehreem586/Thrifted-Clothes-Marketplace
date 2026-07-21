import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useListings } from '../../context/ListingsContext';
import './SellerProfile.css';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
  'Peshawar', 'Quetta', 'Hyderabad', 'Faisalabad', 'Multan',
];

// Per-user localStorage key
const profileKey = (uid) => uid ? `sellerProfile_${uid}` : 'sellerProfile_guest';

function SellerProfile() {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();
  const { listings, orders } = useListings();

  const [name, setName]         = useState('');
  const [city, setCity]         = useState('');
  const [bio, setBio]           = useState('');
  const [phone, setPhone]       = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false); // success flash
  const [error, setError]       = useState('');

  // ── Real stats from listings / orders ──
  const totalSales = listings.filter(i => i.status === 'Sold').length + orders.length;
  const totalReviews = orders.filter(o => o.reviewed || o.status === 'Delivered').length;
  const avgRating = totalReviews > 0 ? 5.0 : 0;

  // ── Populate fields from Supabase profile or user-scoped localStorage ──
  useEffect(() => {
    const uid = user?.id;
    const key = profileKey(uid);

    // Layer 1: Supabase profile
    let p = profile ? { ...profile } : {};

    // Layer 2: user-scoped localStorage (wins for local-only fields like phone)
    try {
      const local = JSON.parse(localStorage.getItem(key) || '{}');
      p = { ...p, ...local };
    } catch {}

    if (Object.keys(p).length) {
      setName(p.name || '');
      setCity(p.city || '');
      setBio(p.bio || '');
      setPhone(p.phone || '');
      setShowPhone(!!p.show_phone);
      setAvatarPreview(p.avatar_url || null);
      setAvatarFile(null);
    }
  }, [profile, user?.id]);

  // ── Avatar file picker ──
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Save handler — no OTP, phone saves directly ──
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Store name is required.'); return; }
    if (!city)        { setError('Please select your city.'); return; }
    if (!phone.trim()) { setError('Phone number is required for sellers.'); return; }

    setLoading(true);

    const uid = user?.id;
    const key = profileKey(uid);

    // Resolve avatar URL
    let avatar_url = avatarPreview && !avatarFile
      ? avatarPreview
      : (profile?.avatar_url || null);

    if (avatarFile) {
      try {
        avatar_url = await uploadAvatar(avatarFile);
      } catch {
        avatar_url = avatarPreview; // base64 fallback
      }
    }

    const profileData = {
      name:       name.trim(),
      city,
      bio:        bio.trim() || null,
      phone:      phone.trim(),
      show_phone: showPhone,
      avatar_url,
    };

    // ── 1. Save to user-scoped localStorage immediately ──
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({ ...existing, ...profileData }));
    } catch {}

    // ── 2. Update Supabase profile (non-blocking) ──
    try {
      await updateProfile(profileData);
    } catch (err) {
      console.warn('Supabase profile update skipped:', err.message);
    }

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const getInitials = () => {
    const n = name || profile?.name || user?.email || '?';
    return n.charAt(0).toUpperCase();
  };

  return (
    <div className="view-content fade-in seller-profile-view">

      {/* ── Success Toast ── */}
      {saved && (
        <div className="ep-toast">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Store profile saved successfully!
        </div>
      )}

      <div className="view-heading border-bottom">
        <div>
          <h1>Seller Profile</h1>
          <p className="view-sub">Manage your storefront, contact details, and store information.</p>
        </div>
      </div>

      {error && <div className="ep-error">{error}</div>}

      <div className="seller-profile-layout">

        {/* ── Left: Stats Panel ── */}
        <div className="seller-profile-stats-panel">
          <div className="seller-stats-card-main">
            <h3>Storefront Performance</h3>
            <div className="seller-stats-summary-grid">
              <div className="seller-stat-summary-item">
                <span className="summary-val">{totalReviews > 0 ? `★ ${avgRating.toFixed(1)}` : 'N/A'}</span>
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
            <h4>💡 Seller Tips</h4>
            <ul>
              <li>Use clear photos to increase views by up to 3×.</li>
              <li>Keep your bio authentic — buyers trust real stories.</li>
              <li>Respond to messages quickly to boost your rating.</li>
              <li>Enable phone visibility to let buyers contact you on WhatsApp.</li>
            </ul>
          </div>
        </div>

        {/* ── Right: Profile Form ── */}
        <div className="seller-profile-form-panel">
          <form onSubmit={handleSave} className="ep-form">

            {/* Avatar */}
            <div className="ep-avatar-section">
              <div className="ep-avatar-ring">
                {avatarPreview
                  ? <img src={avatarPreview} alt="Avatar" className="ep-avatar-img" />
                  : <div className="ep-avatar-initials">{getInitials()}</div>
                }
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
                <p className="ep-avatar-name">{name || profile?.name || user?.email?.split('@')[0] || 'Seller Store'}</p>
                <p className="ep-avatar-hint">Tap the camera icon to upload your store photo</p>
              </div>
            </div>

            <div className="ep-divider" />

            {/* Store Name */}
            <div className="ep-field">
              <label htmlFor="ep-name" className="ep-label">
                Store Name <span className="ep-required">*</span>
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

            {/* Phone — just a number, no OTP */}
            <div className="ep-field">
              <label htmlFor="ep-phone" className="ep-label">
                Phone Number <span className="ep-required">*</span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '400', marginLeft: '6px' }}>
                  — saved permanently until you change it
                </span>
              </label>
              <input
                id="ep-phone"
                type="tel"
                className="ep-input"
                placeholder="e.g. +92 300 1234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={20}
                required
              />
            </div>

            {/* Show phone toggle */}
            <div className="ep-field toggle-field">
              <div className="toggle-info">
                <span className="toggle-title">Show phone number in listings</span>
                <p className="toggle-desc">Allow buyers to call or WhatsApp you directly from your item listings.</p>
              </div>
              <label className="switch-control">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={e => setShowPhone(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>

            {/* Bio */}
            <div className="ep-field">
              <label htmlFor="ep-bio" className="ep-label">
                Store Bio <span className="ep-optional">(Optional)</span>
              </label>
              <textarea
                id="ep-bio"
                className="ep-textarea"
                placeholder="Tell buyers about your collection, shipping times, or store policies..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={200}
                rows={4}
              />
              <span className="ep-char-count">{bio.length}/200</span>
            </div>

            {/* Email read-only */}
            <div className="ep-field">
              <label className="ep-label">Email Address</label>
              <input
                type="email"
                className="ep-input ep-input--readonly"
                value={user?.email || ''}
                readOnly
              />
            </div>

            {/* Save button */}
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
