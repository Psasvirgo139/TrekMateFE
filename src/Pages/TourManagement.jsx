import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Form, Pagination, Spinner, Toast, ToastContainer, Row, Col } from 'react-bootstrap';
import { ArrowLeft, Search, Edit2, Trash2, Plus, MapPin } from 'lucide-react';
import { getTours, createTour, deleteTour } from '../Services/tourManagementApi';
import CreateTourModal from '../Components/CreateTourModal';
import ConfirmDeleteModal from '../Components/ConfirmDeleteModal';
import './TourManagement.css';

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
        if (response.data.content) {
          setTours(response.data.content);
          setTotalElements(response.data.totalElements);
          setTotalPages(response.data.totalPages);
        } else if (Array.isArray(response.data)) {
          setTours(response.data);
          setTotalElements(response.data.length);
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
        return <span className="difficulty-badge badge-easy">Easy</span>;
      case 'MODERATE':
        return <span className="difficulty-badge badge-moderate">Moderate</span>;
      case 'HARD':
        return <span className="difficulty-badge badge-hard">Hard</span>;
      case 'EXTREME':
        return <span className="difficulty-badge badge-extreme">Extreme</span>;
      default:
        return <span className="difficulty-badge">{level}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge-status status-active">Active</span>;
      case 'DRAFT':
        return <span className="badge-status status-draft">Draft</span>;
      case 'INACTIVE':
        return <span className="badge-status status-inactive">Inactive</span>;
      case 'ARCHIVED':
        return <span className="badge-status status-archived">Archived</span>;
      default:
        return <span className="badge-status">{status}</span>;
    }
  };

  return (
    <div className="tour-list-page container-fluid px-md-5">
      {/* Toast Alert Container */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 10000 }}>
        <Toast 
          show={toast.visible} 
          onClose={() => setToast({ ...toast, visible: false })} 
          delay={3500} 
          autohide
          bg={toast.type}
          className="text-white"
        >
          <Toast.Body className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-5">{toast.type === 'success' ? '✓' : '✗'}</span>
              <span>{toast.message}</span>
            </div>
            <Button variant="close" className="btn-close-white" onClick={() => setToast({ ...toast, visible: false })} />
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Top Header & Navigation */}
      <div className="mb-3 pt-3">
        <Link to="/" className="back-link fw-semibold d-inline-flex align-items-center gap-2 text-decoration-none">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <Row className="list-header align-items-center mb-4">
        <Col md={8} className="header-info">
          <h1 className="fw-bold fs-2" style={{ color: '#012d1d', fontFamily: 'Montserrat, sans-serif' }}>
            Tour Management
          </h1>
          <p className="text-muted mb-0">Monitor and adjust trekking tour itineraries and active routes.</p>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button 
            className="add-tour-btn border-0 px-4 py-2.5 fw-semibold d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: '#012d1d', borderRadius: '8px' }}
            onClick={() => setIsNewModalOpen(true)}
          >
            <Plus size={18} /> Add New Tour
          </Button>
        </Col>
      </Row>

      {/* Filters & Search Row */}
      <Row className="filter-wrapper align-items-center p-3 mb-4 bg-white rounded shadow-sm border mx-0" style={{ borderRadius: '8px' }}>
        <Col lg={4} md={6} className="mb-3 mb-lg-0 px-0">
          <div className="status-pills bg-light p-1 d-inline-flex" style={{ borderRadius: '8px' }}>
            <Button 
              variant={statusTab === 'ALL' ? 'white shadow-sm fw-semibold text-dark' : 'link text-secondary text-decoration-none'} 
              size="sm"
              onClick={() => setStatusTab('ALL')}
              className="px-3 py-1.5"
              style={{ borderRadius: '6px' }}
            >
              All
            </Button>
            <Button 
              variant={statusTab === 'ACTIVE' ? 'white shadow-sm fw-semibold text-dark' : 'link text-secondary text-decoration-none'} 
              size="sm"
              onClick={() => setStatusTab('ACTIVE')}
              className="px-3 py-1.5"
              style={{ borderRadius: '6px' }}
            >
              Active
            </Button>
            <Button 
              variant={statusTab === 'DRAFT' ? 'white shadow-sm fw-semibold text-dark' : 'link text-secondary text-decoration-none'} 
              size="sm"
              onClick={() => setStatusTab('DRAFT')}
              className="px-3 py-1.5"
              style={{ borderRadius: '6px' }}
            >
              Draft
            </Button>
          </div>
        </Col>

        <Col lg={8} md={6} className="px-0">
          <Form onSubmit={(e) => e.preventDefault()} className="d-flex align-items-center gap-2 justify-content-md-end flex-wrap flex-md-nowrap">
            <Form.Select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-auto border-secondary-subtle font-medium"
              style={{ minWidth: '160px', borderRadius: '8px' }}
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MODERATE">Moderate</option>
              <option value="HARD">Hard</option>
              <option value="EXTREME">Extreme</option>
            </Form.Select>

            <div className="search-input-container flex-grow-1 max-width-md-300">
              <Search size={18} className="search-icon-svg" />
              <Form.Control 
                type="text" 
                placeholder="Search by title or location..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-secondary-subtle ps-5 py-2"
                style={{ borderRadius: '8px' }}
              />
            </div>
          </Form>
        </Col>
      </Row>

      {/* Main Data Table */}
      <div className="table-responsive bg-white border shadow-sm" style={{ borderRadius: '8px' }}>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: '#012d1d' }} className="mb-3" />
            <p className="text-muted small">Loading tours list from the database...</p>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div className="fs-1 text-muted mb-2">🏔️</div>
            <h5 className="fw-bold text-dark">No tours found</h5>
            <p className="text-muted small mb-0">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <Table responsive hover className="align-middle mb-0 text-left border-0">
            <thead className="text-white text-uppercase small text-secondary" style={{ backgroundColor: '#012d1d' }}>
              <tr>
                <th className="py-3 ps-4" style={{ width: '35%' }}>Tour / Location</th>
                <th className="py-3">Difficulty</th>
                <th className="py-3">Duration</th>
                <th className="py-3">Bookings & Departures</th>
                <th className="py-3">Status</th>
                <th className="py-3 pe-4 text-end" style={{ width: '12%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id}>
                  <td data-label="Tour / Location" className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="tour-thumbnail-placeholder d-flex align-items-center justify-content-center bg-light rounded" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                        <MapPin size={20} className="text-muted opacity-75" />
                      </div>
                      <div>
                        <Link to={`/admin/tours/${tour.id}`} className="tour-link-name fw-bold text-decoration-none">
                          {tour.title}
                        </Link>
                        <div className="text-muted small mt-1 d-flex align-items-center gap-1">
                          {tour.startLocation && tour.startLocation.trim() !== "" ? tour.startLocation : "Location not specified"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Difficulty" className="py-3">{getDifficultyBadge(tour.difficulty)}</td>
                  <td data-label="Duration" className="py-3">
                    <div className="fw-bold text-dark">
                      {tour.durationDays} Days / {tour.durationNights || 0} Nights
                    </div>
                    <div className="text-muted small mt-1">{tour.distanceKm ? `${tour.distanceKm} km` : '0 km'}</div>
                  </td>
                  <td data-label="Bookings & Departures" className="py-3">
                    <div className="d-flex flex-column gap-1 small text-start">
                      <span className="fw-semibold text-dark">Bookings: {tour.totalBookings || 0}</span>
                      <span className="text-muted">Departures: {tour.totalDepartures || 0}</span>
                    </div>
                  </td>
                  <td data-label="Status" className="py-3">{getStatusBadge(tour.status)}</td>
                  <td data-label="Actions" className="pe-4 py-3 text-end">
                    <div className="d-flex justify-content-end gap-1">
                      <Button 
                        variant="link" 
                        className="action-btn-icon edit-btn p-2 rounded-3 border-0"
                        title="Edit Tour"
                        onClick={() => navigate(`/admin/tours/${tour.id}`)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="link" 
                        className="action-btn-icon delete-btn p-2 rounded-3 border-0"
                        title="Archive Tour"
                        onClick={() => setDeleteId(tour.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Pagination component */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 small text-muted">
          <div>
            Showing <strong>{tours.length}</strong> of <strong>{totalElements}</strong> results
          </div>
          <Pagination className="mb-0">
            <Pagination.Prev 
              disabled={page === 0}
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
            />
            <Pagination.Item active>{page + 1}</Pagination.Item>
            <Pagination.Next 
              disabled={page === totalPages - 1}
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            />
          </Pagination>
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
