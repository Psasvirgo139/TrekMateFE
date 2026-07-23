import React, { useState } from 'react';
import { X } from 'lucide-react';

const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'RETIRED'];
const CONDITION_LABEL = { EXCELLENT: 'Excellent', GOOD: 'Good', FAIR: 'Fair', RETIRED: 'Retired' };

const ReturnModal = ({ open, onClose, onSubmit, rental }) => {
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [damageFee, setDamageFee] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open || !rental) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(rental.id, {
        returnCondition,
        damageFee: damageFee !== '' ? Number(damageFee) : 0,
        notes,
      });
      setReturnCondition('GOOD');
      setDamageFee('');
      setNotes('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Confirm Equipment Return</h3>
            <p className="text-xs text-gray-500 mt-0.5">{rental.equipmentName} × {rental.quantity}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Return Condition</label>
            <select
              value={returnCondition}
              onChange={e => setReturnCondition(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30 focus:border-trek-primary"
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{CONDITION_LABEL[c]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Damage Fee (₫)</label>
            <input
              type="number" min="0" value={damageFee}
              onChange={e => setDamageFee(e.target.value)}
              placeholder="0 if none"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Condition at return, additional notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30 resize-none"
            />
          </div>

          {damageFee && Number(damageFee) > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2 text-sm">
              ⚠️ Damage fee: <strong>{Number(damageFee).toLocaleString('vi-VN')}₫</strong> will be recorded
            </div>
          )}
        </form>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 rounded-lg bg-trek-primary text-white text-sm font-medium hover:bg-trek-tertiary disabled:opacity-60">
            {submitting ? 'Processing...' : 'Confirm Return'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;
