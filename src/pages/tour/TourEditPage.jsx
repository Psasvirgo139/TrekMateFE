import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { validateTourData } from '../../utils/validation';
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
} from '../../services/tourManagementApi';
import WaypointModal from '../../components/tour/WaypointModal';

// Import modular subcomponents
import TourBasicInfoForm from './components/TourBasicInfoForm';
import TourTagsSection from './components/TourTagsSection';
import TourWaypointList from './components/TourWaypointList';
import TourDailyItineraryList from './components/TourDailyItineraryList';
import TourGallerySection from './components/TourGallerySection';
import TourDepartureList from './components/TourDepartureList';
import ConfirmDeleteModal from '../../components/tour/ConfirmDeleteModal';

const ArrowLeft = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

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
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  // Main data states
  const [tour, setTour] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [images, setImages] = useState([]);
  const [departuresCount, setDeparturesCount] = useState(0);

  // Tag inputs state
  const [tagInputs, setTagInputs] = useState({ highlight: '', include: '', exclude: '', requirement: '' });

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [useNightsDropdown, setUseNightsDropdown] = useState(true);

  useEffect(() => {
    if (tour) {
      const valErrors = validateTourData(tour);
      setErrors(valErrors);
    }
  }, [tour]);

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
    // Auto hide toast
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
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
    if (Object.keys(errors).length > 0) {
      showToast('Please correct any data entry errors before saving!', 'danger');
      return;
    }
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

  const handleDeleteWp = (wpId) => {
    setConfirmModal({
      show: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this waypoint? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteWaypoint(id, wpId);
          showToast('Waypoint deleted successfully.');
          fetchDetail();
        } catch (error) {
          console.error(error);
          showToast('Failed to delete waypoint!', 'danger');
        }
      }
    });
  };

  // --- TAB 3: DAILY ITINERARY ACTION ---
  const addNewDayItinerary = () => {
    const maxDayNumber = itineraries.reduce((max, it) => {
      const num = parseInt(it.dayNumber);
      return (!isNaN(num) && num > max) ? num : max;
    }, 0);
    const nextDay = maxDayNumber + 1;
    const newDay = {
      id: 'it-new-' + Math.random().toString(36).substr(2, 9),
      dayNumber: nextDay,
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
      dayNumber: it.dayNumber,
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

  const handleDeleteItinerary = (itId) => {
    setConfirmModal({
      show: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this itinerary day? This action cannot be undone.',
      onConfirm: async () => {
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
      }
    });
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

  const handleDeleteImage = (imgId) => {
    setConfirmModal({
      show: true,
      title: 'Confirm photo Delete',
      message: 'Are you sure you want to delete this image from the tour?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await deleteTourImage(id, imgId);
          showToast('Successfully deleted image!');
          fetchDetail();
        } catch (error) {
          console.error(error);
          showToast('Failed to delete image!', 'danger');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 min-h-screen">
        <div className="w-10 h-10 border-4 border-[#012d1d] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-500 text-sm">Loading tour details...</p>
      </div>
    );
  }

  if (errorMsg || !tour) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-red-100 p-8 text-center">
          <div className="text-5xl text-red-500 mb-4">⚠️</div>
          <h3 className="font-montserrat font-bold text-xl text-gray-900 mb-2">Tour Not Found</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{errorMsg || 'The requested Tour ID does not exist in the system.'}</p>
          <Link to="/admin/tours" className="inline-block bg-[#012d1d] hover:bg-[#0c432d] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-[#012d1d]/10">
            Back to Tour List
          </Link>
        </div>
      </div>
    );
  }

  const tabItems = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'waypoints', label: `Waypoints (${waypoints.length})` },
    { id: 'itinerary', label: `Daily Itinerary (${itineraries.length})` },
    { id: 'gallery', label: `Image Gallery (${images.length})` },
    { id: 'departures', label: `Departures (${departuresCount})` }
  ];

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-10 px-4 md:px-12 font-sans text-gray-800">
      {/* Toast Alert */}
      {toast.visible && (
        <div 
          className="fixed top-5 right-5 z-[50000] p-4 rounded-xl shadow-xl flex items-center justify-between gap-4 text-white bg-opacity-95 transform transition-all duration-300 animate-slide-in"
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

      {/* Back navigation */}
      <div className="mb-4">
        <Link to="/admin/tours" className="text-gray-500 hover:text-[#012d1d] font-semibold flex items-center gap-2 text-sm transition-all duration-150 transform hover:-translate-x-1 d-inline-flex">
          <ArrowLeft size={16} /> Back to Tour List
        </Link>
      </div>
      
      {/* Header Info */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider mb-2 ${
          tour.status === 'ACTIVE' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-gray-100 text-gray-700 border border-gray-200'
        }`}>
          {tour.status === 'ACTIVE' ? 'Active' : tour.status}
        </span>
        <h1 className="font-montserrat font-bold text-2xl md:text-3xl text-[#012d1d]">{tour.title}</h1>
        <p className="text-gray-500 text-xs mt-1">Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 text-[11px] font-mono">{tour.slug || 'not-created'}</code></p>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto gap-4 scrollbar-thin">
        {tabItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all font-montserrat ${
              activeTab === item.id 
                ? 'border-[#012d1d] text-[#012d1d]' 
                : 'border-transparent text-gray-500 hover:text-[#012d1d] hover:border-gray-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT SPACES */}
      <div>
        {/* TAB 1: BASIC INFO & TAGS */}
        {activeTab === 'basic' && (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-6 w-full">
            <TourBasicInfoForm
              tour={tour}
              onChange={setTour}
              handleTitleChange={handleTitleChange}
              generateSlug={generateSlug}
              errors={errors}
              touched={touched}
              setTouched={setTouched}
              useNightsDropdown={useNightsDropdown}
              setUseNightsDropdown={setUseNightsDropdown}
            />
            
            <TourTagsSection
              tour={tour}
              onChange={(updatedFields) => setTour(prev => ({ ...prev, ...updatedFields }))}
            />

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={Object.keys(errors).length > 0}
                className="bg-[#012d1d] hover:bg-[#0c432d] text-white px-8 py-3.5 font-bold rounded-lg transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save All Changes
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: WAYPOINTS */}
        {activeTab === 'waypoints' && (
          <TourWaypointList
            waypoints={waypoints}
            onAddClick={() => { setCurrentWp(null); setIsWpModalOpen(true); }}
            onEditClick={(wp) => { setCurrentWp(wp); setIsWpModalOpen(true); }}
            onDeleteClick={handleDeleteWp}
          />
        )}

        {/* TAB 3: DAILY ITINERARY */}
        {activeTab === 'itinerary' && (
          <TourDailyItineraryList
            itineraries={itineraries}
            waypoints={waypoints}
            expandedItineraryId={expandedItineraryId}
            setExpandedItineraryId={setExpandedItineraryId}
            onAddDayClick={addNewDayItinerary}
            onItineraryFieldChange={handleItineraryChange}
            onSaveDayClick={handleSaveItinerary}
            onDeleteDayClick={handleDeleteItinerary}
            onToggleWaypointInDay={toggleWaypointInDay}
          />
        )}

        {/* TAB 4: IMAGE GALLERY */}
        {activeTab === 'gallery' && (
          <TourGallerySection
            images={images}
            newImgData={newImgData}
            onChangeNewImgData={setNewImgData}
            onAddImage={handleAddImage}
            onDeleteImage={handleDeleteImage}
          />
        )}

        {/* TAB 5: DEPARTURES */}
        <div style={{ display: activeTab === 'departures' ? 'block' : 'none' }}>
          <TourDepartureList
            tourId={id}
            durationDays={tour?.durationDays || 1}
            showToast={showToast}
            onDeparturesChange={setDeparturesCount}
          />
        </div>
      </div>

      {/* Waypoint Modal */}
      <WaypointModal 
        show={isWpModalOpen}
        onClose={() => setIsWpModalOpen(false)}
        onSave={handleWpSubmit}
        waypoint={currentWp}
        totalWaypoints={waypoints.length}
      />

      {/* Custom Confirmation Modal */}
      <ConfirmDeleteModal 
        show={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
        onConfirm={() => {
          if (confirmModal.onConfirm) confirmModal.onConfirm();
          setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />
    </div>
  );
};

export default TourEditPage;
