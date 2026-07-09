import React, { useState } from 'react';
import { Plus, MapPin, Flag, Edit2, RefreshCw, Save, ChevronRight } from 'lucide-react';
import './Settings.css';

const categories = [
  { name: 'Vintage', items: '7,892 items listed' },
  { name: 'Streetwear', items: '5,490 items listed' },
  { name: 'Designer', items: '3,183 items listed' },
  { name: 'Accessories', items: '2,903 items listed' },
];

const cities = [
  { name: 'Islamabad', active: true },
  { name: 'Lahore', active: true },
  { name: 'Karachi', active: true },
  { name: 'Hyderabad', active: false },
];

const reportReasons = [
  {
    name: 'Counterfeit Item',
    desc: 'The item is not authentic, or is a replica.',
    count: 1,
    type: 'danger',
  },
  {
    name: 'Inaccurate Description',
    desc: "Condition, size, or material description doesn't match item description.",
    type: 'normal',
  },
  {
    name: 'Spam or Misleading',
    desc: 'Multiple duplicate posts or promotional tags.',
    type: 'normal',
  },
  {
    name: 'Prohibited Goods',
    desc: "Items that violate our terms of service (e.g., weapons, drugs).",
    type: 'normal',
  },
];

export default function Settings() {
  const [cityList, setCityList] = useState(cities);

  const toggleCity = idx => {
    setCityList(prev =>
      prev.map((c, i) => (i === idx ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div className="settings-root">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-sub">Configure core marketplace metadata and governance parameters.</p>
        </div>
      </div>

      {/* Main 3-column grid */}
      <div className="settings-grid">
        {/* Categories */}
        <div className="settings-card">
          <div className="settings-card-header">
            <p className="settings-card-title">
              <span className="card-icon categories-icon">☰</span> Categories
            </p>
            <button className="add-btn"><Plus size={13} /> Add</button>
          </div>
          <div className="cat-settings-list">
            {categories.map(cat => (
              <div key={cat.name} className="cat-settings-row">
                <div>
                  <p className="cat-settings-name">{cat.name}</p>
                  <p className="cat-settings-sub">{cat.items}</p>
                </div>
                <button className="row-icon-btn"><ChevronRight size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Cities Served */}
        <div className="settings-card">
          <div className="settings-card-header">
            <p className="settings-card-title">
              <MapPin size={15} /> Cities Served
            </p>
            <button className="add-btn"><Plus size={13} /> Add</button>
          </div>
          <button className="map-view-btn">Map View Active</button>
          <div className="city-list">
            {cityList.map((city, i) => (
              <div key={city.name} className="city-row">
                <div className={`city-indicator ${city.active ? 'active' : ''}`}></div>
                <span className="city-name">{city.name}</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={city.active}
                    onChange={() => toggleCity(i)}
                  />
                  <span className="toggle-track"></span>
                </label>
                <button className="row-icon-btn"><ChevronRight size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Report Reasons */}
        <div className="settings-card">
          <div className="settings-card-header">
            <p className="settings-card-title">
              <Flag size={15} /> Report Reasons
            </p>
            <button className="policy-link-btn">Policy →</button>
          </div>
          <p className="report-note">These reasons are visible to users when flagging items for moderation.</p>
          <div className="report-reasons-list">
            {reportReasons.map(r => (
              <div key={r.name} className={`report-reason-row ${r.type === 'danger' ? 'danger-row' : ''}`}>
                <div>
                  <p className="rr-name">
                    {r.name}
                    {r.count && <span className="rr-count">{r.count}</span>}
                  </p>
                  <p className="rr-desc">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="update-policy-btn">Update Policy Settings</button>
        </div>
      </div>

      {/* Footer status row */}
      <div className="settings-footer-row">
        <div className="settings-footer-card">
          <div className="footer-card-icon"><Edit2 size={16} /></div>
          <div>
            <p className="footer-card-label">Last Metadata Update</p>
            <p className="footer-card-val">Today at 10:45 AM by Sarah Jenkins.</p>
          </div>
          <button className="view-audit-btn">View Audit Log</button>
        </div>
        <div className="settings-footer-card">
          <div className="footer-card-icon sync"><RefreshCw size={16} /></div>
          <div>
            <p className="footer-card-label">Sync Status</p>
            <p className="footer-card-val">Production database synchronized (12 nodes)</p>
          </div>
          <button className="live-badge">Live</button>
        </div>
        <button className="push-changes-btn">
          <Save size={15} /> Push Live Changes
        </button>
      </div>
    </div>
  );
}
