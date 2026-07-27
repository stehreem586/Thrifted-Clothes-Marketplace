import React from 'react';
import { useModeration } from '../../context/ModerationContext';
import { ShieldCheck, X, FileText } from 'lucide-react';
import './ReportModal.css';

export default function PolicyModal({ isOpen, onClose, policyKey = 'EXTERNAL_PAYMENTS' }) {
  const { POLICY_SECTIONS } = useModeration();
  if (!isOpen) return null;

  const policy = POLICY_SECTIONS[policyKey] || POLICY_SECTIONS['GENERAL_GUIDELINES'];

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-card" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="report-title-wrap">
            <ShieldCheck size={22} style={{ color: '#0284c7', background: '#e0f2fe', padding: '6px', borderRadius: '8px' }} />
            <div>
              <h3>{policy.title}</h3>
              <p className="report-subtitle">{policy.code} • SecondLife Official Safety Standards</p>
            </div>
          </div>
          <button className="report-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="report-modal-form" style={{ padding: '24px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #0284c7', fontSize: '0.9rem', color: '#1e293b' }}>
            <strong>Summary:</strong> {policy.summary}
          </div>

          <div style={{ marginTop: '14px' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Full Policy Regulation
            </h4>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6', background: '#f1f5f9', padding: '14px', borderRadius: '8px', margin: 0 }}>
              {policy.fullText}
            </pre>
          </div>

          <div className="report-modal-actions" style={{ marginTop: '16px' }}>
            <button className="report-cancel-btn" onClick={onClose}>
              Close Reference
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
