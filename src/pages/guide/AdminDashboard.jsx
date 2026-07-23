import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CalendarCheck, 
  Users, 
  Compass, 
  Loader2, 
  RotateCw, 
  Award, 
  Star, 
  Info 
} from 'lucide-react';
import { fetchDashboardStats } from '../../services/adminDashboardApi';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Load Dashboard Data
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardStats();
        if (active) {
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        if (active) {
          setError('Failed to fetch dashboard statistics from the server.');
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  // Formatter for Currency
  const formatCurrency = (val) => {
    if (typeof val !== 'number') return val;
    if (val >= 1000000000) {
      return `₫${(val / 1000000000).toFixed(2)}B`;
    }
    if (val >= 1000000) {
      return `₫${(val / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Formatter for Table Dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="db-loader">
        <Loader2 size={36} className="db-spin" />
        <p style={{ marginTop: '16px' }}>Loading dashboard statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="db-container">
        {error && (
          <div className="db-toast">
            <Info size={16} />
            <span>{error}</span>
          </div>
        )}
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No stats data loaded.
        </div>
      </div>
    );
  }

  // Revenue line chart coordinates math
  const width = 600;
  const height = 200;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 35;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxRevenue = Math.max(...stats.revenueTrend.map(d => d.revenue), 1000000);
  const roundedMax = Math.ceil(maxRevenue / 50000000) * 50000000;
  
  const getCoords = (index, value) => {
    const x = paddingLeft + (index / (stats.revenueTrend.length - 1)) * chartWidth;
    const y = paddingTop + (1 - value / roundedMax) * chartHeight;
    return { x, y };
  };

  let linePath = '';
  let areaPath = '';
  const points = [];
  stats.revenueTrend.forEach((item, index) => {
    const { x, y } = getCoords(index, item.revenue);
    points.push({ x, y, label: item.month, value: item.revenue, bookings: item.bookingsCount });
    if (index === 0) {
      linePath += `M ${x} ${y}`;
      areaPath += `M ${x} ${paddingTop + chartHeight} L ${x} ${y}`;
    } else {
      linePath += ` L ${x} ${y}`;
      areaPath += ` L ${x} ${y}`;
    }
    if (index === stats.revenueTrend.length - 1) {
      areaPath += ` L ${x} ${paddingTop + chartHeight} Z`;
    }
  });

  // Donut chart segments math
  const r = 36;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * r;
  const statuses = Object.keys(stats.bookingStatusBreakdown).filter(s => stats.bookingStatusBreakdown[s] > 0);
  const totalBookings = Object.values(stats.bookingStatusBreakdown).reduce((a, b) => a + b, 0);
  const donutColors = {
    COMPLETED: '#10b981',
    CONFIRMED: '#3b82f6',
    PENDING: '#0ea5e9',
    CANCELLED: '#ef4444',
    ONGOING: '#f59e0b',
    REFUNDED: '#8b5cf6',
  };
  let accumulatedPercent = 0;
  const donutSegments = statuses.map(st => {
    const val = stats.bookingStatusBreakdown[st];
    const pct = (val / totalBookings) * 100;
    const dashArray = `${(pct / 100) * circumference} ${circumference}`;
    const dashOffset = - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += pct;
    return { status: st, value: val, percentage: pct, dashArray, dashOffset, color: donutColors[st] || '#9ca3af' };
  });

  return (
    <div className="db-container">
      {/* Toast Warning */}
      {error && (
        <div className="db-toast">
          <Info size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="db-header">
        <div className="db-title-area">
          <h2>Revenue & Bookings Overview</h2>
          <p>Performance metrics and insights for the TrekMate platform</p>
        </div>
        <div className="db-actions">
          <button 
            className="db-refresh-btn" 
            onClick={() => setRefreshKey(prev => prev + 1)}
            title="Refresh Data"
          >
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* 1. Statistics Cards Grid */}
      <section className="db-stats-grid">
        {/* Card 1: Revenue */}
        <div className="db-card db-glow-accent">
          <div className="db-stat-header">
            <span className="db-stat-title">Revenue</span>
            <div className="db-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="db-stat-value">{formatCurrency(stats.overview.totalRevenue)}</div>
          <div className="db-stat-footer">
            <div className={`db-stat-trend db-stat-trend-${stats.overview.revenuePercentageChange >= 0 ? 'up' : 'down'}`}>
              {stats.overview.revenuePercentageChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(stats.overview.revenuePercentageChange).toFixed(1)}%</span>
            </div>
            <span className="db-stat-label">vs last month</span>
          </div>
        </div>

        {/* Card 2: Bookings */}
        <div className="db-card db-glow-info">
          <div className="db-stat-header">
            <span className="db-stat-title">Bookings Count</span>
            <div className="db-stat-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
              <CalendarCheck size={18} />
            </div>
          </div>
          <div className="db-stat-value">{stats.overview.totalBookings}</div>
          <div className="db-stat-footer">
            <div className={`db-stat-trend db-stat-trend-${stats.overview.bookingsPercentageChange >= 0 ? 'up' : 'down'}`}>
              {stats.overview.bookingsPercentageChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(stats.overview.bookingsPercentageChange).toFixed(1)}%</span>
            </div>
            <span className="db-stat-label">vs last month</span>
          </div>
        </div>

        {/* Card 3: Users */}
        <div className="db-card db-glow-warning">
          <div className="db-stat-header">
            <span className="db-stat-title">Registered Users</span>
            <div className="db-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="db-stat-value">{stats.overview.totalUsers}</div>
          <div className="db-stat-footer">
            <div className={`db-stat-trend db-stat-trend-${stats.overview.usersPercentageChange >= 0 ? 'up' : 'down'}`}>
              {stats.overview.usersPercentageChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(stats.overview.usersPercentageChange).toFixed(1)}%</span>
            </div>
            <span className="db-stat-label">vs last month</span>
          </div>
        </div>

        {/* Card 4: Active Tours */}
        <div className="db-card db-glow-error">
          <div className="db-stat-header">
            <span className="db-stat-title">Active Tours</span>
            <div className="db-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <Compass size={18} />
            </div>
          </div>
          <div className="db-stat-value">{stats.overview.totalTours}</div>
          <div className="db-stat-footer">
            <div className={`db-stat-trend db-stat-trend-${stats.overview.toursPercentageChange >= 0 ? 'up' : 'down'}`}>
              {stats.overview.toursPercentageChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(stats.overview.toursPercentageChange).toFixed(1)}%</span>
            </div>
            <span className="db-stat-label">vs last month</span>
          </div>
        </div>
      </section>

      {/* 2. Charts Section Grid */}
      <section className="db-charts-grid">
        {/* Line Chart */}
        <div className="db-card">
          <h3 className="db-chart-title">Monthly Revenue Trends</h3>
          <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
              <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                const y = paddingTop + r * chartHeight;
                const value = roundedMax * (1 - r);
                return (
                  <g key={i}>
                    <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={paddingLeft - 8} y={y + 4} fill="#6b7280" fontSize="9" textAnchor="end">{formatCurrency(value)}</text>
                  </g>
                );
              })}

              {/* Paths */}
              {stats.revenueTrend.length > 1 && (
                <>
                  <path d={areaPath} fill="url(#areaGlow)" />
                  <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
                </>
              )}

              {/* Points */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <text x={pt.x} y={height - 8} fill="#6b7280" fontSize="9" textAnchor="middle">{pt.label}</text>
                  {hoveredPoint === idx && (
                    <line x1={pt.x} y1={paddingTop} x2={pt.x} y2={paddingTop + chartHeight} stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
                  )}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={hoveredPoint === idx ? 5.5 : 4} 
                    fill="#fff" 
                    stroke="#10b981" 
                    strokeWidth="2.5" 
                    style={{ cursor: 'pointer', transition: 'all 0.1s' }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint !== null && (
              <div className="db-tooltip" style={{ left: `${points[hoveredPoint].x + 10}px`, top: `${points[hoveredPoint].y - 50}px` }}>
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>{points[hoveredPoint].label}</div>
                <div>Revenue: <strong>{new Intl.NumberFormat('vi-VN').format(points[hoveredPoint].value)} đ</strong></div>
                <div style={{ color: '#38bdf8', marginTop: '2px' }}>Bookings: {points[hoveredPoint].bookings}</div>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="db-card">
          <h3 className="db-chart-title">Booking Status Breakdown</h3>
          <div className="db-donut-wrapper">
            <div className="db-svg-container">
              <svg viewBox="0 0 100 100" width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r={r} fill="transparent" stroke="rgba(0,0,0,0.02)" strokeWidth={strokeWidth} />
                {donutSegments.map((seg, i) => (
                  <circle 
                    key={i} 
                    cx="50" 
                    cy="50" 
                    r={r} 
                    fill="transparent" 
                    stroke={seg.color} 
                    strokeWidth={strokeWidth} 
                    strokeDasharray={seg.dashArray} 
                    strokeDashoffset={seg.dashOffset} 
                    strokeLinecap="round" 
                  />
                ))}
              </svg>
              <div className="db-donut-center">
                <span className="db-donut-total">{totalBookings}</span>
                <span className="db-donut-label">Bookings</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="db-legend">
              {donutSegments.map((seg, i) => (
                <div key={i} className="db-legend-item">
                  <div className="db-legend-dot" style={{ backgroundColor: seg.color }} />
                  <div className="db-legend-labels">
                    <span className="db-legend-name">{seg.status}</span>
                    <span className="db-legend-val">{seg.value} ({seg.percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tables Section Grid */}
      <section className="db-tables-grid">
        {/* Recent Bookings Table */}
        <div className="db-card">
          <div className="db-table-header">
            <div>
              <h3 className="db-chart-title" style={{ marginBottom: '2px' }}>Recent Bookings</h3>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0' }}>Most recent tour booking actions across the platform</p>
            </div>
          </div>
          <div className="db-table-scroll">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Booking Code</th>
                  <th>Client Name</th>
                  <th>Trekking Tour</th>
                  <th>Booked At</th>
                  <th>Total Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b.bookingCode}>
                    <td className="db-code">{b.bookingCode}</td>
                    <td className="db-client">{b.customerName}</td>
                    <td>{b.tourTitle}</td>
                    <td style={{ color: '#6b7280' }}>{formatDate(b.bookedAt)}</td>
                    <td style={{ fontWeight: '600' }}>{formatCurrency(b.totalPrice)}</td>
                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Tours Ranking List */}
        <div className="db-card">
          <h3 className="db-chart-title" style={{ marginBottom: '2px' }}>Popular Trekking Tours</h3>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0', marginBottom: '16px' }}>Top 5 performers based on total bookings & revenue</p>
          
          <div className="db-popular-list">
            {stats.popularTours.map((t, idx) => (
              <div key={t.tourId} className="db-popular-item">
                {/* Rank Badge */}
                <div 
                  className="db-rank-box"
                  style={{
                    backgroundColor: idx === 0 ? 'rgba(245, 158, 11, 0.1)' : idx === 1 ? 'rgba(156, 163, 175, 0.1)' : idx === 2 ? 'rgba(180, 83, 9, 0.1)' : 'rgba(229, 231, 235, 0.5)',
                    color: idx === 0 ? '#b45309' : idx === 1 ? '#4b5563' : idx === 2 ? '#78350f' : '#6b7280'
                  }}
                >
                  {idx < 3 ? <Award size={14} /> : `#${idx + 1}`}
                </div>
                {/* Tour Details */}
                <div className="db-popular-details">
                  <h4 className="db-popular-title" title={t.title}>{t.title}</h4>
                  <div className="db-popular-meta">
                    <span style={{ fontWeight: '600', color: '#374151' }}>{t.bookingsCount} bookings</span>
                    <span>•</span>
                    <span>{formatCurrency(t.totalRevenue)}</span>
                  </div>
                </div>
                {/* Tour Rating */}
                <div className="db-popular-rating">
                  <Star size={10} fill="#f59e0b" stroke="none" />
                  <span>{t.avgRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
