import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useHasRole } from '../context/AuthContext';
import Header from '../components/layout/Header';
import UserProfile from '../components/user-profile/UserProfile';
import EditProfileModal from '../components/user-profile/shared/EditProfileModal';
import { fetchCustomerProfile, fetchGuideProfile } from '../services/userProfileApi';
import { fetchMyBookings } from '../services/bookingApi';
import { RefreshCw } from 'lucide-react';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isGuide = useHasRole('GUIDE');
  const isAdmin = useHasRole('ADMIN');
  const role = isGuide ? 'guide' : 'customer';

  const [profileData, setProfileData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Redirect if not authenticated or if Admin (Admin doesn't have a profile)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?tab=login', { replace: true });
      } else if (isAdmin) {
        navigate('/', { replace: true });
      }
    }
  }, [authLoading, user, isAdmin, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user || isAdmin) return;

    setLoading(true);
    setError(null);
    try {
      let data;
      if (role === 'customer') {
        data = await fetchCustomerProfile(user.id);
        
        // Load bookings/trips for customer
        try {
          const bookingsRes = await fetchMyBookings({ page: 0, size: 50 });
          if (bookingsRes && bookingsRes.content) {
            const sortedBookings = [...bookingsRes.content].sort((a, b) => new Date(b.departureDate) - new Date(a.departureDate));
            const mappedTrips = sortedBookings.map(b => ({
              id: b.id,
              date: new Date(b.departureDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' }),
              title: b.tourTitle,
              difficulty: b.difficulty || 'Moderate',
              status: b.status === 'COMPLETED' ? 'completed' : 
                      (b.status === 'CANCELLED' ? 'cancelled' : 
                      (b.status === 'MISSING' ? 'missing' : 
                      (b.status === 'MISSED' ? 'missed' : 
                      (b.status === 'ONGOING' ? 'ongoing' : 'upcoming'))))
            }));
            setTrips(mappedTrips);
          }
        } catch (bookingErr) {
          console.warn("Failed to fetch bookings for profile:", bookingErr);
        }
      } else {
        data = await fetchGuideProfile(user.id);
      }
      setProfileData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, role]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAction = (actionType) => {
    if (actionType === 'edit') {
      setShowEditModal(true);
    }
  };

  if (authLoading || (!user && !error)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#012d1d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    return null;
  }

  return (
    <div className="bg-[#f7f9f6] min-h-screen">
      <Header hideHero={true} />
      <div className="h-[80px] bg-[#012d1d] w-full" />

      <main className="max-w-6xl mx-auto py-8">
        {loading && !profileData ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
            <RefreshCw className="w-8 h-8 text-[#012d1d] animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-500">Đang tải thông tin cá nhân...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-2xl mx-auto my-12">
            <span className="text-3xl">⚠️</span>
            <h4 className="font-bold text-red-700 mt-2 mb-1">Lỗi tải hồ sơ</h4>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : (
          profileData && (
            <UserProfile
              role={role}
              data={profileData}
              isOwnProfile={true}
              onAction={handleAction}
              trips={trips}
            />
          )
        )}
      </main>

      {showEditModal && profileData && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          role={role}
          profileData={profileData}
          userId={user.id}
          onSaveSuccess={fetchProfile}
        />
      )}
    </div>
  );
};

export default Profile;
