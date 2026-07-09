import React, { useState } from 'react';
import {
  AlertTriangle, Shield, CheckCircle, Clock, ChevronLeft, ChevronRight,
  XCircle, Filter, MoreVertical
} from 'lucide-react';
import './Disputes.css';

const reports = [
  {
    id: 1,
    title: 'Counterfeit Luxury Bag',
    listingId: '#46-4682 · 34 mins',
    timeAgo: '34 mins ago',
    accused: '@alex_vintg',
    reporter: '@luxury_reseller',
    status: 'Open',
    statusType: 'open',
    priority: 'High',
    priorityType: 'high',
    active: true,
  },
  {
    id: 2,
    title: 'Inappropriate Language',
    listingId: '#46-4682 · 1 hour',
    timeAgo: '1 hour ago',
    accused: '@mod_lover',
    reporter: '@user_9001',
    status: 'Open',
    statusType: 'open',
    priority: 'Low',
    priorityType: 'low',
    active: false,
  },
  {
    id: 3,
    title: 'Non-Delivery Claim',
    listingId: '#46-4682 · 2 hours',
    timeAgo: '2 hours ago',
    accused: '@buyer_jake',
    reporter: '@seller_pro',
    status: 'Resolved',
    statusType: 'resolved',
    priority: 'Medium',
    priorityType: 'medium',
    active: false,
  },
  {
    id: 4,
    title: 'Spam Behavior',
    listingId: '#46-4671 · 4 hours',
    timeAgo: '4 hours ago',
    accused: 'System Bot',
    reporter: '@promo_deals_32',
    status: 'Dismissed',
    statusType: 'dismissed',
    priority: 'Low',
    priorityType: 'low',
    active: false,
  },
];

export default function Disputes() {
  const [activeReport, setActiveReport] = useState(1);
  const [activeTab, setActiveTab] = useState('All Reports');

  const active = reports.find(r => r.id === activeReport);

  return (
    <div className="disputes-root">
      {/* Header */}
      <div className="disputes-header">
        <div>
          <h1 className="page-title">Trust &amp; Safety Queue</h1>
          <p className="page-sub">Monitor and resolve community reports to maintain platform integrity.</p>
        </div>
        <div className="disputes-tabs">
          {['All Reports', 'Disputes Only'].map(t => (
            <button
              key={t}
              className={`disp-tab-btn ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
          <button className="outline-btn-icon"><Filter size={14} /> Filter</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="disputes-stats">
        <div className="dstat">
          <div className="dstat-icon-wrap blue"><Clock size={18} /></div>
          <div>
            <p className="dstat-label">Pending Review</p>
            <p className="dstat-val">42</p>
            <p className="dstat-hint green-txt">+5 today</p>
          </div>
        </div>
        <div className="dstat">
          <div className="dstat-icon-wrap gray"><Clock size={18} /></div>
          <div>
            <p className="dstat-label">Avg. Response Time</p>
            <p className="dstat-val">2.4h</p>
            <p className="dstat-hint">0% vs last week</p>
          </div>
        </div>
        <div className="dstat">
          <div className="dstat-icon-wrap green"><CheckCircle size={18} /></div>
          <div>
            <p className="dstat-label">Resolved (30d)</p>
            <p className="dstat-val">128</p>
            <p className="dstat-hint green-txt">99% success</p>
          </div>
        </div>
        <div className="dstat">
          <div className="dstat-icon-wrap red"><AlertTriangle size={18} /></div>
          <div>
            <p className="dstat-label">Flagged High Risk</p>
            <p className="dstat-val">7</p>
            <span className="risk-icon"><AlertTriangle size={14} /></span>
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className="disputes-panel">
        {/* Left: Report list */}
        <div className="disp-report-list">
          <div className="disp-list-header">
            <span className="disp-list-col">REPORT DETAILS</span>
            <span className="disp-list-col">REPORTER / ACCUSED</span>
            <span className="disp-list-col">STATUS</span>
            <span className="disp-list-col">PRIORITY</span>
          </div>
          {reports.map(r => (
            <div
              key={r.id}
              className={`disp-report-row ${activeReport === r.id ? 'active' : ''}`}
              onClick={() => setActiveReport(r.id)}
            >
              <div className="disp-row-detail">
                <p className="disp-row-title">{r.title}</p>
                <p className="disp-row-meta">{r.listingId}</p>
                <p className="disp-row-meta">{r.timeAgo}</p>
              </div>
              <div className="disp-row-parties">
                <p className="disp-party">{r.accused}</p>
                <span className="party-arrow">→</span>
                <p className="disp-party">{r.reporter}</p>
              </div>
              <div>
                <span className={`disp-status ${r.statusType}`}>{r.status}</span>
              </div>
              <div>
                <span className={`disp-priority ${r.priorityType}`}>{r.priority}</span>
              </div>
            </div>
          ))}
          <div className="table-footer" style={{padding:'12px 16px'}}>
            <p>Showing 4 of 42 active reports</p>
            <div className="disp-pg-row">
              <button><ChevronLeft size={14}/></button>
              <button><ChevronRight size={14}/></button>
            </div>
          </div>
        </div>

        {/* Right: Incident detail */}
        {active && (
          <div className="disp-detail-card">
            <div className="disp-detail-header">
              <p className="incident-title">Incident Detail</p>
              <span className="incident-date-badge">12-31-2023</span>
            </div>

            <p className="incident-section-label">REPORT SUMMARY</p>
            <p className="incident-quote">
              "The buyer claims the stitching on the interior label of the Chanel 19 Flap bag does not match authentic production standards. Buyer has provided comparison photos."
            </p>

            <div className="incident-parties">
              <div className="party-col">
                <p className="party-label">Accused</p>
                <p className="party-val">@luxury_reseller</p>
                <p className="party-sub">Trusted Seller</p>
              </div>
              <div className="party-col">
                <p className="party-label">Reporter</p>
                <p className="party-val">@alex_vintg</p>
                <p className="party-sub">Trusted Seller</p>
              </div>
            </div>

            <p className="incident-section-label">VISUAL EVIDENCE (4)</p>
            <div className="evidence-grid">
              <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&h=200&q=80" alt="Evidence 1" className="evidence-img" />
              <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&h=200&q=80" alt="Evidence 2" className="evidence-img" />
            </div>

            <p className="incident-section-label">RECENT INTERACTIONS</p>
            <div className="interactions-scroll">
              <p className="interaction-msg">
                <strong>@luxury_reseller:</strong> "I assure you it's 100% authentic. I bought it from the Paris flagship…"
              </p>
              <p className="interaction-msg">
                <strong>@alex_vintg:</strong> "The heat stamp is completely off. I'm filing a dispute now."
              </p>
            </div>

            <div className="resolution-actions">
              <p className="incident-section-label">Resolution Controls</p>
              <div className="res-btn-row">
                <button className="res-btn warn"><Shield size={13} /> Issue Warning</button>
                <button className="res-btn ban"><XCircle size={13} /> Ban Account</button>
              </div>
              <button className="res-btn-resolve">
                <CheckCircle size={14} /> Mark as Resolved
              </button>
              <button className="dismiss-btn">Dismiss as False Report</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
