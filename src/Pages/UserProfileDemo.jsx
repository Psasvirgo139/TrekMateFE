import React, { useState, useEffect, useCallback } from 'react';
import UserProfile from '../Components/UserProfile';
import { ToggleLeft, ToggleRight, Shield, User, HelpCircle, RefreshCw } from 'lucide-react';
import { fetchCustomerProfile, fetchGuideProfile } from '../services/userProfileApi';
import { fetchUsers } from '../services/adminUserApi';
import EditProfileModal from '../Components/UserProfile/Shared/EditProfileModal';

const UserProfileDemo = () => {
  const [role, setRole] = useState('customer'); // 'customer' or 'guide'
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [logs, setLogs] = useState([]);
  
  // API loading states
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit Modal states
  const [showEditModal, setShowEditModal] = useState(false);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${message}`, ...prev].slice(0, 5));
  };

  // 1. Fetch available users list from backend to populate dropdown
  const loadUsersList = useCallback(async () => {
    try {
      const data = await fetchUsers({ page: 0, size: 50 });
      if (data && data.content) {
        setUsersList(data.content);
        addLog(`Loaded ${data.content.length} users from backend.`);
      }
    } catch (err) {
      addLog(`Backend fetch users failed: ${err.message}.`);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadUsersList();
  }, [loadUsersList]);

  // 2. Automatically select appropriate user ID when switching roles
  useEffect(() => {
    if (usersList.length > 0) {
      const matched = usersList.find(u => {
        const hasRole = role === 'guide' 
          ? (u.guideTier || u.roles?.includes('GUIDE')) 
          : u.roles?.includes('CUSTOMER');
        return hasRole;
      });

      if (matched) {
        setSelectedUserId(matched.id);
        addLog(`Selected backend user: ${matched.displayName} for role: ${role}`);
      } else {
        setSelectedUserId('');
        addLog(`No backend user found with role ${role}.`);
      }
    }
  }, [role, usersList]);

  // 3. Fetch Full Profile detail from backend based on Selected User ID
  const fetchSelectedProfile = useCallback(async () => {
    if (!selectedUserId) {
      setProfileData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let data;
      if (role === 'customer') {
        data = await fetchCustomerProfile(selectedUserId);
        addLog(`Fetched Customer profile for UUID: ${selectedUserId}`);
      } else {
        data = await fetchGuideProfile(selectedUserId);
        addLog(`Fetched Guide profile for UUID: ${selectedUserId}`);
      }
      setProfileData(data);
    } catch (err) {
      addLog(`Failed to fetch backend profile: ${err.message}`);
      setProfileData(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, role]);

  useEffect(() => {
    fetchSelectedProfile();
  }, [fetchSelectedProfile]);

  const handleAction = (actionType, dataObj) => {
    if (actionType === 'book') {
      addLog(`SUCCESS: "Book Guide" clicked for guide: ${dataObj.displayName}. Initiating booking flow...`);
    } else if (actionType === 'edit') {
      setShowEditModal(true);
    } else if (actionType === 'settings') {
      addLog(`INFO: "Settings" button clicked. Redirecting to account preferences...`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-trek-neutral relative">
      {/* Interactive Admin Control Panel */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-trek-primary text-white rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm md:text-base font-montserrat">TrekMate Profile Inspector</h2>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Frontend Sandbox</p>
            </div>
          </div>

          {/* Interactive controls */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            {/* User Dropdown Selector */}
            {usersList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Source:</span>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="bg-slate-100 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl text-slate-700 outline-none focus:ring-1 focus:ring-trek-primary"
                >
                  <option value="">-- Select Backend User --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.displayName} ({u.roles?.join(', ') || 'USER'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Role Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setRole('customer')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  role === 'customer'
                    ? 'bg-white text-trek-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Customer
              </button>
              <button
                onClick={() => setRole('guide')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  role === 'guide'
                    ? 'bg-white text-trek-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Guide
              </button>
            </div>

            {/* Ownership Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-bold text-slate-500">Own Profile:</span>
              <button
                onClick={() => setIsOwnProfile(!isOwnProfile)}
                className="text-trek-primary hover:text-trek-primary/80 transition-colors"
              >
                {isOwnProfile ? (
                  <ToggleRight className="w-8 h-8 text-trek-primary" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </label>

            {/* Refresh button */}
            <button
              onClick={() => {
                loadUsersList();
                fetchSelectedProfile();
              }}
              className="p-2 text-slate-500 hover:text-trek-primary hover:bg-slate-100 rounded-xl transition-all duration-200"
              title="Refresh profiles"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Sandbox details */}
        <div className="bg-gradient-to-r from-trek-primary/5 to-trek-tertiary/5 rounded-3xl p-6 border border-trek-primary/10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <h3 className="font-extrabold text-trek-primary font-montserrat flex items-center gap-2 text-sm uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-trek-tertiary" />
              Dynamic Props & Backend API integration
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Active Role: <span className="text-trek-primary font-bold">{role.toUpperCase()}</span> | 
              Ownership state: <span className="text-trek-primary font-bold">{isOwnProfile ? 'OWNER VIEW' : 'PUBLIC VIEW'}</span> |
              Data source: <span className="text-emerald-700 font-bold">🟢 Spring Boot API Direct Fetch</span>
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-2 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100 flex items-center gap-1.5 animate-pulse">
                <span>Database Status: {error} (Profile might not exist or backend needs restart)</span>
              </p>
            )}
          </div>
          
          {/* Active Logs Console */}
          <div className="w-full lg:w-80 bg-slate-900 text-[11px] font-mono text-emerald-400 p-4 rounded-2xl shadow-inner border border-slate-800">
            <p className="text-slate-400 font-semibold border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
              <span>Sandbox Action Terminal</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </p>
            <div className="h-20 overflow-y-auto flex flex-col gap-1 select-none scrollbar-thin">
              {logs.length === 0 ? (
                <span className="text-slate-600 italic">No events triggered. Click buttons on profile cards...</span>
              ) : (
                logs.map((log, index) => (
                  <span key={index} className="truncate">{log}</span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Render Component */}
      {(loading || !profileData || error) ? (
        <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-trek-primary animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500">Loading user profile from the database..</p>
        </div>
      ) : (
        <UserProfile 
          role={role} 
          data={profileData} 
          isOwnProfile={isOwnProfile}
          onAction={handleAction}
          trips={[]} // Dynamically load from backend as needed
        />
      )}
      <EditProfileModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        role={role}
        profileData={profileData}
        userId={selectedUserId}
        onSaveSuccess={fetchSelectedProfile}
        addLog={addLog}
      />
    </div>
  );
};

export default UserProfileDemo;
