import React, { useState } from 'react';

export default function TourDailyItineraryList({
  itineraries,
  waypoints,
  expandedItineraryId,
  setExpandedItineraryId,
  onAddDayClick,
  onItineraryFieldChange,
  onSaveDayClick,
  onDeleteDayClick,
  onToggleWaypointInDay
}) {
  const [errors, setErrors] = useState({});

  const handleFieldChange = (itId, field, value) => {
    onItineraryFieldChange(itId, field, value);
    if (errors[itId] && errors[itId][field]) {
      setErrors((prev) => ({
        ...prev,
        [itId]: {
          ...prev[itId],
          [field]: null
        }
      }));
    }
    if (field === 'walkingHoursMin' || field === 'walkingHoursMax') {
      setErrors((prev) => ({
        ...prev,
        [itId]: {
          ...prev[itId],
          walkingHoursMin: null,
          walkingHoursMax: null
        }
      }));
    }
  };

  const validateDay = (it) => {
    const dayErrors = {};
    if (!it.dayTitle || !it.dayTitle.trim()) {
      dayErrors.dayTitle = "Day title is required";
    }
    if (!it.dayDescription || !it.dayDescription.trim()) {
      dayErrors.dayDescription = "Day description is required";
    }
    if (it.distanceKm !== undefined && it.distanceKm !== null && it.distanceKm !== '') {
      if (parseFloat(it.distanceKm) < 0) {
        dayErrors.distanceKm = "Distance cannot be negative";
      }
    }
    if (it.elevationGainM !== undefined && it.elevationGainM !== null && it.elevationGainM !== '') {
      if (parseInt(it.elevationGainM) < 0) {
        dayErrors.elevationGainM = "Elevation gain cannot be negative";
      }
    }
    if (it.elevationLossM !== undefined && it.elevationLossM !== null && it.elevationLossM !== '') {
      if (parseInt(it.elevationLossM) < 0) {
        dayErrors.elevationLossM = "Elevation loss cannot be negative";
      }
    }
    if (it.walkingHoursMin !== undefined && it.walkingHoursMin !== null && it.walkingHoursMin !== '') {
      if (parseInt(it.walkingHoursMin) < 0) {
        dayErrors.walkingHoursMin = "Min walking hours cannot be negative";
      }
    }
    if (it.walkingHoursMax !== undefined && it.walkingHoursMax !== null && it.walkingHoursMax !== '') {
      if (parseInt(it.walkingHoursMax) < 0) {
        dayErrors.walkingHoursMax = "Max walking hours cannot be negative";
      } else if (it.walkingHoursMin && parseInt(it.walkingHoursMax) < parseInt(it.walkingHoursMin)) {
        dayErrors.walkingHoursMax = "Max hours must be at least min hours";
      }
    }

    setErrors((prev) => ({ ...prev, [it.id]: dayErrors }));
    return Object.keys(dayErrors).length === 0;
  };
  return (
    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 gap-4">
        <div>
          <h3 className="font-montserrat font-bold text-lg text-[#012d1d]">Daily Itinerary Details</h3>
          <p className="text-gray-500 text-xs mt-0.5">Configure trekking activities, distance metrics, and connected waypoints for each day.</p>
        </div>
        <button 
          onClick={onAddDayClick}
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
                {/* Collapsible Header */}
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

                {/* Collapsible Body */}
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
                            onChange={(e) => handleFieldChange(it.id, 'dayTitle', e.target.value)}
                            className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all font-medium ${
                              errors[it.id]?.dayTitle 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:border-[#012d1d]'
                            }`}
                          />
                          {errors[it.id]?.dayTitle && (
                            <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors[it.id].dayTitle}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Day Description</label>
                          <textarea 
                            rows={3}
                            value={it.dayDescription || ''}
                            onChange={(e) => handleFieldChange(it.id, 'dayDescription', e.target.value)}
                            className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all leading-relaxed ${
                              errors[it.id]?.dayDescription 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:border-[#012d1d]'
                            }`}
                          />
                          {errors[it.id]?.dayDescription && (
                            <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors[it.id].dayDescription}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Waypoint</label>
                            <select
                              value={it.startWaypointId || ''}
                              onChange={(e) => onItineraryFieldChange(it.id, 'startWaypointId', e.target.value)}
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
                              onChange={(e) => onItineraryFieldChange(it.id, 'endWaypointId', e.target.value)}
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
                              onChange={(e) => onItineraryFieldChange(it.id, 'overnightWaypointId', e.target.value)}
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
                              onChange={(e) => handleFieldChange(it.id, 'distanceKm', e.target.value)}
                              className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                                errors[it.id]?.distanceKm 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:border-[#012d1d]'
                              }`}
                            />
                            {errors[it.id]?.distanceKm && (
                              <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors[it.id].distanceKm}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Elevation Gain (m)</label>
                            <input 
                              type="number" 
                              value={it.elevationGainM || ''} 
                              onChange={(e) => handleFieldChange(it.id, 'elevationGainM', e.target.value)}
                              className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                                errors[it.id]?.elevationGainM 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:border-[#012d1d]'
                              }`}
                            />
                            {errors[it.id]?.elevationGainM && (
                              <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors[it.id].elevationGainM}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Elevation Loss (m)</label>
                            <input 
                              type="number" 
                              value={it.elevationLossM || ''} 
                              onChange={(e) => handleFieldChange(it.id, 'elevationLossM', e.target.value)}
                              className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                                errors[it.id]?.elevationLossM 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:border-[#012d1d]'
                              }`}
                            />
                            {errors[it.id]?.elevationLossM && (
                              <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors[it.id].elevationLossM}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Day Difficulty</label>
                            <select 
                              value={it.dayDifficulty || 'EASY'}
                              onChange={(e) => onItineraryFieldChange(it.id, 'dayDifficulty', e.target.value)}
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
                              onChange={(e) => handleFieldChange(it.id, 'walkingHoursMin', e.target.value)}
                              className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                                errors[it.id]?.walkingHoursMin 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:border-[#012d1d]'
                              }`}
                            />
                            {errors[it.id]?.walkingHoursMin && (
                              <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors[it.id].walkingHoursMin}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Max Walking Hours</label>
                            <input 
                              type="number" 
                              value={it.walkingHoursMax || ''} 
                              onChange={(e) => handleFieldChange(it.id, 'walkingHoursMax', e.target.value)}
                              className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                                errors[it.id]?.walkingHoursMax 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:border-[#012d1d]'
                              }`}
                            />
                            {errors[it.id]?.walkingHoursMax && (
                              <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors[it.id].walkingHoursMax}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated Start Time</label>
                            <input 
                              type="text" 
                              placeholder="08:00"
                              value={it.suggestedStartTime || ''} 
                              onChange={(e) => onItineraryFieldChange(it.id, 'suggestedStartTime', e.target.value)}
                              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated End Time</label>
                            <input 
                              type="text" 
                              placeholder="16:00"
                              value={it.suggestedEndTime || ''} 
                              onChange={(e) => onItineraryFieldChange(it.id, 'suggestedEndTime', e.target.value)}
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
                            onChange={(e) => onItineraryFieldChange(it.id, 'mealNotes', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Day Safety Instructions</label>
                          <textarea 
                            rows={2}
                            placeholder="Describe rocky path precautions, hydration targets..."
                            value={it.safetyNotes || ''} 
                            onChange={(e) => onItineraryFieldChange(it.id, 'safetyNotes', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all leading-relaxed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Guide Special Instructions (Internal)</label>
                          <textarea 
                            rows={2}
                            placeholder="Private notes for team guides, porter pickups..."
                            value={it.guideNotes || ''} 
                            onChange={(e) => onItineraryFieldChange(it.id, 'guideNotes', e.target.value)}
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
                                      onChange={() => onToggleWaypointInDay(it.id, wp.id)}
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
                        onClick={() => onDeleteDayClick(it.id)}
                        className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold transition-all"
                      >
                        Delete this Day
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (validateDay(it)) {
                            onSaveDayClick(it);
                          }
                        }}
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
  );
}
