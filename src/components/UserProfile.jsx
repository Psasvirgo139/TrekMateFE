import React from 'react';
import { Languages, Compass, AlertCircle } from 'lucide-react';
import ProfileHeader from './UserProfile/Shared/ProfileHeader';
import StatsCard from './UserProfile/Shared/StatsCard';
import TagList from './UserProfile/Shared/TagList';
import PersonalInfoGrid from './UserProfile/Customer/PersonalInfoGrid';
import EmergencyContactSection from './UserProfile/Customer/EmergencyContactSection';
import MedicalNotesBox from './UserProfile/Customer/MedicalNotesBox';
import TripHistoryList from './UserProfile/Customer/TripHistoryList';
import BioCard from './UserProfile/Guide/BioCard';
import CertificateList from './UserProfile/Guide/CertificateList';

const UserProfile = ({ role = 'customer', data, isOwnProfile = true, onAction, trips = [] }) => {
  const isGuide = role === 'guide';

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl border border-slate-100 text-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-slate-400 animate-spin-slow mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Profile Data Not Found</h3>
        <p className="text-sm text-slate-500 mt-2">Please ensure the role and profile details are provided.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-8 font-sans px-4 py-8">
      <ProfileHeader 
        role={role} 
        data={data} 
        isOwnProfile={isOwnProfile} 
        onAction={onAction} 
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8">
          <StatsCard role={role} data={data} />
          {isGuide ? (
            <>
              <BioCard bio={data.bio} />
              <TagList 
                title="Languages" 
                items={data.languages} 
                icon={Languages} 
                colorTheme="tertiary" 
              />
            </>
          ) : (
            <>
              <PersonalInfoGrid data={data} />
              <EmergencyContactSection 
                contact={data.emergencyContact} 
                isOwnProfile={isOwnProfile} 
              />
            </>
          )}
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
          {isGuide ? (
            <>
              <TagList 
                title="Specializations & Skills" 
                items={data.specializations} 
                icon={Compass} 
                colorTheme="secondary" 
              />
              <CertificateList certifications={data.certifications} />
            </>
          ) : (
            <>
              <MedicalNotesBox notes={data.medicalNotes} />
              <TripHistoryList trips={trips} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
