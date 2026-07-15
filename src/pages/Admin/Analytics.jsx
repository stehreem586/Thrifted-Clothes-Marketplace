import React, { useState } from 'react';
import {
  Filter, Download, User, Clock, ChevronLeft, ChevronRight,
  Shield, AlertOctagon, RotateCcw, Trash2, Edit3
} from 'lucide-react';
import './Analytics.css';

const logs = [
  {
    id: 1,
    timestamp: 'Oct 24, 2023\n12:22:58',
    admin: { name: 'Julian V.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80' },
    actionType: 'BANNED USER',
    actionColor: 'red',
    target: '@streetwear_blig',
    ip: '113.189.1.45',
    details: '—',
  },
  {
    id: 2,
    timestamp: 'Oct 24, 2023\n12:03:50',
    admin: { name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80' },
    actionType: 'APPROVED LISTING',
    actionColor: 'green',
    target: 'Vintage Leather Jacket #902',
    ip: '113.10.20:41',
    details: '—',
  },
  {
    id: 3,
    timestamp: 'Oct 24, 2023\n10:38:44',
    admin: { name: 'Julian V.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80' },
    actionType: 'DELETED: COMMENT',
    actionColor: 'orange',
    target: '@first_maven_83',
    ip: '183.189.1.45',
    details: '—',
  },
  {
    id: 4,
    timestamp: 'Oct 24, 2023\n01:41:11',
    admin: { initials: 'MT', name: 'Mark T.', color: '#f59e0b' },
    actionType: 'MATCH CONFIRMED',
    actionColor: 'blue',
    target: 'Payout Gateways',
    ip: '113.0.0.9',
    details: '—',
  },
  {
    id: 5,
    timestamp: 'Oct 28, 2023\n02:50:02',
    admin: { name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80' },
    actionType: 'APPROVED',
    actionColor: 'green',
    target: 'Silk Midi Burn #901',
    ip: '13.38.10:41',
    details: '—',
  },
];

const actionColorMap = {
  red:    { bg: '#fee2e2', color: '#991b1b' },
  green:  { bg: '#d1fae5', color: '#065f46' },
  orange: { bg: '#fef3c7', color: '#92400e' },
  blue:   { bg: '#dbeafe', color: '#1e40af' },
};

export default function Analytics() {
  return (
    <div className="analytics-root">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1 className="page-title">Admin Activity Log</h1>
          <p className="page-sub">Audit trail and system oversight records.</p>
        </div>
        <div className="analytics-actions">
          <button className="outline-btn-icon"><Filter size={14} /> Filter</button>
          <button className="export-btn-sm"><Download size={14} /> Export CSV</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="analytics-stats">
        <div className="astat-card orange-border">
          <div className="astat-icon-wrap orange-icon"><AlertOctagon size={18} strokeWidth={2.5} /></div>
          <div>
            <p className="astat-label">Total Logs Cited</p>
            <p className="astat-val">1,402</p>
          </div>
        </div>
        <div className="astat-card red-border">
          <div className="astat-icon-wrap red-icon"><Trash2 size={18} strokeWidth={2.5} /></div>
          <div>
            <p className="astat-label">Removal Events</p>
            <p className="astat-val">12</p>
          </div>
        </div>
        <div className="astat-card blue-border">
          <div className="astat-icon-wrap blue-icon"><Shield size={18} strokeWidth={2.5} /></div>
          <div>
            <p className="astat-label">Approvals</p>
            <p className="astat-val">84</p>
          </div>
        </div>
        <div className="astat-card gray-border">
          <div className="astat-icon-wrap gray-icon"><User size={18} strokeWidth={2.5} /></div>
          <div>
            <p className="astat-label">Active Admins</p>
            <p className="astat-val">3</p>
          </div>
        </div>
      </div>

      {/* Log table */}
      <div className="analytics-table-card">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>ADMIN NAME</th>
              <th>ACTION TYPE</th>
              <th>TARGET</th>
              <th>IP ADDRESS</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const ac = actionColorMap[log.actionColor] || actionColorMap.blue;
              return (
                <tr key={log.id}>
                  <td className="log-timestamp">
                    {log.timestamp.split('\n').map((line, i) => (
                      <span key={i} className={i === 0 ? 'ts-date' : 'ts-time'}>{line}</span>
                    ))}
                  </td>
                  <td>
                    <div className="log-admin">
                      {log.admin.avatar ? (
                        <img src={log.admin.avatar} alt={log.admin.name} className="log-admin-avatar-img" />
                      ) : (
                        <div className="log-av" style={{ background: log.admin.color }}>
                          {log.admin.initials}
                        </div>
                      )}
                      <span>{log.admin.name}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="log-action-badge"
                      style={{ background: ac.bg, color: ac.color }}
                    >
                      {log.actionType}
                    </span>
                  </td>
                  <td className="log-target">{log.target}</td>
                  <td className="log-ip">{log.ip}</td>
                  <td>
                    <button className="log-details-btn"><Edit3 size={13} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="table-footer">
          <p>Showing 1–5 of 1902 logs</p>
          <div className="pagination">
            <button className="pg-arrow"><ChevronLeft size={14} /></button>
            <button className="pg-active">1</button>
            <button>2</button>
            <button>3</button>
            <button className="pg-arrow"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
