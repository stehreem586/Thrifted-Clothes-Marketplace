import React, { useState } from 'react';
import {
  Filter, Download, AlertTriangle, Shield, Clock,
  User, CheckCircle, HelpCircle, XCircle, ArrowRight, Search
} from 'lucide-react';
import './Messages.css';

const flags = [
  {
    id: 1,
    priority: 'High Risk',
    priorityType: 'high',
    title: 'Suspicious Transaction:',
    ticketId: 'Ticket #4823',
    meta: 'Reported by: User_LydiaV',
    rule: 'Policy: Fraud/Scam Attempt',
    time: '4m ago',
    active: true,
  },
  {
    id: 2,
    priority: 'Medium',
    priorityType: 'medium',
    title: 'Abusive Language: Ticket #4827',
    ticketId: 'Reported by: Seller_EuroChic',
    meta: 'Policy: Community Guidelines',
    rule: '',
    time: '15m ago',
    active: false,
  },
  {
    id: 3,
    priority: 'Low',
    priorityType: 'low',
    title: 'External Payment Link: Ticket #4821',
    ticketId: 'System Detected',
    meta: 'Policy: Off-Platform Trade',
    rule: '',
    time: '1h ago',
    active: false,
  },
];

export default function Messages() {
  const [activeFlag, setActiveFlag] = useState(1);
  const [search, setSearch] = useState('');

  return (
    <div className="messages-root">
      {/* Header */}
      <div className="msg-header">
        <div>
          <h1 className="page-title">Chat Oversight</h1>
          <p className="page-sub">Reviewing 12 active policy violations and flagged content.</p>
        </div>
        <div className="msg-header-actions">
          <button className="outline-btn-icon"><Filter size={14} style={{ marginRight: '4px' }} /> Filter High Risk</button>
          <button className="export-btn-sm"><Download size={14} style={{ marginRight: '4px' }} /> Export Report</button>
        </div>
      </div>

      {/* Main split view */}
      <div className="msg-panel">
        {/* Left: Pending flags */}
        <div className="msg-flag-list">
          <div className="flag-search-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search flagged tickets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <p className="flag-list-title">PENDING FLAGS</p>
          {flags.map(f => (
            <div
              key={f.id}
              className={`flag-item ${activeFlag === f.id ? 'active' : ''}`}
              onClick={() => setActiveFlag(f.id)}
            >
              <div className="flag-item-top">
                <span className={`priority-badge ${f.priorityType}`}>
                  {f.priority === 'High Risk' && <AlertTriangle size={10} style={{ marginRight: '4px' }} />}
                  {f.priority}
                </span>
                <span className="flag-time"><Clock size={11} style={{ marginRight: '4px' }} /> {f.time}</span>
              </div>
              <p className="flag-title">{f.title}</p>
              <p className="flag-ticket">{f.ticketId}</p>
              <p className="flag-meta">{f.meta}</p>
              {f.rule && <p className="flag-rule">{f.rule}</p>}
            </div>
          ))}
        </div>

        {/* Right side: Chat preview + Profile/Policy stats */}
        <div className="msg-content-side">
          {/* Chat box */}
          <div className="chat-card-custom">
            <div className="chat-card-header">
              <div className="avatar-header-group">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="LydiaV"
                  className="chat-header-avatar"
                />
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Merchant_X"
                  className="chat-header-avatar overlap"
                />
                <div>
                  <p className="chat-header-title">Conversation: LydiaV &amp; Merchant_X</p>
                  <p className="chat-header-meta">Listing: Vintage Gold Trench · Ticket #4823</p>
                </div>
              </div>
              <button className="chat-more-btn">⋯</button>
            </div>

            <div className="chat-body-custom">
              {/* Restricted View Badge */}
              <div className="restricted-badge-wrap">
                <span className="restricted-badge-text">🔒 RESTRICTED PRIVACY VIEW</span>
              </div>

              {/* Message 1 */}
              <div className="chat-bubble left-bubble">
                <p className="bubble-text disabled-text">[Message hidden for privacy: Content unrelated to flag.]</p>
                <span className="bubble-time">LydiaV • 10:22 AM</span>
              </div>

              {/* Message 2 */}
              <div className="chat-bubble right-bubble">
                <p className="bubble-text disabled-text">[Message hidden for privacy: Content unrelated to flag.]</p>
                <span className="bubble-time">Merchant_X • 10:44 AM</span>
              </div>

              {/* Reported message block */}
              <div className="reported-message-container">
                <div className="reported-badge">🚨 REPORTED MESSAGE</div>
                <div className="reported-message-bubble">
                  <p className="reported-bubble-text">
                    "Can we do this outside of SecondLife? I can pay via Venmo/CashApp directly to avoid fees."
                  </p>
                </div>
              </div>

              {/* Action buttons under chat */}
              <div className="chat-actions-row">
                <span className="actions-info-txt">ℹ️ Resolved actions will be logged.</span>
                <div className="actions-buttons">
                  <button className="chat-action-btn warn">Warn User</button>
                  <button className="chat-action-btn restrict">Restrict Account</button>
                  <button className="chat-action-btn dismiss">Dismiss Flag</button>
                </div>
              </div>
            </div>
          </div>

          {/* Lower layout: User Profile & Policy Reference */}
          <div className="lower-info-row">
            {/* User Profile */}
            <div className="info-box user-profile-box">
              <p className="info-box-title">USER PROFILE: LYDIAV</p>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Account Age</span>
                  <span className="info-val">14 Days</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Previous Flags</span>
                  <span className="info-val flag-alert">3 (Warning Sent)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Success Rate</span>
                  <span className="info-val">0% (No Sales)</span>
                </div>
              </div>
            </div>

            {/* Policy Reference */}
            <div className="info-box policy-box">
              <p className="info-box-title">POLICY REFERENCE</p>
              <div className="policy-content">
                <p className="policy-section">Section A.2: External Payments</p>
                <p className="policy-text">
                  "Soliciting or offering payment through methods outside of the SecondLife secure checkout is strictly prohibited to protect the community from fraud."
                </p>
                <a href="#policy" className="policy-link">Read Full Policy <ArrowRight size={12} /></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer statistics */}
      <footer className="chat-oversight-footer">
        <div className="footer-stat">
          <span className="fs-label">AVG RESOLVE TIME</span>
          <span className="fs-val">12.4m</span>
        </div>
        <div className="footer-stat">
          <span className="fs-label">TODAY'S TICKETS</span>
          <span className="fs-val">142</span>
        </div>
        <p className="footer-confidential">© 2026 SecondLife Admin Intelligence — Strictly Confidential</p>
      </footer>
    </div>
  );
}
