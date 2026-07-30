import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModeration } from '../../context/ModerationContext';
import {
  AlertTriangle, Shield, CheckCircle, Clock, ChevronLeft, ChevronRight,
  XCircle, Filter, MoreVertical, MessageSquare, History, Eye, EyeOff, Trash2, ShieldAlert
} from 'lucide-react';
import PolicyModal from '../../components/common/PolicyModal';
import ActionConfirmModal from '../../components/common/ActionConfirmModal';
import AuditLogModal from '../../components/common/AuditLogModal';
import './Disputes.css';

export default function Disputes() {
  const navigate = useNavigate();
  const { reports, takeModerationAction } = useModeration();

  const [activeReportId, setActiveReportId] = useState(() => reports[0]?.id || null);
  const [activeTab, setActiveTab] = useState('All Reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, Pending, Under Review, Resolved, Dismissed
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // ALL, High, Medium, Low
  const [sourceFilter, setSourceFilter] = useState('ALL'); // ALL, User Report, System Detected

  // Modal states
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({ isOpen: false });

  // Filtered reports calculation
  const filteredReports = reports.filter(r => {
    // Tab filter
    if (activeTab === 'Disputes Only' && r.source !== 'User Report') return false;
    if (activeTab === 'System Flags' && r.source !== 'System Detected') return false;
    if (activeTab === 'High Risk' && r.priority !== 'High') return false;

    // Status filter
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

    // Priority filter
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;

    // Source filter
    if (sourceFilter !== 'ALL' && r.source !== sourceFilter) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchTicket = r.ticketId.toLowerCase().includes(q);
      const matchAccused = r.accused?.username?.toLowerCase().includes(q) || r.accused?.name?.toLowerCase().includes(q);
      const matchReporter = r.reporter?.username?.toLowerCase().includes(q) || r.reporter?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchTicket && !matchAccused && !matchReporter) return false;
    }

    return true;
  });

  const activeReport = reports.find(r => r.id === activeReportId) || filteredReports[0] || reports[0];

  // Dynamic statistics
  const pendingCount = reports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;
  const resolved30dCount = reports.filter(r => r.status === 'Resolved' || r.status === 'Dismissed').length;
  const highRiskCount = reports.filter(r => r.priority === 'High' && r.status !== 'Resolved' && r.status !== 'Dismissed').length;

  const todayCount = reports.filter(r => {
    const rawDate = r.createdAt || r.date;
    if (!rawDate) return false;
    return new Date(rawDate).toDateString() === new Date().toDateString();
  }).length;

  // Moderation Action Handler with Confirmation for Destructive Actions
  const handleActionClick = (actionType, title, message, confirmVariant = 'danger') => {
    if (['suspend_1', 'suspend_7', 'suspend_30', 'ban_user', 'remove_listing', 'delete_message'].includes(actionType)) {
      setConfirmModalConfig({
        isOpen: true,
        actionType,
        title,
        message,
        confirmVariant
      });
    } else {
      // Direct actions (Under Review, Dismiss, Resolve, Restore)
      takeModerationAction({
        reportId: activeReport.id,
        actionType,
        moderatorName: 'Admin Moderator'
      });
    }
  };

  const handleConfirmActionExecute = ({ reason, notes }) => {
    takeModerationAction({
      reportId: activeReport.id,
      actionType: confirmModalConfig.actionType,
      moderatorName: 'Admin Moderator',
      reason,
      notes
    });
  };

  return (
    <div className="disputes-root">
      {/* Policy Modal */}
      <PolicyModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        policyKey={activeReport?.policyKey || 'EXTERNAL_PAYMENTS'}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
      />

      {/* Action Confirmation Modal */}
      <ActionConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig({ isOpen: false })}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmVariant={confirmModalConfig.confirmVariant}
        onConfirm={handleConfirmActionExecute}
      />

      {/* Header */}
      <div className="disputes-header">
        <div>
          <h1 className="page-title">Trust &amp; Safety Queue</h1>
          <p className="page-sub">Monitor and resolve community reports to maintain platform integrity.</p>
        </div>

        <button className="outline-btn-icon" onClick={() => setShowAuditModal(true)}>
            <History size={14} style={{ marginRight: '4px' }} /> Audit Log
          </button>
      </div>

      {/* Stat cards */}
      <div className="disputes-stats">
        <div className="dstat">
          <div className="dstat-icon-wrap blue"><Clock size={18} /></div>
          <div>
            <p className="dstat-label">Pending Review</p>
            <p className="dstat-val">{pendingCount}</p>
            <p className="dstat-hint green-txt">+{todayCount} created today</p>
          </div>
        </div>
        <div className="dstat">
          <div className="dstat-icon-wrap gray"><Clock size={18} /></div>
          <div>
            <p className="dstat-label">Avg. Response Time</p>
            <p className="dstat-val">N/A</p>
            <p className="dstat-hint">System Active</p>
          </div>
        </div>
        <div className="dstat">
          <div className="dstat-icon-wrap green"><CheckCircle size={18} /></div>
          <div>
            <p className="dstat-label">Resolved (30d)</p>
            <p className="dstat-val">{resolved30dCount}</p>
            <p className="dstat-hint green-txt">All-time resolution</p>
          </div>
        </div>
        <div className="dstat">
          <div className="dstat-icon-wrap red"><AlertTriangle size={18} /></div>
          <div>
            <p className="dstat-label">Flagged High Risk</p>
            <p className="dstat-val">{highRiskCount}</p>
            <span className="risk-icon"><AlertTriangle size={14} /></span>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="disputes-filter-bar">
        <div className="disp-search-box">
          <input
            type="text"
            placeholder="Search report title, ID, accused, reporter..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="disp-filter-group">
          <select value={activeTab} onChange={e => setActiveTab(e.target.value)}>
            <option value="All Reports">All Reports</option>
            <option value="Disputes Only">Disputes Only</option>
            <option value="System Flags">System Flags</option>
            <option value="High Risk">High Risk</option>
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>

          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
            <option value="ALL">All Sources</option>
            <option value="User Report">User Reports</option>
            <option value="System Detected">System Detected</option>
          </select>
        </div>
      </div>

      {/* Main panel */}
      <div className="disputes-panel">
        {/* Left: Report list */}
        <div className="disp-report-list">
          <div className="disp-list-header">
            <span className="disp-list-col">REPORT DETAILS</span>
            <span className="disp-list-col">ACCUSED / REPORTER</span>
            <span className="disp-list-col">STATUS</span>
            <span className="disp-list-col">PRIORITY</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="no-reports-found">
              <ShieldAlert size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
              <p>No reports match the selected filters.</p>
            </div>
          ) : (
            filteredReports.map(r => (
              <div
                key={r.id}
                className={`disp-report-row ${activeReport?.id === r.id ? 'active' : ''}`}
                onClick={() => setActiveReportId(r.id)}
              >
                <div className="disp-row-detail">
                  <p className="disp-row-title">{r.title}</p>
                  <p className="disp-row-meta">{r.ticketId} · {r.timeAgo}</p>
                  <span className="disp-source-tag">{r.source}</span>
                </div>
                <div className="disp-row-parties">
                  <p className="disp-party">{r.accused?.username || '@user'}</p>
                  <span className="party-arrow">←</span>
                  <p className="disp-party">{r.reporter?.username || '@reporter'}</p>
                </div>
                <div>
                  <span className={`disp-status ${r.statusType || 'open'}`}>{r.status}</span>
                </div>
                <div>
                  <span className={`disp-priority ${r.priorityType || 'low'}`}>
                    {r.priority === 'High' ? '🔴 High' : r.priority === 'Medium' ? '🟠 Medium' : '🟢 Low'}
                  </span>
                </div>
              </div>
            ))
          )}

          <div className="table-footer" style={{ padding: '12px 16px' }}>
            <p>Showing {filteredReports.length} of {reports.length} reports</p>
            <div className="disp-pg-row">
              <button><ChevronLeft size={14} /></button>
              <button><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        {/* Right: Incident detail */}
        {activeReport ? (
          <div className="disp-detail-card">
            <div className="disp-detail-header">
              <div>
                <p className="incident-title">{activeReport.title}</p>
                <p className="incident-subtitle">{activeReport.ticketId} · Source: {activeReport.source}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`disp-status ${activeReport.statusType}`}>{activeReport.status}</span>
                <span className={`disp-priority ${activeReport.priorityType}`}>
                  {activeReport.priority === 'High' ? '🔴 High' : activeReport.priority === 'Medium' ? '🟠 Medium' : '🟢 Low'}
                </span>
                <button
                  className="chat-oversight-link-btn"
                  title="Open Chat Oversight & Action Queue"
                  onClick={() => navigate(`/admin/messages?ticketId=${activeReport.ticketId}`)}
                >
                  <MessageSquare size={14} style={{ marginRight: '4px' }} /> Chat Oversight
                </button>
              </div>
            </div>

            {/* Summary */}
            <p className="incident-section-label">REPORT SUMMARY &amp; REASON</p>
            <div className="incident-quote-box">
              <p className="incident-quote">"{activeReport.evidence?.summary || 'No detailed summary provided.'}"</p>
              <span className="violation-tag">Policy Category: {activeReport.reportType}</span>
            </div>

            {/* Parties */}
            <div className="incident-parties">
              <div className="party-col">
                <p className="party-label">ACCUSED USER</p>
                <div className="party-user-row">
                  <img src={activeReport.accused?.avatar} alt="Accused" className="party-avatar" />
                  <div>
                    <p className="party-val">{activeReport.accused?.username}</p>
                    <p className="party-sub">{activeReport.accused?.name} · Age: {activeReport.accused?.accountAge}</p>
                    <p className="party-warnings-txt">Warnings: {activeReport.accused?.warningsCount || 0} | Reports: {activeReport.accused?.reportsCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="party-col">
                <p className="party-label">REPORTER / SOURCE</p>
                <div className="party-user-row">
                  <img src={activeReport.reporter?.avatar} alt="Reporter" className="party-avatar" />
                  <div>
                    <p className="party-val">{activeReport.reporter?.username}</p>
                    <p className="party-sub">{activeReport.reporter?.name} · {activeReport.reporter?.verified ? 'Verified Member' : 'Member'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Listing details if applicable */}
            {activeReport.listing && (
              <>
                <p className="incident-section-label">ASSOCIATED MARKETPLACE LISTING</p>
                <div className="incident-listing-card">
                  <img src={activeReport.listing.image} alt="Listing" className="inc-listing-thumb" />
                  <div>
                    <p className="inc-listing-title">{activeReport.listing.title}</p>
                    <p className="inc-listing-price">{activeReport.listing.price} · Listing {activeReport.listing.id}</p>
                    <p className="inc-listing-seller">Seller: {activeReport.listing.seller}</p>
                  </div>
                </div>
              </>
            )}

            {/* Visual Evidence / Flagged Messages */}
            <p className="incident-section-label">EVIDENCE &amp; INTERACTION LOG</p>
            {activeReport.evidence?.messages && activeReport.evidence.messages.length > 0 ? (
              <div className="interactions-scroll">
                {activeReport.evidence.messages.map(m => (
                  <div key={m.id} className={`interaction-msg ${m.isFlagged ? 'flagged-msg-block' : ''}`}>
                    <strong>{m.sender}:</strong> "{m.text}"
                    {m.isFlagged && <span className="flag-badge-inline">🚨 {m.flagReason || 'Flagged'}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-evidence-txt">No conversation logs attached to this report.</p>
            )}

            {activeReport.evidence?.images && activeReport.evidence.images.length > 0 && (
              <div className="evidence-grid" style={{ marginTop: '10px' }}>
                {activeReport.evidence.images.map((imgUrl, i) => (
                  <img key={i} src={imgUrl} alt={`Evidence ${i + 1}`} className="evidence-img" />
                ))}
              </div>
            )}

            {/* Policy Reference Box */}
            <div className="policy-reference-card">
              <div className="policy-card-top">
                <Shield size={16} className="policy-shield-icon" />
                <span>Policy Reference Standard</span>
              </div>
              <p className="policy-card-body">
                Violation of Section Policy guidelines regarding <strong>{activeReport.reportType}</strong>. Solicitations, counterfeit claims, or abusive behavior carry strict penalties up to permanent expulsion.
              </p>
              <button className="read-policy-btn" onClick={() => setShowPolicyModal(true)}>
                Read Full Policy Standard
              </button>
            </div>

            {/* Resolution Controls */}
            <div className="resolution-actions">
              <p className="incident-section-label">MODERATION RESOLUTION CONTROLS</p>
              
              <div className="res-btn-row">
                <button
                  className="res-btn warn"
                  onClick={() => handleActionClick('send_warning', 'Issue Official Warning', `Send official warnings notice to ${activeReport.accused?.username}?`, 'warning')}
                >
                  <Shield size={13} /> Issue Warning
                </button>
                <button
                  className="res-btn ban"
                  onClick={() => handleActionClick('suspend_7', 'Suspend User (7 Days)', `Suspend ${activeReport.accused?.username} for 7 days?`, 'danger')}
                >
                  <Clock size={13} /> Suspend (7d)
                </button>
                <button
                  className="res-btn ban"
                  onClick={() => handleActionClick('ban_user', 'Permanently Ban Account', `Are you sure you want to permanently ban ${activeReport.accused?.username}?`, 'danger')}
                >
                  <XCircle size={13} /> Ban Account
                </button>
              </div>

              {activeReport.listing && (
                <div className="res-btn-row" style={{ marginTop: '8px' }}>
                  <button
                    className="res-btn warn"
                    onClick={() => handleActionClick('remove_listing', 'Remove Listing', `Remove listing "${activeReport.listing.title}" from marketplace?`, 'danger')}
                  >
                    <Trash2 size={13} /> Remove Listing
                  </button>
                </div>
              )}

              <div className="res-btn-row" style={{ marginTop: '10px' }}>
                <button
                  className="res-btn-review"
                  onClick={() => handleActionClick('under_review')}
                >
                  Mark as Under Review
                </button>
                <button
                  className="res-btn-resolve"
                  onClick={() => handleActionClick('resolve_report')}
                >
                  <CheckCircle size={14} /> Mark as Resolved
                </button>
              </div>

              <button
                className="dismiss-btn"
                onClick={() => handleActionClick('dismiss')}
              >
                Dismiss as False Report
              </button>
            </div>
          </div>
        ) : (
          <div className="disp-detail-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Select a report from the list to inspect details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
