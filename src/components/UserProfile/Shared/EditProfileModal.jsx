import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Save, User } from 'lucide-react';
import { updateCustomerProfile, updateGuideProfile } from '../../../Services/userProfileApi';
import CustomerProfileForm from './components/CustomerProfileForm';
import GuideProfileForm from './components/GuideProfileForm';

const EditProfileModal = ({ isOpen, onClose, role, profileData, userId, onSaveSuccess, addLog }) => {
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

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
        emergencyContactAddress: profileData.emergencyContact?.address || '',
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
        isAvailable: profileData.isAvailable !== undefined ? profileData.isAvailable : true,
      });
    }
  }, [profileData, isOpen, role]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (addLog) addLog('Saving updated profile to backend database...');
    try {
      if (role === 'customer') {
        await updateCustomerProfile(userId, {
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
            address: editFormData.emergencyContactAddress,
          },
        });
        if (addLog) addLog('Successfully updated Customer Profile!');
      } else {
        await updateGuideProfile(userId, {
          displayName: editFormData.displayName,
          phone: editFormData.phone || null,
          avatarUrl: editFormData.avatarUrl || null,
          bio: editFormData.bio || null,
          homeProvince: editFormData.homeProvince || null,
          experienceYears: parseInt(editFormData.experienceYears) || 0,
          languages: editFormData.languages
            ? editFormData.languages.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          specializations: editFormData.specializations
            ? editFormData.specializations.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          idCardNumber: editFormData.idCardNumber || null,
          isAvailable: editFormData.isAvailable,
        });
        if (addLog) addLog('Successfully updated Guide Profile!');
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      if (addLog) addLog(`Failed to update profile: ${err.message}`);
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[85vh] overflow-y-auto font-sans flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 rounded-t-3xl">
          <h3 className="font-extrabold text-trek-neutral font-montserrat text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-trek-primary" />
            Edit Profile ({role === 'customer' ? 'Customer' : 'Guide'})
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-600">
          {role === 'customer' ? (
            <CustomerProfileForm formData={editFormData} onChange={setEditFormData} />
          ) : (
            <GuideProfileForm formData={editFormData} onChange={setEditFormData} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-3 rounded-b-3xl">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all duration-200">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-trek-primary hover:bg-trek-primary/95 text-white rounded-xl font-bold shadow-lg flex items-center gap-1.5 transition-all duration-200 active:scale-95 disabled:opacity-50">
            {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileModal;
