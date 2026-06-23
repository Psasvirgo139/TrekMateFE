import React from 'react';
import { Compass, CalendarDays } from 'lucide-react';

const TripHistoryList = ({ trips }) => {
  const getStatusColor = (status) => {
    switch (status?.toString().toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500';
      case 'upcoming':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-4">
      <h3 className="text-lg font-bold text-trek-neutral font-montserrat flex items-center gap-2 border-b border-slate-100 pb-3">
        <Compass className="w-5 h-5 text-trek-primary" />
        Trekking History & Trips
      </h3>

      {(!trips || trips.length === 0) ? (
        <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-100">
          No trips recorded. Start exploring with TrekMate!
        </div>
      ) : (
        <div className="relative pl-6 border-l border-slate-100 flex flex-col gap-6 pt-2">
          {trips.map((trip, idx) => (
            <div key={trip.id || idx} className="relative group">
              {/* Timeline dot */}
              <span className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-4 ring-slate-100 z-10 transition-transform group-hover:scale-125 duration-200 ${getStatusColor(trip.status)}`} />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-md border border-slate-100 hover:border-slate-200 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-trek-tertiary" />
                    {trip.date}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-800 mt-1 font-montserrat group-hover:text-trek-primary transition-colors duration-200">
                    {trip.title}
                  </h4>
                  <span className="inline-block text-[10px] font-bold text-slate-500 bg-white border border-slate-200/60 rounded px-1.5 py-0.5 mt-2">
                    Difficulty: {trip.difficulty || 'Moderate'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-extrabold self-start md:self-auto uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(trip.status)}`} />
                  <span className="text-slate-600">{trip.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripHistoryList;
