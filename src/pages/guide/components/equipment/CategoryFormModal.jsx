import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const EMPTY = { name: '', slug: '', icon: '', sortOrder: '', isActive: true };

const CategoryFormModal = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setForm(initialData
        ? { name: initialData.name, slug: initialData.slug, icon: initialData.icon ?? '', sortOrder: initialData.sortOrder ?? '', isActive: initialData.isActive ?? true }
        : EMPTY);
    }
  }, [open, initialData]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto-generate slug from name
  const handleNameChange = (v) => {
    set('name', v);
    if (!initialData) {
      const slug = v.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
        .trim().replace(/\s+/g, '-');
      set('slug', slug);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        sortOrder: form.sortOrder !== '' ? Number(form.sortOrder) : 0,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {initialData ? 'Sửa danh mục' : 'Thêm danh mục'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tên danh mục *</label>
            <input
              required type="text" value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="VD: Lều trại"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30 focus:border-trek-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
            <input
              required type="text" value={form.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder="camping-tent"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-trek-primary/30 focus:border-trek-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
              <input
                type="text" value={form.icon}
                onChange={e => set('icon', e.target.value)}
                placeholder="tent, backpack..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Thứ tự</label>
              <input
                type="number" min="0" value={form.sortOrder}
                onChange={e => set('sortOrder', e.target.value)}
                placeholder="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              className="w-4 h-4 accent-trek-primary"
            />
            <span className="text-sm text-gray-700">Đang hoạt động</span>
          </label>
        </form>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 rounded-lg bg-trek-primary text-white text-sm font-medium hover:bg-trek-tertiary disabled:opacity-60">
            {submitting ? 'Đang lưu...' : initialData ? 'Lưu thay đổi' : 'Thêm danh mục'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;
