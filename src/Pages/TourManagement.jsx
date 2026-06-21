import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTours, createTour, deleteTour } from '../services/tourManagementApi';
import { ArrowLeft, Search, Edit2, Trash2, Plus, MapPin } from 'lucide-react';
import CreateTourModal from '../Components/CreateTourModal';
import ConfirmDeleteModal from '../Components/ConfirmDeleteModal';

const TourManagement = () => {
  const navigate = useNavigate();
  
  // State for tours and pagination
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter and search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [statusTab, setStatusTab] = useState('ALL'); // ALL, ACTIVE, DRAFT

  // Modals visibility states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Toast alert state
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    // Auto hide toast
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  };

  // 1. Debounce search term to avoid spamming the backend API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // 2. Fetch tours list from API
  const fetchToursData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sortBy: 'createdAt',
        direction: 'DESC'
      };
      
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (difficulty !== 'ALL') params.difficulty = difficulty;
      if (statusTab !== 'ALL') params.status = statusTab;

      const response = await getTours(params);
      
      if (response.data) {
        const json = response.data;
        // Handle wrapped response: { code: 200, data: { content: [...] } }
        if (json.code === 200 && json.data) {
          const pageData = json.data;
          setTours(pageData.content || []);
          setTotalElements(pageData.totalElements || 0);
          setTotalPages(pageData.totalPages || 0);
        // Fallbacks for legacy/alternative formats
        } else if (json.content !== undefined) {
          setTours(json.content || []);
          setTotalElements(json.totalElements || 0);
          setTotalPages(json.totalPages || 0);
        } else if (Array.isArray(json)) {
          setTours(json);
          setTotalElements(json.length);
          setTotalPages(1);
        } else {
          setTours([]);
          setTotalElements(0);
          setTotalPages(0);
        }
      } else {
        setTours([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error connecting to backend API:", error);
      showToast('Connection to backend failed!', 'danger');
      setTours([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToursData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, difficulty, statusTab, debouncedSearch]);

  // Handle tour creation
  const handleCreate = async (formData) => {
    try {
      const response = await createTour(formData);
      showToast('Tour created successfully! Redirecting...');
      setIsNewModalOpen(false);
      
      if (response.data && response.data.id) {
        setTimeout(() => {
          navigate(`/admin/tours/${response.data.id}`);
        }, 1200);
      } else {
        fetchToursData();
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to save the new tour!', 'danger');
      throw error;
    }
  };

  // Handle tour archiving/deletion
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteTour(deleteId);
      showToast('Tour archived successfully.');
      setDeleteId(null);
      fetchToursData();
    } catch (error) {
      console.error(error);
      showToast('Failed to archive the tour!', 'danger');
      setDeleteId(null);
    }
  };

  const getDifficultyBadge = (level) => {
    switch (level) {
      case 'EASY':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-50 text-cyan-600 border border-cyan-100">Easy</span>;
      case 'MODERATE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 text-amber-600 border border-amber-100">Moderate</span>;
      case 'HARD':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-orange-50 text-orange-600 border border-orange-100">Hard</span>;
      case 'EXTREME':
      case 'EXPERT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-50 text-purple-600 border border-purple-100">Extreme</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-50 text-gray-600 border border-gray-100">{level}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">Draft</span>;
      case 'INACTIVE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Inactive</span>;
      case 'ARCHIVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">Archived</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-600 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-10 px-4 md:px-12 font-sans text-gray-800">
      {/* Toast Alert */}
      {toast.visible && (
        <div 
          className="fixed top-5 right-5 z-[10000] p-4 rounded-xl shadow-xl flex items-center justify-between gap-4 text-white bg-opacity-95 transform transition-all duration-300 animate-slide-in"
          style={{ backgroundColor: toast.type === 'danger' ? '#dc2626' : '#10b981' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{toast.type === 'danger' ? '✗' : '✓'}</span>
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToast({ ...toast, visible: false })} 
            className="text-white hover:opacity-80 text-xl font-bold leading-none focus:outline-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* Top Header & Navigation */}
      <div className="mb-4">
        <Link to="/" className="text-gray-500 hover:text-[#012d1d] font-semibold flex items-center gap-2 text-sm transition-all duration-150 transform hover:-translate-x-1 d-inline-flex">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl md:text-3xl text-[#012d1d]">
            Tour Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and adjust trekking tour itineraries and active routes.</p>
        </div>
        <div>
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="w-full md:w-auto bg-[#012d1d] hover:bg-[#0c432d] text-white px-5 py-2.5 font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all duration-150 transform hover:-translate-y-0.5"
          >
            <Plus size={18} /> Add New Tour
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 mb-6 bg-white rounded-xl shadow-sm border border-gray-200 gap-4">
        {/* Status Pills */}
        <div className="bg-gray-100 p-1 flex rounded-lg self-start">
          <button 
            onClick={() => setStatusTab('ALL')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              statusTab === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setStatusTab('ACTIVE')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              statusTab === 'ACTIVE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Active
          </button>
          <button 
            onClick={() => setStatusTab('DRAFT')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              statusTab === 'DRAFT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Draft
          </button>
        </div>

        {/* Search & Difficulty */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto">
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all font-medium"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MODERATE">Moderate</option>
            <option value="HARD">Hard</option>
            <option value="EXTREME">Extreme</option>
          </select>

          <div className="relative flex-grow md:w-72">
            <Search size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search by title or location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#012d1d] border-t-transparent rounded-full animate-spin mb-3 mx-auto"></div>
            <p className="text-gray-500 text-sm">Loading tours list from the database...</p>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-4xl text-gray-300 mb-2">🏔️</div>
            <h5 className="font-bold text-gray-700">No tours found</h5>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="hidden md:table-header-group bg-[#012d1d] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider font-montserrat">Tour / Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider font-montserrat">Difficulty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider font-montserrat">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider font-montserrat">Bookings & Departures</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider font-montserrat">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider font-montserrat w-[12%]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 flex flex-col md:table-row-group p-4 md:p-0">
              {tours.map((tour) => (
                <tr 
                  key={tour.id} 
                  className="flex flex-col md:table-row border border-gray-200 md:border-0 rounded-xl p-4 md:p-0 mb-4 md:mb-0 hover:bg-emerald-50/10 transition-colors duration-150"
                >
                  {/* Tour/Location cell */}
                  <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-b-0 border-gray-100">
                    <span className="md:hidden font-montserrat font-bold text-xs text-gray-400 uppercase tracking-wider mr-2">Tour / Location</span>
                    <div className="flex items-center gap-3 text-right md:text-left justify-end md:justify-start">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                        <MapPin size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <Link to={`/admin/tours/${tour.id}`} className="font-bold text-[#012d1d] hover:text-[#fea619] transition-colors duration-150">
                          {tour.title}
                        </Link>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {tour.startLocation && tour.startLocation.trim() !== "" ? tour.startLocation : "Location not specified"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Difficulty cell */}
                  <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-b-0 border-gray-100">
                    <span className="md:hidden font-montserrat font-bold text-xs text-gray-400 uppercase tracking-wider mr-2">Difficulty</span>
                    <div className="text-right md:text-left">
                      {getDifficultyBadge(tour.difficulty)}
                    </div>
                  </td>

                  {/* Duration cell */}
                  <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-b-0 border-gray-100">
                    <span className="md:hidden font-montserrat font-bold text-xs text-gray-400 uppercase tracking-wider mr-2">Duration</span>
                    <div className="text-right md:text-left">
                      <div className="font-bold text-gray-950">
                        {tour.durationDays} Days / {tour.durationNights || 0} Nights
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">{tour.distanceKm ? `${tour.distanceKm} km` : '0 km'}</div>
                    </div>
                  </td>

                  {/* Bookings & Departures cell */}
                  <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-b-0 border-gray-100">
                    <span className="md:hidden font-montserrat font-bold text-xs text-gray-400 uppercase tracking-wider mr-2">Bookings</span>
                    <div className="flex flex-col text-right md:text-left">
                      <span className="font-semibold text-gray-800 text-sm">Bookings: {tour.totalBookings || 0}</span>
                      <span className="text-gray-500 text-xs">Departures: {tour.totalDepartures || 0}</span>
                    </div>
                  </td>

                  {/* Status cell */}
                  <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-b-0 border-gray-100">
                    <span className="md:hidden font-montserrat font-bold text-xs text-gray-400 uppercase tracking-wider mr-2">Status</span>
                    <div className="text-right md:text-left">
                      {getStatusBadge(tour.status)}
                    </div>
                  </td>

                  {/* Actions cell */}
                  <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell text-right">
                    <span className="md:hidden font-montserrat font-bold text-xs text-gray-400 uppercase tracking-wider mr-2">Actions</span>
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => navigate(`/admin/tours/${tour.id}`)}
                        className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-none"
                        title="Edit Tour"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(tour.id)}
                        className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                        title="Archive Tour"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-sm text-gray-500">
          <div>
            Showing <strong className="text-gray-800">{tours.length}</strong> of <strong className="text-gray-800">{totalElements}</strong> results
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              className="px-4 py-2 text-xs font-semibold border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-xs font-bold bg-[#012d1d] text-white rounded-lg">
              {page + 1}
            </span>
            <button 
              disabled={page === totalPages - 1}
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              className="px-4 py-2 text-xs font-semibold border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create New Tour Modal */}
      <CreateTourModal 
        show={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleCreate}
      />

      {/* Confirmation Modal */}
      <ConfirmDeleteModal 
        show={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        tourTitle={tours.find(t => t.id === deleteId)?.title || ''}
      />
    </div>
  );
};

export default TourManagement;
