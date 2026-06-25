import React from 'react';

const SuspendUserModal = ({
  banTarget,
  banReason,
  setBanReason,
  onClose,
  onConfirm,
}) => {
  if (!banTarget) return null;

  return (
    <div className="um-modal-backdrop" onClick={onClose}>
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
          <button type="button" className="um-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="um-btn um-btn-danger" onClick={onConfirm}>
            Confirm suspend
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendUserModal;
