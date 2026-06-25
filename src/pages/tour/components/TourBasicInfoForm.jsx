import React from 'react';

export default function TourBasicInfoForm({ tour, onChange, handleTitleChange, generateSlug }) {
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
                required
                placeholder="e.g., 3"
                value={tour.durationDays || ''}
                onChange={(e) => onChange({...tour, durationDays: e.target.value})}
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
                onChange={(e) => onChange({...tour, durationNights: e.target.value})}
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
                Start Location (Name)
              </label>
              <input 
                type="text" 
                placeholder="e.g., Sapa Town, Lao Cai"
                value={tour.startLocation || ''}
                onChange={(e) => onChange({...tour, startLocation: e.target.value})}
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
                onChange={(e) => onChange({...tour, endLocation: e.target.value})}
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
