import React, { useState, useMemo } from 'react';
import { useListings } from '../../context/ListingsContext';
import './SellerDashboard.css';

function SellerDashboard({ dashboardSearch }) {
  const { listings, orders } = useListings();
  const [dateFilter, setDateFilter] = useState('All Time'); // 'Today' | 'Last 7 Days' | 'This Month' | 'All Time'
  const [chartView, setChartView] = useState('Weekly'); // 'Weekly' | 'Monthly'

  // Date filtering logic with previous period comparison
  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now.getTime() - 14 * 24 * 60 * 60 * 1000;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

    const isMatchCurr = (dateStr) => {
      if (!dateStr) return true;
      const t = new Date(dateStr).getTime();
      if (dateFilter === 'Today') return t >= startOfToday;
      if (dateFilter === 'Last 7 Days') return t >= sevenDaysAgo;
      if (dateFilter === 'This Month') return t >= startOfMonth;
      return true; // All Time
    };

    const isMatchPrev = (dateStr) => {
      if (!dateStr) return false;
      const t = new Date(dateStr).getTime();
      if (dateFilter === 'Today') return t >= startOfYesterday && t < startOfToday;
      if (dateFilter === 'Last 7 Days') return t >= fourteenDaysAgo && t < sevenDaysAgo;
      if (dateFilter === 'This Month') return t >= startOfPrevMonth && t < startOfMonth;
      return false;
    };

    const validListings = listings.filter(item => isMatchCurr(item.createdAt));
    const prevListings  = listings.filter(item => isMatchPrev(item.createdAt));

    const validOrders = orders.filter(item => isMatchCurr(item.date));
    const prevOrders  = orders.filter(item => isMatchPrev(item.date));

    return { validListings, prevListings, validOrders, prevOrders };
  }, [listings, orders, dateFilter]);

  // Derived Metrics & Pure Percentage Calculation
  const metrics = useMemo(() => {
    const { validListings, prevListings, validOrders, prevOrders } = filteredData;

    const totalSalesAmount = validOrders.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);
    const prevSalesAmount  = prevOrders.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);

    const totalListingsCount = validListings.length;
    const prevListingsCount  = prevListings.length;

    const salesCount = validOrders.length;
    const prevSalesCount = prevOrders.length;

    const calcPct = (curr, prev) => {
      if (dateFilter === 'All Time') return null; // Do NOT show percentage for All Time
      if (prev === 0 && curr === 0) return '0%';
      if (prev === 0 && curr > 0) return '+100%';
      const diff = Math.round(((curr - prev) / prev) * 100);
      return diff >= 0 ? `+${diff}%` : `${diff}%`;
    };

    return {
      totalSales: totalSalesAmount > 0 ? `PKR ${totalSalesAmount.toLocaleString()}` : 'PKR 0',
      totalSalesPct: calcPct(totalSalesAmount, prevSalesAmount),

      totalListings: totalListingsCount > 0 ? totalListingsCount.toLocaleString() : '0',
      totalListingsPct: calcPct(totalListingsCount, prevListingsCount),

      salesCount: salesCount > 0 ? salesCount.toLocaleString() : '0',
      salesCountPct: calcPct(salesCount, prevSalesCount),

      revenue: totalSalesAmount > 0 ? `PKR ${totalSalesAmount.toLocaleString()}` : 'PKR 0',
      revenuePct: calcPct(totalSalesAmount, prevSalesAmount),

      hasData: validOrders.length > 0 || validListings.length > 0
    };
  }, [filteredData, dateFilter]);

  // Sales Over Time SVG Chart Data (Sales Count: 7 on Mon, 2 on Tue, etc.)
  const chartData = useMemo(() => {
    if (chartView === 'Weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];
      orders.forEach(order => {
        if (!order.date) return;
        const d = new Date(order.date);
        let dayIdx = d.getDay() - 1; // 0 = Mon
        if (dayIdx < 0) dayIdx = 6; // Sun
        dayCounts[dayIdx] += 1; // Sales count (e.g. 7 on Monday)
      });

      return { labels: days, values: dayCounts };
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthCounts = new Array(12).fill(0);
      orders.forEach(order => {
        if (!order.date) return;
        const m = new Date(order.date).getMonth();
        monthCounts[m] += 1;
      });

      const currentMonth = new Date().getMonth();
      const last6Months = [];
      const last6Values = [];
      for (let i = 5; i >= 0; i--) {
        const mIdx = (currentMonth - i + 12) % 12;
        last6Months.push(months[mIdx]);
        last6Values.push(monthCounts[mIdx]);
      }

      return { labels: last6Months, values: last6Values };
    }
  }, [orders, chartView]);

  // Calculate SVG Points based on Sales Count
  const svgCalculatedPoints = useMemo(() => {
    const { values } = chartData;
    const minVal = 0;
    const maxVal = Math.max(...values, 5); // Scale appropriately for sales counts
    const width = 500;
    const startX = 60;
    const startY = 200;
    const chartHeight = 160;

    const stepX = width / (values.length - 1 || 1);

    const points = values.map((val, idx) => {
      const x = startX + idx * stepX;
      const y = startY - ((val - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y: isNaN(y) ? 200 : y, val };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x},200 L ${startX},200 Z`;

    return { points, linePath, areaPath, maxVal };
  }, [chartData]);

  // Category Breakdown Calculation
  const categoryStats = useMemo(() => {
    if (listings.length === 0) return [];
    const countMap = {};
    listings.forEach(item => {
      const cat = item.category || 'Other';
      countMap[cat] = (countMap[cat] || 0) + 1;
    });

    const total = listings.length;
    const colors = ['orange', 'black', 'gray', 'light-gray'];
    
    return Object.entries(countMap)
      .map(([category, count], idx) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [listings]);

  // Recent Sales filtered by search
  const recentSalesList = useMemo(() => {
    let list = filteredData.validOrders;
    if (dashboardSearch && dashboardSearch.trim() !== '') {
      const term = dashboardSearch.toLowerCase();
      list = list.filter(o =>
        o.title.toLowerCase().includes(term) ||
        o.buyerName.toLowerCase().includes(term) ||
        o.id.toLowerCase().includes(term)
      );
    }
    return list.slice(0, 5);
  }, [filteredData.validOrders, dashboardSearch]);

  return (
    <div className="view-content fade-in">
      <div className="view-heading">
        <div>
          <h1>Performance Overview</h1>
          <p className="view-sub">Real-time marketplace seller analytics from SecondLife Marketplace.</p>
        </div>
        
        {/* Real Date Filter */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Filter Period:</label>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="clean-select"
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '600' }}
          >
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="This Month">This Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>
      </div>

      {/* Performance Stats Cards (Shows ONLY Percentage tag; Hidden for All Time) */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Sales</span>
          <div className="stat-value-container">
            <h2>{metrics.totalSales}</h2>
            {metrics.totalSalesPct !== null && (
              <span className={`stat-trend ${metrics.totalSalesPct.startsWith('-') ? 'negative' : 'positive'}`}>
                {metrics.totalSalesPct}
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Listings</span>
          <div className="stat-value-container">
            <h2>{metrics.totalListings}</h2>
            {metrics.totalListingsPct !== null && (
              <span className={`stat-trend ${metrics.totalListingsPct.startsWith('-') ? 'negative' : 'positive'}`}>
                {metrics.totalListingsPct}
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Sales Count</span>
          <div className="stat-value-container">
            <h2>{metrics.salesCount}</h2>
            {metrics.salesCountPct !== null && (
              <span className={`stat-trend ${metrics.salesCountPct.startsWith('-') ? 'negative' : 'positive'}`}>
                {metrics.salesCountPct}
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Revenue</span>
          <div className="stat-value-container">
            <h2>{metrics.revenue}</h2>
            {metrics.revenuePct !== null && (
              <span className={`stat-trend ${metrics.revenuePct.startsWith('-') ? 'negative' : 'positive'}`}>
                {metrics.revenuePct}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chart and categories grid */}
      <div className="dashboard-charts-grid">
        <div className="dashboard-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Sales Over Time</h3>
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setChartView('Weekly')}
                style={{
                  padding: '4px 10px', fontSize: '12px', fontWeight: '700', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: chartView === 'Weekly' ? '#111' : 'transparent', color: chartView === 'Weekly' ? '#fff' : '#64748b'
                }}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setChartView('Monthly')}
                style={{
                  padding: '4px 10px', fontSize: '12px', fontWeight: '700', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: chartView === 'Monthly' ? '#111' : 'transparent', color: chartView === 'Monthly' ? '#fff' : '#64748b'
                }}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="mock-chart">
            <svg viewBox="0 0 600 250" className="chart-svg">
              {/* Grid lines */}
              <line x1="40" y1="200" x2="560" y2="200" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="150" x2="560" y2="150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="100" x2="560" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="50" x2="560" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

              {/* Y Axis Labels */}
              <text x="30" y="204" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="end">0</text>
              <text x="30" y="154" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="end">{Math.round(svgCalculatedPoints.maxVal * 0.3)}</text>
              <text x="30" y="104" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="end">{Math.round(svgCalculatedPoints.maxVal * 0.6)}</text>
              <text x="30" y="54" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="end">{Math.round(svgCalculatedPoints.maxVal)}</text>

              {/* Dynamic Area Fill */}
              <path d={svgCalculatedPoints.areaPath} fill="rgba(193, 147, 88, 0.08)" stroke="none" />

              {/* Dynamic Line Path */}
              <path
                d={svgCalculatedPoints.linePath}
                fill="none"
                stroke="#111111"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dynamic Dots and Values */}
              {svgCalculatedPoints.points.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 12} fontSize="10.5" fontWeight="700" fill="#111111" textAnchor="middle">
                    {pt.val > 0 ? pt.val : '0'}
                  </text>
                  <text x={pt.x} y="222" fontSize="12" fontWeight="600" fill="#64748b" textAnchor="middle">
                    {chartData.labels[i]}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Real Categories Breakdown */}
        <div className="dashboard-categories-card">
          <h3>Categories</h3>
          <div className="categories-list">
            {categoryStats.length > 0 ? (
              categoryStats.map(item => (
                <div key={item.category} className="category-progress-item">
                  <div className="progress-details">
                    <span>{item.category}</span>
                    <strong>{item.percentage}%</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div className={`progress-bar-fill ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginTop: '20px' }}>
                No active category listings found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Table (100% Real World Data) */}
      <div className="recent-sales-card">
        <div className="card-header-row">
          <h3>Recent Sales</h3>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Showing real sales history</span>
        </div>
        <div className="table-responsive">
          <table className="seller-table aligned-middle">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Product</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentSalesList.length > 0 ? (
                recentSalesList.map(order => (
                  <tr key={order.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-thumbnail">
                          <img src={order.image} alt={order.title} />
                        </div>
                        <div className="product-details">
                          <span className="product-title">{order.title}</span>
                          <span className="product-subtitle">{order.details}</span>
                        </div>
                      </div>
                    </td>
                    <td>{order.buyerName}</td>
                    <td>{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td>
                      <span className={`status-pill ${order.status === 'Delivered' ? 'complete' : 'pending-status'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td><strong>PKR {parseFloat(order.price).toLocaleString()}</strong></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state-row" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    N/A — No sales recorded for this filter period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
