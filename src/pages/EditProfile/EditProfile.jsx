import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './EditProfile.css';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
  'Peshawar', 'Quetta', 'Hyderabad', 'Faisalabad', 'Multan',
];

function EditProfile({ isOpen, onClose }) {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();

  const [name, setName]             = useState('');
  const [city, setCity]             = useState('');
  const [bio, setBio]               = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(false);
  const [error, setError]           = useState('');
  const panelRef = useRef(null);

  // Populate fields when panel opens
  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || '');
      setCity(profile.city || '');
      setBio(profile.bio || '');
      setAvatarPreview(profile.avatar_url || null);
      setAvatarFile(null);
      setError('');
      setToast(false);
    }
  }, [isOpen, profile]);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

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
    if (!city)        { setError('Please select a city');    return; }

    setLoading(true);
    try {
      let avatar_url = profile?.avatar_url || null;

      if (avatarFile) {
        try {
          avatar_url = await uploadAvatar(avatarFile);
        } catch (avatarErr) {
          console.warn('Avatar upload skipped:', avatarErr.message);
        }
      }

      await updateProfile({
        name: name.trim(),
        city,
        bio: bio.trim() || null,
        avatar_url,
        profile_complete: true,
      });

      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const n = profile?.name || user?.email || '';
    return n.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Backdrop */}
      <div className={`ep-backdrop ${isOpen ? 'ep-backdrop--visible' : ''}`} onClick={onClose} />

      {/* Slide-in Panel */}
      <div className={`ep-panel ${isOpen ? 'ep-panel--open' : ''}`} ref={panelRef}>

        {/* Success Toast */}
        {toast && (
          <div className="ep-toast">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Profile updated!
          </div>
        )}

        {/* Panel Header */}
        <div className="ep-header">
          <div>
            <h2 className="ep-title">Edit Profile</h2>
            <p className="ep-subtitle">Changes save directly to your account</p>
          </div>
          <button className="ep-close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="ep-body">
          {error && <div className="ep-error">{error}</div>}

          <form onSubmit={handleSave} className="ep-form">

            {/* Avatar */}
            <div className="ep-avatar-section">
              <div className="ep-avatar-ring">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="ep-avatar-img" />
                ) : (
                  <div className="ep-avatar-initials">{getInitials()}</div>
                )}
                <label htmlFor="ep-avatar-input" className="ep-avatar-edit" title="Change photo">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </label>
                <input
                  id="ep-avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="ep-avatar-info">
                <p className="ep-avatar-name">{profile?.name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="ep-avatar-hint">Tap the camera icon to change photo</p>
              </div>
            </div>

            {/* Divider */}
            <div className="ep-divider" />

            {/* Display Name */}
            <div className="ep-field">
              <label htmlFor="ep-name" className="ep-label">
                Display Name <span className="ep-required">*</span>
              </label>
              <input
                id="ep-name"
                type="text"
                className="ep-input"
                placeholder="e.g. Aisha Khan"
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

            {/* Bio */}
            <div className="ep-field">
              <label htmlFor="ep-bio" className="ep-label">
                Bio <span className="ep-optional">(Optional)</span>
              </label>
              <textarea
                id="ep-bio"
                className="ep-textarea"
                placeholder="Tell people about your style..."
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
              <p className="ep-hint">Email cannot be changed here</p>
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
                  Save Changes
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}

export default EditProfile;
