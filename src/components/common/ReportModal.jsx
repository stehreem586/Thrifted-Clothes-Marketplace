import React, { useState } from 'react';
import { useModeration } from '../../context/ModerationContext';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, X, ShieldAlert, CheckCircle } from 'lucide-react';
import './ReportModal.css';

const REPORT_REASONS = [
  'Suspicious Transaction',
  'External Payment Request',
  'Abusive Language',
  'Harassment',
  'Spam',
  'Fake Listing',
  'Counterfeit Item',
  'Fraud / Scam Attempt',
  'Duplicate Listings',
  'Fake Reviews',
  'Identity Impersonation',
  'Inappropriate Content'
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType = 'User', // 'User' | 'Seller' | 'Buyer' | 'Listing' | 'Message' | 'Review'
  targetUser = null,
  targetListing = null,
  targetMessageId = null
}) {
  const { submitUserReport } = useModeration();
  const { user, profile, showToast } = useAuth();

  const [reportType, setReportType] = useState('External Payment Request');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const reporter = {
        id: user?.id || 'usr_guest',
        name: profile?.name || 'Community Member',
        email: user?.email || 'user@example.com',
        avatar: profile?.avatar_url
      };

      const accused = targetUser || {
        id: targetListing?.seller_id || 'usr_seller',
        name: targetListing?.seller?.name || targetListing?.seller || 'Reported Seller'
      };

      submitUserReport({
        reportType,
        description,
        reporter,
        accused,
        listing: targetListing,
        messageId: targetMessageId
      });

      setSubmitting(false);
      setSubmittedSuccess(true);

      setTimeout(() => {
        setSubmittedSuccess(false);
        if (showToast) showToast('Report submitted successfully to Safety Team');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error submitting report:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-card" onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="report-title-wrap">
            <ShieldAlert size={20} className="report-modal-icon" />
            <div>
              <h3>Report {targetType}</h3>
              <p className="report-subtitle">Help keep SecondLife safe and trusted.</p>
            </div>
          </div>
          <button className="report-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="report-success-view">
            <CheckCircle size={48} className="report-success-icon" />
            <h4>Report Submitted</h4>
            <p>Thank you for letting us know. Our Trust &amp; Safety team is reviewing this report.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="report-modal-form">
            {/* Target Info Summary */}
            <div className="report-target-box">
              <span className="target-lbl">Reporting:</span>
              <span className="target-val">
                {targetUser?.name || targetListing?.title || targetType}
              </span>
            </div>

            {/* Reason Dropdown */}
            <div className="report-form-group">
              <label htmlFor="reportReasonSelect">Reason for Report *</label>
              <select
                id="reportReasonSelect"
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                required
              >
                {REPORT_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <div className="report-form-group">
              <label htmlFor="reportDescription">Additional Details (Optional)</label>
              <textarea
                id="reportDescription"
                rows={4}
                placeholder="Provide details or context regarding the policy violation..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="report-privacy-note">
              <AlertTriangle size={13} style={{ marginRight: '6px', flexShrink: 0 }} />
              <span>Reports are confidential. Your reporter ID is attached automatically for audit compliance.</span>
            </div>

            {/* Actions */}
            <div className="report-modal-actions">
              <button type="button" className="report-cancel-btn" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="report-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
