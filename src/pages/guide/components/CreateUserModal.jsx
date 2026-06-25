import React from 'react';

const CreateUserModal = ({
  showCreate,
  createForm,
  setCreateForm,
  onClose,
  onSubmit,
}) => {
  if (!showCreate) return null;

  return (
    <div className="um-modal-backdrop" onClick={onClose}>
      <form className="um-modal" onClick={(e) => e.stopPropagation()} onSubmit={onSubmit}>
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
          <button type="button" className="um-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="um-btn um-btn-primary">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserModal;
