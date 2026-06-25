import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import WaypointModal from '../../components/WaypointModal';

const ArrowLeft = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const Plus = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const X = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
  ];

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
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basic' && (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-6 w-full">
            {/* General & Status */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center bg-gray-50/50 p-4 border-b border-gray-200">
                <h3 className="font-montserrat font-bold text-[#012d1d]">General & Status</h3>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-gray-100 border text-gray-600 rounded">Step 1</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Tour Title <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Enter tour title..."
                      value={tour.title || ''}
                      onChange={handleTitleChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Slug (URL Path)
                    </label>
                    <input 
                      type="text" 
                      placeholder="auto-generated-slug-path"
                      value={tour.slug || ''}
                      onChange={(e) => setTour({...tour, slug: generateSlug(e.target.value)})}
                      className="w-full px-4 py-2 text-sm border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select 
                      value={tour.status || 'DRAFT'}
                      onChange={(e) => setTour({...tour, status: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Difficulty
                    </label>
                    <select 
                      value={tour.difficulty || 'EASY'}
                      onChange={(e) => setTour({...tour, difficulty: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="HARD">Hard</option>
                      <option value="EXTREME">Extreme</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Duration (Days) *
                    </label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g., 3"
                      value={tour.durationDays || ''}
                      onChange={(e) => setTour({...tour, durationDays: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Duration (Nights) *
                    </label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g., 2"
                      value={tour.durationNights || ''}
                      onChange={(e) => setTour({...tour, durationNights: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Distance (Km)
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g., 25"
                      value={tour.distanceKm || ''}
                      onChange={(e) => setTour({...tour, distanceKm: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Max Elevation (m)
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g., 1500"
                      value={tour.maxElevationM || ''}
                      onChange={(e) => setTour({...tour, maxElevationM: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary & Description */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center bg-gray-50/50 p-4 border-b border-gray-200">
                <h3 className="font-montserrat font-bold text-[#012d1d]">Summary & Description</h3>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-gray-100 border text-gray-600 rounded">Step 2</span>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Short Description (Card Summary)
                  </label>
                  <textarea 
                    rows={2}
                    maxLength={500}
                    placeholder="Enter brief tour summary (max 500 characters)..."
                    value={tour.shortDescription || ''}
                    onChange={(e) => setTour({...tour, shortDescription: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Detailed Description
                  </label>
                  <textarea 
                    rows={6}
                    placeholder="Enter detailed description of the trek..."
                    value={tour.description || ''}
                    onChange={(e) => setTour({...tour, description: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Location & Map */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center bg-gray-50/50 p-4 border-b border-gray-200">
                <h3 className="font-montserrat font-bold text-[#012d1d]">Location & Map</h3>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-gray-100 border text-gray-600 rounded">Step 3</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Start Location (Name)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g., Sapa Town, Lao Cai"
                      value={tour.startLocation || ''}
                      onChange={(e) => setTour({...tour, startLocation: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      End Location (Name)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g., Fansipan Summit"
                      value={tour.endLocation || ''}
                      onChange={(e) => setTour({...tour, endLocation: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Start Latitude
                    </label>
                    <input 
                      type="number" 
                      step="0.000001"
                      placeholder="e.g., 22.336"
                      value={tour.startLat || ''}
                      onChange={(e) => setTour({...tour, startLat: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Start Longitude
                    </label>
                    <input 
                      type="number" 
                      step="0.000001"
                      placeholder="e.g., 103.843"
                      value={tour.startLng || ''}
                      onChange={(e) => setTour({...tour, startLng: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      End Latitude
                    </label>
                    <input 
                      type="number" 
                      step="0.000001"
                      placeholder="e.g., 22.302"
                      value={tour.endLat || ''}
                      onChange={(e) => setTour({...tour, endLat: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      End Longitude
                    </label>
                    <input 
                      type="number" 
                      step="0.000001"
                      placeholder="e.g., 103.775"
                      value={tour.endLng || ''}
                      onChange={(e) => setTour({...tour, endLng: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    GPX Route File URL
                  </label>
                  <input 
                    type="url" 
                    placeholder="e.g., https://maps.trekmate.com/gpx/fansipan.gpx"
                    value={tour.routeGpxUrl || ''}
                    onChange={(e) => setTour({...tour, routeGpxUrl: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Highlights & Amenities */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center bg-gray-50/50 p-4 border-b border-gray-200">
                <h3 className="font-montserrat font-bold text-[#012d1d]">Highlights & Amenities</h3>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-gray-100 border text-gray-600 rounded">Step 4</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Highlights */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Highlights</label>
                  <div className="flex overflow-hidden border border-gray-300 rounded-lg focus-within:border-[#012d1d] focus-within:ring-2 focus-within:ring-[#012d1d]/20 transition-all bg-white">
                    <input 
                      type="text" 
                      placeholder="e.g., Sunset above the clouds..."
                      value={tagInputs.highlight}
                      onChange={(e) => setTagInputs({...tagInputs, highlight: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('highlight'))}
                      className="w-full px-4 py-2 text-sm border-0 focus:outline-none focus:ring-0"
                    />
                    <button 
                      type="button"
                      onClick={() => addTag('highlight')}
                      className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold border-l border-gray-300 flex items-center gap-1 transition-all"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                  <div className="min-h-[80px] rounded-lg p-3 bg-gray-50 border border-gray-200 flex flex-wrap gap-2">
                    {tour.highlights && tour.highlights.map((h, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-semibold">
                        {h}
                        <button type="button" className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => removeTag('highlight', idx)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Includes */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Includes</label>
                  <div className="flex overflow-hidden border border-gray-300 rounded-lg focus-within:border-[#012d1d] focus-within:ring-2 focus-within:ring-[#012d1d]/20 transition-all bg-white">
                    <input 
                      type="text" 
                      placeholder="e.g., Support team, Porter service..."
                      value={tagInputs.include}
                      onChange={(e) => setTagInputs({...tagInputs, include: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('include'))}
                      className="w-full px-4 py-2 text-sm border-0 focus:outline-none focus:ring-0"
                    />
                    <button 
                      type="button"
                      onClick={() => addTag('include')}
                      className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold border-l border-gray-300 flex items-center gap-1 transition-all"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                  <div className="min-h-[80px] rounded-lg p-3 bg-gray-50 border border-gray-200 flex flex-wrap gap-2">
                    {tour.includes && tour.includes.map((i, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold">
                        {i}
                        <button type="button" className="text-emerald-400 hover:text-red-500 transition-colors" onClick={() => removeTag('include', idx)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Excludes */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Excludes</label>
                  <div className="flex overflow-hidden border border-gray-300 rounded-lg focus-within:border-[#012d1d] focus-within:ring-2 focus-within:ring-[#012d1d]/20 transition-all bg-white">
                    <input 
                      type="text" 
                      placeholder="e.g., Personal gear, Alcoholic drinks..."
                      value={tagInputs.exclude}
                      onChange={(e) => setTagInputs({...tagInputs, exclude: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('exclude'))}
                      className="w-full px-4 py-2 text-sm border-0 focus:outline-none focus:ring-0"
                    />
                    <button 
                      type="button"
                      onClick={() => addTag('exclude')}
                      className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold border-l border-gray-300 flex items-center gap-1 transition-all"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                  <div className="min-h-[80px] rounded-lg p-3 bg-gray-50 border border-gray-200 flex flex-wrap gap-2">
                    {tour.excludes && tour.excludes.map((ex, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-semibold">
                        {ex}
                        <button type="button" className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => removeTag('exclude', idx)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Requirements</label>
                  <div className="flex overflow-hidden border border-gray-300 rounded-lg focus-within:border-[#012d1d] focus-within:ring-2 focus-within:ring-[#012d1d]/20 transition-all bg-white">
                    <input 
                      type="text" 
                      placeholder="e.g., Trekking shoes, Physical stamina..."
                      value={tagInputs.requirement}
                      onChange={(e) => setTagInputs({...tagInputs, requirement: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('requirement'))}
                      className="w-full px-4 py-2 text-sm border-0 focus:outline-none focus:ring-0"
                    />
                    <button 
                      type="button"
                      onClick={() => addTag('requirement')}
                      className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold border-l border-gray-300 flex items-center gap-1 transition-all"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                  <div className="min-h-[80px] rounded-lg p-3 bg-gray-50 border border-gray-200 flex flex-wrap gap-2">
                    {tour.requirements && tour.requirements.map((r, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-semibold">
                        {r}
                        <button type="button" className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => removeTag('requirement', idx)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                className="bg-[#012d1d] hover:bg-[#0c432d] text-white px-8 py-3.5 font-bold rounded-lg transition-all shadow-md hover:-translate-y-0.5"
              >
                Save All Changes
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: WAYPOINTS */}
        {activeTab === 'waypoints' && (
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 gap-4">
              <div>
                <h3 className="font-montserrat font-bold text-lg text-[#012d1d]">Route Waypoints List</h3>
                <p className="text-gray-500 text-xs mt-0.5">Start, intermediate, overnight shelter, and end points of the trekking route.</p>
              </div>
              <button 
                onClick={() => { setCurrentWp(null); setIsWpModalOpen(true); }}
                className="bg-[#012d1d] hover:bg-[#0c432d] text-white px-4 py-2 font-semibold rounded-lg text-sm transition-all"
              >
                + Add Waypoint
              </button>
            </div>

            {waypoints.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl block mb-2">📍</span>
                <p className="text-sm">No waypoints have been set for this tour route yet.</p>
              </div>
            ) : (
              <div className="relative pl-8 border-l-2 border-dashed border-gray-200 ml-4 space-y-6 py-2">
                {waypoints.map((wp) => (
                  <div key={wp.id} className="relative">
                    {/* Node Sequence Indicator */}
                    <div className="absolute -left-12 top-1.5 w-7 h-7 rounded-full bg-[#fea619] text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm">
                      {wp.sequenceOrder}
                    </div>
                    
                    {/* Card container */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:border-[#012d1d]/30 transition-all">
                      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/30 rounded-t-xl">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-[#012d1d]">{wp.name}</h5>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-200 text-gray-600 rounded uppercase">{wp.waypointType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setCurrentWp(wp); setIsWpModalOpen(true); }} className="px-3 py-1 text-xs font-semibold border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700">Edit</button>
                          <button onClick={() => handleDeleteWp(wp.id)} className="px-3 py-1 text-xs font-semibold border border-red-200 rounded bg-white hover:bg-red-50 text-red-600">Delete</button>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {wp.description && <p className="text-gray-500 text-xs leading-relaxed">{wp.description}</p>}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 border border-gray-100">
                          {wp.elevationM && <div>📐 Elevation: <strong className="text-gray-800">{wp.elevationM}m</strong></div>}
                          {(wp.lat && wp.lng) && <div>🌐 Coordinates: <strong className="text-gray-800">{wp.lat}, {wp.lng}</strong></div>}
                          {wp.waterSource && <div>💧 Water Source: <strong className="text-gray-800">{wp.waterSource}</strong></div>}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className={`px-2 py-1 text-[10px] font-semibold border rounded-md ${wp.hasToilet ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>🚽 Toilet</span>
                          <span className={`px-2 py-1 text-[10px] font-semibold border rounded-md ${wp.hasShelter ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>🛖 Shelter</span>
                          <span className={`px-2 py-1 text-[10px] font-semibold border rounded-md ${wp.hasPhoneSignal ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>📶 Phone Signal</span>
                          <span className={`px-2 py-1 text-[10px] font-semibold border rounded-md ${wp.hasFirstAid ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>🩺 First Aid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DAILY ITINERARY */}
        {activeTab === 'itinerary' && (
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 gap-4">
              <div>
                <h3 className="font-montserrat font-bold text-lg text-[#012d1d]">Daily Itinerary Details</h3>
                <p className="text-gray-500 text-xs mt-0.5">Configure trekking activities, distance metrics, and connected waypoints for each day.</p>
              </div>
              <button 
                onClick={addNewDayItinerary}
                className="bg-[#012d1d] hover:bg-[#0c432d] text-white px-4 py-2 font-semibold rounded-lg text-sm transition-all"
              >
                + Add Day Itinerary
              </button>
            </div>

            {itineraries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl block mb-2">📅</span>
                <p className="text-sm">No daily itinerary has been defined for this tour yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {itineraries.map((it, idx) => {
                  const isExpanded = expandedItineraryId === it.id;
                  return (
                    <div key={it.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                      {/* Header */}
                      <button
                        type="button"
                        onClick={() => setExpandedItineraryId(isExpanded ? null : it.id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/60 transition-colors focus:outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-xs font-bold text-white bg-[#012d1d] rounded-md">Day {idx + 1}</span>
                          <span className="font-bold text-gray-900 text-sm md:text-base text-left">{it.dayTitle}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 text-xs md:text-sm font-semibold">
                          <span className="hidden sm:inline">
                            {it.distanceKm ? `${it.distanceKm} km` : ''} 
                            {it.dayDifficulty ? ` • Difficulty: ${it.dayDifficulty}` : ''}
                          </span>
                          <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      </button>

                      {/* Collapse Body */}
                      {isExpanded && (
                        <div className="p-6 border-t border-gray-200 bg-white">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Form Content */}
                            <div className="lg:col-span-8 space-y-4 border-r-0 lg:border-r border-gray-200 lg:pr-6">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Day Title</label>
                                <input 
                                  type="text" 
                                  value={it.dayTitle || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'dayTitle', e.target.value)}
                                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all font-medium"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Day Description</label>
                                <textarea 
                                  rows={3}
                                  value={it.dayDescription || ''}
                                  onChange={(e) => handleItineraryChange(it.id, 'dayDescription', e.target.value)}
                                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all leading-relaxed"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Waypoint</label>
                                  <select
                                    value={it.startWaypointId || ''}
                                    onChange={(e) => handleItineraryChange(it.id, 'startWaypointId', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  >
                                    <option value="">-- Select Start Point --</option>
                                    {waypoints.map(w => (
                                      <option key={w.id} value={w.id}>#{w.sequenceOrder} - {w.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Waypoint</label>
                                  <select
                                    value={it.endWaypointId || ''}
                                    onChange={(e) => handleItineraryChange(it.id, 'endWaypointId', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  >
                                    <option value="">-- Select End Point --</option>
                                    {waypoints.map(w => (
                                      <option key={w.id} value={w.id}>#{w.sequenceOrder} - {w.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Overnight Waypoint (optional)</label>
                                  <select
                                    value={it.overnightWaypointId || ''}
                                    onChange={(e) => handleItineraryChange(it.id, 'overnightWaypointId', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  >
                                    <option value="">-- No Overnight Stay --</option>
                                    {waypoints.map(w => (
                                      <option key={w.id} value={w.id}>#{w.sequenceOrder} - {w.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Day Distance (Km)</label>
                                  <input 
                                    type="number" 
                                    step="0.1"
                                    value={it.distanceKm || ''} 
                                    onChange={(e) => handleItineraryChange(it.id, 'distanceKm', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Elevation Gain (m)</label>
                                  <input 
                                    type="number" 
                                    value={it.elevationGainM || ''} 
                                    onChange={(e) => handleItineraryChange(it.id, 'elevationGainM', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Elevation Loss (m)</label>
                                  <input 
                                    type="number" 
                                    value={it.elevationLossM || ''} 
                                    onChange={(e) => handleItineraryChange(it.id, 'elevationLossM', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Day Difficulty</label>
                                  <select 
                                    value={it.dayDifficulty || 'EASY'}
                                    onChange={(e) => handleItineraryChange(it.id, 'dayDifficulty', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  >
                                    <option value="EASY">Easy</option>
                                    <option value="MODERATE">Moderate</option>
                                    <option value="HARD">Hard</option>
                                    <option value="EXTREME">Extreme</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Min Walking Hours</label>
                                  <input 
                                    type="number" 
                                    value={it.walkingHoursMin || ''} 
                                    onChange={(e) => handleItineraryChange(it.id, 'walkingHoursMin', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Max Walking Hours</label>
                                  <input 
                                    type="number" 
                                    value={it.walkingHoursMax || ''} 
                                    onChange={(e) => handleItineraryChange(it.id, 'walkingHoursMax', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated Start Time</label>
                                  <input 
                                    type="text" 
                                    placeholder="08:00"
                                    value={it.suggestedStartTime || ''} 
                                    onChange={(e) => handleItineraryChange(it.id, 'suggestedStartTime', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated End Time</label>
                                  <input 
                                    type="text" 
                                    placeholder="16:00"
                                    value={it.suggestedEndTime || ''} 
                                    onChange={(e) => handleItineraryChange(it.id, 'suggestedEndTime', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Meal Notes</label>
                                <input 
                                  type="text" 
                                  placeholder="Breakfast: self-catering, Lunch: packed lunch..."
                                  value={it.mealNotes || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'mealNotes', e.target.value)}
                                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Day Safety Instructions</label>
                                <textarea 
                                  rows={2}
                                  placeholder="Describe rocky path precautions, hydration targets..."
                                  value={it.safetyNotes || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'safetyNotes', e.target.value)}
                                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all leading-relaxed"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Guide Special Instructions (Internal)</label>
                                <textarea 
                                  rows={2}
                                  placeholder="Private notes for team guides, porter pickups..."
                                  value={it.guideNotes || ''} 
                                  onChange={(e) => handleItineraryChange(it.id, 'guideNotes', e.target.value)}
                                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all leading-relaxed"
                                />
                              </div>
                            </div>

                            {/* Right Side Visited Waypoints Checklist */}
                            <div className="lg:col-span-4 lg:pl-4">
                              <h6 className="font-bold mb-2 text-gray-900 text-sm">Waypoints Visited Today</h6>
                              <p className="text-gray-500 text-xs mb-3">Check the waypoints visited during this day:</p>
                              
                              {waypoints.length === 0 ? (
                                <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg text-amber-800 text-xs">
                                  No waypoints available. Please add waypoints in Tab 2 first.
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-[380px] overflow-y-auto">
                                  {waypoints.map(wp => {
                                    const links = it.waypointLinks || [];
                                    const linked = links.some(link => link.waypointId === wp.id);
                                    const linkObj = links.find(link => link.waypointId === wp.id);
                                    return (
                                      <div key={wp.id} className={`p-2 border rounded-lg flex items-center justify-between transition-colors ${linked ? 'border-amber-400 bg-amber-50/50' : 'bg-white border-gray-200'}`}>
                                        <label className="flex items-center space-x-2 text-xs font-semibold text-gray-800 cursor-pointer w-full">
                                          <input 
                                            type="checkbox"
                                            checked={linked}
                                            onChange={() => toggleWaypointInDay(it.id, wp.id)}
                                            className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                                          />
                                          <span>#{wp.sequenceOrder} - {wp.name}</span>
                                        </label>
                                        {linked && (
                                          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fea619] text-white rounded">Order: {linkObj?.visitOrder}</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-6 border-t border-gray-200 pt-4">
                            <button 
                              type="button" 
                              onClick={() => handleDeleteItinerary(it.id)}
                              className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold transition-all"
                            >
                              Delete this Day
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleSaveItinerary(it)}
                              className="bg-[#012d1d] hover:bg-[#0c432d] text-white px-5 py-2 font-bold rounded-lg text-xs transition-all shadow-sm"
                            >
                              Save Day Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IMAGE GALLERY */}
        {activeTab === 'gallery' && (
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Image list grid */}
              <div className="lg:col-span-8 lg:border-r border-gray-200 lg:pr-6">
                <h3 className="font-montserrat font-bold text-lg text-[#012d1d] mb-4">Image Collection</h3>
                
                {images.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-4xl block mb-2">🖼️</span>
                    <p className="text-sm">No images stored for this tour yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className={`bg-white rounded-xl border overflow-hidden flex flex-col shadow-sm transition-all ${img.isCover ? 'border-[#fea619] ring-2 ring-[#fea619]/10' : 'border-gray-200'}`}>
                        <div className="relative h-40 overflow-hidden bg-gray-100">
                          <img 
                            src={img.imageUrl} 
                            alt={img.caption || 'Tour media'} 
                            className="w-full h-full object-cover" 
                          />
                          {img.isCover && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold bg-[#fea619] text-white rounded uppercase tracking-wider">
                              Main Cover
                            </span>
                          )}
                        </div>
                        <div className="p-3 flex flex-col justify-between flex-grow">
                          <p className="font-semibold text-xs text-gray-800 line-clamp-1 mb-3">{img.caption || 'No caption'}</p>
                          <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                            <span className="px-2 py-0.5 bg-gray-100 border text-gray-500 rounded text-[10px] font-semibold">Order: {img.sortOrder}</span>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteImage(img.id)}
                              className="text-red-600 hover:text-red-700 font-bold transition-all text-[11px]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add image form */}
              <div className="lg:col-span-4 lg:pl-4 space-y-4">
                <h3 className="font-montserrat font-bold text-lg text-[#012d1d]">Add New Image</h3>
                <form onSubmit={handleAddImage} className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3 shadow-sm">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image URL *</label>
                    <input 
                      type="url" 
                      required 
                      placeholder="https://example.com/trekking-photo.webp"
                      value={newImgData.imageUrl}
                      onChange={(e) => setNewImgData({...newImgData, imageUrl: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Caption</label>
                    <input 
                      type="text" 
                      placeholder="Sunset view from the ridge..."
                      value={newImgData.caption}
                      onChange={(e) => setNewImgData({...newImgData, caption: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Alt Text</label>
                    <input 
                      type="text" 
                      placeholder="Descriptive alt text for SEO..."
                      value={newImgData.altText}
                      onChange={(e) => setNewImgData({...newImgData, altText: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Display Order</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={newImgData.sortOrder}
                        onChange={(e) => setNewImgData({...newImgData, sortOrder: parseInt(e.target.value) || 1})}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all bg-white"
                      />
                    </div>
                    <div className="flex items-end pb-2.5">
                      <label className="flex items-center space-x-2 text-xs font-semibold text-gray-800 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newImgData.isCover}
                          onChange={(e) => setNewImgData({...newImgData, isCover: e.target.checked})}
                          className="w-4 h-4 text-[#012d1d] border-gray-300 rounded focus:ring-[#012d1d]"
                        />
                        <span>Cover Image</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#012d1d] hover:bg-[#0c432d] text-white font-bold py-2.5 rounded-lg text-sm transition-all mt-4 shadow-sm"
                  >
                    Add to Gallery
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>

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
