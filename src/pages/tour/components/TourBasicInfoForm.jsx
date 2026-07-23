import React from 'react';
import { getValidNightsOptions } from '../../../utils/validation';
import SearchableLocationSelect from '../../../components/common/SearchableLocationSelect';

export default function TourBasicInfoForm({ 
  tour, 
  onChange, 
  handleTitleChange, 
  generateSlug,
  errors = {},
  touched = {},
  setTouched,
  useNightsDropdown = true,
  setUseNightsDropdown
}) {
  const handleBlur = (field) => {
    if (setTouched) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  };

  const showError = (field) => {
    return errors[field] && touched[field];
  };

  return (
    <div className="space-y-6">
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
                placeholder="Enter tour title..."
                value={tour.title || ''}
                onChange={handleTitleChange}
                onBlur={() => handleBlur('title')}
                className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                  showError('title') 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#012d1d]'
                }`}
              />
              {showError('title') && (
                <p className="mt-1 text-[11px] text-red-500 leading-tight">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Slug (URL Path)
              </label>
              <input 
                type="text" 
                placeholder="auto-generated-slug-path"
                value={tour.slug || ''}
                onChange={(e) => onChange({...tour, slug: generateSlug(e.target.value)})}
                className="w-full px-4 py-2 text-sm border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed font-mono text-xs focus:outline-none"
                disabled
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
                onChange={(e) => onChange({...tour, status: e.target.value})}
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
                onChange={(e) => onChange({...tour, difficulty: e.target.value})}
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
                min="0"
                placeholder="e.g., 3"
                value={tour.durationDays !== undefined && tour.durationDays !== null ? tour.durationDays : ''}
                onChange={(e) => {
                  const days = e.target.value === '' ? '' : parseInt(e.target.value);
                  let nights = tour.durationNights;
                  
                  if (useNightsDropdown && !isNaN(days) && days >= 0) {
                    const validNights = getValidNightsOptions(days);
                    if (validNights.length > 0 && !validNights.includes(nights)) {
                      nights = validNights[0];
                    }
                  }
                  
                  onChange({
                    ...tour,
                    durationDays: days,
                    durationNights: nights
                  });
                }}
                onBlur={() => handleBlur('durationDays')}
                className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                  showError('durationDays') 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#012d1d]'
                }`}
              />
              {showError('durationDays') && (
                <p className="mt-1 text-[11px] text-red-500 leading-tight">{errors.durationDays}</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Duration (Nights) *
                </label>
                <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={useNightsDropdown}
                    onChange={(e) => setUseNightsDropdown(e.target.checked)}
                    className="rounded text-[#012d1d] focus:ring-[#012d1d] w-3 h-3"
                  />
                  Use Dropdown
                </label>
              </div>
              
              {useNightsDropdown ? (
                <select
                  value={tour.durationNights !== undefined && tour.durationNights !== null ? tour.durationNights : 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onChange({ ...tour, durationNights: val });
                    if (setTouched) {
                      setTouched(prev => ({ ...prev, durationNights: true }));
                    }
                  }}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all bg-white"
                >
                  {getValidNightsOptions(tour.durationDays).map(opt => (
                    <option key={opt} value={opt}>{opt} Đêm</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="number" 
                  min="0"
                  placeholder="e.g., 2"
                  value={tour.durationNights !== undefined && tour.durationNights !== null ? tour.durationNights : ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                    onChange({ ...tour, durationNights: val });
                  }}
                  onBlur={() => handleBlur('durationNights')}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                    showError('durationNights') 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
              )}
              {showError('durationNights') && !useNightsDropdown && (
                <p className="mt-1 text-[11px] text-red-500 leading-tight">{errors.durationNights}</p>
              )}
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
                onChange={(e) => onChange({...tour, distanceKm: e.target.value})}
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
                onChange={(e) => onChange({...tour, maxElevationM: e.target.value})}
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
              onChange={(e) => onChange({...tour, shortDescription: e.target.value})}
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
              onChange={(e) => onChange({...tour, description: e.target.value})}
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
                Start Location (Name) *
              </label>
              <SearchableLocationSelect
                value={tour.startLocation || ''}
                onChange={(val) => {
                  onChange({...tour, startLocation: val});
                  if (setTouched) {
                    setTouched(prev => ({ ...prev, startLocation: true }));
                  }
                }}
                placeholder="e.g., Sapa Town, Lao Cai"
                error={showError('startLocation')}
              />
              {showError('startLocation') && (
                <p className="mt-1 text-[11px] text-red-500 leading-tight">{errors.startLocation}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                End Location (Name) *
              </label>
              <SearchableLocationSelect
                value={tour.endLocation || ''}
                onChange={(val) => {
                  onChange({...tour, endLocation: val});
                  if (setTouched) {
                    setTouched(prev => ({ ...prev, endLocation: true }));
                  }
                }}
                placeholder="e.g., Fansipan Summit"
                error={showError('endLocation')}
              />
              {showError('endLocation') && (
                <p className="mt-1 text-[11px] text-red-500 leading-tight">{errors.endLocation}</p>
              )}
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
                onChange={(e) => onChange({...tour, startLat: e.target.value})}
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
                onChange={(e) => onChange({...tour, startLng: e.target.value})}
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
                onChange={(e) => onChange({...tour, endLat: e.target.value})}
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
                onChange={(e) => onChange({...tour, endLng: e.target.value})}
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
              onChange={(e) => onChange({...tour, routeGpxUrl: e.target.value})}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
