import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, MapPin, Flag, Save, ChevronRight, X, Sliders, ShieldCheck, RefreshCw, Edit2
} from 'lucide-react';
import './Settings.css';

const PLATFORM_REPORT_REASONS = [
  { id: 1, name: 'External Payment Request', policy_code: 'Section A.2', description: 'Soliciting payment outside SecondLife checkout.' },
  { id: 2, name: 'Counterfeit Item',          policy_code: 'Section C.4', description: 'Item is a replica or counterfeit brand.' },
  { id: 3, name: 'Abusive Language',          policy_code: 'Section B.1', description: 'Profanity, slurs, or harassment in messages.' },
  { id: 4, name: 'Spam or Misleading',        policy_code: 'Section G.1', description: 'Multiple duplicate posts or deceptive images.' },
];

export default function Settings() {
  const { showToast } = useAuth();

  const [categoriesList, setCategoriesList] = useState([]);
  const [citiesList,     setCitiesList]     = useState([]);
  const [reportReasons,  setReportReasons]  = useState(PLATFORM_REPORT_REASONS);

  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [newCityName,      setNewCityName]      = useState('');
  const [showAddCatModal,  setShowAddCatModal]  = useState(false);
  const [newCatName,       setNewCatName]       = useState('');

  const [minOrders,    setMinOrders]    = useState(() => Number(localStorage.getItem('sl_min_orders')  || 15));
  const [minRating,    setMinRating]    = useState(() => Number(localStorage.getItem('sl_min_rating')  || 4.5));
  const [autoScanner,  setAutoScanner]  = useState(() => localStorage.getItem('sl_auto_scanner') !== 'false');

  // Load saved city active-states from localStorage
  const savedActiveMap = useCallback(() => {
    try { return JSON.parse(localStorage.getItem('sl_cities_active') || '{}'); }
    catch { return {}; }
  }, []);

  // ── Fetch real data silently — page shows immediately ────────────────
  const fetchData = useCallback(async () => {
    // 1. Categories from listings table
    try {
      const { data: listings } = await supabase
        .from('listings')
        .select('category');

      if (listings && listings.length > 0) {
        const catMap = {};
        listings.forEach(l => {
          const cat = l.category || 'Uncategorised';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        setCategoriesList(
          Object.entries(catMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        );
      }
    } catch (err) {
      console.warn('Settings: could not fetch categories:', err.message);
    }

    // 2. Cities from profiles table (city field on the user profile)
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('city');

      if (profiles && profiles.length > 0) {
        const cityMap = {};
        profiles.forEach(p => {
          if (!p.city) return;
          cityMap[p.city] = (cityMap[p.city] || 0) + 1;
        });
        const activeMap = savedActiveMap();
        setCitiesList(
          Object.entries(cityMap)
            .map(([name, count]) => ({
              name,
              count,
              active: activeMap[name] !== undefined ? activeMap[name] : true,
            }))
            .sort((a, b) => b.count - a.count)
        );
      }
    } catch (err) {
      console.warn('Settings: could not fetch cities:', err.message);
    }

    // 3. Report reasons — try DB first, fall back silently to static list
    try {
      const { data: reasons, error } = await supabase
        .from('report_reasons')
        .select('*');
      if (!error && reasons && reasons.length > 0) {
        setReportReasons(reasons);
      }
      // else keep PLATFORM_REPORT_REASONS default
    } catch (_) {
      // table may not exist — keep defaults silently
    }
  }, [savedActiveMap]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── City toggle ──────────────────────────────────────────────────────
  const handleToggleCity = (name) => {
    setCitiesList(prev => {
      const next = prev.map(c => c.name === name ? { ...c, active: !c.active } : c);
      const map = {};
      next.forEach(c => { map[c.name] = c.active; });
      localStorage.setItem('sl_cities_active', JSON.stringify(map));
      return next;
    });
  };

  // ── Add city ─────────────────────────────────────────────────────────
  const handleAddCitySubmit = (e) => {
    e.preventDefault();
    const trimmed = newCityName.trim();
    if (!trimmed) return;
    if (citiesList.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      if (showToast) showToast('City already exists.');
      return;
    }
    setCitiesList(prev => {
      const next = [{ name: trimmed, count: 0, active: true }, ...prev];
      const map = {};
      next.forEach(c => { map[c.name] = c.active; });
      localStorage.setItem('sl_cities_active', JSON.stringify(map));
      return next;
    });
    setNewCityName('');
    setShowAddCityModal(false);
    if (showToast) showToast(`"${trimmed}" added to served cities.`);
  };

  // ── Add category ─────────────────────────────────────────────────────
  const handleAddCatSubmit = (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categoriesList.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      if (showToast) showToast('Category already exists.');
      return;
    }
    setCategoriesList(prev => [{ name: trimmed, count: 0 }, ...prev]);
    setNewCatName('');
    setShowAddCatModal(false);
    if (showToast) showToast(`Category "${trimmed}" added.`);
  };

  // ── Push changes ─────────────────────────────────────────────────────
  const handlePushChanges = () => {
    localStorage.setItem('sl_min_orders',   String(minOrders));
    localStorage.setItem('sl_min_rating',   String(minRating));
    localStorage.setItem('sl_auto_scanner', String(autoScanner));
    const map = {};
    citiesList.forEach(c => { map[c.name] = c.active; });
    localStorage.setItem('sl_cities_active', JSON.stringify(map));
    if (showToast) showToast('Settings saved & pushed live!');
  };

  const activeCities = citiesList.filter(c => c.active).length;

  return (
    <div className="settings-root">

      {/* ── Add City Modal ── */}
      {showAddCityModal && (
        <div className="report-modal-overlay" onClick={() => setShowAddCityModal(false)}>
          <div className="report-modal-card" onClick={e => e.stopPropagation()}>
            <div className="report-modal-header">
              <div className="report-title-wrap">
                <MapPin size={20} style={{ color: '#0284c7' }} />
                <div><h3>Add Served City</h3><p className="report-subtitle">Expand marketplace region.</p></div>
              </div>
              <button className="report-modal-close" onClick={() => setShowAddCityModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCitySubmit} className="report-modal-form">
              <div className="report-form-group">
                <label htmlFor="cityNameInput">City Name *</label>
                <input id="cityNameInput" type="text" required placeholder="e.g. Multan, Quetta…" value={newCityName} onChange={e => setNewCityName(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
              <div className="report-modal-actions">
                <button type="button" className="report-cancel-btn" onClick={() => setShowAddCityModal(false)}>Cancel</button>
                <button type="submit" className="report-submit-btn" style={{ backgroundColor: '#1a1a2e' }}>Add City</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Category Modal ── */}
      {showAddCatModal && (
        <div className="report-modal-overlay" onClick={() => setShowAddCatModal(false)}>
          <div className="report-modal-card" onClick={e => e.stopPropagation()}>
            <div className="report-modal-header">
              <div className="report-title-wrap">
                <Sliders size={20} style={{ color: '#c19358' }} />
                <div><h3>Add Category</h3><p className="report-subtitle">Create new product taxonomy item.</p></div>
              </div>
              <button className="report-modal-close" onClick={() => setShowAddCatModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCatSubmit} className="report-modal-form">
              <div className="report-form-group">
                <label htmlFor="catNameInput">Category Name *</label>
                <input id="catNameInput" type="text" required placeholder="e.g. Activewear, Denim…" value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
              <div className="report-modal-actions">
                <button type="button" className="report-cancel-btn" onClick={() => setShowAddCatModal(false)}>Cancel</button>
                <button type="submit" className="report-submit-btn" style={{ backgroundColor: '#c19358' }}>Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="settings-header">
        <div>
          <h1 className="page-title">Platform Governance &amp; Metadata</h1>
          <p className="page-sub">Manage marketplace taxonomy, cities, seller thresholds &amp; moderation rules.</p>
        </div>
        <button className="adv-filter-btn" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Trusted Seller Governance ── */}
      <div className="settings-card" style={{ padding: '18px 20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#059669' }} /> Trusted Seller Governance
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Badge formula: Completed Orders ≥ <strong>{minOrders}</strong> AND Rating ≥ <strong>{minRating}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="minOrdersInput" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Min. Orders</label>
              <input id="minOrdersInput" type="number" value={minOrders} onChange={e => setMinOrders(Number(e.target.value))} style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '700' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="minRatingInput" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Min. Rating</label>
              <input id="minRatingInput" type="number" step="0.1" value={minRating} onChange={e => setMinRating(Number(e.target.value))} style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '700' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Auto-Scanner</span>
              <label className="toggle-switch" style={{ marginTop: '4px' }}>
                <input type="checkbox" checked={autoScanner} onChange={e => setAutoScanner(e.target.checked)} />
                <span className="toggle-track"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-column grid ── */}
      <div className="settings-grid">

        {/* Categories */}
        <div className="settings-card">
          <div className="settings-card-header">
            <p className="settings-card-title">
              <span className="card-icon">☰</span>
              Categories {categoriesList.length > 0 && `(${categoriesList.length})`}
            </p>
            <button className="add-btn" onClick={() => setShowAddCatModal(true)}><Plus size={13} /> Add</button>
          </div>
          {categoriesList.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '16px 0', lineHeight: '1.6' }}>
              Categories appear automatically<br />as sellers create listings.
            </p>
          ) : (
            <div className="cat-settings-list">
              {categoriesList.map(cat => (
                <div key={cat.name} className="cat-settings-row">
                  <div>
                    <p className="cat-settings-name">{cat.name}</p>
                    <p className="cat-settings-sub">{cat.count.toLocaleString()} listings</p>
                  </div>
                  <button className="row-icon-btn"><ChevronRight size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cities */}
        <div className="settings-card">
          <div className="settings-card-header">
            <p className="settings-card-title">
              <MapPin size={15} /> Cities {citiesList.length > 0 && `(${activeCities} active)`}
            </p>
            <button className="add-btn" onClick={() => setShowAddCityModal(true)}><Plus size={13} /> Add</button>
          </div>
          {citiesList.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '16px 0', lineHeight: '1.6' }}>
              Cities appear automatically<br />from user profiles.
            </p>
          ) : (
            <div className="city-list">
              {citiesList.map(city => (
                <div key={city.name} className="city-row">
                  <div className={`city-indicator ${city.active ? 'active' : ''}`}></div>
                  <div style={{ flex: 1 }}>
                    <span className="city-name">{city.name}</span>
                    <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>{city.count} users</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={city.active} onChange={() => handleToggleCity(city.name)} />
                    <span className="toggle-track"></span>
                  </label>
                  <button className="row-icon-btn"><ChevronRight size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Reasons */}
        <div className="settings-card">
          <div className="settings-card-header">
            <p className="settings-card-title"><Flag size={15} /> Report Reasons</p>
          </div>
          <p className="report-note">Visible to users when flagging listings or messages.</p>
          <div className="report-reasons-list">
            {reportReasons.map(r => (
              <div key={r.id} className="report-reason-row">
                <p className="rr-name">
                  {r.name}
                  {r.policy_code && <span className="rr-count">{r.policy_code}</span>}
                </p>
                <p className="rr-desc">{r.description || r.desc || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="settings-footer-row">
        <div className="settings-footer-card">
          <div className="footer-card-icon"><Edit2 size={16} /></div>
          <div>
            <p className="footer-card-label">Last Update</p>
            <p className="footer-card-val">{new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="settings-footer-card">
          <div className="footer-card-icon sync"><RefreshCw size={16} /></div>
          <div>
            <p className="footer-card-label">Data Status</p>
            <p className="footer-card-val">{categoriesList.length} categories · {citiesList.length} cities</p>
          </div>
          <button className="live-badge">Live</button>
        </div>
        <button className="push-changes-btn" onClick={handlePushChanges}>
          <Save size={15} /> Push Live Changes
        </button>
      </div>
    </div>
  );
}
