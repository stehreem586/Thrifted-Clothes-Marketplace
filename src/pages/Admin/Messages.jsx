import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useModeration } from '../../context/ModerationContext';
import {
  Filter, Download, AlertTriangle, Shield, Clock,
  User, CheckCircle, HelpCircle, XCircle, ArrowRight, Search, Eye, EyeOff, Trash2
} from 'lucide-react';
import PolicyModal from '../../components/common/PolicyModal';
import ActionConfirmModal from '../../components/common/ActionConfirmModal';
import './Messages.css';

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reports, takeModerationAction } = useModeration();

  const [activeReportId, setActiveReportId] = useState(null);
  const [search, setSearch] = useState('');
  const [privacyMaskEnabled, setPrivacyMaskEnabled] = useState(true);

  // Modals
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({ isOpen: false });

  // Handle URL ticket parameter deep-linking from Disputes section
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ticketParam = params.get('ticketId') || params.get('reportId');

    if (ticketParam) {
      const found = reports.find(r => r.ticketId === ticketParam || r.id === ticketParam);
      if (found) {
        setActiveReportId(found.id);
        return;
      }
    }

    if (reports.length > 0 && !activeReportId) {
      setActiveReportId(reports[0].id);
    }
  }, [location.search, reports]);

  const activeReport = reports.find(r => r.id === activeReportId) || reports[0];

  // Filtered pending flags
  const filteredFlags = reports.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.ticketId.toLowerCase().includes(q) ||
      r.reportType.toLowerCase().includes(q) ||
      r.accused?.username?.toLowerCase().includes(q) ||
      r.reporter?.username?.toLowerCase().includes(q)
    );
  });

  // Action Dispatcher with Confirmation Workflow
  const handleActionTrigger = (actionType, title, message, confirmVariant = 'danger') => {
    if (['suspend_1', 'suspend_7', 'suspend_30', 'ban_user', 'remove_listing', 'delete_message'].includes(actionType)) {
      setConfirmModalConfig({
        isOpen: true,
        actionType,
        title,
        message,
        confirmVariant
      });
    } else {
      takeModerationAction({
        reportId: activeReport.id,
        actionType,
        moderatorName: 'Chat Oversight Admin'
      });
    }
  };

  const handleConfirmActionExecute = ({ reason, notes }) => {
    takeModerationAction({
      reportId: activeReport.id,
      actionType: confirmModalConfig.actionType,
      moderatorName: 'Chat Oversight Admin',
      reason,
      notes
    });
  };

  return (
    <div className="messages-root">
      {/* Policy Modal */}
      <PolicyModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        policyKey={activeReport?.policyKey || 'EXTERNAL_PAYMENTS'}
      />

      {/* Confirmation Modal */}
      <ActionConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig({ isOpen: false })}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmVariant={confirmModalConfig.confirmVariant}
        onConfirm={handleConfirmActionExecute}
      />

      {/* Header */}
      <div className="msg-header">
        <div>
          <h1 className="page-title">Chat Oversight &amp; Action Center</h1>
          <p className="page-sub">Reviewing active policy violations and inspecting conversation threads in real time.</p>
        </div>
        <div className="msg-header-actions">
          <button className="outline-btn-icon" onClick={() => navigate('/admin/disputes')}>
            <Shield size={14} style={{ marginRight: '4px' }} /> View Disputes Dashboard
          </button>
          <button className="export-btn-sm" onClick={() => setPrivacyMaskEnabled(!privacyMaskEnabled)}>
            {privacyMaskEnabled ? <Eye size={14} style={{ marginRight: '4px' }} /> : <EyeOff size={14} style={{ marginRight: '4px' }} />}
            {privacyMaskEnabled ? 'Unmask Messages' : 'Mask Non-Offending Messages'}
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className="msg-panel">
        {/* Left: Pending flags queue */}
        <div className="msg-flag-list">
          <div className="flag-search-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search flagged tickets or users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <p className="flag-list-title">FLAGGED CHAT QUEUE ({filteredFlags.length})</p>

          {filteredFlags.length > 0 ? (
            filteredFlags.map(f => (
              <div
                key={f.id}
                className={`flag-item ${activeReport?.id === f.id ? 'active' : ''}`}
                onClick={() => setActiveReportId(f.id)}
              >
                <div className="flag-item-top">
                  <span className={`priority-badge ${f.priorityType}`}>
                    {f.priority === 'High' && <AlertTriangle size={10} style={{ marginRight: '4px' }} />}
                    {f.priority === 'High' ? '🔴 High Risk' : f.priority === 'Medium' ? '🟠 Medium' : '🟢 Low'}
                  </span>
                  <span className="flag-time"><Clock size={11} style={{ marginRight: '4px' }} /> {f.timeAgo}</span>
                </div>
                <p className="flag-title">{f.reportType}</p>
                <p className="flag-ticket">{f.ticketId} · {f.listing ? f.listing.title : 'Chat Thread'}</p>
                <p className="flag-meta">Accused: {f.accused?.username} | Reporter: {f.reporter?.username}</p>
                <p className="flag-rule">Policy: {f.reportType}</p>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No flagged chat reports currently in queue.
            </div>
          )}
        </div>

        {/* Right side: Chat preview + Profile/Policy stats */}
        {activeReport ? (
          <div className="msg-content-side">
            {/* Chat oversight card */}
            <div className="chat-card-custom">
              <div className="chat-card-header">
                <div className="avatar-header-group">
                  <img
                    src={activeReport.reporter?.avatar}
                    alt={activeReport.reporter?.name}
                    className="chat-header-avatar"
                  />
                  <img
                    src={activeReport.accused?.avatar}
                    alt={activeReport.accused?.name}
                    className="chat-header-avatar overlap"
                  />
                  <div>
                    <p className="chat-header-title">
                      Conversation: {activeReport.reporter?.username} &amp; {activeReport.accused?.username}
                    </p>
                    <p className="chat-header-meta">
                      Listing: {activeReport.listing ? activeReport.listing.title : 'Direct Inquiry'} · Ticket {activeReport.ticketId}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`disp-status ${activeReport.statusType}`}>{activeReport.status}</span>
                </div>
              </div>

              <div className="chat-body-custom">
                {/* Restricted View Badge */}
                <div className="restricted-badge-wrap">
                  <span className="restricted-badge-text">
                    {privacyMaskEnabled ? '🔒 RESTRICTED PRIVACY VIEW (NON-OFFENDING MESSAGES MASKED)' : '👁️ FULL UNMASKED AUDIT MODE'}
                  </span>
                </div>

                {/* Render conversation messages */}
                {activeReport.evidence?.messages && activeReport.evidence.messages.length > 0 ? (
                  activeReport.evidence.messages.map((msg, index) => (
                    <React.Fragment key={msg.id || index}>
                      {msg.isFlagged ? (
                        <div className="reported-message-container">
                          <div className="reported-badge">
                            🚨 REPORTED MESSAGE (VIOLATION DETECTED)
                          </div>
                          <div className="reported-message-bubble">
                            <p className="reported-bubble-text">"{msg.text}"</p>
                            <div className="flagged-msg-actions">
                              <button
                                className="msg-del-btn"
                                onClick={() => handleActionTrigger('delete_message', 'Delete Message', 'Delete this offending message from chat history?', 'danger')}
                              >
                                <Trash2 size={12} style={{ marginRight: '4px' }} /> Delete Message
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`chat-bubble ${msg.sender === activeReport.accused?.username ? 'right-bubble' : 'left-bubble'}`}>
                          <p className={`bubble-text ${privacyMaskEnabled ? 'disabled-text' : ''}`}>
                            {privacyMaskEnabled ? '[Message hidden for privacy: Content unrelated to flag.]' : msg.text}
                          </p>
                          <span className="bubble-time">{msg.sender} • {msg.time || '10:20 AM'}</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="no-chat-messages">
                    <p>No direct messages attached to this report.</p>
                  </div>
                )}

                {/* Inline Action Buttons under Chat */}
                <div className="chat-actions-row">
                  <span className="actions-info-txt">ℹ️ Actions are logged in audit history.</span>
                  <div className="actions-buttons">
                    <button
                      className="chat-action-btn warn"
                      onClick={() => handleActionTrigger('send_warning', 'Issue Warning', `Issue formal warning to ${activeReport.accused?.username}?`, 'warning')}
                    >
                      Warn User
                    </button>
                    <button
                      className="chat-action-btn restrict"
                      onClick={() => handleActionTrigger('suspend_7', 'Restrict Account', `Restrict ${activeReport.accused?.username} for 7 days?`, 'danger')}
                    >
                      Restrict Account
                    </button>
                    <button
                      className="chat-action-btn dismiss"
                      onClick={() => handleActionTrigger('dismiss')}
                    >
                      Dismiss Flag
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower layout: User Profile & Policy Reference */}
            <div className="lower-info-row">
              {/* User Profile */}
              <div className="info-box user-profile-box">
                <p className="info-box-title">USER PROFILE: {activeReport.accused?.username}</p>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Account Age</span>
                    <span className="info-val">{activeReport.accused?.accountAge || '30 Days'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Previous Flags</span>
                    <span className="info-val flag-alert">{activeReport.accused?.warningsCount || 0} Warnings</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Listings / Sales</span>
                    <span className="info-val">{activeReport.accused?.listingsCount || 0} / {activeReport.accused?.totalSales || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className="info-val">{activeReport.accused?.verified ? 'Verified Seller' : 'Standard Account'}</span>
                  </div>
                </div>
              </div>

              {/* Policy Reference */}
              <div className="info-box policy-box">
                <p className="info-box-title">POLICY REFERENCE</p>
                <div className="policy-content">
                  <p className="policy-section">{activeReport.reportType}</p>
                  <p className="policy-text">
                    "{activeReport.evidence?.summary || 'Soliciting off-platform trade or abusive language is prohibited.'}"
                  </p>
                  <button className="policy-link-btn" onClick={() => setShowPolicyModal(true)}>
                    Read Full Policy <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="msg-content-side" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Select a flagged conversation from the queue.</p>
          </div>
        )}
      </div>

      {/* Footer statistics */}
      <footer className="chat-oversight-footer">
        <div className="footer-stat">
          <span className="fs-label">AVG RESOLVE TIME</span>
          <span className="fs-val">12.4m</span>
        </div>
        <div className="footer-stat">
          <span className="fs-label">ACTIVE TICKETS</span>
          <span className="fs-val">{reports.length}</span>
        </div>
        <p className="footer-confidential">© 2026 SecondLife Admin Intelligence — Strictly Confidential</p>
      </footer>
    </div>
  );
}
