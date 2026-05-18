import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './Analytics.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await api.get('/analytics/dashboard', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-error">No analytics data available</div>;
  }

  const { totals, topSearches, topProducts, deviceStats, recentActivities, conversionRate } = analytics;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <select 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
          className="date-range-select"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon visitors">
            <i className="fas fa-users"></i>
          </div>
          <div className="metric-content">
            <h3>Total Visitors</h3>
            <p className="metric-value">{totals.visitors.toLocaleString()}</p>
            <small>{totals.uniqueVisitors.toLocaleString()} unique</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon pageviews">
            <i className="fas fa-eye"></i>
          </div>
          <div className="metric-content">
            <h3>Page Views</h3>
            <p className="metric-value">{totals.pageViews.toLocaleString()}</p>
            <small>{(totals.pageViews / totals.visitors || 0).toFixed(1)} per visitor</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon users">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="metric-content">
            <h3>Logged In Users</h3>
            <p className="metric-value">{totals.loggedInUsers.toLocaleString()}</p>
            <small>{totals.guestUsers.toLocaleString()} guests</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon searches">
            <i className="fas fa-search"></i>
          </div>
          <div className="metric-content">
            <h3>Searches</h3>
            <p className="metric-value">{totals.searches.toLocaleString()}</p>
            <small>{(totals.searches / totals.visitors || 0).toFixed(1)} per visitor</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon products">
            <i className="fas fa-box"></i>
          </div>
          <div className="metric-content">
            <h3>Products Viewed</h3>
            <p className="metric-value">{totals.productsViewed.toLocaleString()}</p>
            <small>{totals.addedToCart.toLocaleString()} added to cart</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon orders">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="metric-content">
            <h3>Orders</h3>
            <p className="metric-value">{totals.orders.toLocaleString()}</p>
            <small>₹{totals.revenue.toLocaleString()} revenue</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon conversion">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <h3>Conversion Rate</h3>
            <p className="metric-value">{conversionRate}%</p>
            <small>Visitors to orders</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon avg-order">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="metric-content">
            <h3>Avg Order Value</h3>
            <p className="metric-value">₹{totals.orders > 0 ? Math.round(totals.revenue / totals.orders).toLocaleString() : 0}</p>
            <small>Per order</small>
          </div>
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="analytics-section">
        <h3>Device Breakdown</h3>
        <div className="device-stats">
          <div className="device-stat">
            <i className="fas fa-mobile-alt"></i>
            <div>
              <strong>Mobile</strong>
              <p>{deviceStats.mobile.toLocaleString()} ({((deviceStats.mobile / totals.visitors) * 100 || 0).toFixed(1)}%)</p>
            </div>
          </div>
          <div className="device-stat">
            <i className="fas fa-tablet-alt"></i>
            <div>
              <strong>Tablet</strong>
              <p>{deviceStats.tablet.toLocaleString()} ({((deviceStats.tablet / totals.visitors) * 100 || 0).toFixed(1)}%)</p>
            </div>
          </div>
          <div className="device-stat">
            <i className="fas fa-desktop"></i>
            <div>
              <strong>Desktop</strong>
              <p>{deviceStats.desktop.toLocaleString()} ({((deviceStats.desktop / totals.visitors) * 100 || 0).toFixed(1)}%)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Top Searches */}
        <div className="analytics-card">
          <h3><i className="fas fa-search"></i> Top Searches</h3>
          {topSearches && topSearches.length > 0 ? (
            <div className="search-list">
              {topSearches.map((search, index) => (
                <div key={index} className="search-item">
                  <span className="search-rank">#{index + 1}</span>
                  <span className="search-query">{search.query}</span>
                  <span className="search-count">{search.count} searches</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No search data available</p>
          )}
        </div>

        {/* Top Products */}
        <div className="analytics-card">
          <h3><i className="fas fa-fire"></i> Top Viewed Products</h3>
          {topProducts && topProducts.length > 0 ? (
            <div className="product-list">
              {topProducts.map((item, index) => (
                <div key={index} className="product-item">
                  <span className="product-rank">#{index + 1}</span>
                  <div className="product-info">
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0].url} alt={item.product.name} />
                    )}
                    <div>
                      <strong>{item.product?.name || 'Unknown Product'}</strong>
                      <small>{item.views} views</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No product data available</p>
          )}
        </div>
      </div>

      {/* Recent User Activities */}
      <div className="analytics-section">
        <h3><i className="fas fa-history"></i> Recent User Activities</h3>
        {recentActivities && recentActivities.length > 0 ? (
          <div className="activities-table">
            <table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>Activities</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.sessionId}>
                    <td><code>{activity.sessionId.substring(0, 8)}...</code></td>
                    <td>
                      {activity.userId ? (
                        <span className="user-logged-in">
                          <i className="fas fa-user"></i> {activity.userId.name || activity.userId.email}
                        </span>
                      ) : (
                        <span className="user-guest">
                          <i className="fas fa-user-secret"></i> Guest
                        </span>
                      )}
                    </td>
                    <td>
                      {activity.isLoggedIn ? (
                        <span className="status-badge logged-in">Logged In</span>
                      ) : (
                        <span className="status-badge guest">Guest</span>
                      )}
                    </td>
                    <td><i className={`fas fa-${activity.device === 'mobile' ? 'mobile-alt' : activity.device === 'tablet' ? 'tablet-alt' : 'desktop'}`}></i> {activity.device}</td>
                    <td>{activity.browser}</td>
                    <td>{activity.activities?.length || 0} actions</td>
                    <td>{new Date(activity.lastActivity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No recent activities</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
