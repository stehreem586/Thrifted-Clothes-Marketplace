import "./Admin.css";

function Dashboard() {
  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <h2>SecondLife</h2>
          <p>Admin Panel</p>
        </div>

        <div className="nav-menu">

          <div className="nav active">
            <span>▣</span>
            Dashboard
          </div>

          <div className="nav">
            <span>▤</span>
            Inventory
          </div>

          <div className="nav">
            <span>◉</span>
            Sales
          </div>

          <div className="nav">
            <span>♟</span>
            Users
          </div>

          <div className="nav">
            <span>⚙</span>
            Community
          </div>

        </div>

        <button className="create-btn">
          + Create Listing
        </button>

        <div className="side-bottom">
          <p>Help Center</p>
          <p>Logout</p>
        </div>

      </aside>


      {/* Main */}
      <main className="main">

        {/* Header */}

        <div className="header">

          <div className="search">
            🔍
            <input
              placeholder="Search articles, users, or listings..."
            />
          </div>

          <div className="user-area">
            🔔
            <div className="avatar"></div>
          </div>

        </div>


        {/* Heading */}

        <div className="heading">

          <div>
            <h1>Performance Overview</h1>
            <p>
              Explore the data from SecondLife Marketplace.
            </p>
          </div>


          <button className="date-btn">
            Today
          </button>

        </div>



        {/* Cards */}

        <div className="cards">

          <div className="stat-card">
            <p>Total Sales</p>
            <h2>21,201</h2>
            <span className="green">
              ↑ 12.5%
            </span>
          </div>


          <div className="stat-card">
            <p>Total Listings</p>
            <h2>108,350</h2>
            <span className="green">
              ↑ 8.2%
            </span>
          </div>


          <div className="stat-card">
            <p>Sales Count</p>
            <h2>2,861</h2>
            <span className="green">
              ↑ 4.8%
            </span>
          </div>


          <div className="stat-card">
            <p>Revenue</p>
            <h2>PKR 991,296</h2>
            <span className="green">
              ↑ 15.3%
            </span>
          </div>


        </div>



        {/* Chart + Categories */}

        <div className="content-row">


          <div className="chart-card">

            <h3>Signups Over Time</h3>


            <div className="graph">

              <svg viewBox="0 0 600 250">

                <polyline
                  points="
                  20,220
                  100,180
                  180,190
                  260,130
                  350,150
                  430,80
                  520,120
                  580,50"
                  fill="none"
                  stroke="#111"
                  strokeWidth="5"
                />


                <polyline
                  points="
                  20,220
                  100,180
                  180,190
                  260,130
                  350,150
                  430,80
                  520,120
                  580,50
                  580,250
                  20,250"
                  fill="rgba(0,0,0,0.05)"
                  stroke="none"
                />

              </svg>

            </div>

          </div>



          <div className="category-card">

            <h3>Categories</h3>


            <div className="progress-item">

              <div>
                <span>Vintage Streetwear</span>
                <b>40%</b>
              </div>

              <div className="bar">
                <div className="fill orange"
                  style={{width:"40%"}}
                ></div>
              </div>

            </div>


            <div className="progress-item">

              <div>
                <span>Oversize Wear</span>
                <b>23%</b>
              </div>

              <div className="bar">
                <div className="fill black"
                  style={{width:"23%"}}
                ></div>
              </div>

            </div>


            <div className="progress-item">

              <div>
                <span>Bottoms</span>
                <b>21%</b>
              </div>

              <div className="bar">
                <div className="fill gray"
                  style={{width:"21%"}}
                ></div>
              </div>

            </div>


            <div className="progress-item">

              <div>
                <span>Accessories</span>
                <b>16%</b>
              </div>

              <div className="bar">
                <div className="fill light"
                  style={{width:"16%"}}
                ></div>
              </div>

            </div>


          </div>


        </div>




        {/* Table */}

        <div className="sales-card">

          <div className="sales-head">

            <h3>Recent Sales</h3>

            <a href="#">
              View All Transactions
            </a>

          </div>


          <table>

            <thead>

              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>

            </thead>


            <tbody>

              <tr>

                <td>
                  Vintage Old Money Olive Shirt
                </td>

                <td>
                  Muhammad Tahir
                </td>

                <td>
                  Oct 12
                </td>

                <td>
                  <span className="status complete">
                    Completed
                  </span>
                </td>

                <td>
                  PKR 4200
                </td>

              </tr>


              <tr>

                <td>
                  Common Projects Achilles
                </td>

                <td>
                  Sara Pathan
                </td>

                <td>
                  Oct 7
                </td>

                <td>
                  <span className="status pending">
                    Pending
                  </span>
                </td>

                <td>
                  PKR 5600
                </td>

              </tr>



              <tr>

                <td>
                  Loop Home Cashmere
                </td>

                <td>
                  Farhan Ali
                </td>

                <td>
                  Oct 4
                </td>

                <td>
                  <span className="status complete">
                    Completed
                  </span>
                </td>

                <td>
                  PKR 1900
                </td>

              </tr>


            </tbody>


          </table>


        </div>



      </main>


    </div>
  );
}


export default Dashboard;