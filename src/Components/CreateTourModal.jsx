import React, { useState, useEffect } from 'react';

const CreateTourModal = ({ show, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'EASY',
    durationDays: 1,
    durationNights: 0,
    startLocation: '',
    endLocation: '',
    status: 'DRAFT'
  });

  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setFormData({
        title: '',
        difficulty: 'EASY',
        durationDays: 1,
        durationNights: 0,
        startLocation: '',
        endLocation: '',
        status: 'DRAFT'
      });
      setValidated(false);
      setSaving(false);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setValidated(true);
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error creating tour:", error);
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
            Create New Tour
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
            {/* Tour Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Tour Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g., Trekking Giang Troi Waterfall 2D1N"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
                  validated && !formData.title.trim() 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#012d1d]'
                }`}
              />
              {validated && !formData.title.trim() && (
                <p className="mt-1 text-xs text-red-500">Please specify a tour title.</p>
              )}
            </div>

            {/* Difficulty & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Difficulty Level
                </label>
                <select 
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                >
                  <option value="EASY">Easy</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HARD">Hard</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Initial Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                </select>
              </div>
            </div>

            {/* Duration Days & Nights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Duration Days <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  min="1" 
                  required
                  value={formData.durationDays}
                  onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value) || 1})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Duration Nights <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  min="0" 
                  required
                  value={formData.durationNights}
                  onChange={(e) => setFormData({...formData, durationNights: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                />
              </div>
            </div>

            {/* Start & End Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Start Location
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Da Nang City Center"
                  value={formData.startLocation}
                  onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  End Location
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Hoa Ninh, Hoa Vang"
                  value={formData.endLocation}
                  onChange={(e) => setFormData({...formData, endLocation: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                />
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
              {saving ? 'Saving...' : 'Create & Edit Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTourModal;
