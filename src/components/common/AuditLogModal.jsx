import React from 'react';
import { useModeration } from '../../context/ModerationContext';
import { History, X, Shield, Clock } from 'lucide-react';
import './ReportModal.css';

export default function AuditLogModal({ isOpen, onClose }) {
  const { auditLog } = useModeration();
  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-card" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="report-title-wrap">
            <History size={22} style={{ color: '#6366f1', background: '#e0e7ff', padding: '6px', borderRadius: '8px' }} />
            <div>
              <h3>Moderation Audit History</h3>
              <p className="report-subtitle">Immutable log of all admin oversight actions</p>
            </div>
          </div>
          <button className="report-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="report-modal-form" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
          {auditLog.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>No moderation actions recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {auditLog.map(log => (
                <div key={log.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                      ⚡ {log.action}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {log.date}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', gap: '16px', marginBottom: '4px' }}>
                    <span><strong>Moderator:</strong> {log.moderator}</span>
                    {log.reportId && <span><strong>Ticket:</strong> {log.reportId}</span>}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                    "{log.reason}" {log.notes ? `— ${log.notes}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="report-modal-actions" style={{ marginTop: '16px' }}>
            <button className="report-cancel-btn" onClick={onClose}>
              Close Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
