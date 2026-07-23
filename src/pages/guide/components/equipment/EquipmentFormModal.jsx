import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const EMPTY_FORM = {
  categoryId: '',
  name: '',
  description: '',
  brand: '',
  model: '',
  pricePerDay: '',
  depositAmount: '',
  totalStock: '',
  availableStock: '',
  condition: 'GOOD',
  imageUrl: '',
  weightKg: '',
  isActive: true,
};

const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'RETIRED'];
const CONDITION_LABEL = { EXCELLENT: 'Excellent', GOOD: 'Good', FAIR: 'Fair', RETIRED: 'Retired' };

const EquipmentFormModal = ({ open, onClose, onSubmit, initialData, categories }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (initialData) {
        setForm({
          categoryId: initialData.categoryId ?? '',
          name: initialData.name ?? '',
          description: initialData.description ?? '',
          brand: initialData.brand ?? '',
          model: initialData.model ?? '',
          pricePerDay: initialData.pricePerDay ?? '',
          depositAmount: initialData.depositAmount ?? '',
          totalStock: initialData.totalStock ?? '',
          availableStock: initialData.availableStock ?? '',
          condition: initialData.condition ?? 'GOOD',
          imageUrl: initialData.imageUrl ?? '',
          weightKg: initialData.weightKg ?? '',
          isActive: initialData.isActive ?? true,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        categoryId: Number(form.categoryId),
        pricePerDay: Number(form.pricePerDay),
        depositAmount: form.depositAmount !== '' ? Number(form.depositAmount) : 0,
        totalStock: Number(form.totalStock),
        availableStock: form.availableStock !== '' ? Number(form.availableStock) : Number(form.totalStock),
        weightKg: form.weightKg !== '' ? Number(form.weightKg) : null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {initialData ? 'Edit Equipment' : 'Add New Equipment'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">{error}</div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
            <select
              required
              value={form.categoryId}
              onChange={e => set('categoryId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30 focus:border-trek-primary"
            >
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Equipment Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Naturehike 2-Person Tent..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30 focus:border-trek-primary"
            />
          </div>

          {/* Brand + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={e => set('brand', e.target.value)}
                placeholder="Naturehike, Deuter..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
              <input
                type="text"
                value={form.model}
                onChange={e => set('model', e.target.value)}
                placeholder="NH20ZP015..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              />
            </div>
          </div>

          {/* Price + Deposit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Daily Rate (₫) *</label>
              <input
                required
                type="number"
                min="0"
                value={form.pricePerDay}
                onChange={e => set('pricePerDay', e.target.value)}
                placeholder="50000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Deposit (₫)</label>
              <input
                type="number"
                min="0"
                value={form.depositAmount}
                onChange={e => set('depositAmount', e.target.value)}
                placeholder="200000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Stock *</label>
              <input
                required
                type="number"
                min="0"
                value={form.totalStock}
                onChange={e => set('totalStock', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Available Stock</label>
              <input
                type="number"
                min="0"
                value={form.availableStock}
                onChange={e => set('availableStock', e.target.value)}
                placeholder="= Total if blank"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              />
            </div>
          </div>

          {/* Condition + Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={e => set('condition', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              >
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{CONDITION_LABEL[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.weightKg}
                onChange={e => set('weightKg', e.target.value)}
                placeholder="1.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={e => set('imageUrl', e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Detailed equipment description..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30 resize-none"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              className="w-4 h-4 accent-trek-primary"
            />
            <span className="text-sm text-gray-700">Available for rental (Active)</span>
          </label>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-trek-primary text-white text-sm font-medium hover:bg-trek-tertiary disabled:opacity-60"
          >
            {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Equipment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentFormModal;
