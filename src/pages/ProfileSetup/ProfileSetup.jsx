import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import './ProfileSetup.css';

const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Faisalabad',
  'Multan',
];

function ProfileSetup() {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
      if (profile.bio) setBio(profile.bio);
      if (profile.city) setCity(profile.city);
    }
  }, [profile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Please enter your display name'); return; }
    if (!city) { setError('Please select your city'); return; }

    setLoading(true);
    try {
      let avatar_url = profile?.avatar_url || null;

      if (avatarFile) {
        try {
          avatar_url = await uploadAvatar(avatarFile);
        } catch (avatarErr) {
          console.warn('Avatar upload failed (bucket may not exist yet):', avatarErr.message);
          // Continue without avatar — don't block profile setup
        }
      }

      const updates = {
        name: name.trim(),
        city,
        bio: bio.trim() || null,
        avatar_url,
        profile_complete: true,
      };

      await updateProfile(updates);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Allow skipping optional fields but still need name + city
    // This button is just for the page design — skipping goes home
    navigate('/');
  };

  return (
    <div className="ps-page">
      {/* Animated background blobs */}
      <div className="ps-blob ps-blob-1" />
      <div className="ps-blob ps-blob-2" />

      <div className="ps-container">
        {/* Header */}
        <div className="ps-header">
          <div className="ps-logo">SecondLife</div>
          <div className="ps-step-badge">Profile Setup</div>
        </div>

        <div className="ps-card">
          <div className="ps-card-header">
            <h1 className="ps-title">Set Up Your Profile</h1>
            <p className="ps-subtitle">Tell us a bit about yourself to get started. You can update this anytime.</p>
          </div>

          {error && <div className="ps-error">{error}</div>}

          <form onSubmit={handleSubmit} className="ps-form">
            {/* Avatar Upload */}
            <div className="ps-avatar-section">
              <div className="ps-avatar-wrapper">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="ps-avatar-preview" />
                ) : (
                  <div className="ps-avatar-placeholder">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <label htmlFor="avatarUpload" className="ps-avatar-edit-btn" title="Upload photo">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </label>
                <input
                  type="file"
                  id="avatarUpload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="ps-avatar-hint">
                <span className="ps-optional-tag">Optional</span>
                <span>Profile photo</span>
              </div>
            </div>

            {/* Name — required */}
            <div className="ps-field">
              <label htmlFor="ps-name" className="ps-label">
                Display Name <span className="ps-required">*</span>
              </label>
              <input
                id="ps-name"
                type="text"
                className="ps-input"
                placeholder="e.g. Aisha Khan"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={50}
                required
              />
            </div>

            {/* City — required */}
            <div className="ps-field">
              <label htmlFor="ps-city" className="ps-label">
                City <span className="ps-required">*</span>
              </label>
              <div className="ps-select-wrapper">
                <select
                  id="ps-city"
                  className="ps-select"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                >
                  <option value="">Select your city</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg className="ps-select-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Bio — optional */}
            <div className="ps-field">
              <label htmlFor="ps-bio" className="ps-label">
                Bio <span className="ps-optional-tag">Optional</span>
              </label>
              <textarea
                id="ps-bio"
                className="ps-textarea"
                placeholder="Tell people about your style, what you're looking for..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={200}
                rows={3}
              />
              <p className="ps-char-count">{bio.length}/200</p>
            </div>

            <div className="ps-actions">
              <button type="submit" className="ps-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="ps-spinner" />
                ) : (
                  <>
                    Save & Continue
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
              <button type="button" className="ps-skip-btn" onClick={handleSkip}>
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;
