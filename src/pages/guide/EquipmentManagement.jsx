import React, { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import {
  fetchCategories,
  fetchEquipments,
  fetchAllRentals,
  fetchEquipmentRentals,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  toggleEquipmentActive,
  createCategory,
  updateCategory,
  deleteCategory,
  returnRental,
} from '../../services/equipmentApi';
import { useToast } from '../../context/ToastContext';

import EquipmentStatsBar from './components/equipment/EquipmentStatsBar';
import EquipmentTable from './components/equipment/EquipmentTable';
import EquipmentFormModal from './components/equipment/EquipmentFormModal';
import CategoryFormModal from './components/equipment/CategoryFormModal';
import RentalTable from './components/equipment/RentalTable';
import ReturnModal from './components/equipment/ReturnModal';

const TABS = [
  { key: 'equipment', label: '🎒 Equipment' },
  { key: 'categories', label: '📂 Categories' },
  { key: 'rentals', label: '🔄 Rentals' },
];

const EquipmentManagement = () => {
  const { showToast, showConfirm } = useToast();
  const [tab, setTab] = useState('equipment');

  // ─── Categories state ─────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);

  // ─── Equipment state ──────────────────────────────────────────────────────
  const [equipments, setEquipments] = useState([]);
  const [eqLoading, setEqLoading] = useState(false);
  const [eqError, setEqError] = useState(null);
  const [eqPage, setEqPage] = useState(0);
  const [eqTotalPages, setEqTotalPages] = useState(0);
  const [eqTotal, setEqTotal] = useState(0);
  const [eqSearch, setEqSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Form modal (create/edit)
  const [showEqForm, setShowEqForm] = useState(false);
  const [editEq, setEditEq] = useState(null);

  // ─── Rentals state ────────────────────────────────────────────────────────
  const [rentals, setRentals] = useState([]);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [rentalError, setRentalError] = useState(null);
  const [rentalPage, setRentalPage] = useState(0);
  const [rentalTotalPages, setRentalTotalPages] = useState(0);
  const [rentalTotal, setRentalTotal] = useState(0);
  const [focusedEquipment, setFocusedEquipment] = useState(null); // equipment to drill into
  const [returnTarget, setReturnTarget] = useState(null); // rental to return

  // ─── Category modal ───────────────────────────────────────────────────────
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState(null);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);

  // ─── Load categories (always) ─────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (_) {}
  }, []);

  // ─── Load equipment ───────────────────────────────────────────────────────
  const loadEquipments = useCallback(async () => {
    setEqLoading(true);
    setEqError(null);
    try {
      const params = { page: eqPage, size: 10 };
      if (filterCat) params.categoryId = filterCat;
      if (filterActive !== '') params.isActive = filterActive;
      const data = await fetchEquipments(params);
      setEquipments(data.content ?? []);
      setEqTotalPages(data.totalPages ?? 0);
      setEqTotal(data.totalElements ?? 0);

      // Build stats from loaded data (lightweight approximation)
      setStats(prev => ({
        total: data.totalElements ?? 0,
        active: (data.content ?? []).filter(e => e.isActive).length,
        inactive: (data.content ?? []).filter(e => !e.isActive).length,
        renting: prev?.renting ?? 0,
      }));
    } catch (err) {
      setEqError(err.response?.data?.message || err.message);
    } finally {
      setEqLoading(false);
    }
  }, [eqPage, filterCat, filterActive]);

  // ─── Load rentals ─────────────────────────────────────────────────────────
  const loadRentals = useCallback(async () => {
    setRentalLoading(true);
    setRentalError(null);
    try {
      const params = { page: rentalPage, size: 10 };
      const data = focusedEquipment
        ? await fetchEquipmentRentals(focusedEquipment.id, params)
        : await fetchAllRentals(params);
      setRentals(data.content ?? []);
      setRentalTotalPages(data.totalPages ?? 0);
      setRentalTotal(data.totalElements ?? 0);

      // Count active rentals for stats
      const activeCount = (data.content ?? []).filter(r => !r.returned).length;
      setStats(prev => ({ ...(prev ?? {}), renting: activeCount }));
    } catch (err) {
      setRentalError(err.response?.data?.message || err.message);
    } finally {
      setRentalLoading(false);
    }
  }, [rentalPage, focusedEquipment]);

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => { loadCategories(); }, [loadCategories]);

  useEffect(() => {
    if (tab === 'equipment') loadEquipments();
  }, [tab, loadEquipments]);

  useEffect(() => {
    if (tab === 'rentals') loadRentals();
  }, [tab, loadRentals]);

  useEffect(() => { setEqPage(0); }, [filterCat, filterActive]);

  // ─── Equipment handlers ───────────────────────────────────────────────────
  const handleCreateEq = async (form) => {
    try {
      await createEquipment(form);
      showToast('Equipment added successfully!', 'success');
      loadEquipments();
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create equipment.', 'error');
    }
  };

  const handleUpdateEq = async (form) => {
    try {
      await updateEquipment(editEq.id, form);
      showToast('Equipment updated successfully!', 'success');
      loadEquipments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update equipment.', 'error');
    }
  };

  const handleDeleteEq = (eq) => {
    showConfirm({
      title: 'Delete Equipment',
      message: `Are you sure you want to delete equipment "${eq.name}"? This action cannot be undone.`,
      confirmText: 'Delete Now',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteEquipment(eq.id);
          showToast(`Equipment "${eq.name}" deleted successfully!`, 'success');
          loadEquipments();
        } catch (err) {
          showToast(err.response?.data?.message || err.message, 'error');
        }
      },
    });
  };

  const handleToggle = async (id) => {
    try {
      await toggleEquipmentActive(id);
      showToast('Equipment status updated!', 'success');
      loadEquipments();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleViewRentals = (eq) => {
    setFocusedEquipment(eq);
    setRentalPage(0);
    setTab('rentals');
  };

  // ─── Category handlers ────────────────────────────────────────────────────
  const handleCreateCat = async (form) => {
    try {
      await createCategory(form);
      showToast('New category created!', 'success');
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create category.', 'error');
    }
  };

  const handleUpdateCat = async (form) => {
    try {
      await updateCategory(editCat.id, form);
      showToast('Category updated successfully!', 'success');
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update category.', 'error');
    }
  };

  const handleDeleteCat = (cat) => {
    showConfirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${cat.name}"?`,
      confirmText: 'Delete Category',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCategory(cat.id);
          showToast(`Category "${cat.name}" deleted!`, 'success');
          loadCategories();
        } catch (err) {
          showToast(err.response?.data?.message || err.message, 'error');
        }
      },
    });
  };

  // ─── Rental handlers ──────────────────────────────────────────────────────
  const handleReturn = async (rentalId, data) => {
    try {
      await returnRental(rentalId, data);
      setReturnTarget(null);
      showToast('Equipment returned successfully!', 'success');
      loadRentals();
      loadEquipments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process equipment return.', 'error');
    }
  };

  // ─── Filtered equipment (client-side search) ──────────────────────────────
  const filtered = eqSearch
    ? equipments.filter(e =>
        e.name?.toLowerCase().includes(eqSearch.toLowerCase()) ||
        e.brand?.toLowerCase().includes(eqSearch.toLowerCase()) ||
        e.categoryName?.toLowerCase().includes(eqSearch.toLowerCase()))
    : equipments;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Page header */}
      <div className="flex-shrink-0 flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-0.5">Equipment Management</h2>
          <p className="text-sm text-gray-500">Manage rental equipment and inventory for trekking tours.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => tab === 'equipment' ? loadEquipments() : tab === 'rentals' ? loadRentals() : loadCategories()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          {tab === 'equipment' && (
            <button
              type="button"
              onClick={() => { setEditEq(null); setShowEqForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-trek-primary text-white text-sm font-medium hover:bg-trek-tertiary transition-colors"
            >
              <Plus size={14} />
              Add Equipment
            </button>
          )}
          {tab === 'categories' && (
            <button
              type="button"
              onClick={() => { setEditCat(null); setShowCatForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-trek-primary text-white text-sm font-medium hover:bg-trek-tertiary transition-colors"
            >
              <Plus size={14} />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <EquipmentStatsBar stats={stats} />

      {/* Main panel */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setTab(t.key); if (t.key !== 'rentals') setFocusedEquipment(null); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          {tab === 'equipment' && (
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search equipment..."
                  value={eqSearch}
                  onChange={e => setEqSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30 focus:border-trek-primary w-44"
                />
              </div>
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={filterActive}
                onChange={e => setFilterActive(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-trek-primary/30"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab content */}
        {tab === 'equipment' && (
          <EquipmentTable
            equipments={filtered}
            loading={eqLoading}
            error={eqError}
            page={eqPage}
            totalPages={eqTotalPages}
            totalElements={eqTotal}
            onPageChange={setEqPage}
            onEdit={(eq) => { setEditEq(eq); setShowEqForm(true); }}
            onDelete={handleDeleteEq}
            onToggle={handleToggle}
            onViewRentals={handleViewRentals}
          />
        )}

        {tab === 'categories' && (
          <>
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {['Category Name', 'Slug', 'Icon', 'Sort Order', 'Equipment Count', 'Status', 'Actions'].map(h => (
                      <th key={h}
                        className="sticky top-0 z-10 text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 border-b border-gray-200">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">No categories found</td>
                    </tr>
                  ) : categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-semibold text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                      <td className="px-4 py-3 text-gray-500">{cat.icon || '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{cat.sortOrder}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-trek-primary">{cat.equipmentCount ?? 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        {cat.isActive
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-600">Inactive</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => { setEditCat(cat); setShowCatForm(true); }}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCat(cat)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'rentals' && (
          <RentalTable
            rentals={rentals}
            loading={rentalLoading}
            error={rentalError}
            page={rentalPage}
            totalPages={rentalTotalPages}
            totalElements={rentalTotal}
            onPageChange={setRentalPage}
            onReturn={(r) => setReturnTarget(r)}
            equipmentName={focusedEquipment?.name}
            onBack={() => { setFocusedEquipment(null); setRentalPage(0); }}
          />
        )}
      </div>

      {/* Modals */}
      <EquipmentFormModal
        open={showEqForm}
        onClose={() => { setShowEqForm(false); setEditEq(null); }}
        onSubmit={editEq ? handleUpdateEq : handleCreateEq}
        initialData={editEq}
        categories={categories}
      />

      <CategoryFormModal
        open={showCatForm}
        onClose={() => { setShowCatForm(false); setEditCat(null); }}
        onSubmit={editCat ? handleUpdateCat : handleCreateCat}
        initialData={editCat}
      />

      <ReturnModal
        open={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        onSubmit={handleReturn}
        rental={returnTarget}
      />
    </div>
  );
};

export default EquipmentManagement;
