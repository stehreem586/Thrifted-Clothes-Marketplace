import React, { useState, useRef } from 'react';
import './Settings.css';

const initialProfileState = {
  fullName: 'Julianne Vane',
  username: 'jules_vane',
  email: 'julianne.vane@example.com',
  profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  googleConnected: true,
  googleEmail: 'julianne.vane@gmail.com'
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'notifications', 'privacy', 'shipping'
  const [profile, setProfile] = useState(initialProfileState);
  const [passwords, setPasswords] = useState({ current: '••••••••', new: '••••••••' });
  const [notificationSettings, setNotificationSettings] = useState({
    newArrivals: true,
    offers: true,
    orderUpdates: true,
    messages: true,
    securityAlerts: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    searchIndexing: false,
    analytics: true
  });
  
  // Shipping details state
  const [shippingAddress, setShippingAddress] = useState({
    street: '123 SecondLife Way, Suite A',
    cityStateZip: 'New York, NY 10001',
    country: 'United States'
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef(null);

  // Trigger Toast Notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Profile Form Handlers
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  // Image Upload Logic
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        showToast('Image size exceeds 800K limit', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profilePic: reader.result }));
        showToast('Profile picture uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfile(prev => ({ ...prev, profilePic: null }));
    showToast('Profile picture removed');
  };

  // Disconnect Google account toggle
  const handleGoogleToggle = () => {
    if (profile.googleConnected) {
      setProfile(prev => ({ ...prev, googleConnected: false }));
      showToast('Disconnected from Google Account', 'info');
    } else {
      setProfile(prev => ({ ...prev, googleConnected: true }));
      showToast('Successfully connected to Google Account', 'success');
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setProfile(initialProfileState);
    setPasswords({ current: '••••••••', new: '••••••••' });
    showToast('Changes discarded', 'info');
  };

  // Save changes
  const handleSaveChanges = (e) => {
    e.preventDefault();
    showToast('Profile settings saved successfully');
  };

  // Update password action
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwords.new === '••••••••' || passwords.new === '') {
      showToast('Please enter a valid new password', 'error');
      return;
    }
    showToast('Password updated successfully');
    setPasswords({ current: '••••••••', new: '••••••••' });
  };

  const handleLogOut = () => {
    localStorage.removeItem('userRole');
    showToast('Logging out...', 'info');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="settings-page-wrapper">
      {/* Visual Toast Notification */}
      {toast.show && (
        <div className={`settings-toast ${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' && (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="settings-layout-container">
        {/* LEFT SIDEBAR */}
        <aside className="settings-sidebar">
          <h2 className="sidebar-main-title">Settings</h2>
          
          <ul className="sidebar-menu-list">
            <li>
              <button 
                type="button" 
                className={`sidebar-menu-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Account</span>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className={`sidebar-menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Notifications</span>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className={`sidebar-menu-item ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Privacy</span>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className={`sidebar-menu-item ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Shipping</span>
              </button>
            </li>
          </ul>

          <div className="sidebar-divider"></div>

          <button 
            type="button" 
            className="sidebar-menu-item logout-menu-btn"
            onClick={handleLogOut}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log Out</span>
          </button>
        </aside>

        {/* RIGHT CONTENT PANEL */}
        <main className="settings-main-content">
          {activeTab === 'account' && (
            <div className="settings-panel">
              <div className="panel-header-section">
                <h1 className="panel-title">Account Settings</h1>
                <p className="panel-subtitle">Manage your public profile and account details.</p>
              </div>

              {/* Profile Picture Card */}
              <div className="settings-card profile-pic-card">
                <div className="avatar-uploader-row">
                  <div className="avatar-preview-container" onClick={handleUploadClick} title="Upload new photo">
                    {profile.profilePic ? (
                      <img src={profile.profilePic} alt={profile.fullName} className="avatar-img" />
                    ) : (
                      <div className="avatar-placeholder">
                        {profile.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <button type="button" className="avatar-edit-overlay" aria-label="Upload Photo">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="uploader-text-actions">
                    <span className="uploader-title">Profile Picture</span>
                    <span className="uploader-description">JPG, GIF or PNG. Max size of 800K.</span>
                    <div className="uploader-buttons">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        style={{ display: 'none' }}
                      />
                      <button type="button" className="settings-btn-primary upload-btn" onClick={handleUploadClick}>
                        Upload New
                      </button>
                      <button type="button" className="settings-btn-secondary remove-btn" onClick={handleRemovePhoto}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Form Fields */}
              <form onSubmit={handleSaveChanges} className="account-form">
                <div className="form-row-two-cols">
                  <div className="form-input-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input 
                      type="text" 
                      id="fullName" 
                      name="fullName"
                      value={profile.fullName} 
                      onChange={handleProfileInputChange}
                      placeholder="e.g. Julianne Vane"
                      required
                    />
                  </div>
                  <div className="form-input-group">
                    <label htmlFor="username">Username</label>
                    <input 
                      type="text" 
                      id="username" 
                      name="username"
                      value={profile.username} 
                      onChange={handleProfileInputChange}
                      placeholder="e.g. jules_vane"
                      required
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={profile.email} 
                    onChange={handleProfileInputChange}
                    placeholder="e.g. julianne.vane@example.com"
                    required
                  />
                </div>

                {/* Connected Accounts Section */}
                <div className="form-divider-section">
                  <h3 className="section-header-title">Connected Accounts</h3>
                  <div className="settings-card connected-account-card">
                    <div className="connected-row">
                      <div className="provider-info-group">
                        <div className="provider-logo-circle google-logo">
                          <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                        </div>
                        <div className="provider-details">
                          <span className="provider-name">Google</span>
                          <span className="provider-subtext">
                            {profile.googleConnected 
                              ? `Connected as ${profile.googleEmail}` 
                              : 'Not connected'}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        type="button" 
                        className={`disconnect-text-btn ${!profile.googleConnected ? 'connect-style' : ''}`}
                        onClick={handleGoogleToggle}
                      >
                        {profile.googleConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="form-divider-section">
                  <h3 className="section-header-title">Change Password</h3>
                  <div className="password-fields-card">
                    <div className="form-input-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input 
                        type="password" 
                        id="currentPassword" 
                        name="current"
                        value={passwords.current} 
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="form-input-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input 
                        type="password" 
                        id="newPassword" 
                        name="new"
                        value={passwords.new} 
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <button type="button" className="update-password-btn" onClick={handleUpdatePassword}>
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Footer Save Row */}
                <div className="settings-footer-actions-row">
                  <div className="bottom-divider"></div>
                  <div className="buttons-group">
                    <button type="button" className="discard-changes-btn" onClick={handleDiscardChanges}>
                      Discard Changes
                    </button>
                    <button type="submit" className="save-profile-btn">
                      Save Profile
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <div className="panel-header-section">
                <h1 className="panel-title">Notifications</h1>
                <p className="panel-subtitle">Configure how you receive updates and communications.</p>
              </div>

              <div className="settings-card toggle-settings-card">
                <h3 className="section-header-title">Email Communications</h3>
                
                <label className="toggle-row">
                  <div className="toggle-label-desc">
                    <span className="toggle-label">New Arrivals Alerts</span>
                    <span className="toggle-desc">Receive notifications when pre-loved clothing matching your tastes is listed.</span>
                  </div>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.newArrivals}
                      onChange={() => setNotificationSettings(p => ({ ...p, newArrivals: !p.newArrivals }))}
                    />
                    <span className="slider round"></span>
                  </div>
                </label>

                <label className="toggle-row">
                  <div className="toggle-label-desc">
                    <span className="toggle-label">Saved Item Discounts</span>
                    <span className="toggle-desc">Notify me when price drops on items in my saved list.</span>
                  </div>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.offers}
                      onChange={() => setNotificationSettings(p => ({ ...p, offers: !p.offers }))}
                    />
                    <span className="slider round"></span>
                  </div>
                </label>

                <label className="toggle-row">
                  <div className="toggle-label-desc">
                    <span className="toggle-label">Order Updates</span>
                    <span className="toggle-desc">Get emails about order confirmation, shipping, and delivery status.</span>
                  </div>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.orderUpdates}
                      onChange={() => setNotificationSettings(p => ({ ...p, orderUpdates: !p.orderUpdates }))}
                    />
                    <span className="slider round"></span>
                  </div>
                </label>
              </div>

              <div className="settings-card toggle-settings-card">
                <h3 className="section-header-title">App Notifications</h3>
                
                <label className="toggle-row">
                  <div className="toggle-label-desc">
                    <span className="toggle-label">Direct Messages</span>
                    <span className="toggle-desc">Notify when buyers or sellers send messages in chat.</span>
                  </div>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.messages}
                      onChange={() => setNotificationSettings(p => ({ ...p, messages: !p.messages }))}
                    />
                    <span className="slider round"></span>
                  </div>
                </label>

                <label className="toggle-row">
                  <div className="toggle-label-desc">
                    <span className="toggle-label">Security Alerts</span>
                    <span className="toggle-desc">Notify about login attempts from new locations or devices.</span>
                  </div>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.securityAlerts}
                      onChange={() => setNotificationSettings(p => ({ ...p, securityAlerts: !p.securityAlerts }))}
                    />
                    <span className="slider round"></span>
                  </div>
                </label>
              </div>

              <div className="settings-footer-actions-row">
                <div className="buttons-group right-aligned">
                  <button type="button" className="save-profile-btn" onClick={() => showToast('Notification settings updated')}>
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-panel">
              <div className="panel-header-section">
                <h1 className="panel-title">Privacy Settings</h1>
                <p className="panel-subtitle">Manage your profile visibility and data options.</p>
              </div>

              <div className="settings-card toggle-settings-card">
                <h3 className="section-header-title">Visibility</h3>
                
                <label className="toggle-row">
                  <div className="toggle-label-desc">
                    <span className="toggle-label">Public Saved Items</span>
                    <span className="toggle-desc">Allow other users to browse the items you have saved.</span>
                  </div>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={privacySettings.publicProfile}
                      onChange={() => setPrivacySettings(p => ({ ...p, publicProfile: !p.publicProfile }))}
                    />
                    <span className="slider round"></span>
                  </div>
                </label>

                <label className="toggle-row">
                  <div className="toggle-label-desc">
                    <span className="toggle-label">Search Engine Indexing</span>
                    <span className="toggle-desc">Let search engines index your public store profile.</span>
                  </div>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={privacySettings.searchIndexing}
                      onChange={() => setPrivacySettings(p => ({ ...p, searchIndexing: !p.searchIndexing }))}
                    />
                    <span className="slider round"></span>
                  </div>
                </label>
              </div>

              <div className="settings-card toggle-settings-card">
                <h3 className="section-header-title">Usage & Data</h3>
                
                <label className="toggle-row">
                  <div className="toggle-label-desc">
                    <span className="toggle-label">Data Analytics</span>
                    <span className="toggle-desc">Share anonymized navigation patterns to help us improve the interface.</span>
                  </div>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={privacySettings.analytics}
                      onChange={() => setPrivacySettings(p => ({ ...p, analytics: !p.analytics }))}
                    />
                    <span className="slider round"></span>
                  </div>
                </label>
              </div>

              <div className="settings-footer-actions-row">
                <div className="buttons-group right-aligned">
                  <button type="button" className="save-profile-btn" onClick={() => showToast('Privacy settings updated')}>
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="settings-panel">
              <div className="panel-header-section">
                <h1 className="panel-title">Shipping Address</h1>
                <p className="panel-subtitle">Manage where your purchased outfits get shipped.</p>
              </div>

              <div className="settings-card address-settings-card">
                <h3 className="section-header-title">Default Address</h3>
                
                <div className="current-address-card">
                  <div className="address-icon-group">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  
                  <div className="address-details">
                    <span className="recipient-name">{profile.fullName}</span>
                    <span className="address-street">{shippingAddress.street}</span>
                    <span className="address-city-state">{shippingAddress.cityStateZip}</span>
                    <span className="address-country">{shippingAddress.country}</span>
                  </div>

                  <span className="default-badge">DEFAULT</span>
                </div>

                <div className="address-actions-wrapper">
                  <button 
                    type="button" 
                    className="address-action-btn edit-btn"
                    onClick={() => {
                      const newStreet = prompt('Enter street address:', shippingAddress.street);
                      const newCity = prompt('Enter City, State Zip:', shippingAddress.cityStateZip);
                      if (newStreet && newCity) {
                        setShippingAddress({ street: newStreet, cityStateZip: newCity, country: 'United States' });
                        showToast('Address updated');
                      }
                    }}
                  >
                    Edit Address
                  </button>
                  <button 
                    type="button" 
                    className="address-action-btn add-new-btn"
                    onClick={() => showToast('Multiple addresses support coming soon!', 'info')}
                  >
                    Add New Address
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
