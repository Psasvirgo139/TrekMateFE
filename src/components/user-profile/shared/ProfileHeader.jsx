import React from 'react';
import { MapPin, Compass, ShieldCheck, CalendarDays, User } from 'lucide-react';

const ProfileHeader = ({ role, data, isOwnProfile, onAction }) => {
  const isGuide = role === 'guide';
  const name = isGuide ? data.displayName : data.fullName;
  const avatar = data.avatarUrl;

  const getCustomerBadge = (toursCount) => {
    if (toursCount > 10) return { label: 'Elite Explorer', color: 'bg-trek-secondary text-white' };
    if (toursCount > 5) return { label: 'Active Hiker', color: 'bg-trek-tertiary text-white' };
    return { label: 'Pathfinder', color: 'bg-slate-500 text-white' };
  };

  const customerBadge = !isGuide ? getCustomerBadge(data.totalToursJoined || 0) : null;

  return (
    <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {/* Cover Photo */}
      <div 
        className="h-48 md:h-64 w-full bg-cover bg-center relative"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-trek-primary/70 via-black/20 to-transparent" />
      </div>

      {/* Profile Header Info */}
      <div className="px-6 pb-6 pt-2 md:px-8 md:pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative">
        {/* Avatar & Name */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-16 md:-mt-24 z-10">
          <div className="relative group">
            <img 
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'} 
              alt={name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl object-cover"
            />
            {isGuide && data.isAvailable && (
              <span className="absolute bottom-2 right-2 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white"></span>
              </span>
            )}
          </div>

          <div className="text-center md:text-left pt-2 md:pt-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-trek-neutral font-montserrat tracking-tight flex items-center gap-1.5">
                {name}
              </h1>
              
              {/* Verification & Badges */}
              {isGuide && data.idCardVerified && (
                <span 
                  className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200"
                  title="Identity Card Verified"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Guide
                </span>
              )}

              {!isGuide && customerBadge && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${customerBadge.color}`}>
                  <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                  {customerBadge.label}
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-slate-500 mt-1 md:mt-2 flex items-center justify-center md:justify-start gap-1">
              <MapPin className="w-4 h-4 text-trek-tertiary" />
              {isGuide ? (data.homeProvince || 'Da Nang, Vietnam') : (data.nationality || 'Vietnam')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isGuide && (
          <div className="flex items-center justify-center gap-3 z-10 w-full md:w-auto">
            <button
              onClick={() => onAction && onAction('edit', data)}
              className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-white bg-trek-primary hover:bg-trek-primary/95 shadow-lg shadow-emerald-950/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
            >
              {isOwnProfile ? 'Edit Profile' : 'Book a Tour'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
