import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs, Tab, Accordion, Form, Button, Row, Col, Badge, Spinner, Toast, ToastContainer, Card, InputGroup } from 'react-bootstrap';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { 
  getTourDetail, 
  updateTour, 
  addWaypoint, 
  updateWaypoint, 
  deleteWaypoint,
  saveItinerary,
  deleteItinerary,
  addTourImage,
  deleteTourImage
} from '../Services/tourManagementApi';
import WaypointModal from '../Components/WaypointModal';
import './TourEditPage.css';

// Sanitization utilities
const cleanStringValue = (val) => (val === 'string' || val === 'STRING') ? '' : val;

const sanitizeTourData = (data) => {
  const cleaned = { ...data };
  
  const stringKeys = ['title', 'slug', 'shortDescription', 'description', 'startLocation', 'endLocation', 'routeGpxUrl'];
  stringKeys.forEach(key => {
    if (cleaned[key]) {
      cleaned[key] = cleanStringValue(cleaned[key]);
    }
  });

  const arrayKeys = ['highlights', 'includes', 'excludes', 'requirements'];
  arrayKeys.forEach(key => {
    if (Array.isArray(cleaned[key])) {
      cleaned[key] = cleaned[key].map(cleanStringValue).filter(item => item !== '');
    }
  });

  return cleaned;
};

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents / marks
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-');
};

const TourEditPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Main data states
  const [tour, setTour] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [images, setImages] = useState([]);

  // Tag inputs state
  const [tagInputs, setTagInputs] = useState({ highlight: '', include: '', exclude: '', requirement: '' });

  // Waypoint Modal state
  const [isWpModalOpen, setIsWpModalOpen] = useState(false);
  const [currentWp, setCurrentWp] = useState(null); // null means add new

  // Accordion Itinerary active day index
  const [expandedItineraryId, setExpandedItineraryId] = useState(null);
  
  // Image URL model
  const [newImgData, setNewImgData] = useState({
    imageUrl: '',
    caption: '',
    altText: '',
    isCover: false,
    sortOrder: 1
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
  };

  // Fetch Tour details from Backend API
  const fetchDetail = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await getTourDetail(id);
      if (response.data) {
        const cleanedData = sanitizeTourData(response.data);
        setTour(cleanedData);
        setWaypoints(cleanedData.waypoints || []);
        setItineraries(cleanedData.dailyItinerary || []);
        setImages(cleanedData.images || []);
      } else {
        setErrorMsg('No data found from the backend server!');
      }
    } catch (error) {
      console.error("Error loading tour details:", error);
      setErrorMsg('Unable to connect to the backend or Tour ID does not exist!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Real-time title change & slug generator
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTour(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle)
    }));
  };

  // --- TAB 1: BASIC INFO ACTION ---
  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: tour.title,
        slug: tour.slug,
        shortDescription: tour.shortDescription,
        description: tour.description,
        difficulty: tour.difficulty,
        durationDays: parseInt(tour.durationDays),
        durationNights: parseInt(tour.durationNights),
        distanceKm: parseFloat(tour.distanceKm) || 0,
        maxElevationM: tour.maxElevationM ? parseInt(tour.maxElevationM) : 0,
        startLocation: tour.startLocation,
        endLocation: tour.endLocation,
        startLat: tour.startLat ? parseFloat(tour.startLat) : null,
        startLng: tour.startLng ? parseFloat(tour.startLng) : null,
        endLat: tour.endLat ? parseFloat(tour.endLat) : null,
        endLng: tour.endLng ? parseFloat(tour.endLng) : null,
        routeGpxUrl: tour.routeGpxUrl,
        highlights: tour.highlights || [],
        includes: tour.includes || [],
        excludes: tour.excludes || [],
        requirements: tour.requirements || [],
        status: tour.status
      };
      
      await updateTour(id, payload);
      showToast('Basic tour details updated successfully!');
    } catch (error) {
      console.error(error);
      showToast('Failed to update tour details on the backend!', 'danger');
    }
  };

  // Tags management (highlights, includes, etc.)
  const addTag = (field) => {
    const value = tagInputs[field].trim();
    if (!value) return;
    
    const plurals = { highlight: 'highlights', include: 'includes', exclude: 'excludes', requirement: 'requirements' };
    const listKey = plurals[field];

    const currentList = tour[listKey] || [];
    if (currentList.includes(value)) {
      showToast('This item already exists in the list!', 'danger');
      return;
    }

    setTour(prev => ({
      ...prev,
      [listKey]: [...currentList, value]
    }));
    setTagInputs(prev => ({ ...prev, [field]: '' }));
  };

  const removeTag = (field, tagIndex) => {
    const plurals = { highlight: 'highlights', include: 'includes', exclude: 'excludes', requirement: 'requirements' };
    const listKey = plurals[field];

    setTour(prev => ({
      ...prev,
      [listKey]: (tour[listKey] || []).filter((_, idx) => idx !== tagIndex)
    }));
  };

  // --- TAB 2: WAYPOINTS ACTION ---
  const handleWpSubmit = async (payload) => {
    try {
      if (currentWp) {
        await updateWaypoint(id, currentWp.id, payload);
        showToast('Waypoint updated successfully!');
      } else {
        await addWaypoint(id, payload);
        showToast('New waypoint added successfully!');
      }
      setIsWpModalOpen(false);
      fetchDetail();
    } catch (error) {
      console.error(error);
      showToast('Failed to save waypoint on the backend!', 'danger');
      throw error;
    }
  };

  const handleDeleteWp = async (wpId) => {
    if (!window.confirm('Are you sure you want to delete this waypoint?')) return;
    try {
      await deleteWaypoint(id, wpId);
      showToast('Waypoint deleted successfully.');
      fetchDetail();
    } catch (error) {
      console.error(error);
      showToast('Failed to delete waypoint!', 'danger');
    }
  };

  // --- TAB 3: DAILY ITINERARY ACTION ---
  const addNewDayItinerary = () => {
    const nextDay = itineraries.length + 1;
    const newDay = {
      id: 'it-new-' + Math.random().toString(36).substr(2, 9),
      dayTitle: `Day ${nextDay}: Enter itinerary title`,
      dayDescription: 'Enter trekking details for today...',
      startWaypointId: waypoints[0]?.id || '',
      endWaypointId: waypoints[waypoints.length - 1]?.id || '',
      overnightWaypointId: '',
      distanceKm: 0.0,
      elevationGainM: 0,
      elevationLossM: 0,
      walkingHoursMin: 2,
      walkingHoursMax: 4,
      dayDifficulty: 'EASY',
      suggestedStartTime: '08:00',
      suggestedEndTime: '16:00',
      mealNotes: 'Breakfast: Self-provided; Lunch: Light snack; Dinner: Camping dinner.',
      safetyNotes: '',
      guideNotes: '',
      waypointLinks: []
    };
    
    setItineraries(prev => [...prev, newDay]);
    setExpandedItineraryId(newDay.id);
  };

  const handleItineraryChange = (itId, field, value) => {
    setItineraries(prev => prev.map(it => {
      if (it.id === itId) {
        return { ...it, [field]: value };
      }
      return it;
    }));
  };

  const handleSaveItinerary = async (it) => {
    const payload = {
      id: it.id.startsWith('it-new-') ? null : it.id,
      dayTitle: it.dayTitle,
      dayDescription: it.dayDescription,
      startWaypointId: it.startWaypointId || null,
      endWaypointId: it.endWaypointId || null,
      overnightWaypointId: it.overnightWaypointId || null,
      distanceKm: parseFloat(it.distanceKm) || 0,
      elevationGainM: parseInt(it.elevationGainM || 0),
      elevationLossM: parseInt(it.elevationLossM || 0),
      walkingHoursMin: parseInt(it.walkingHoursMin || 2),
      walkingHoursMax: parseInt(it.walkingHoursMax || 4),
      dayDifficulty: it.dayDifficulty,
      suggestedStartTime: it.suggestedStartTime,
      suggestedEndTime: it.suggestedEndTime,
      mealNotes: it.mealNotes,
      safetyNotes: it.safetyNotes,
      guideNotes: it.guideNotes,
      waypointLinks: it.waypointLinks || []
    };

    try {
      await saveItinerary(id, payload);
      showToast('Saved daily itinerary day successfully!');
      fetchDetail();
    } catch (error) {
      console.error(error);
      showToast('Failed to save daily itinerary on the backend!', 'danger');
    }
  };

  const handleDeleteItinerary = async (itId) => {
    if (!window.confirm('Are you sure you want to delete this itinerary day?')) return;
    
    if (itId.startsWith('it-new-')) {
      setItineraries(prev => prev.filter(it => it.id !== itId));
      return;
    }

    try {
      await deleteItinerary(id, itId);
      showToast('Itinerary day deleted successfully.');
      fetchDetail();
    } catch (error) {
      console.error(error);
      showToast('Failed to delete itinerary day on the backend!', 'danger');
    }
  };

  const toggleWaypointInDay = (itId, wpId) => {
    setItineraries(prev => prev.map(it => {
      if (it.id === itId) {
        const links = it.waypointLinks || [];
        const exists = links.some(link => link.waypointId === wpId);
        
        let newLinks;
        if (exists) {
          newLinks = links.filter(link => link.waypointId !== wpId)
                          .map((link, index) => ({ ...link, visitOrder: index + 1 }));
        } else {
          newLinks = [...links, { waypointId: wpId, visitOrder: links.length + 1 }];
        }
        return { ...it, waypointLinks: newLinks };
      }
      return it;
    }));
  };

  // --- TAB 4: GALLERY & COVER ACTION ---
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImgData.imageUrl.trim()) {
      showToast('Image URL cannot be empty!', 'danger');
      return;
    }

    const payload = {
      imageUrl: newImgData.imageUrl,
      caption: newImgData.caption,
      altText: newImgData.altText || newImgData.caption,
      isCover: newImgData.isCover,
      sortOrder: parseInt(newImgData.sortOrder)
    };

    try {
      await addTourImage(id, payload);
      showToast('Added image to gallery successfully!');
      setNewImgData({
        imageUrl: '',
        caption: '',
        altText: '',
        isCover: false,
        sortOrder: images.length + 2
      });
      fetchDetail();
    } catch (error) {
      console.error(error);
      showToast('Failed to upload image on the backend!', 'danger');
    }
  };

  const handleDeleteImage = async (imgId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteTourImage(id, imgId);
      showToast('Deleted image successfully!');
      fetchDetail();
    } catch (error) {
      console.error(error);
      showToast('Failed to delete image on the backend!', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="tour-edit-page text-center py-5">
        <Spinner animation="border" style={{ color: '#012d1d' }} className="mb-3" />
        <p className="text-muted">Loading tour details...</p>
      </div>
    );
  }

  if (errorMsg || !tour) {
    return (
      <div className="tour-edit-page container py-5 text-center">
        <Card className="p-5 border-danger shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
          <Card.Body>
            <div className="fs-1 text-danger mb-3">⚠️</div>
            <Card.Title className="fw-bold mb-3">Tour Not Found</Card.Title>
            <Card.Text className="text-muted mb-4">{errorMsg || 'The requested Tour ID does not exist in the system.'}</Card.Text>
            <Link to="/admin/tours" className="btn btn-primary border-0" style={{ backgroundColor: '#012d1d' }}>
              Back to Tour List
            </Link>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="tour-edit-page container-fluid px-md-5">
      {/* Toast notifications */}
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

      {/* Back navigation */}
      <div className="edit-breadcrumbs mb-3 pt-3">
        <Link to="/admin/tours" className="back-link fw-semibold d-inline-flex align-items-center gap-2 text-decoration-none">
          <ArrowLeft size={16} className="back-icon" /> Back to Tour List
        </Link>
      </div>
      
      {/* Header Info */}
      <Row className="edit-title-block align-items-center mb-4 pb-3 border-bottom">
        <Col>
          <Badge bg={tour.status === 'ACTIVE' ? 'success' : 'secondary'} className="mb-2 px-2.5 py-1.5 fw-semibold text-uppercase">
            {tour.status === 'ACTIVE' ? 'Active' : tour.status}
          </Badge>
          <h1 className="fw-bold fs-2 text-dark m-0" style={{ fontFamily: 'Montserrat, sans-serif' }}>{tour.title}</h1>
          <p className="slug-line text-muted small mt-1 mb-0">Slug: <code>{tour.slug || 'not-created'}</code></p>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onSelect={(k) => setActiveTab(k)} 
        className="mb-4 tabs-nav fw-semibold border-bottom"
      >
        {/* TAB 1: BASIC INFO */}
        <Tab eventKey="basic" title="📝 Basic Info">
          <Form onSubmit={handleBasicInfoSubmit} className="edit-form-container">
            {/* General & Status */}
            <Card className="mb-4 border shadow-sm rounded-3">
              <Card.Body className="p-4">
                <div className="section-heading-wrapper mb-4 pb-2 border-bottom d-flex align-items-center justify-content-between">
                  <h3 className="section-heading m-0">General & Status</h3>
                  <span className="badge bg-secondary-subtle text-secondary-emphasis border px-2.5 py-1.5 rounded-3 fw-semibold small">Step 1</span>
                </div>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Tour Title <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="text" 
                        required 
                        placeholder="Enter tour title..."
                        value={tour.title || ''}
                        onChange={handleTitleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Slug (URL Path)</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="auto-generated-slug-path"
                        value={tour.slug || ''}
                        className="slug-input-muted bg-light text-muted"
                        onChange={(e) => setTour({...tour, slug: generateSlug(e.target.value)})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Status</Form.Label>
                      <Form.Select 
                        value={tour.status || 'DRAFT'}
                        onChange={(e) => setTour({...tour, status: e.target.value})}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="ARCHIVED">Archived</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Difficulty</Form.Label>
                      <Form.Select 
                        value={tour.difficulty || 'EASY'}
                        onChange={(e) => setTour({...tour, difficulty: e.target.value})}
                      >
                        <option value="EASY">Easy</option>
                        <option value="MODERATE">Moderate</option>
                        <option value="HARD">Hard</option>
                        <option value="EXTREME">Extreme</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* 4-column metric layout */}
                <Row className="g-3 mb-2">
                  <Col xs={6} md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Duration (Days) *</Form.Label>
                      <Form.Control 
                        type="number" 
                        required
                        placeholder="e.g., 3"
                        value={tour.durationDays || ''}
                        onChange={(e) => setTour({...tour, durationDays: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Duration (Nights) *</Form.Label>
                      <Form.Control 
                        type="number" 
                        required
                        placeholder="e.g., 2"
                        value={tour.durationNights || ''}
                        onChange={(e) => setTour({...tour, durationNights: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Distance (Km)</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.1" 
                        placeholder="e.g., 25"
                        value={tour.distanceKm || ''}
                        onChange={(e) => setTour({...tour, distanceKm: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Max Elevation (m)</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="e.g., 1500"
                        value={tour.maxElevationM || ''}
                        onChange={(e) => setTour({...tour, maxElevationM: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Summary & Description */}
            <Card className="mb-4 border shadow-sm rounded-3">
              <Card.Body className="p-4">
                <div className="section-heading-wrapper mb-4 pb-2 border-bottom d-flex align-items-center justify-content-between">
                  <h3 className="section-heading m-0">Summary & Description</h3>
                  <span className="badge bg-secondary-subtle text-secondary-emphasis border px-2.5 py-1.5 rounded-3 fw-semibold small">Step 2</span>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small">Short Description (Card Summary)</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={2}
                    maxLength={500}
                    placeholder="Enter brief tour summary (max 500 characters)..."
                    value={tour.shortDescription || ''}
                    onChange={(e) => setTour({...tour, shortDescription: e.target.value})}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">Detailed Description</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={6}
                    placeholder="Enter detailed description of the trek..."
                    value={tour.description || ''}
                    onChange={(e) => setTour({...tour, description: e.target.value})}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Location & Map */}
            <Card className="mb-4 border shadow-sm rounded-3">
              <Card.Body className="p-4">
                <div className="section-heading-wrapper mb-4 pb-2 border-bottom d-flex align-items-center justify-content-between">
                  <h3 className="section-heading m-0">Location & Map</h3>
                  <span className="badge bg-secondary-subtle text-secondary-emphasis border px-2.5 py-1.5 rounded-3 fw-semibold small">Step 3</span>
                </div>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Start Location (Name)</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="e.g., Sapa Town, Lao Cai"
                        value={tour.startLocation || ''}
                        onChange={(e) => setTour({...tour, startLocation: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">End Location (Name)</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="e.g., Fansipan Summit"
                        value={tour.endLocation || ''}
                        onChange={(e) => setTour({...tour, endLocation: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Start Latitude</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.000001"
                        placeholder="e.g., 22.336"
                        value={tour.startLat || ''}
                        onChange={(e) => setTour({...tour, startLat: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Start Longitude</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.000001"
                        placeholder="e.g., 103.843"
                        value={tour.startLng || ''}
                        onChange={(e) => setTour({...tour, startLng: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">End Latitude</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.000001"
                        placeholder="e.g., 22.302"
                        value={tour.endLat || ''}
                        onChange={(e) => setTour({...tour, endLat: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">End Longitude</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.000001"
                        placeholder="e.g., 103.775"
                        value={tour.endLng || ''}
                        onChange={(e) => setTour({...tour, endLng: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">GPX Route File URL</Form.Label>
                  <Form.Control 
                    type="url" 
                    placeholder="e.g., https://maps.trekmate.com/gpx/fansipan.gpx"
                    value={tour.routeGpxUrl || ''}
                    onChange={(e) => setTour({...tour, routeGpxUrl: e.target.value})}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Highlights & Amenities */}
            <Card className="mb-4 border shadow-sm rounded-3">
              <Card.Body className="p-4">
                <div className="section-heading-wrapper mb-4 pb-2 border-bottom d-flex align-items-center justify-content-between">
                  <h3 className="section-heading m-0">Highlights & Amenities</h3>
                  <span className="badge bg-secondary-subtle text-secondary-emphasis border px-2.5 py-1.5 rounded-3 fw-semibold small">Step 4</span>
                </div>
                
                <Row className="gy-4">
                  {/* Highlights */}
                  <Col lg={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold text-dark small">Highlights</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="text" 
                          placeholder="e.g., Sunset above the clouds..."
                          value={tagInputs.highlight}
                          onChange={(e) => setTagInputs({...tagInputs, highlight: e.target.value})}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('highlight'))}
                        />
                        <Button variant="outline-dark" onClick={() => addTag('highlight')}>
                          <Plus size={16} className="me-1" /> Add
                        </Button>
                      </InputGroup>
                    </Form.Group>
                    <div className="tags-display-box rounded-3 p-3 bg-light border" style={{ minHeight: '80px' }}>
                      {tour.highlights && tour.highlights.map((h, idx) => (
                        <Badge key={idx} className="tag-item tag-neutral me-1.5 mb-1.5">
                          {h}
                          <button type="button" className="tag-delete-btn" onClick={() => removeTag('highlight', idx)}>
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </Col>

                  {/* Includes */}
                  <Col lg={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold text-dark small">Includes</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="text" 
                          placeholder="e.g., Support team, Porter service..."
                          value={tagInputs.include}
                          onChange={(e) => setTagInputs({...tagInputs, include: e.target.value})}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('include'))}
                        />
                        <Button variant="outline-dark" onClick={() => addTag('include')}>
                          <Plus size={16} className="me-1" /> Add
                        </Button>
                      </InputGroup>
                    </Form.Group>
                    <div className="tags-display-box rounded-3 p-3 bg-light border" style={{ minHeight: '80px' }}>
                      {tour.includes && tour.includes.map((i, idx) => (
                        <Badge key={idx} className="tag-item tag-emerald me-1.5 mb-1.5">
                          {i}
                          <button type="button" className="tag-delete-btn" onClick={() => removeTag('include', idx)}>
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </Col>

                  {/* Excludes */}
                  <Col lg={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold text-dark small">Excludes</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="text" 
                          placeholder="e.g., Personal gear, Alcoholic drinks..."
                          value={tagInputs.exclude}
                          onChange={(e) => setTagInputs({...tagInputs, exclude: e.target.value})}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('exclude'))}
                        />
                        <Button variant="outline-dark" onClick={() => addTag('exclude')}>
                          <Plus size={16} className="me-1" /> Add
                        </Button>
                      </InputGroup>
                    </Form.Group>
                    <div className="tags-display-box rounded-3 p-3 bg-light border" style={{ minHeight: '80px' }}>
                      {tour.excludes && tour.excludes.map((ex, idx) => (
                        <Badge key={idx} className="tag-item tag-neutral me-1.5 mb-1.5">
                          {ex}
                          <button type="button" className="tag-delete-btn" onClick={() => removeTag('exclude', idx)}>
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </Col>

                  {/* Requirements */}
                  <Col lg={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold text-dark small">Requirements</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="text" 
                          placeholder="e.g., Trekking shoes, Physical stamina..."
                          value={tagInputs.requirement}
                          onChange={(e) => setTagInputs({...tagInputs, requirement: e.target.value})}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('requirement'))}
                        />
                        <Button variant="outline-dark" onClick={() => addTag('requirement')}>
                          <Plus size={16} className="me-1" /> Add
                        </Button>
                      </InputGroup>
                    </Form.Group>
                    <div className="tags-display-box rounded-3 p-3 bg-light border" style={{ minHeight: '80px' }}>
                      {tour.requirements && tour.requirements.map((r, idx) => (
                        <Badge key={idx} className="tag-item tag-neutral me-1.5 mb-1.5">
                          {r}
                          <button type="button" className="tag-delete-btn" onClick={() => removeTag('requirement', idx)}>
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end mb-4">
              <Button 
                type="submit" 
                className="save-changes-btn px-5 py-3 border-0 fw-bold shadow-sm"
              >
                Save All Changes
              </Button>
            </div>
          </Form>
        </Tab>

        {/* TAB 2: WAYPOINTS */}
        <Tab eventKey="waypoints" title={`📍 Waypoints (${waypoints.length})`}>
          <div className="waypoints-tab-content bg-white p-4 border rounded shadow-sm">
            <div className="tab-section-header d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <div>
                <h3 className="fw-bold fs-5 mb-1" style={{ color: '#012d1d' }}>Route Waypoints List</h3>
                <p className="text-muted small mb-0">Start, intermediate, overnight shelter, and end points of the trekking route.</p>
              </div>
              <Button 
                className="border-0 fw-semibold px-4"
                style={{ backgroundColor: '#012d1d' }}
                onClick={() => { setCurrentWp(null); setIsWpModalOpen(true); }}
              >
                + Add Waypoint
              </Button>
            </div>

            {waypoints.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <span className="fs-1">📍</span>
                <p className="mt-2">No waypoints have been set for this tour route yet.</p>
              </div>
            ) : (
              <div className="waypoints-timeline position-relative ps-4 ms-2">
                {waypoints.map((wp, index) => (
                  <div key={wp.id} className="timeline-node position-relative mb-4">
                    <div 
                      className="node-number position-absolute rounded-circle text-white d-flex align-items-center justify-content-center fw-bold text-center"
                      style={{ left: '-38px', top: '4px', width: '26px', height: '26px', backgroundColor: '#fea619', fontSize: '0.75rem', zIndex: 2, boxShadow: '0 0 0 4px white' }}
                    >
                      {wp.sequenceOrder}
                    </div>
                    <Card className="node-card border-secondary-subtle border-start-0 shadow-sm border-2">
                      <div className="card-header-line p-3 border-bottom d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="fw-bold m-0 fs-6" style={{ color: '#012d1d' }}>{wp.name}</h5>
                          <Badge bg="secondary" className="small text-uppercase" style={{ fontSize: '0.65rem' }}>{wp.waypointType}</Badge>
                        </div>
                        <div className="d-flex gap-1">
                          <Button variant="outline-dark" size="sm" className="py-0.5 px-2" style={{ fontSize: '0.75rem' }} onClick={() => { setCurrentWp(wp); setIsWpModalOpen(true); }}>Edit</Button>
                          <Button variant="outline-danger" size="sm" className="py-0.5 px-2" style={{ fontSize: '0.75rem' }} onClick={() => handleDeleteWp(wp.id)}>Delete</Button>
                        </div>
                      </div>
                      <Card.Body className="p-3">
                        {wp.description && <p className="text-muted small mb-2">{wp.description}</p>}
                        <Row className="g-2 text-secondary small bg-light rounded p-2 mb-2">
                          {wp.elevationM && <Col sm={4}>📐 Elevation: <strong>{wp.elevationM}m</strong></Col>}
                          {(wp.lat && wp.lng) && <Col sm={4}>🌐 Coordinates: <strong>{wp.lat}, {wp.lng}</strong></Col>}
                          {wp.waterSource && <Col sm={4}>💧 Water Source: <strong>{wp.waterSource}</strong></Col>}
                        </Row>
                        <div className="d-flex gap-1.5 flex-wrap">
                          <span className={`badge border small py-1 px-2 ${wp.hasToilet ? 'text-success bg-success-subtle border-success-subtle' : 'text-muted bg-light border-light-subtle'}`}>🚽 Toilet</span>
                          <span className={`badge border small py-1 px-2 ${wp.hasShelter ? 'text-success bg-success-subtle border-success-subtle' : 'text-muted bg-light border-light-subtle'}`}>🛖 Shelter</span>
                          <span className={`badge border small py-1 px-2 ${wp.hasPhoneSignal ? 'text-success bg-success-subtle border-success-subtle' : 'text-muted bg-light border-light-subtle'}`}>📶 Phone Signal</span>
                          <span className={`badge border small py-1 px-2 ${wp.hasFirstAid ? 'text-success bg-success-subtle border-success-subtle' : 'text-muted bg-light border-light-subtle'}`}>🩺 First Aid</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tab>

        {/* TAB 3: DAILY ITINERARY */}
        <Tab eventKey="itinerary" title={`📅 Daily Itinerary (${itineraries.length})`}>
          <div className="itinerary-tab-content bg-white p-4 border rounded shadow-sm">
            <div className="tab-section-header d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <div>
                <h3 className="fw-bold fs-5 mb-1" style={{ color: '#012d1d' }}>Daily Itinerary Details</h3>
                <p className="text-muted small mb-0">Configure trekking activities, distance metrics, and connected waypoints for each day.</p>
              </div>
              <Button 
                className="border-0 fw-semibold px-4"
                style={{ backgroundColor: '#012d1d' }}
                onClick={addNewDayItinerary}
              >
                + Add Day Itinerary
              </Button>
            </div>

            {itineraries.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <span className="fs-1">📅</span>
                <p className="mt-2">No daily itinerary has been defined for this tour yet.</p>
              </div>
            ) : (
              <Accordion activeKey={expandedItineraryId} onSelect={(k) => setExpandedItineraryId(k)}>
                {itineraries.map((it, idx) => (
                  <Accordion.Item key={it.id} eventKey={it.id} className="mb-3 border rounded shadow-sm">
                    <Accordion.Header className="fw-bold">
                      <div className="d-flex align-items-center w-100 justify-content-between pe-3">
                        <div>
                          <Badge bg="dark" className="me-2" style={{ backgroundColor: '#012d1d' }}>Day {idx + 1}</Badge>
                          <span className="fw-bold text-dark">{it.dayTitle}</span>
                        </div>
                        <span className="text-muted small d-none d-sm-inline">
                          {it.distanceKm ? `${it.distanceKm} km` : ''} 
                          {it.dayDifficulty ? ` • Difficulty: ${it.dayDifficulty}` : ''}
                        </span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="p-4 border-top">
                      <Row className="gy-3">
                        <Col lg={8} className="border-end pe-lg-4">
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Day Title</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={it.dayTitle || ''} 
                              onChange={(e) => handleItineraryChange(it.id, 'dayTitle', e.target.value)}
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Day Description</Form.Label>
                            <Form.Control 
                              as="textarea"
                              rows={3}
                              value={it.dayDescription || ''}
                              onChange={(e) => handleItineraryChange(it.id, 'dayDescription', e.target.value)}
                            />
                          </Form.Group>

                          <Row className="mb-3">
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Start Waypoint</Form.Label>
                                <Form.Select
                                  value={it.startWaypointId || ''}
                                  onChange={(e) => handleItineraryChange(it.id, 'startWaypointId', e.target.value)}
                                >
                                  <option value="">-- Select Start Point --</option>
                                  {waypoints.map(w => (
                                    <option key={w.id} value={w.id}>#{w.sequenceOrder} - {w.name}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">End Waypoint</Form.Label>
                                <Form.Select
                                  value={it.endWaypointId || ''}
                                  onChange={(e) => handleItineraryChange(it.id, 'endWaypointId', e.target.value)}
                                >
                                  <option value="">-- Select End Point --</option>
                                  {waypoints.map(w => (
                                    <option key={w.id} value={w.id}>#{w.sequenceOrder} - {w.name}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Overnight Waypoint (optional)</Form.Label>
                                <Form.Select
                                  value={it.overnightWaypointId || ''}
                                  onChange={(e) => handleItineraryChange(it.id, 'overnightWaypointId', e.target.value)}
                                >
                                  <option value="">-- No Overnight Stay --</option>
                                  {waypoints.map(w => (
                                    <option key={w.id} value={w.id}>#{w.sequenceOrder} - {w.name}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Day Distance (Km)</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  step="0.1"
                                  value={it.distanceKm || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'distanceKm', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Elevation Gain (m)</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  value={it.elevationGainM || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'elevationGainM', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Elevation Loss (m)</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  value={it.elevationLossM || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'elevationLossM', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Day Difficulty</Form.Label>
                                <Form.Select 
                                  value={it.dayDifficulty || 'EASY'}
                                  onChange={(e) => handleItineraryChange(it.id, 'dayDifficulty', e.target.value)}
                                >
                                  <option value="EASY">Easy</option>
                                  <option value="MODERATE">Moderate</option>
                                  <option value="HARD">Hard</option>
                                  <option value="EXTREME">Extreme</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Min Walking Hours</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  value={it.walkingHoursMin || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'walkingHoursMin', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Max Walking Hours</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  value={it.walkingHoursMax || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'walkingHoursMax', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Estimated Start Time</Form.Label>
                                <Form.Control 
                                  type="text" 
                                  placeholder="08:00"
                                  value={it.suggestedStartTime || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'suggestedStartTime', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold small text-secondary">Estimated End Time</Form.Label>
                                <Form.Control 
                                  type="text" 
                                  placeholder="16:00"
                                  value={it.suggestedEndTime || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'suggestedEndTime', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Meal Notes</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="Breakfast: self-catering, Lunch: packed lunch..."
                              value={it.mealNotes || ''} 
                              onChange={(e) => handleItineraryChange(it.id, 'mealNotes', e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Day Safety Instructions</Form.Label>
                            <Form.Control 
                              as="textarea"
                              rows={2}
                              placeholder="Describe rocky path precautions, hydration targets..."
                              value={it.safetyNotes || ''} 
                              onChange={(e) => handleItineraryChange(it.id, 'safetyNotes', e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Guide Special Instructions (Internal)</Form.Label>
                            <Form.Control 
                              as="textarea"
                              rows={2}
                              placeholder="Private notes for team guides, porter pickups..."
                              value={it.guideNotes || ''} 
                              onChange={(e) => handleItineraryChange(it.id, 'guideNotes', e.target.value)}
                            />
                          </Form.Group>
                        </Col>

                        <Col lg={4} className="ps-lg-4 mt-3 mt-lg-0">
                          <h6 className="fw-bold mb-2 text-dark small">Waypoints Visited Today</h6>
                          <p className="text-muted small" style={{ fontSize: '0.8rem' }}>Check the waypoints visited during this day:</p>
                          
                          {waypoints.length === 0 ? (
                            <div className="small-warning text-warning border border-warning-subtle bg-warning-subtle p-3 rounded small">
                              No waypoints available. Please add waypoints in Tab 2 first.
                            </div>
                          ) : (
                            <div className="d-flex flex-column gap-2 bg-light border rounded p-3 overflow-auto" style={{ maxHeight: '380px' }}>
                              {waypoints.map(wp => {
                                const links = it.waypointLinks || [];
                                const linked = links.some(link => link.waypointId === wp.id);
                                const linkObj = links.find(link => link.waypointId === wp.id);
                                return (
                                  <div key={wp.id} className={`p-2 border rounded d-flex align-items-center justify-content-between ${linked ? 'border-warning bg-warning-subtle bg-opacity-25' : 'bg-white'}`}>
                                    <Form.Check 
                                      type="checkbox"
                                      id={`wp-check-${it.id}-${wp.id}`}
                                      label={`#${wp.sequenceOrder} - ${wp.name}`}
                                      checked={linked}
                                      onChange={() => toggleWaypointInDay(it.id, wp.id)}
                                      className="small fw-semibold text-dark m-0"
                                    />
                                    {linked && (
                                      <Badge bg="warning" className="text-dark small">Order: {linkObj.visitOrder}</Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-between mt-4 border-top pt-3">
                        <Button variant="outline-danger" onClick={() => handleDeleteItinerary(it.id)}>Delete this Day</Button>
                        <Button 
                          className="border-0 fw-bold px-4" 
                          style={{ backgroundColor: '#012d1d' }}
                          onClick={() => handleSaveItinerary(it)}
                        >
                          Save Day Details
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </div>
        </Tab>

        {/* TAB 4: IMAGE GALLERY */}
        <Tab eventKey="gallery" title={`🖼️ Image Gallery (${images.length})`}>
          <div className="gallery-tab-content bg-white p-4 border rounded shadow-sm">
            <Row className="gy-4">
              {/* Image list grid */}
              <Col lg={8} className="border-end pe-lg-4">
                <h3 className="fw-bold fs-5 mb-4" style={{ color: '#012d1d' }}>Image Collection</h3>
                
                {images.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <span className="fs-1">🖼️</span>
                    <p className="mt-2">No images stored for this tour yet.</p>
                  </div>
                ) : (
                  <Row className="g-3">
                    {images.map((img) => (
                      <Col sm={6} key={img.id}>
                        <Card className={`h-100 ${img.isCover ? 'border-warning shadow-sm border-2' : ''}`}>
                          <div className="position-relative" style={{ height: '160px', overflow: 'hidden' }}>
                            <Card.Img 
                              variant="top" 
                              src={img.imageUrl} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            {img.isCover && (
                              <Badge bg="warning" className="position-absolute top-0 start-0 m-2 text-dark text-uppercase small">
                                Main Cover
                              </Badge>
                            )}
                          </div>
                          <Card.Body className="p-3 d-flex flex-column justify-content-between">
                            <p className="fw-semibold small text-truncate text-dark mb-2">{img.caption || 'No caption'}</p>
                            <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                              <Badge bg="light" className="text-secondary border">Order: {img.sortOrder}</Badge>
                              <Button 
                                variant="link" 
                                className="text-danger p-0 text-decoration-none fw-semibold small"
                                onClick={() => handleDeleteImage(img.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>

              {/* Add image form */}
              <Col lg={4} className="ps-lg-4 mt-3 mt-lg-0">
                <h3 className="fw-bold fs-5 mb-4" style={{ color: '#012d1d' }}>Add New Image</h3>
                <Form onSubmit={handleAddImage} className="bg-light border p-4 rounded-3 shadow-sm">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary small">Image URL *</Form.Label>
                    <Form.Control 
                      type="url" 
                      required 
                      placeholder="https://example.com/trekking-photo.webp"
                      value={newImgData.imageUrl}
                      onChange={(e) => setNewImgData({...newImgData, imageUrl: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary small">Caption</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Sunset view from the ridge..."
                      value={newImgData.caption}
                      onChange={(e) => setNewImgData({...newImgData, caption: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary small">Alt Text</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Descriptive alt text for SEO..."
                      value={newImgData.altText}
                      onChange={(e) => setNewImgData({...newImgData, altText: e.target.value})}
                    />
                  </Form.Group>

                  <Row className="align-items-center mb-3">
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-secondary small">Display Order</Form.Label>
                        <Form.Control 
                          type="number" 
                          min="1" 
                          value={newImgData.sortOrder}
                          onChange={(e) => setNewImgData({...newImgData, sortOrder: parseInt(e.target.value) || 1})}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} className="pt-4">
                      <Form.Check 
                        type="checkbox"
                        id="isCover-img-check"
                        label="Set as Cover Image"
                        checked={newImgData.isCover}
                        onChange={(e) => setNewImgData({...newImgData, isCover: e.target.checked})}
                        className="small fw-semibold text-dark"
                      />
                    </Col>
                  </Row>

                  <Button 
                    type="submit" 
                    className="w-100 border-0 fw-bold py-2 mt-3"
                    style={{ backgroundColor: '#012d1d' }}
                  >
                    Add to Gallery
                  </Button>
                </Form>
              </Col>
            </Row>
          </div>
        </Tab>
      </Tabs>

      {/* Extracted Waypoint Modal component */}
      <WaypointModal 
        show={isWpModalOpen}
        onClose={() => setIsWpModalOpen(false)}
        onSave={handleWpSubmit}
        waypoint={currentWp}
        totalWaypoints={waypoints.length}
      />
    </div>
  );
};

export default TourEditPage;
