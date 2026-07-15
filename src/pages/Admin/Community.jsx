import React, { useState } from 'react';
import {
  Search, Shield, AlertTriangle, Activity, Eye, SlidersHorizontal, Plus,
  MoreVertical, CheckCircle, XCircle, UserPlus, ShieldCheck, UserX, Users
} from 'lucide-react';
import './Community.css';

// ── Mock User Data (with Unsplash Avatars) ──
const users = [
  {
    id: 1,
    name: 'Elena Rodriguez',
    email: 'elenr@yourmail.com',
    role: 'Seller',
    joined: 'Oct 12, 2023',
    listings: 142,
    status: 'Clear',
    statusType: 'clear',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 2,
    name: 'Marcus Thorne',
    email: 'm.thorne@domane.co',
    role: 'Buyer',
    joined: 'Jan 03, 2024',
    listings: 0,
    status: '3 Reports',
    statusType: 'reports',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 3,
    name: 'Sasha Kim',
    email: 'skim_vin@gmail.com',
    role: 'Seller',
    joined: 'Nov 22, 2023',
    listings: 88,
    status: 'Clear',
    statusType: 'clear',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 4,
    name: 'Julian Vance',
    email: 'ujance@outlook.com',
    role: 'Buyer',
    joined: 'Mar 12, 2024',
    listings: 4,
    status: 'Flagged',
    statusType: 'flagged',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 5,
    name: 'Liam O\'Connor',
    email: 'loignnerackon.co',
    role: null,
    joined: 'Aug 18, 2024',
    listings: 0,
    status: 'BANNED',
    statusType: 'banned',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80',
    dimmed: true,
  },
];

// ── Mock Team Data ──
const teamMembers = [
  {
    id: 1,
    name: 'Elena Arts',
    email: 'earts@secondlife.com',
    role: 'Super admin',
    roleType: 'super',
    status: 'Active',
    lastActive: '5 mins ago',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 2,
    name: 'Marcus Wong',
    email: 'm.wong@secondlife.com',
    role: 'Moderator',
    roleType: 'moderator',
    status: 'Active',
    lastActive: '1 hour ago',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 3,
    name: 'Sarah Fisher',
    email: 's.fisher@paceslife.com',
    role: 'Support',
    roleType: 'support',
    status: 'Away',
    lastActive: '2 hours ago',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80',
  },
];

const permissionMatrix = [
  {
    section: 'Financial Reports',
    desc: 'Revenue payouts and bank statements.',
    superAdmin: 'full',
    moderator: 'none',
    support: 'view',
  },
  {
    section: 'Listing Moderation',
    desc: 'Approve or reject community listings.',
    superAdmin: 'full',
    moderator: 'full',
    support: 'view',
  },
  {
    section: 'Customer Dispute Resolution',
    desc: 'Access to user chat logs and submit resolution.',
    superAdmin: 'full',
    moderator: 'full',
    support: 'full',
  },
  {
    section: 'Team Management',
    desc: 'Add/Remove admins and change roles.',
    superAdmin: 'full',
    moderator: 'none',
    support: 'none',
  },
];

const permIcon = (level) => {
  if (level === 'full') return <CheckCircle size={16} color="#059669" strokeWidth={2.5} />;
  if (level === 'view') return <Eye size={16} color="#9ca3af" strokeWidth={2} />;
  return <XCircle size={16} color="#d1d5db" strokeWidth={2} />;
};

const roleCards = [
  {
    icon: '⚡',
    title: 'Super Admins',
    count: '3 Active',
    countColor: 'green',
    desc: 'Full access to all system settings and controls. Handles financial data.',
  },
  {
    icon: '🛡️',
    title: 'Moderators',
    count: '12 Active',
    countColor: 'blue',
    desc: 'Responsible for maintaining listing quality and dispute mediation.',
  },
  {
    icon: '🎧',
    title: 'Support Agents',
    count: '26 Active',
    countColor: 'gray',
    desc: 'Assisting users, scale sellers and store account management.',
  },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'team'
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      activeFilter === 'All' ||
      (activeFilter === 'Buyers' && u.role === 'Buyer') ||
      (activeFilter === 'Sellers' && u.role === 'Seller');
    return matchSearch && matchRole;
  });

  return (
    <div className="community-root">
      {/* Tab Switcher */}
      <div className="page-level-tabs">
        <button
          className={`page-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setSearch(''); }}
        >
          User Management
        </button>
        <button
          className={`page-tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => { setActiveTab('team'); setSearch(''); }}
        >
          Team Management
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Header */}
          <div className="comm-header">
            <div>
              <h1 className="page-title">User Management</h1>
              <p className="page-sub">Monitor, filter, and moderate the SecondLife community.</p>
            </div>
            <div className="total-users-badge">
              <span className="total-big">12,482</span>
              <span className="total-label">Total Users</span>
              <span className="total-sub">+9% New today</span>
            </div>
          </div>

          {/* User table card */}
          <div className="comm-table-card">
            <div className="comm-table-toolbar">
              <div className="comm-search-wrap">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, email, or user ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <span className="filter-label">Filter by Role:</span>
                {['All', 'Buyers', 'Sellers'].map(t => (
                  <button
                    key={t}
                    className={`filter-btn ${activeFilter === t ? 'active' : ''}`}
                    onClick={() => setActiveFilter(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button className="adv-filter-btn"><SlidersHorizontal size={13} style={{ marginRight: '4px' }} /> Advanced Filters</button>
            </div>

            <table className="comm-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>JOINED</th>
                  <th>LISTINGS</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className={u.dimmed ? 'dimmed-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <img src={u.avatar} alt={u.name} className="user-avatar-img" />
                        <div>
                          <p className="user-name">{u.name}</p>
                          <p className="user-email">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.role ? (
                        <span className={`role-pill ${u.role.toLowerCase()}`}>{u.role}</span>
                      ) : (
                        <span className="role-pill banned-role">—</span>
                      )}
                    </td>
                    <td className="date-cell">{u.joined}</td>
                    <td className="num-cell">{u.listings}</td>
                    <td>
                      <span className={`user-status ${u.statusType}`}>
                        {u.statusType !== 'banned' && '● '}
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="user-actions">
                        <button className="ua-btn" title="View"><Eye size={13} /></button>
                        <button className="ua-btn" title="Warning"><AlertTriangle size={13} /></button>
                        <button className="ua-btn" title="More"><MoreVertical size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer">
              <p>Showing 1–5 of 12,482 users</p>
              <div className="pagination">
                <button>‹</button>
                <button className="pg-active">1</button>
                <button>2</button>
                <button>3</button>
                <span>…</span>
                <button>1049</button>
                <button>›</button>
              </div>
            </div>
          </div>

          {/* Bottom stat cards with proper icons */}
          <div className="comm-bottom-stats">
            <div className="cbstat green">
              <span className="cbstat-icon-wrap green"><ShieldCheck size={20} /></span>
              <div>
                <p className="cbstat-label">TRUSTED SELLERS</p>
                <p className="cbstat-val">2,841</p>
              </div>
              <span className="cbstat-badge up">+4%</span>
            </div>
            <div className="cbstat red-card">
              <span className="cbstat-icon-wrap red"><UserX size={20} /></span>
              <div>
                <p className="cbstat-label">ACTIVE REPORTS</p>
                <p className="cbstat-val red-val">342</p>
              </div>
              <span className="cbstat-badge down">-12%</span>
            </div>
            <div className="cbstat orange-card">
              <span className="cbstat-icon-wrap orange"><Activity size={20} /></span>
              <div>
                <p className="cbstat-label">MARKET ACTIVITY</p>
                <p className="cbstat-val">High</p>
                <p className="cbstat-hint">Peak traffic observed at 8PM GMT</p>
              </div>
              <span className="cbstat-badge up">+15%</span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Team Management */}
          <div className="team-header">
            <div>
              <h1 className="page-title">Admin Team</h1>
              <p className="page-sub">Manage your organization's members and their access levels.</p>
            </div>
            <div className="team-header-right">
              <div className="team-search-wrap">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search team members…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="invite-btn"><UserPlus size={14} style={{ marginRight: '6px' }} /> Invite Team Member</button>
            </div>
          </div>

          {/* Admin Team table */}
          <div className="team-card">
            <table className="team-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>LAST ACTIVE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers
                  .filter(m =>
                    m.name.toLowerCase().includes(search.toLowerCase()) ||
                    m.email.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(m => (
                    <tr key={m.id}>
                      <td>
                        <div className="team-member-cell">
                          <img src={m.avatar} alt={m.name} className="team-avatar-img" />
                          <div>
                            <p className="team-member-name">{m.name}</p>
                            <p className="team-member-email">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`team-role-badge ${m.roleType}`}>{m.role}</span>
                      </td>
                      <td>
                        <span className={`team-status ${m.status.toLowerCase()}`}>
                          ● {m.status}
                        </span>
                      </td>
                      <td className="team-last-active">{m.lastActive}</td>
                      <td>
                        <button className="team-action-btn"><MoreVertical size={15} /></button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Permission Matrix */}
          <div className="team-card">
            <div className="perm-header">
              <div>
                <p className="team-section-title">Permission Matrix</p>
                <p className="team-section-sub">Define granular access control for each administrative role.</p>
              </div>
              <button className="edit-roles-btn">Edit Roles</button>
            </div>

            <table className="perm-table">
              <thead>
                <tr>
                  <th>ADMIN SECTION</th>
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

          {/* Role Cards */}
          <div className="role-cards-row">
            {roleCards.map(rc => (
              <div key={rc.title} className="role-card">
                <div className="role-card-top">
                  <span className="role-card-icon">{rc.icon}</span>
                  <span className={`role-count-badge ${rc.countColor}`}>{rc.count}</span>
                </div>
                <p className="role-card-title">{rc.title}</p>
                <p className="role-card-desc">{rc.desc}</p>
              </div>
            ))}
          </div>

          <p className="team-footer-note">© 2026 SecondLife Admin. Admin Dashboard v2.4.0</p>
        </>
      )}
    </div>
  );
}
