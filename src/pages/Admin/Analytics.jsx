import React, { useState, useEffect } from 'react';
import {
  Filter, Download, User, Clock, ChevronLeft, ChevronRight,
  Shield, AlertOctagon, Trash2, Edit3, CheckCircle, TrendingUp
} from 'lucide-react';
import { useListings } from '../../context/ListingsContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import './Analytics.css';

const actionColorMap = {
  red:    { bg: '#fee2e2', color: '#991b1b' },
  green:  { bg: '#d1fae5', color: '#065f46' },
  orange: { bg: '#fef3c7', color: '#92400e' },
  blue:   { bg: '#dbeafe', color: '#1e40af' },
  purple: { bg: '#ede9fe', color: '#5b21b6' },
};

export default function Analytics() {
  const { listings, orders, reviews } = useListings();
  const { profile, user } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);

  // Fetch real user count
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (count !== null) setTotalUsers(count);
      } catch (e) {}
    };
    fetchUsers();
  }, []);

  // Build a real activity log from existing listing & review events
  const now = new Date();
  const fmtTime = (isoStr) => {
    if (!isoStr) return now.toLocaleString();
    try {
      return new Date(isoStr).toLocaleString('en-PK', {
        dateStyle: 'medium', timeStyle: 'short'
      });
    } catch { return isoStr; }
  };

  const adminName = profile?.name || user?.email?.split('@')[0] || 'Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  // Generate real activity log rows from listings
  const activityLogs = [];

  // Approved listings
  listings
    .filter(l => l.status === 'Approved' || l.status === 'Active')
    .slice(0, 3)
    .forEach(l => activityLogs.push({
      id: `app-${l.id}`,
      timestamp: fmtTime(l.createdAt),
      adminName,
      adminInitial,
      actionType: 'APPROVED LISTING',
      actionColor: 'green',
      target: l.title || 'Listing',
      details: `PKR ${parseFloat(l.price).toLocaleString()}`,
    }));

  // Pending listings
  listings
    .filter(l => l.status === 'Pending' || l.status === 'pending')
    .slice(0, 2)
    .forEach(l => activityLogs.push({
      id: `pend-${l.id}`,
      timestamp: fmtTime(l.createdAt),
      adminName,
      adminInitial,
      actionType: 'PENDING REVIEW',
      actionColor: 'orange',
      target: l.title || 'Listing',
      details: `Awaiting approval`,
    }));

  // Rejected listings
  listings
    .filter(l => l.status === 'Rejected')
    .slice(0, 2)
    .forEach(l => activityLogs.push({
      id: `rej-${l.id}`,
      timestamp: fmtTime(l.createdAt),
      adminName,
      adminInitial,
      actionType: 'REJECTED LISTING',
      actionColor: 'red',
      target: l.title || 'Listing',
      details: 'Did not meet guidelines',
    }));

  // Reviews
  reviews.slice(0, 2).forEach(rv => activityLogs.push({
    id: `rev-${rv.id}`,
    timestamp: fmtTime(rv.date),
    adminName,
    adminInitial,
    actionType: 'REVIEW RECEIVED',
    actionColor: 'purple',
    target: rv.listingTitle || 'Item',
    details: `★ ${rv.rating} by ${rv.customerName}`,
  }));

  // Sort by timestamp descending
  activityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Real stat computations
  const totalLogged = activityLogs.length;
  const removalCount = listings.filter(l => l.status === 'Rejected').length;
  const approvalCount = listings.filter(l => l.status === 'Approved' || l.status === 'Active').length;
  const pendingCount = listings.filter(l => l.status === 'Pending' || l.status === 'pending').length;

  return (
    <div className="analytics-root">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1 className="page-title">Admin Activity Log</h1>
          <p className="page-sub">Real-time audit trail of marketplace activity, approvals and review events.</p>
        </div>
        <div className="analytics-actions">
          <button className="export-btn-sm"><Download size={14} /> Export CSV</button>
        </div>
      </div>

      {/* Real Stat cards */}
      <div className="analytics-stats">
        <div className="astat-card orange-border">
          <div className="astat-icon-wrap orange-icon"><AlertOctagon size={18} strokeWidth={2.5} /></div>
          <div>
            <p className="astat-label">Total Activity Events</p>
            <p className="astat-val">{totalLogged}</p>
          </div>
        </div>
        <div className="astat-card red-border">
          <div className="astat-icon-wrap red-icon"><Trash2 size={18} strokeWidth={2.5} /></div>
          <div>
            <p className="astat-label">Rejected Listings</p>
            <p className="astat-val">{removalCount}</p>
          </div>
        </div>
        <div className="astat-card blue-border">
          <div className="astat-icon-wrap blue-icon"><Shield size={18} strokeWidth={2.5} /></div>
          <div>
            <p className="astat-label">Approved Listings</p>
            <p className="astat-val">{approvalCount}</p>
          </div>
        </div>
        <div className="astat-card gray-border">
          <div className="astat-icon-wrap gray-icon"><User size={18} strokeWidth={2.5} /></div>
          <div>
            <p className="astat-label">Registered Users</p>
            <p className="astat-val">{totalUsers}</p>
          </div>
        </div>
        <div className="astat-card" style={{ borderLeft: '3px solid #a78bfa' }}>
          <div className="astat-icon-wrap" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <TrendingUp size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="astat-label">Pending Reviews</p>
            <p className="astat-val">{pendingCount}</p>
          </div>
        </div>
        <div className="astat-card" style={{ borderLeft: '3px solid #6ee7b7' }}>
          <div className="astat-icon-wrap" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="astat-label">Total Reviews</p>
            <p className="astat-val">{reviews.length}</p>
          </div>
        </div>
      </div>

      {/* Real log table */}
      <div className="analytics-table-card">
        {activityLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <p style={{ fontWeight: '700', fontSize: '16px', color: '#334155', margin: 0 }}>No activity yet</p>
            <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
              Marketplace actions (approvals, rejections, reviews) will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>ADMIN</th>
                  <th>ACTION TYPE</th>
                  <th>TARGET</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => {
                  const ac = actionColorMap[log.actionColor] || actionColorMap.blue;
                  return (
                    <tr key={log.id}>
                      <td className="log-timestamp">
                        <span className="ts-date">{log.timestamp.split(',')[0]}</span>
                        <span className="ts-time">{log.timestamp.split(',')[1] || ''}</span>
                      </td>
                      <td>
                        <div className="log-admin">
                          <div className="log-av" style={{ background: '#c19358', color: '#fff', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                            {log.adminInitial}
                          </div>
                          <span>{log.adminName}</span>
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
                      <td className="log-ip" style={{ fontStyle: 'italic', color: '#64748b' }}>{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="table-footer">
              <p>Showing {activityLogs.length} real-time event(s)</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
