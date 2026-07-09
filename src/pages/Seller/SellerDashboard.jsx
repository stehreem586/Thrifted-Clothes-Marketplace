import React from 'react';
import './SellerDashboard.css';

function SellerDashboard({ dashboardSearch, setDashboardSearch }) {
  return (
    <div className="view-content fade-in">
      <div className="view-heading">
        <div>
          <h1>Performance Overview</h1>
          <p className="view-sub">Explore the data from SecondLife Marketplace.</p>
        </div>
        <button className="secondary-action-btn calendar-btn">Today</button>
      </div>

      {/* Performance Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Sales</span>
          <div className="stat-value-container">
            <h2>21,201</h2>
            <span className="stat-trend positive">↑ 12.5%</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Listings</span>
          <div className="stat-value-container">
            <h2>108,350</h2>
            <span className="stat-trend positive">↑ 8.2%</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sales Count</span>
          <div className="stat-value-container">
            <h2>2,861</h2>
            <span className="stat-trend positive">↑ 4.8%</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Revenue</span>
          <div className="stat-value-container">
            <h2>PKR 991,296</h2>
            <span className="stat-trend positive">↑ 15.3%</span>
          </div>
        </div>
      </div>

      {/* Chart and categories grid */}
      <div className="dashboard-charts-grid">
        <div className="dashboard-chart-card">
          <h3>Signups Over Time</h3>
          <div className="mock-chart">
            <svg viewBox="0 0 600 250" className="chart-svg">
              {/* Grid lines */}
              <line x1="40" y1="200" x2="560" y2="200" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="150" x2="560" y2="150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="100" x2="560" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="50" x2="560" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

              {/* Y Axis Labels */}
              <text x="30" y="204" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="end">0</text>
              <text x="30" y="154" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="end">100</text>
              <text x="30" y="104" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="end">200</text>
              <text x="30" y="54" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="end">300</text>

              {/* Area Fill */}
              <path
                d="M 60,200 L 60,170 L 140,130 L 220,150 L 300,80 L 380,100 L 460,50 L 540,30 L 540,200 Z"
                fill="rgba(193, 147, 88, 0.08)"
                stroke="none"
              />

              {/* Line Path */}
              <path
                d="M 60,170 L 140,130 L 220,150 L 300,80 L 380,100 L 460,50 L 540,30"
                fill="none"
                stroke="#111111"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots on Data Points */}
              <circle cx="60" cy="170" r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />
              <circle cx="140" cy="130" r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />
              <circle cx="220" cy="150" r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />
              <circle cx="300" cy="80" r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />
              <circle cx="380" cy="100" r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />
              <circle cx="460" cy="50" r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />
              <circle cx="540" cy="30" r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />

              {/* Values above data points */}
              <text x="60" y="154" fontSize="10.5" fontWeight="700" fill="#111111" textAnchor="middle">42</text>
              <text x="140" y="114" fontSize="10.5" fontWeight="700" fill="#111111" textAnchor="middle">78</text>
              <text x="220" y="134" fontSize="10.5" fontWeight="700" fill="#111111" textAnchor="middle">60</text>
              <text x="300" y="64" fontSize="10.5" fontWeight="700" fill="#111111" textAnchor="middle">145</text>
              <text x="380" y="84" fontSize="10.5" fontWeight="700" fill="#111111" textAnchor="middle">120</text>
              <text x="460" y="34" fontSize="10.5" fontWeight="700" fill="#111111" textAnchor="middle">190</text>
              <text x="540" y="14" fontSize="10.5" fontWeight="700" fill="#111111" textAnchor="middle">220</text>

              {/* X Axis Labels */}
              <text x="60" y="222" fontSize="12" fontWeight="600" fill="#64748b" textAnchor="middle">Mon</text>
              <text x="140" y="222" fontSize="12" fontWeight="600" fill="#64748b" textAnchor="middle">Tue</text>
              <text x="220" y="222" fontSize="12" fontWeight="600" fill="#64748b" textAnchor="middle">Wed</text>
              <text x="300" y="222" fontSize="12" fontWeight="600" fill="#64748b" textAnchor="middle">Thu</text>
              <text x="380" y="222" fontSize="12" fontWeight="600" fill="#64748b" textAnchor="middle">Fri</text>
              <text x="460" y="222" fontSize="12" fontWeight="600" fill="#64748b" textAnchor="middle">Sat</text>
              <text x="540" y="222" fontSize="12" fontWeight="600" fill="#64748b" textAnchor="middle">Sun</text>
            </svg>
          </div>
        </div>

        <div className="dashboard-categories-card">
          <h3>Categories</h3>
          <div className="categories-list">
            <div className="category-progress-item">
              <div className="progress-details">
                <span>Vintage Streetwear</span>
                <strong>40%</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill orange" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="category-progress-item">
              <div className="progress-details">
                <span>Oversize Wear</span>
                <strong>23%</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill black" style={{ width: '23%' }}></div>
              </div>
            </div>
            <div className="category-progress-item">
              <div className="progress-details">
                <span>Bottoms</span>
                <strong>21%</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill gray" style={{ width: '21%' }}></div>
              </div>
            </div>
            <div className="category-progress-item">
              <div className="progress-details">
                <span>Accessories</span>
                <strong>16%</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill light-gray" style={{ width: '16%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="recent-sales-card">
        <div className="card-header-row">
          <h3>Recent Sales</h3>
          <a href="#view-all" className="card-link">View All Transactions</a>
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
              <tr>
                <td>
                  <div className="product-cell">
                    <div className="product-thumbnail">
                      <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&q=80" alt="Vintage Old Money Olive Shirt" />
                    </div>
                    <div className="product-details">
                      <span className="product-title">Vintage Old Money Olive Shirt</span>
                      <span className="product-subtitle">Size L • Olive Green</span>
                    </div>
                  </div>
                </td>
                <td>Muhammad Tahir</td>
                <td>Oct 12</td>
                <td><span className="status-pill complete">Completed</span></td>
                <td>PKR 4,200</td>
              </tr>
              <tr>
                <td>
                  <div className="product-cell">
                    <div className="product-thumbnail">
                      <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&q=80" alt="Common Projects Achilles" />
                    </div>
                    <div className="product-details">
                      <span className="product-title">Common Projects Achilles</span>
                      <span className="product-subtitle">Size 42 • White</span>
                    </div>
                  </div>
                </td>
                <td>Sara Pathan</td>
                <td>Oct 7</td>
                <td><span className="status-pill pending-status">Pending</span></td>
                <td>PKR 5,600</td>
              </tr>
              <tr>
                <td>
                  <div className="product-cell">
                    <div className="product-thumbnail">
                      <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100&q=80" alt="Loop Home Cashmere" />
                    </div>
                    <div className="product-details">
                      <span className="product-title">Loop Home Cashmere</span>
                      <span className="product-subtitle">Size S • Charcoal</span>
                    </div>
                  </div>
                </td>
                <td>Farhan Ali</td>
                <td>Oct 4</td>
                <td><span className="status-pill complete">Completed</span></td>
                <td>PKR 1,900</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
