import React from 'react';
import { Compass, CalendarDays, Star } from 'lucide-react';

const ToursLedHistoryList = ({ tours }) => {
  const renderStars = (rating) => {
    if (rating === null || rating === undefined) {
      return <span className="text-slate-400 italic text-[11px] font-semibold">No reviews yet</span>;
    }
    
    const stars = [];
    const roundedRating = Math.round(rating * 10) / 10;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 opacity-60" />);
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-slate-300" />);
      }
    }
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">{stars}</div>
        <span className="text-xs font-bold text-slate-600">({roundedRating} / 5)</span>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch (status?.toString().toUpperCase()) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-full">Completed</span>;
      case 'ONGOING':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-800 rounded-full animate-pulse">Ongoing</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded-full">Upcoming</span>;
    }
  };

  const getDotColorClass = (status) => {
    switch (status?.toString().toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-500';
      case 'ONGOING':
        return 'bg-blue-500';
      default:
        return 'bg-amber-500';
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-4">
      <h3 className="text-lg font-bold text-trek-neutral font-montserrat flex items-center gap-2 border-b border-slate-100 pb-3">
        <Compass className="w-5 h-5 text-trek-primary" />
        Tours Led History & Feedback
      </h3>

      {(!tours || tours.length === 0) ? (
        <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-100">
          No tours led yet.
        </div>
      ) : (
        <div className="relative pl-6 border-l border-slate-100 flex flex-col gap-6 pt-2">
          {tours.map((tour, idx) => (
            <div key={tour.departureId || idx} className="relative group">
              {/* Timeline dot */}
              <span className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-4 ring-slate-100 z-10 transition-transform group-hover:scale-125 duration-200 ${getDotColorClass(tour.status)}`} />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-md border border-slate-100 hover:border-slate-200 transition-all duration-300">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-trek-tertiary" />
                      {new Date(tour.departureDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    {getStatusBadge(tour.status)}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 font-montserrat group-hover:text-trek-primary transition-colors duration-200">
                    {tour.tourTitle}
                  </h4>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto">
                  {tour.status?.toUpperCase() === 'COMPLETED' && renderStars(tour.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToursLedHistoryList;
