import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useModeration } from '../../context/ModerationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search, AlertTriangle, Eye, Plus,
  MoreVertical, CheckCircle, XCircle, UserPlus, ShieldCheck, UserX, Users, X, Award, ChevronDown
} from 'lucide-react';
import ActionConfirmModal from '../../components/common/ActionConfirmModal';
import './Community.css';

const permissionMatrix = [
  { section: 'Financial Reports', desc: 'Revenue payouts and bank statements.', superAdmin: 'full', moderator: 'none', support: 'view' },
  { section: 'Listing Moderation', desc: 'Approve or reject community listings.', superAdmin: 'full', moderator: 'full', support: 'view' },
  { section: 'Customer Dispute Resolution', desc: 'Access to user chat logs and submit resolution.', superAdmin: 'full', moderator: 'full', support: 'full' },
  { section: 'Team Management', desc: 'Add/Remove admins and change roles.', superAdmin: 'full', moderator: 'none', support: 'none' },
];

const permIcon = (level) => {
  if (level === 'full') return <CheckCircle size={16} color="#059669" strokeWidth={2.5} />;
  if (level === 'view') return <Eye size={16} color="#9ca3af" strokeWidth={2} />;
  return <XCircle size={16} color="#d1d5db" strokeWidth={2} />;
};

const isTrustedSeller = (u) =>
  u.role === 'seller' && (u.completed_orders || 0) >= 15 && (u.avg_rating || 0) >= 4.5;

const avatarUrl = (u) =>
  u.avatar_url ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.email || 'U')}&background=1a1a2e&color=fff&size=80`;

const teamRoleLabel = (role) => {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'moderator')   return 'Moderator';
  if (role === 'supporter')   return 'Supporter';
  if (role === 'admin')       return 'Admin';
  return role || 'Staff';
};

const teamRoleType = (role) => {
  if (role === 'super_admin' || role === 'admin') return 'super';
  if (role === 'moderator')   return 'moderator';
  return 'support';
};

const userStatusLabel = (u) => {
  if (u.status === 'banned')  return { label: 'BANNED',  type: 'banned' };
  if (u.status === 'flagged' || u.seller_status === 'Flagged' || u.seller_status === 'Suspended') return { label: 'Flagged / Suspended', type: 'flagged' };
  if (u.seller_status === 'Pending' || u.status === 'pending') return { label: 'Pending Verification', type: 'reports' };
  const warns = u.warnings_count || 0;
  if (warns > 0) return { label: `${warns} Warning${warns > 1 ? 's' : ''}`, type: 'reports' };
  return { label: 'Active', type: 'clear' };
};

const PAGE_SIZE = 4;
const FILTERS = ['All', 'Buyers', 'Sellers', 'Trusted'];

export default function Community() {
  const { takeModerationAction } = useModeration();
  const { user, profile: adminProfile, showToast } = useAuth();
  // Check localStorage as fallback in case adminProfile hasn't hydrated yet
  const adminRole = adminProfile?.role || localStorage.getItem('userRole') || '';
  const isAdmin = adminRole === 'admin' || adminRole === 'super_admin';

  const [allUsers, setAllUsers]   = useState([]);
  const [teamList, setTeamList]   = useState([]);
  const [reportsCount, setReportsCount] = useState(0);

  const [activeTab, setActiveTab]       = useState('users');
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [search, setSearch]             = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [inspectedUser, setInspectedUser]   = useState(null);
  const [warningUser, setWarningUser]       = useState(null);
  const [warningReason, setWarningReason]   = useState('');
  const [actionConfirmConfig, setActionConfirmConfig] = useState({ isOpen: false });
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [changingRoleMemberId, setChangingRoleMemberId] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({ name: '', email: '', role: 'Moderator' });

  // Fetch silently in background — no loading screen
  const fetchData = useCallback(async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const adminRoles = ['admin', 'super_admin', 'moderator', 'supporter'];
      let allProfiles = profiles || [];

      // Read local seller status overrides
      let localStatuses = {};
      try {
        const rawLocal = localStorage.getItem('secondlife_seller_statuses');
        if (rawLocal) localStatuses = JSON.parse(rawLocal);
      } catch (e) {}

      // Auto-promote: find users with listings and ensure their role is treated as seller
      const listingSellerIds = new Set();
      try {
        const { data: listingRows } = await supabase
          .from('listings')
          .select('seller_id');
        if (listingRows && listingRows.length > 0) {
          listingRows.forEach(l => { if (l.seller_id) listingSellerIds.add(String(l.seller_id)); });

          const nonSellerIds = Array.from(listingSellerIds).filter(id => {
            const prof = allProfiles.find(p => p.id === id);
            return prof && !adminRoles.includes(prof.role) && prof.role !== 'seller';
          });
          if (nonSellerIds.length > 0) {
            try {
              await supabase.from('profiles').update({ role: 'seller' }).in('id', nonSellerIds);
            } catch (_) {}
            allProfiles = allProfiles.map(p =>
              nonSellerIds.includes(p.id) ? { ...p, role: 'seller' } : p
            );
          }
        }
      } catch (_) {}

      // Enrich profiles with seller_status
      allProfiles = allProfiles.map(p => {
        const isSeller = p.role === 'seller' || listingSellerIds.has(String(p.id)) || (p.seller_status && p.seller_status.trim() !== '');
        const roleName = isSeller ? 'seller' : (p.role || 'customer');

        let resolvedSellerStatus = null;
        if (isSeller) {
          if (localStatuses[p.id]) {
            resolvedSellerStatus = localStatuses[p.id];
          } else if (p.seller_status && p.seller_status.trim() !== '') {
            resolvedSellerStatus = p.seller_status;
          } else if (p.status === 'flagged' || p.status === 'suspended') {
            resolvedSellerStatus = 'Flagged';
          } else if (p.status === 'pending') {
            resolvedSellerStatus = 'Pending';
          } else if (p.role === 'seller' && (!p.seller_status || p.seller_status === 'Verified')) {
            resolvedSellerStatus = 'Verified';
          } else {
            resolvedSellerStatus = 'Pending';
          }
        }

        return {
          ...p,
          role: roleName,
          seller_status: resolvedSellerStatus
        };
      });

      setAllUsers(allProfiles.filter(p => !adminRoles.includes(p.role)));
      setTeamList(allProfiles.filter(p =>  adminRoles.includes(p.role)));
    } catch (err) {
      console.warn('Community profile fetch:', err.message);
    }

    try {
      const { count } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open');
      setReportsCount(count || 0);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchData();
    const handleStatusUpdate = () => fetchData();
    window.addEventListener('sellerStatusUpdated', handleStatusUpdate);
    return () => window.removeEventListener('sellerStatusUpdated', handleStatusUpdate);
  }, [fetchData]);
  // Reset visible count when filter/search changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeFilter, search]);

  // Metrics — 'customer' is the DB role name for buyers
  const totalUsersCount     = allUsers.length;
  const sellersCount        = allUsers.filter(u => u.role === 'seller').length;
  const buyersCount         = allUsers.filter(u => u.role === 'customer' || u.role === 'buyer' || !u.role).length;
  const trustedSellersCount = allUsers.filter(isTrustedSeller).length;

  // Filtered users
  const filteredUsers = allUsers.filter(u => {
    const q = search.toLowerCase();
    const match = (u.name || '').toLowerCase().includes(q) ||
                  (u.email || '').toLowerCase().includes(q) ||
                  (u.username || '').toLowerCase().includes(q) ||
                  (u.city || '').toLowerCase().includes(q);
    if (!match) return false;
    if (activeFilter === 'Buyers')  return u.role === 'customer' || u.role === 'buyer' || !u.role;
    if (activeFilter === 'Sellers') return u.role === 'seller';
    if (activeFilter === 'Trusted') return isTrustedSeller(u);
    return true;
  });

  const visibleUsers = filteredUsers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredUsers.length;

  const filteredTeam = teamList.filter(m => {
    const q = search.toLowerCase();
    return (m.name || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q);
  });

  // Actions
  const handleIssueWarningSubmit = async (e) => {
    e.preventDefault();
    if (!warningUser) return;
    const newWarns = (warningUser.warnings_count || 0) + 1;
    await supabase.from('profiles').update({ warnings_count: newWarns, status: 'flagged' }).eq('id', warningUser.id);
    setAllUsers(prev => prev.map(u => u.id === warningUser.id ? { ...u, warnings_count: newWarns, status: 'flagged' } : u));
    takeModerationAction({ reportId: `WARN-${warningUser.id}`, actionType: 'send_warning', moderatorName: 'Admin', reason: warningReason });
    if (showToast) showToast(`Warning issued to ${warningUser.name}`);
    setWarningUser(null); setWarningReason('');
  };

  const handleBanUserConfirm = async () => {
    const t = actionConfirmConfig.targetUser; if (!t) return;
    await supabase.from('profiles').update({ status: 'banned' }).eq('id', t.id);
    setAllUsers(prev => prev.map(u => u.id === t.id ? { ...u, status: 'banned' } : u));
    takeModerationAction({ reportId: `BAN-${t.id}`, actionType: 'ban_user', moderatorName: 'Admin', reason: 'Banned' });
    if (showToast) showToast(`${t.name || t.email} has been banned.`);
  };

  const handleChangeTeamRole = async (memberId, newRoleType) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRoleType }).eq('id', memberId);
      if (error) throw error;
      
      await fetchData();
      setOpenMenuUserId(null);
      setChangingRoleMemberId(null);
      if (showToast) {
        showToast(`Role updated to ${newRoleType === 'customer' ? 'Customer' : teamRoleLabel(newRoleType)}`);
      }
    } catch (err) {
      if (showToast) showToast(`Failed to update role: ${err.message}`);
    }
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (showToast) showToast(`Invitation sent to ${newInvite.email} as ${newInvite.role}`);
    setInviteModalOpen(false);
    setNewInvite({ name: '', email: '', role: 'Moderator' });
  };

  return (
    <div className="community-root">

      <ActionConfirmModal
        isOpen={actionConfirmConfig.isOpen}
        onClose={() => setActionConfirmConfig({ isOpen: false })}
        title={actionConfirmConfig.title}
        message={actionConfirmConfig.message}
        confirmVariant="danger"
        onConfirm={handleBanUserConfirm}
      />

      {/* Profile Inspector */}
      {inspectedUser && (
        <div className="report-modal-overlay" onClick={() => setInspectedUser(null)}>
          <div className="report-modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="report-modal-header">
              <div className="report-title-wrap">
                <img src={avatarUrl(inspectedUser)} alt="avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: 0 }}>{inspectedUser.name || 'Unnamed User'}</h3>
                  <p className="report-subtitle">@{inspectedUser.username || '—'} · {inspectedUser.email}</p>
                </div>
              </div>
              <button className="report-modal-close" onClick={() => setInspectedUser(null)}><X size={18} /></button>
            </div>
            <div className="report-modal-form" style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Role</span><p style={{ fontWeight: '700', margin: '2px 0 0', textTransform: 'capitalize' }}>{inspectedUser.role === 'customer' ? 'Buyer' : (inspectedUser.role || 'Buyer')}</p></div>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>City</span><p style={{ fontWeight: '700', margin: '2px 0 0' }}>📍 {inspectedUser.city || 'Not set'}</p></div>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Joined</span><p style={{ fontWeight: '700', margin: '2px 0 0' }}>{inspectedUser.created_at ? new Date(inspectedUser.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p></div>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status</span><p style={{ fontWeight: '700', margin: '2px 0 0', color: inspectedUser.status === 'banned' ? '#dc2626' : '#059669', textTransform: 'capitalize' }}>{inspectedUser.status || 'Active'}</p></div>
              </div>

              {/* Bio — shown for ALL users, with fallback */}
              <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Bio</span>
                <p style={{ fontSize: '0.85rem', color: inspectedUser.bio ? '#334155' : '#94a3b8', margin: '4px 0 0', lineHeight: '1.5', fontStyle: inspectedUser.bio ? 'normal' : 'italic' }}>
                  {inspectedUser.bio || 'No bio provided yet.'}
                </p>
              </div>

              {/* Seller Metrics — only shown for sellers */}
              {inspectedUser.role === 'seller' && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '8px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#166534' }}>SELLER METRICS</span>
                    {isTrustedSeller(inspectedUser) && <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={12} /> Trusted Seller</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                    <div><span style={{ fontSize: '0.75rem', color: '#166534' }}>Orders</span><p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#14532d', margin: 0 }}>{inspectedUser.completed_orders || 0}</p></div>
                    <div><span style={{ fontSize: '0.75rem', color: '#166534' }}>Rating</span><p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#14532d', margin: 0 }}>★ {inspectedUser.avg_rating ? Number(inspectedUser.avg_rating).toFixed(1) : 'N/A'}</p></div>
                    <div><span style={{ fontSize: '0.75rem', color: '#166534' }}>Listings</span><p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#14532d', margin: 0 }}>{inspectedUser.listings_count || 0}</p></div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.82rem', color: '#991b1b', background: '#fee2e2', padding: '10px 12px', borderRadius: '8px', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Warnings on Record:</span><strong>{inspectedUser.warnings_count || 0}</strong>
              </div>
              <div className="report-modal-actions" style={{ marginTop: '14px' }}>
                <button className="report-cancel-btn" onClick={() => setInspectedUser(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {warningUser && (
        <div className="report-modal-overlay" onClick={() => setWarningUser(null)}>
          <div className="report-modal-card" onClick={e => e.stopPropagation()}>
            <div className="report-modal-header">
              <div className="report-title-wrap">
                <AlertTriangle size={20} className="report-modal-icon" />
                <div>
                  <h3>Issue Warning to {warningUser.name}</h3>
                  <p className="report-subtitle">{warningUser.email} · Warnings: {warningUser.warnings_count || 0}</p>
                </div>
              </div>
              <button className="report-modal-close" onClick={() => setWarningUser(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleIssueWarningSubmit} className="report-modal-form">
              <div className="report-form-group">
                <label htmlFor="warningExplanationInput">Warning Explanation *</label>
                <textarea id="warningExplanationInput" rows={4} required placeholder="Explain the policy violation..." value={warningReason} onChange={e => setWarningReason(e.target.value)} />
              </div>
              <div className="report-modal-actions">
                <button type="button" className="report-cancel-btn" onClick={() => setWarningUser(null)}>Cancel</button>
                <button type="submit" className="report-submit-btn" style={{ backgroundColor: '#d97706' }}>Issue Warning</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="report-modal-overlay" onClick={() => setInviteModalOpen(false)}>
          <div className="report-modal-card" onClick={e => e.stopPropagation()}>
            <div className="report-modal-header">
              <div className="report-title-wrap">
                <UserPlus size={20} style={{ color: '#0284c7' }} />
                <div><h3>Invite Team Member</h3><p className="report-subtitle">Grant admin privileges to staff.</p></div>
              </div>
              <button className="report-modal-close" onClick={() => setInviteModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleInviteSubmit} className="report-modal-form">
              <div className="report-form-group">
                <label htmlFor="inviteNameInput">Full Name *</label>
                <input id="inviteNameInput" type="text" required placeholder="e.g. Zainab Malik" value={newInvite.name} onChange={e => setNewInvite({ ...newInvite, name: e.target.value })} style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
              <div className="report-form-group">
                <label htmlFor="inviteEmailInput">Email *</label>
                <input id="inviteEmailInput" type="email" required placeholder="name@secondlife.com" value={newInvite.email} onChange={e => setNewInvite({ ...newInvite, email: e.target.value })} style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
              <div className="report-form-group">
                <label htmlFor="inviteRoleSelect">Role *</label>
                <select id="inviteRoleSelect" value={newInvite.role} onChange={e => setNewInvite({ ...newInvite, role: e.target.value })}>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Supporter">Support Agent</option>
                </select>
              </div>
              <div className="report-modal-actions">
                <button type="button" className="report-cancel-btn" onClick={() => setInviteModalOpen(false)}>Cancel</button>
                <button type="submit" className="report-submit-btn" style={{ backgroundColor: '#1a1a2e' }}>Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Switcher — no counts */}
      <div className="page-level-tabs">
        <button className={`page-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setSearch(''); setVisibleCount(PAGE_SIZE); }}>
          User Management
        </button>
        <button className={`page-tab-btn ${activeTab === 'team' ? 'active' : ''}`} onClick={() => { setActiveTab('team'); setSearch(''); }}>
          Team &amp; Staff
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Header */}
          <div className="comm-header">
            <div>
              <h1 className="page-title">User Management</h1>
              <p className="page-sub">Monitor and moderate community members &amp; trusted sellers.</p>
            </div>
            <div className="total-users-badge">
              <span className="total-big">{totalUsersCount}</span>
              <span className="total-label">Total Users</span>
              <span className="total-sub">{sellersCount} sellers · {buyersCount} buyers</span>
            </div>
          </div>

          {/* Table Card */}
          <div className="comm-table-card">
            <div className="comm-table-toolbar">
              {/* Search */}
              <div className="comm-search-wrap">
                <Search size={14} className="search-icon" />
                <input type="text" placeholder="Search by name, email, city…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>

              {/* Filter Dropdown Toggle */}
              <div style={{ position: 'relative' }}>
                <button
                  className="adv-filter-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: activeFilter !== 'All' ? '700' : '500', borderColor: activeFilter !== 'All' ? '#1a1a2e' : undefined }}
                  onClick={() => setFilterOpen(p => !p)}
                >
                  {activeFilter === 'All' ? 'Filter' : activeFilter === 'Trusted' ? '★ Trusted Sellers' : activeFilter}
                  <ChevronDown size={13} style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </button>
                {filterOpen && (
                  <div className="filter-dropdown-list">
                    {FILTERS.map(f => (
                      <button
                        key={f}
                        className={`filter-dropdown-item ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => { setActiveFilter(f); setFilterOpen(false); setVisibleCount(PAGE_SIZE); }}
                      >
                        {f === 'Trusted' ? '★ Trusted Sellers' : f}
                        {activeFilter === f && <CheckCircle size={13} color="#059669" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <Users size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <p>{totalUsersCount === 0 ? 'No users have signed up yet.' : `No users match "${search}".`}</p>
              </div>
            ) : (
              <>
                <table className="comm-table">
                  <thead>
                    <tr>
                      <th>USER</th>
                      <th>ROLE</th>
                      <th>JOINED</th>
                      <th>SALES / RATING</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsers.map(u => {
                      const trusted = isTrustedSeller(u);
                      const { label: statusLabel, type: statusType } = userStatusLabel(u);
                      return (
                        <tr key={u.id} className={u.status === 'banned' ? 'dimmed-row' : ''}>
                          <td>
                            <div className="user-cell">
                              <img src={avatarUrl(u)} alt={u.name} className="user-avatar-img" />
                              <div>
                                <p className="user-name">
                                  {u.name || u.email}
                                  {trusted && <span className="trusted-star-badge">★ Trusted</span>}
                                </p>
                                <p className="user-email">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className={`role-pill ${u.role === 'customer' ? 'buyer' : (u.role || 'buyer')}`} style={{ textTransform: 'capitalize' }}>{u.role === 'customer' ? 'Buyer' : (u.role || 'Buyer')}</span></td>
                          <td className="date-cell">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                          <td className="num-cell">
                            {u.role === 'seller'
                              ? <span>{u.completed_orders || 0} orders · ★ {u.avg_rating ? Number(u.avg_rating).toFixed(1) : '—'}</span>
                              : <span style={{ color: '#94a3b8' }}>Buyer</span>}
                          </td>
                          <td><span className={`user-status ${statusType}`}>{statusType !== 'banned' && '● '}{statusLabel}</span></td>
                          <td>
                            <div className="user-actions">
                              <button className="ua-btn" title="View Profile" onClick={() => setInspectedUser(u)}><Eye size={14} /></button>
                              <button className="ua-btn warn-icon-btn" title="Issue Warning" onClick={() => setWarningUser(u)}><AlertTriangle size={14} /></button>
                              <button className="ua-btn ban-icon-btn" title="Ban User" onClick={() => setActionConfirmConfig({ isOpen: true, targetUser: u, title: `Ban: ${u.name || u.email}`, message: 'This will permanently block marketplace access.' })}><XCircle size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* View More */}
                <div className="table-footer">
                  <p>Showing {visibleUsers.length} of {filteredUsers.length} users</p>
                  {hasMore && (
                    <button className="adv-filter-btn" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                      View More ({filteredUsers.length - visibleCount} remaining)
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="comm-bottom-stats">
            <div className="cbstat">
              <span className="cbstat-icon-wrap green"><ShieldCheck size={20} /></span>
              <div>
                <p className="cbstat-label">TRUSTED SELLERS</p>
                <p className="cbstat-val">{trustedSellersCount}</p>
                <p className="cbstat-hint">15+ orders &amp; 4.5+ rating</p>
              </div>
            </div>
            <div className="cbstat">
              <span className="cbstat-icon-wrap red"><UserX size={20} /></span>
              <div>
                <p className="cbstat-label">OPEN REPORTS</p>
                <p className="cbstat-val red-val">{reportsCount}</p>
                <p className="cbstat-hint">Pending moderation action</p>
              </div>
            </div>
            <div className="cbstat">
              <span className="cbstat-icon-wrap orange"><Users size={20} /></span>
              <div>
                <p className="cbstat-label">TOTAL COMMUNITY</p>
                <p className="cbstat-val">{totalUsersCount}</p>
                <p className="cbstat-hint">{sellersCount} sellers · {buyersCount} buyers</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Team */}
          <div className="team-header">
            <div>
              <h1 className="page-title">Admin Team &amp; Staff</h1>
              <p className="page-sub">Manage staff members and change roles dynamically.</p>
            </div>
            <div className="team-header-right">
              <div className="team-search-wrap">
                <Search size={14} className="search-icon" />
                <input type="text" placeholder="Search team…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="invite-btn" onClick={() => setInviteModalOpen(true)}>
                <UserPlus size={14} style={{ marginRight: '6px' }} /> Invite Member
              </button>
            </div>
          </div>

          <div className="team-card">
            {filteredTeam.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <p>No staff members found. Assign admin roles in Supabase or invite your first team member.</p>
              </div>
            ) : (
              <table className="team-table">
                <thead>
                  <tr>
                    <th>MEMBER</th>
                    <th>ROLE</th>
                    <th>JOINED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeam.map(m => (
                    <tr key={m.id}>
                      <td>
                        <div className="team-member-cell">
                          <img src={avatarUrl(m)} alt={m.name} className="team-avatar-img" />
                          <div>
                            <p className="team-member-name">{m.name || 'Unnamed'}</p>
                            <p className="team-member-email">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={`team-role-badge ${teamRoleType(m.role)}`}>{teamRoleLabel(m.role)}</span></td>
                      <td className="team-last-active">{m.created_at ? new Date(m.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td>
                        <div style={{ position: 'relative', zIndex: openMenuUserId === m.id ? 9999 : 1 }}>
                          {isAdmin ? (
                            <>
                              <button className="team-action-btn" onClick={() => { setOpenMenuUserId(openMenuUserId === m.id ? null : m.id); setChangingRoleMemberId(null); }}>
                                <MoreVertical size={15} />
                              </button>
                              {openMenuUserId === m.id && (
                                <div className="role-menu-dropdown">
                                  {changingRoleMemberId !== m.id ? (
                                    <>
                                      <p className="menu-header">Actions:</p>
                                      <button onClick={() => setChangingRoleMemberId(m.id)}>
                                        Change Role...
                                      </button>
                                      <button onClick={() => handleChangeTeamRole(m.id, 'customer')} style={{ color: '#ef4444' }}>
                                        Remove Admin
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <p className="menu-header">Select Role:</p>
                                      <button onClick={() => handleChangeTeamRole(m.id, 'super_admin')}>Make Super Admin</button>
                                      <button onClick={() => handleChangeTeamRole(m.id, 'admin')}>Make Admin</button>
                                      <button onClick={() => handleChangeTeamRole(m.id, 'moderator')}>Make Moderator</button>
                                      <button onClick={() => handleChangeTeamRole(m.id, 'supporter')}>Make Supporter</button>
                                      <button onClick={() => setChangingRoleMemberId(null)} style={{ borderTop: '1px solid #f1f5f9', color: '#64748b', marginTop: '4px' }}>
                                        ← Back
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Permission Matrix */}
          <div className="team-card">
            <div className="perm-header">
              <div>
                <p className="team-section-title">Permission Matrix</p>
                <p className="team-section-sub">Granular access control for each role.</p>
              </div>
            </div>
            <table className="perm-table">
              <thead>
                <tr>
                  <th>SECTION</th>
                  <th className="perm-col">SUPER ADMIN</th>
                  <th className="perm-col">MODERATOR</th>
                  <th className="perm-col">SUPPORT</th>
                </tr>
              </thead>
              <tbody>
                {permissionMatrix.map(row => (
                  <tr key={row.section}>
                    <td>
                      <p className="perm-section-name">{row.section}</p>
                      <p className="perm-section-desc">{row.desc}</p>
                    </td>
                    <td className="perm-col">{permIcon(row.superAdmin)}</td>
                    <td className="perm-col">{permIcon(row.moderator)}</td>
                    <td className="perm-col">{permIcon(row.support)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
