import React from 'react';
import { Plus, X } from 'lucide-react';

export default function TourTagsSection({
  tour,
  tagInputs,
  onChangeTagInputs,
  addTag,
  removeTag
}) {
  return (
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
              onChange={(e) => onChangeTagInputs({...tagInputs, highlight: e.target.value})}
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
              onChange={(e) => onChangeTagInputs({...tagInputs, include: e.target.value})}
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
              onChange={(e) => onChangeTagInputs({...tagInputs, exclude: e.target.value})}
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
              onChange={(e) => onChangeTagInputs({...tagInputs, requirement: e.target.value})}
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
  );
}
