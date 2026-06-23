import React from 'react';
import { Star, Activity } from 'lucide-react';

const StatsCard = ({ role, data }) => {
  const isGuide = role === 'guide';

  if (isGuide) {
    return (
      <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
        <div className="text-center p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/30">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tours Led</span>
          <span className="block text-xl md:text-2xl font-black text-trek-primary mt-1">{data.totalToursLed || 0}</span>
        </div>
        <div className="text-center p-3 rounded-2xl bg-amber-50/50 border border-amber-100/30">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</span>
          <span className="block text-xl md:text-2xl font-black text-trek-secondary mt-1">{data.experienceYears || 0} yrs</span>
        </div>
        <div className="text-center p-3 rounded-2xl bg-blue-50/50 border border-blue-100/30">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-xl md:text-2xl font-black text-slate-800">{data.avgRating ? Number(data.avgRating).toFixed(1) : '0.0'}</span>
            <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">({data.totalReviews || 0} reviews)</span>
        </div>
      </div>
    );
  }

  // Customer stats
  const getFitnessBadgeColor = (level) => {
    switch (level?.toString().toUpperCase()) {
      case 'ADVANCED':
      case 'EXPERT':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'INTERMEDIATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
      <div className="text-center p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/30">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tours Joined</span>
        <span className="block text-2xl md:text-3xl font-black text-trek-primary mt-1">{data.totalToursJoined || 0}</span>
      </div>
      <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center items-center">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Fitness Level</span>
        <span className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getFitnessBadgeColor(data.fitnessLevel)}`}>
          <Activity className="w-3.5 h-3.5" />
          {data.fitnessLevel || 'BEGINNER'}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;
