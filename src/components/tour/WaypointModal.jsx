import React, { useState, useEffect } from 'react';

const WaypointModal = ({ show, onClose, onSave, waypoint = null, totalWaypoints = 0 }) => {
  const [formData, setFormData] = useState({
    name: '',
    sequenceOrder: 1,
    waypointType: 'CAMP_SITE',
    lat: '',
    lng: '',
    elevationM: '',
    description: '',
    hasToilet: false,
    hasShelter: false,
    hasPhoneSignal: false,
    hasFirstAid: false,
    waterSource: 'NONE',
    waterNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      if (waypoint) {
        setFormData({
          name: waypoint.name || '',
          sequenceOrder: waypoint.sequenceOrder || 1,
          waypointType: waypoint.waypointType || 'CAMP_SITE',
          lat: waypoint.lat !== null && waypoint.lat !== undefined ? waypoint.lat : '',
          lng: waypoint.lng !== null && waypoint.lng !== undefined ? waypoint.lng : '',
          elevationM: waypoint.elevationM !== null && waypoint.elevationM !== undefined ? waypoint.elevationM : '',
          description: waypoint.description || '',
          hasToilet: !!waypoint.hasToilet,
          hasShelter: !!waypoint.hasShelter,
          hasPhoneSignal: !!waypoint.hasPhoneSignal,
          hasFirstAid: !!waypoint.hasFirstAid,
          waterSource: waypoint.waterSource || 'NONE',
          waterNotes: waypoint.waterNotes || ''
        });
      } else {
        setFormData({
          name: '',
          sequenceOrder: totalWaypoints + 1,
          waypointType: 'CAMP_SITE',
          lat: '',
          lng: '',
          elevationM: '',
          description: '',
          hasToilet: false,
          hasShelter: false,
          hasPhoneSignal: false,
          hasFirstAid: false,
          waterSource: 'NONE',
          waterNotes: ''
        });
      }
      setErrors({});
      setSaving(false);
    }
  }, [show, waypoint, totalWaypoints]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Waypoint name is required";
    }
    if (formData.sequenceOrder === undefined || formData.sequenceOrder === null || formData.sequenceOrder === '') {
      newErrors.sequenceOrder = "Sequence order is required";
    } else if (parseInt(formData.sequenceOrder) < 1) {
      newErrors.sequenceOrder = "Sequence order must be at least 1";
    }
    if (formData.elevationM && parseInt(formData.elevationM) < 0) {
      newErrors.elevationM = "Elevation cannot be negative";
    }
    if (formData.lat && (parseFloat(formData.lat) < -90 || parseFloat(formData.lat) > 90)) {
      newErrors.lat = "Latitude must be between -90 and 90";
    }
    if (formData.lng && (parseFloat(formData.lng) < -180 || parseFloat(formData.lng) > 180)) {
      newErrors.lng = "Longitude must be between -180 and 180";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      sequenceOrder: parseInt(formData.sequenceOrder),
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lng: formData.lng ? parseFloat(formData.lng) : null,
      elevationM: formData.elevationM ? parseInt(formData.elevationM) : null
    };

    try {
      await onSave(payload);
    } catch (error) {
      console.error("Error saving waypoint:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] my-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#012d1d] text-white py-4 px-6 rounded-t-xl">
          <h3 className="font-montserrat font-bold text-lg">
            {waypoint ? 'Edit Waypoint' : 'Add Waypoint'}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-light leading-none focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Waypoint Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Waypoint Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g., Camp Site Black Stone"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                  errors.name 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#012d1d]'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{errors.name}</p>
              )}
            </div>

            {/* Sequence Order & Waypoint Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Sequence Order <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  min="1" 
                  value={formData.sequenceOrder}
                  onChange={(e) => handleFieldChange('sequenceOrder', e.target.value)}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                    errors.sequenceOrder 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
                {errors.sequenceOrder && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.sequenceOrder}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Waypoint Type
                </label>
                <select 
                  value={formData.waypointType}
                  onChange={(e) => setFormData({...formData, waypointType: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                >
                  <option value="TRAILHEAD">TRAILHEAD</option>
                  <option value="SUMMIT">SUMMIT</option>
                  <option value="CAMP_SITE">CAMP SITE</option>
                  <option value="VIEWPOINT">VIEWPOINT</option>
                  <option value="REST_STOP">REST STOP</option>
                  <option value="WATER_SOURCE">WATER SOURCE</option>
                  <option value="CHECKPOINT">CHECKPOINT</option>
                  <option value="VILLAGE">VILLAGE</option>
                  <option value="JUNCTION">JUNCTION</option>
                  <option value="EMERGENCY_POINT">EMERGENCY POINT</option>
                  <option value="RESUPPLY_POINT">RESUPPLY POINT</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Description / Activity Notes
              </label>
              <textarea 
                rows={3}
                placeholder="Provide a brief description about activities or safety here..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
              />
            </div>

            {/* Elevation, Latitude, Longitude */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Elevation (meters)
                </label>
                <input 
                  type="number" 
                  placeholder="e.g., 350"
                  value={formData.elevationM}
                  onChange={(e) => handleFieldChange('elevationM', e.target.value)}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                    errors.elevationM 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
                {errors.elevationM && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.elevationM}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Latitude
                </label>
                <input 
                  type="number" 
                  step="0.000001"
                  placeholder="e.g., 16.0245"
                  value={formData.lat}
                  onChange={(e) => handleFieldChange('lat', e.target.value)}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                    errors.lat 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
                {errors.lat && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.lat}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Longitude
                </label>
                <input 
                  type="number" 
                  step="0.000001"
                  placeholder="e.g., 108.0125"
                  value={formData.lng}
                  onChange={(e) => handleFieldChange('lng', e.target.value)}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                    errors.lng 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
                {errors.lng && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.lng}</p>
                )}
              </div>
            </div>

            {/* Water Source Info & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Water Source
                </label>
                <select 
                  value={formData.waterSource}
                  onChange={(e) => setFormData({...formData, waterSource: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                >
                  <option value="NONE">NONE</option>
                  <option value="STREAM">STREAM</option>
                  <option value="SPRING">SPRING</option>
                  <option value="RIVER">RIVER</option>
                  <option value="WATERFALL">WATERFALL</option>
                  <option value="WELL">WELL</option>
                  <option value="VILLAGE_TAP">VILLAGE TAP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Water Notes
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Small stream 100m from camp, boil before use..."
                  value={formData.waterNotes}
                  onChange={(e) => setFormData({...formData, waterNotes: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                />
              </div>
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Amenities & Safety Checklist
              </label>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                <label className="flex items-center space-x-2 text-sm text-gray-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.hasToilet}
                    onChange={(e) => setFormData({...formData, hasToilet: e.target.checked})}
                    className="w-4 h-4 text-[#012d1d] border-gray-300 rounded focus:ring-[#012d1d]"
                  />
                  <span>Toilet available</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.hasShelter}
                    onChange={(e) => setFormData({...formData, hasShelter: e.target.checked})}
                    className="w-4 h-4 text-[#012d1d] border-gray-300 rounded focus:ring-[#012d1d]"
                  />
                  <span>Rain shelter available</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.hasPhoneSignal}
                    onChange={(e) => setFormData({...formData, hasPhoneSignal: e.target.checked})}
                    className="w-4 h-4 text-[#012d1d] border-gray-300 rounded focus:ring-[#012d1d]"
                  />
                  <span>Mobile signal available</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.hasFirstAid}
                    onChange={(e) => setFormData({...formData, hasFirstAid: e.target.checked})}
                    className="w-4 h-4 text-[#012d1d] border-gray-300 rounded focus:ring-[#012d1d]"
                  />
                  <span>First aid kit available</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4 border-t rounded-b-xl">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={saving} 
              className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-5 py-2 text-sm font-bold text-white bg-[#012d1d] hover:bg-[#0c432d] rounded-lg transition-colors duration-150 shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WaypointModal;
