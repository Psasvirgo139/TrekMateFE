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
import { useToast } from '../../context/ToastContext';
import './UserManagement.css';

// Import subcomponents
import UserStatsOverview from './components/UserStatsOverview';
import UserTable from './components/UserTable';
import SuspendUserModal from './components/SuspendUserModal';
import CreateUserModal from './components/CreateUserModal';

const ROLE_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'GUIDE', label: 'Guides' },
  { key: 'CUSTOMER', label: 'Customers' },
  { key: 'ADMIN', label: 'Admins' },
];

const UserManagement = () => {
  const { showToast } = useToast();
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
      showToast('Account banned successfully!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to ban account', 'error');
    }
  };

  const handleUnban = async (id) => {
    try {
      await unbanUser(id);
      showToast('Account unbanned successfully!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to unban account', 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      showToast('Account approved successfully!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to approve account', 'error');
    }
  };

  const handleEdit = async (user) => {
    const displayName = window.prompt('Display name:', user.displayName);
    if (displayName === null) return;
    try {
      await updateUser(user.id, { displayName });
      showToast('Display name updated successfully!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update display name', 'error');
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
      showToast('New account created successfully!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to create account', 'error');
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

      <UserStatsOverview stats={stats} />

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

        <UserTable
          users={users}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          totalElements={listData?.totalElements ?? 0}
          onPageChange={setPage}
          handleApprove={handleApprove}
          handleEdit={handleEdit}
          handleUnban={handleUnban}
          setBanTarget={setBanTarget}
        />
      </div>

      <SuspendUserModal
        banTarget={banTarget}
        banReason={banReason}
        setBanReason={setBanReason}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBan}
      />

      <CreateUserModal
        showCreate={showCreate}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default UserManagement;
