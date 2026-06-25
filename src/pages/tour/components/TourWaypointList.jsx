import React from 'react';

export default function TourWaypointList({
  waypoints,
  onAddClick,
  onEditClick,
  onDeleteClick
}) {
  return (
    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 gap-4">
        <div>
          <h3 className="font-montserrat font-bold text-lg text-[#012d1d]">Route Waypoints List</h3>
          <p className="text-gray-500 text-xs mt-0.5">Start, intermediate, overnight shelter, and end points of the trekking route.</p>
        </div>
        <button 
          onClick={onAddClick}
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
              {/* Sequence Order Badge */}
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
                    <button 
                      onClick={() => onEditClick(wp)} 
                      className="px-3 py-1 text-xs font-semibold border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDeleteClick(wp.id)} 
                      className="px-3 py-1 text-xs font-semibold border border-red-200 rounded bg-white hover:bg-red-50 text-red-600"
                    >
                      Delete
                    </button>
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
  );
}
