import React from 'react';
import Pagination from '../../../components/common/Pagination';

const GUIDE_TIER_LABEL = {
  SENIOR: 'Senior Guide',
  GUIDE: 'Guide',
  JUNIOR: 'Junior Guide',
};

const STATUS_LABEL = {
  ACTIVE: 'Active',
  PENDING: 'Under Review',
  BANNED: 'Banned',
};

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function roleLabel(user) {
  if (user.guideTier) return GUIDE_TIER_LABEL[user.guideTier] || 'Guide';
  if (user.roles?.includes('ADMIN')) return 'Admin';
  if (user.roles?.includes('CUSTOMER')) return 'Customer';
  return user.roles?.[0] || '-';
}

const UserTable = ({
  users,
  loading,
  error,
  page,
  totalPages,
  totalElements,
  onPageChange,
  handleApprove,
  handleEdit,
  handleUnban,
  setBanTarget,
}) => {
  if (loading) return <div className="um-loading">Loading...</div>;
  if (error) return <div className="um-error">{error}</div>;

  return (
    <>
      <div className="um-table-body">
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No data found
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={user.status === 'BANNED' ? 'row-banned' : ''}
                >
                  <td>
                    <div className="um-user-cell">
                      <div className="um-avatar">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" />
                        ) : (
                          initials(user.displayName)
                        )}
                      </div>
                      <div>
                        <p
                          className={`um-user-name${
                            user.status === 'BANNED' ? ' muted' : ''
                          }`}
                        >
                          {user.displayName}
                        </p>
                        <p className="um-user-email">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="um-badge">{roleLabel(user)}</span>
                  </td>
                  <td>
                    <span
                      className={`um-badge um-badge-${user.status?.toLowerCase()}`}
                    >
                      {STATUS_LABEL[user.status] || user.status}
                    </span>
                  </td>
                  <td>{user.lastActivityLabel}</td>
                  <td>
                    <div className="um-row-actions">
                      {user.status === 'PENDING' && (
                        <button
                          type="button"
                          className="um-btn um-btn-sm"
                          onClick={() => handleApprove(user.id)}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        className="um-btn um-btn-sm"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      {user.status === 'BANNED' ? (
                        <button
                          type="button"
                          className="um-btn um-btn-sm"
                          onClick={() => handleUnban(user.id)}
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="um-btn um-btn-sm um-btn-danger"
                          onClick={() => setBanTarget(user)}
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 0 && (
        <div className="px-4 pb-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            locale="en"
            showSummary={true}
            totalElements={totalElements}
            pageSize={10}
            itemsCount={users.length}
            variant="text"
          />
        </div>
      )}
    </>
  );
};

export default UserTable;
