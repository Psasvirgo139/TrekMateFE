import React from 'react';
import CreativeMultiSelect from '../../../components/common/CreativeMultiSelect';

export default function TourTagsSection({ tour, onChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center bg-gray-50/50 p-4 border-b border-gray-200 rounded-t-xl">
        <h3 className="font-montserrat font-bold text-[#012d1d]">Highlights & Amenities</h3>
        <span className="px-2 py-0.5 text-[11px] font-bold bg-gray-100 border text-gray-600 rounded">Step 4</span>
      </div>
      <div className="p-6 pb-36 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Highlights */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Highlights</label>
          <CreativeMultiSelect
            type="HIGHLIGHT"
            value={tour.highlights || []}
            onChange={(newVals) => onChange({ highlights: newVals })}
            placeholder="Search or add highlights..."
          />
        </div>

        {/* Includes */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Includes</label>
          <CreativeMultiSelect
            type="INCLUDE"
            value={tour.includes || []}
            onChange={(newVals) => onChange({ includes: newVals })}
            placeholder="Search or add includes..."
          />
        </div>

        {/* Excludes */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Excludes</label>
          <CreativeMultiSelect
            type="EXCLUDE"
            value={tour.excludes || []}
            onChange={(newVals) => onChange({ excludes: newVals })}
            placeholder="Search or add excludes..."
          />
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Requirements</label>
          <CreativeMultiSelect
            type="REQUIREMENT"
            value={tour.requirements || []}
            onChange={(newVals) => onChange({ requirements: newVals })}
            placeholder="Search or add requirements..."
          />
        </div>

      </div>
    </div>
  );
}
