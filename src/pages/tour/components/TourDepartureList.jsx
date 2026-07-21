import React, { useState, useEffect } from 'react';
import { 
  getTourDepartures, 
  deleteDeparture
} from '../../../services/tourManagementApi';
import { Calendar, Trash2, Clock, Edit2 } from 'lucide-react';
import ConfirmDeleteModal from '../../../components/tour/ConfirmDeleteModal';
import SingleDepartureModal from '../../../components/tour/SingleDepartureModal';
import BulkDepartureModal from '../../../components/tour/BulkDepartureModal';
import Pagination from '../../../components/common/Pagination';

export default function TourDepartureList({ tourId, durationDays = 1, showToast, onDeparturesChange }) {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [editingDeparture, setEditingDeparture] = useState(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, depId: null });

  // Pagination state
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch departures from API
  const fetchDepartures = async () => {
    setLoading(true);
    try {
      const res = await getTourDepartures(tourId, { 
        page, 
        size, 
        sort: 'departureDate,asc'
      });
      if (res) {
        const pageData = res;
        setDepartures(pageData.content || []);
        setTotalElements(pageData.page?.totalElements ?? pageData.totalElements ?? 0);
        setTotalPages(pageData.page?.totalPages ?? pageData.totalPages ?? 0);
      } else {
        setDepartures([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching departures:", error);
      showToast("Unable to load the departure schedule list!", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, page]);

  useEffect(() => {
    if (onDeparturesChange) {
      onDeparturesChange(totalElements);
    }
  }, [totalElements, onDeparturesChange]);

  // Handle Delete / Cancel departure
  const handleDelete = (depId) => {
    setDeleteConfirm({ show: true, depId });
  };

  const confirmDelete = async () => {
    const depId = deleteConfirm.depId;
    if (!depId) return;
    try {
      await deleteDeparture(tourId, depId);
      showToast("Updated departure schedule status/deleted successfully!");
      if (page === 0) {
        fetchDepartures();
      } else {
        setPage(0);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to delete departure schedule!", "danger");
    } finally {
      setDeleteConfirm({ show: false, depId: null });
    }
  };

  const handleEditClick = (dep) => {
    setEditingDeparture(dep);
    setIsSingleOpen(true);
  };

  const handleSingleSuccess = () => {
    setIsSingleOpen(false);
    setEditingDeparture(null);
    if (page === 0) {
      fetchDepartures();
    } else {
      setPage(0);
    }
  };

  const handleBulkSuccess = () => {
    setIsBulkOpen(false);
    if (page === 0) {
      fetchDepartures();
    } else {
      setPage(0);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">OPEN</span>;
      case 'SCHEDULED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">SCHEDULED</span>;
      case 'FULL':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-700 border border-red-200">FULL</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-500 border border-gray-200">CANCELLED</span>;
      case 'ONGOING':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200">ONGOING</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-700 border border-gray-200">COMPLETED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const selectedDepObj = departures.find(d => d.departureId === deleteConfirm.depId);
  const hasBookings = !!(selectedDepObj && selectedDepObj.bookedSlots > 0);

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm w-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 gap-4">
        <div>
          <h3 className="font-montserrat font-bold text-lg text-[#012d1d]">Manage Departures</h3>
          <p className="text-gray-500 text-xs mt-0.5">Schedule departure dates or set up an automatic cycle to generate departure dates for this tour.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setEditingDeparture(null); setIsSingleOpen(true); }}
            className="bg-[#012d1d] hover:bg-[#0c432d] text-white px-4 py-2 font-semibold rounded-lg text-sm transition-all shadow-sm"
          >
            + Single Schedule
          </button>
          <button 
            onClick={() => setIsBulkOpen(true)}
            className="bg-[#fea619] hover:bg-[#d98b10] text-[#012d1d] font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-sm flex items-center gap-1.5"
          >
            <Clock size={16} /> Periodic Schedule
          </button>
        </div>
      </div>

      {/* Main List Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#012d1d] border-t-transparent rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-gray-500 text-xs">Loading departure schedule...</p>
        </div>
      ) : departures.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          <span className="text-4xl block mb-2">📅</span>
          <p className="text-sm font-semibold">No departure dates have been set yet.</p>
          <p className="text-xs text-gray-400 mt-1">Click the buttons above to schedule the first departure date for this tour.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-[#012d1d] text-white text-xs font-semibold uppercase font-montserrat">
              <tr>
                <th className="px-6 py-3 text-left">Departure Date</th>
                <th className="px-6 py-3 text-left">Return Date</th>
                <th className="px-6 py-3 text-left">Cutoff Date</th>
                <th className="px-6 py-3 text-left">Price / Person</th>
                <th className="px-6 py-3 text-left">Slot Booking</th>
                <th className="px-6 py-3 text-left">Tour Guide</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {departures.map((dep) => (
                <tr key={dep.departureId} className="hover:bg-emerald-50/10 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-gray-900">{dep.departureDate}</td>
                  <td className="px-6 py-3.5 text-gray-600">{dep.returnDate}</td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs">{dep.cutoffDate || 'None'}</td>
                  <td className="px-6 py-3.5 font-semibold text-emerald-700">{formatPrice(dep.pricePerPerson)}</td>
                  <td className="px-6 py-3.5">
                    <span className="font-semibold">{dep.bookedSlots}</span> / {dep.maxGroupSize}
                  </td>
                  <td className="px-6 py-3.5">
                    {dep.guideNames && dep.guideNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {dep.guideNames.map((name, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            👤 {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">None assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">{getStatusBadge(dep.status)}</td>
                  <td className="px-6 py-3.5 text-right flex items-center justify-end gap-1">
                    <button 
                      onClick={() => handleEditClick(dep)}
                      disabled={dep.status === 'CANCELLED' || dep.status === 'COMPLETED'}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent focus:outline-none"
                      title="Edit schedule"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(dep.departureId)}
                      disabled={dep.status === 'CANCELLED' || dep.status === 'COMPLETED'}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent focus:outline-none"
                      title="Delete/Cancel departure"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          locale="en"
          showSummary={true}
          totalElements={totalElements}
          pageSize={size}
          itemsCount={departures.length}
          variant="text"
        />
      )}

      {/* MODAL 1: ADD/EDIT SINGLE DEPARTURE */}
      <SingleDepartureModal
        isOpen={isSingleOpen}
        onClose={() => { setIsSingleOpen(false); setEditingDeparture(null); }}
        tourId={tourId}
        durationDays={durationDays}
        showToast={showToast}
        editingDeparture={editingDeparture}
        onSaveSuccess={handleSingleSuccess}
      />

      {/* MODAL 2: BULK GENERATE DEPARTURES (RECURRING) */}
      <BulkDepartureModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        tourId={tourId}
        showToast={showToast}
        onSaveSuccess={handleBulkSuccess}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal 
        show={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, depId: null })}
        onConfirm={confirmDelete}
        title="Confirm Departure Deletion"
        message={hasBookings 
          ? "There are bookings for this departure already. Cannot delete/cancel."
          : "Are you sure you want to delete/cancel this departure? This action cannot be undone."}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        showConfirm={!hasBookings}
      />
    </div>
  );
}
