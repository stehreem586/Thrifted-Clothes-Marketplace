import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ReportModal.css';

export default function ActionConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm Action',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  onConfirm
}) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    onConfirm({ reason, notes });
    setSubmitting(false);
    setReason('');
    setNotes('');
    onClose();
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-card" onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="report-title-wrap">
            <AlertTriangle
              size={22}
              style={{
                color: confirmVariant === 'danger' ? '#dc2626' : '#d97706',
                background: confirmVariant === 'danger' ? '#fee2e2' : '#fef3c7',
                padding: '6px',
                borderRadius: '8px'
              }}
            />
            <div>
              <h3>{title}</h3>
              <p className="report-subtitle">Confirmation required for administrative action.</p>
            </div>
          </div>
          <button className="report-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleConfirmSubmit} className="report-modal-form">
          <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: '1.5' }}>
            {message}
          </p>

          <div className="report-form-group">
            <label htmlFor="actionReasonInput">Official Reason *</label>
            <input
              id="actionReasonInput"
              type="text"
              required
              placeholder="e.g. Violation of Section A.2 External Payments Policy"
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
            />
          </div>

          <div className="report-form-group">
            <label htmlFor="actionNotesInput">Internal Moderator Notes (Optional)</label>
            <textarea
              id="actionNotesInput"
              rows={3}
              placeholder="Logged permanently in audit history..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="report-modal-actions">
            <button type="button" className="report-cancel-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="report-submit-btn"
              style={{
                backgroundColor: confirmVariant === 'danger' ? '#dc2626' : '#d97706'
              }}
              disabled={submitting}
            >
              {submitting ? 'Executing...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
