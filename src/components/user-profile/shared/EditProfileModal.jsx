import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Save, User } from 'lucide-react';
import { updateCustomerProfile, updateGuideProfile } from '../../../services/userProfileApi';
import { useToast } from '../../../context/ToastContext';

const EditProfileModal = ({ isOpen, onClose, role, profileData, userId, onSaveSuccess, addLog }) => {
  const { showToast } = useToast();
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Initialize form data when modal opens or profileData changes
  useEffect(() => {
    if (!profileData || !isOpen) return;

    if (role === 'customer') {
      setEditFormData({
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        avatarUrl: profileData.avatarUrl || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || 'Male',
        nationality: profileData.nationality || 'Vietnamese',
        homeAddress: profileData.homeAddress || '',
        fitnessLevel: profileData.fitnessLevel || 'BEGINNER',
        medicalNotes: profileData.medicalNotes || '',
        preferredLanguage: profileData.preferredLanguage || 'vi',
        emergencyContactName: profileData.emergencyContact?.name || '',
        emergencyContactPhone: profileData.emergencyContact?.phone || '',
        emergencyContactRelationship: profileData.emergencyContact?.relationship || '',
        emergencyContactAddress: profileData.emergencyContact?.address || ''
      });
    } else {
      setEditFormData({
        displayName: profileData.displayName || '',
        phone: profileData.phone || '',
        avatarUrl: profileData.avatarUrl || '',
        bio: profileData.bio || '',
        homeProvince: profileData.homeProvince || '',
        experienceYears: profileData.experienceYears || 0,
        languages: profileData.languages ? profileData.languages.join(', ') : '',
        specializations: profileData.specializations ? profileData.specializations.join(', ') : '',
        idCardNumber: profileData.idCardNumber || '',
        isAvailable: profileData.isAvailable !== undefined ? profileData.isAvailable : true
      });
    }
  }, [profileData, isOpen, role]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (addLog) addLog('Saving updated profile to backend database...');
    try {
      if (role === 'customer') {
        const payload = {
          fullName: editFormData.fullName,
          phone: editFormData.phone || null,
          avatarUrl: editFormData.avatarUrl || null,
          dateOfBirth: editFormData.dateOfBirth || null,
          gender: editFormData.gender,
          nationality: editFormData.nationality,
          homeAddress: editFormData.homeAddress || null,
          fitnessLevel: editFormData.fitnessLevel,
          medicalNotes: editFormData.medicalNotes || null,
          preferredLanguage: editFormData.preferredLanguage,
          emergencyContact: {
            name: editFormData.emergencyContactName,
            phone: editFormData.emergencyContactPhone,
            relationship: editFormData.emergencyContactRelationship,
            address: editFormData.emergencyContactAddress
          }
        };
        await updateCustomerProfile(userId, payload);
        if (addLog) addLog(`Successfully updated Customer Profile!`);
      } else {
        const payload = {
          displayName: editFormData.displayName,
          phone: editFormData.phone || null,
          avatarUrl: editFormData.avatarUrl || null,
          bio: editFormData.bio || null,
          homeProvince: editFormData.homeProvince || null,
          experienceYears: parseInt(editFormData.experienceYears) || 0,
          languages: editFormData.languages 
            ? editFormData.languages.split(',').map(s => s.trim()).filter(Boolean) 
            : [],
          specializations: editFormData.specializations 
            ? editFormData.specializations.split(',').map(s => s.trim()).filter(Boolean) 
            : [],
          idCardNumber: editFormData.idCardNumber || null,
          isAvailable: editFormData.isAvailable
        };
        await updateGuideProfile(userId, payload);
        if (addLog) addLog(`Successfully updated Guide Profile!`);
      }
      showToast('Profile updated successfully!', 'success');
      onSaveSuccess();
      onClose();
    } catch (err) {
      if (addLog) addLog(`Failed to update profile: ${err.message}`);
      showToast(`Error updating profile: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <form 
        onSubmit={handleSaveProfile}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[85vh] overflow-y-auto font-sans flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 rounded-t-3xl">
          <h3 className="font-extrabold text-trek-neutral font-montserrat text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-trek-primary" />
            Edit Profile ({role === 'customer' ? 'Customer' : 'Guide'})
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-600">
          {role === 'customer' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name (Required)</label>
                  <input 
                    type="text" 
                    required
                    value={editFormData.fullName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Avatar URL</label>
                  <input 
                    type="text" 
                    value={editFormData.avatarUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input 
                    type="date" 
                    value={editFormData.dateOfBirth || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    value={editFormData.gender || 'Male'}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nationality</label>
                  <input 
                    type="text" 
                    value={editFormData.nationality || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nationality: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Preferred Language</label>
                  <select 
                    value={editFormData.preferredLanguage || 'vi'}
                    onChange={(e) => setEditFormData({ ...editFormData, preferredLanguage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  >
                    <option value="vi">Vietnamese (vi)</option>
                    <option value="en">English (en)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fitness Level</label>
                  <select 
                    value={editFormData.fitnessLevel || 'BEGINNER'}
                    onChange={(e) => setEditFormData({ ...editFormData, fitnessLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                    <option value="EXPERT">EXPERT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Home Address</label>
                <input 
                  type="text" 
                  value={editFormData.homeAddress || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, homeAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Medical Notes</label>
                <textarea 
                  rows={2}
                  value={editFormData.medicalNotes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, medicalNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  placeholder="e.g. Asthma, allergies, health conditions..."
                />
              </div>

              {/* Emergency Contact Sub-section */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-extrabold text-trek-primary text-xs uppercase tracking-wider mb-3">Emergency Contact (Khẩn Cấp)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Name</label>
                    <input 
                      type="text" 
                      value={editFormData.emergencyContactName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, emergencyContactName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      value={editFormData.emergencyContactPhone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Relationship (Mối Quan Hệ)</label>
                    <input 
                      type="text" 
                      value={editFormData.emergencyContactRelationship || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, emergencyContactRelationship: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                    <input 
                      type="text" 
                      value={editFormData.emergencyContactAddress || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, emergencyContactAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Display Name (Required)</label>
                  <input 
                    type="text" 
                    required
                    value={editFormData.displayName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Avatar URL</label>
                  <input 
                    type="text" 
                    value={editFormData.avatarUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Home Province</label>
                  <input 
                    type="text" 
                    value={editFormData.homeProvince || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, homeProvince: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Experience Years</label>
                  <input 
                    type="number" 
                    value={editFormData.experienceYears || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, experienceYears: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ID Card Number</label>
                  <input 
                    type="text" 
                    value={editFormData.idCardNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, idCardNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Is Available</label>
                  <select 
                    value={editFormData.isAvailable ? "true" : "false"}
                    onChange={(e) => setEditFormData({ ...editFormData, isAvailable: e.target.value === "true" })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Biography (Giới thiệu)</label>
                <textarea 
                  rows={3}
                  value={editFormData.bio || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                  placeholder="e.g. Certified guide with years of trekking experiences..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Languages (Ngoại Ngữ - Phân tách bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  value={editFormData.languages || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, languages: e.target.value })}
                  placeholder="e.g. Vietnamese, English, French"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Specializations (Chuyên môn - Phân tách bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  value={editFormData.specializations || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, specializations: e.target.value })}
                  placeholder="e.g. Mountain Trekking, Jungle Survival"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary"
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-trek-primary hover:bg-trek-primary/95 text-white rounded-xl font-bold shadow-lg flex items-center gap-1.5 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileModal;
