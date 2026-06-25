import React from 'react';

const UserStatsOverview = ({ stats }) => {
  return (
    <div className="um-stats">
      <div className="um-stat-card">
        <p className="um-stat-label">Total guides</p>
        <p className="um-stat-value">{stats?.totalGuides ?? '-'}</p>
      </div>
      <div className="um-stat-card">
        <p className="um-stat-label">Active</p>
        <p className="um-stat-value">{stats?.activeUsers ?? '-'}</p>
      </div>
      <div className="um-stat-card">
        <p className="um-stat-label">Pending approval</p>
        <p className="um-stat-value">{stats?.pendingApproval ?? '-'}</p>
      </div>
    </div>
  );
};

export default UserStatsOverview;
