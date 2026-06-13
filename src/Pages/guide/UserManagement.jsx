import React, { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import {
  approveUser,
  banUser,
  createUser,
  fetchUserStats,
  fetchUsers,
  unbanUser,
  updateUser,
} from '../../services/adminUserApi';
import './UserManagement.css';

const ROLE_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'GUIDE', label: 'Guides' },
  { key: 'CUSTOMER', label: 'Customers' },
  { key: 'ADMIN', label: 'Admins' },
];

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

const UserManagement = () => {
  const [role, setRole] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState(null);
  const [listData, setListData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [banTarget, setBanTarget] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    phone: '',
    password: '',
    displayName: '',
    role: 'GUIDE',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, listRes] = await Promise.all([
        fetchUserStats(),
        fetchUsers({ role, search: debouncedSearch, page, size: 10 }),
      ]);
      setStats(statsRes);
      setListData(listRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role, debouncedSearch, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(0);
  }, [role, debouncedSearch]);

  const handleBan = async () => {
    if (!banTarget) return;
    try {
      await banUser(banTarget.id, banReason);
      setBanTarget(null);
      setBanReason('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnban = async (id) => {
    try {
      await unbanUser(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = async (user) => {
    const displayName = window.prompt('Display name:', user.displayName);
    if (displayName === null) return;
    try {
      await updateUser(user.id, { displayName });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser(createForm);
      setShowCreate(false);
      setCreateForm({
        email: '',
        phone: '',
        password: '',
        displayName: '',
        role: 'GUIDE',
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const users = listData?.content || [];
  const totalPages = listData?.totalPages || 0;

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div>
          <h2>User Management</h2>
          <p>Manage accounts, roles, and activity status.</p>
        </div>
        <div className="um-actions">
          <button type="button" className="um-btn" disabled title="Coming in a later phase">
            Export list
          </button>
          <button
            type="button"
            className="um-btn um-btn-primary"
            onClick={() => setShowCreate(true)}
          >
            Add user
          </button>
        </div>
      </div>

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

      <div className="um-panel">
        <div className="um-toolbar">
          <div className="um-tabs">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`um-tab${role === tab.key ? ' active' : ''}`}
                onClick={() => setRole(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            className="um-search"
            type="search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <div className="um-loading">Loading...</div>}
        {error && <div className="um-error">{error}</div>}

        {!loading && !error && (
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

            <div className="um-pagination">
              <span>
                Showing {users.length > 0 ? page * 10 + 1 : 0}-
                {page * 10 + users.length} of {listData?.totalElements ?? 0}
              </span>
              <div className="um-pagination-btns">
                <button
                  type="button"
                  className="um-btn um-btn-sm"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span style={{ padding: '0 8px' }}>{page + 1} / {totalPages || 1}</span>
                <button
                  type="button"
                  className="um-btn um-btn-sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {banTarget && (
        <div className="um-modal-backdrop" onClick={() => setBanTarget(null)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Suspend account?</h3>
            <p>
              You are about to suspend <strong>{banTarget.displayName}</strong>. This user
              will not be able to access the system until unbanned. No data will be deleted
              from the database.
            </p>
            <div className="um-field">
              <label htmlFor="ban-reason">Reason (optional)</label>
              <textarea
                id="ban-reason"
                rows={3}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Note for audit log..."
              />
            </div>
            <div className="um-modal-actions">
              <button type="button" className="um-btn" onClick={() => setBanTarget(null)}>
                Cancel
              </button>
              <button type="button" className="um-btn um-btn-danger" onClick={handleBan}>
                Confirm suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="um-modal-backdrop" onClick={() => setShowCreate(false)}>
          <form className="um-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h3>Add user</h3>
            <div className="um-field">
              <label>Email</label>
              <input
                required
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="um-field">
              <label>Phone</label>
              <input
                type="text"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
            <div className="um-field">
              <label>Display name</label>
              <input
                required
                type="text"
                value={createForm.displayName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, displayName: e.target.value })
                }
              />
            </div>
            <div className="um-field">
              <label>Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
            </div>
            <div className="um-field">
              <label>Role</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                <option value="GUIDE">Guide</option>
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="um-modal-actions">
              <button type="button" className="um-btn" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="submit" className="um-btn um-btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
