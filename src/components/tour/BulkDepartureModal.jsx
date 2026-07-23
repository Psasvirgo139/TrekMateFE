import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import {
  generateBulkDepartures,
  getAvailableGuides
} from '../../services/tourManagementApi';

const DAYS_OF_WEEK = [
  { label: 'Monday', value: 'MONDAY' },
  { label: 'Tuesday', value: 'TUESDAY' },
  { label: 'Wednesday', value: 'WEDNESDAY' },
  { label: 'Thursday', value: 'THURSDAY' },
  { label: 'Friday', value: 'FRIDAY' },
  { label: 'Saturday', value: 'SATURDAY' },
  { label: 'Sunday', value: 'SUNDAY' }
];

export default function BulkDepartureModal({
  isOpen,
  onClose,
  tourId,
  showToast,
  onSaveSuccess
}) {
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    pricePerPerson: '',
    maxGroupSize: 10,
    minGroupSize: 2,
    meetingPoint: '',
    allowJoinTour: true,
    notes: '',
    guideIds: []
  });
  const [availableGuides, setAvailableGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setForm({
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        pricePerPerson: '',
        maxGroupSize: 10,
        minGroupSize: 2,
        meetingPoint: '',
        allowJoinTour: true,
        notes: '',
        guideIds: []
      });
      setAvailableGuides([]);
      setSaving(false);
      setErrors({});
    }
  }, [isOpen]);

  // Fetch available guides when dates change in bulk form
  useEffect(() => {
    if (!isOpen) return;

    const startDate = form.startDate;
    const endDate = form.endDate;

    if (startDate && endDate) {
      const fetchBulkAvailableGuides = async () => {
        setLoadingGuides(true);
        try {
          const res = await getAvailableGuides(startDate, endDate);
          if (res.data && res.data.code === 200) {
            setAvailableGuides(res.data.data || []);
          } else {
            setAvailableGuides([]);
          }
        } catch (error) {
          console.error("Error fetching bulk available guides:", error);
          showToast("Unable to load the list of available guides for the cycle!", "danger");
        } finally {
          setLoadingGuides(false);
        }
      };
      fetchBulkAvailableGuides();
    } else {
      setAvailableGuides([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, form.startDate, form.endDate]);

  const toggleDayOfWeek = (dayValue) => {
    const list = [...form.daysOfWeek];
    if (list.includes(dayValue)) {
      setForm({ ...form, daysOfWeek: list.filter(d => d !== dayValue) });
    } else {
      setForm({ ...form, daysOfWeek: [...list, dayValue] });
    }
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (field === 'minGroupSize' || field === 'maxGroupSize') {
      setErrors((prev) => ({ ...prev, minGroupSize: null, maxGroupSize: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!form.endDate) {
      newErrors.endDate = "End date is required";
    } else if (form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
      newErrors.endDate = "End date cannot be earlier than start date";
    }
    if (form.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = "Select at least 1 day of the week";
    }
    if (!form.pricePerPerson) {
      newErrors.pricePerPerson = "Price is required";
    } else if (parseFloat(form.pricePerPerson) < 0) {
      newErrors.pricePerPerson = "Price cannot be negative";
    }
    if (!form.maxGroupSize) {
      newErrors.maxGroupSize = "Maximum group size is required";
    } else if (parseInt(form.maxGroupSize) < 1) {
      newErrors.maxGroupSize = "Maximum group size must be at least 1";
    }
    if (form.minGroupSize && form.maxGroupSize && parseInt(form.minGroupSize) > parseInt(form.maxGroupSize)) {
      newErrors.minGroupSize = "Min group size cannot exceed max group size";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please fill in all required fields correctly!", "danger");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerPerson: parseFloat(form.pricePerPerson),
        maxGroupSize: parseInt(form.maxGroupSize),
        minGroupSize: parseInt(form.minGroupSize)
      };
      const res = await generateBulkDepartures(tourId, payload);
      const count = res.data?.data?.length || 0;
      showToast(`Successfully generated ${count} departure schedules automatically!`);
      onSaveSuccess();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Failed to generate departure schedules in bulk!";
      showToast(errMsg, "danger");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] my-8 animate-fade-in">
        <div className="flex items-center justify-between bg-[#012d1d] text-white py-4 px-6 rounded-t-xl">
          <h3 className="font-montserrat font-bold text-base flex items-center gap-1.5">
            <Clock size={18} /> Generate bulk recurring departure schedules
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-light focus:outline-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Start Date *</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                    errors.startDate 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">End Date *</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                    errors.endDate 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Days of Week Select */}
            <div>
              <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Select Recurring Days of Week *</label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const selected = form.daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        toggleDayOfWeek(day.value);
                        if (errors.daysOfWeek) {
                          setErrors((prev) => ({ ...prev, daysOfWeek: null }));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${selected
                          ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {day.label}
                    </button>
                  );
                 })}
              </div>
              {errors.daysOfWeek && (
                <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.daysOfWeek}</p>
              )}
            </div>

            {/* Price & Limits */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Price Per Person (VND) *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1500000"
                  value={form.pricePerPerson}
                  onChange={(e) => handleFieldChange('pricePerPerson', e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                    errors.pricePerPerson 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
                {errors.pricePerPerson && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.pricePerPerson}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Max Group Size *</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxGroupSize}
                  onChange={(e) => handleFieldChange('maxGroupSize', e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                    errors.maxGroupSize 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
                {errors.maxGroupSize && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.maxGroupSize}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Min Group Size</label>
                <input
                  type="number"
                  min="1"
                  value={form.minGroupSize}
                  onChange={(e) => handleFieldChange('minGroupSize', e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                    errors.minGroupSize 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-[#012d1d]'
                  }`}
                />
                {errors.minGroupSize && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.minGroupSize}</p>
                )}
              </div>
              <div className="pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.allowJoinTour}
                    onChange={(e) => setForm({ ...form, allowJoinTour: e.target.checked })}
                    className="rounded border-gray-300 text-[#012d1d] focus:ring-[#012d1d]"
                  />
                  <span className="font-semibold text-gray-700">Allow Joining Groups</span>
                </label>
              </div>
            </div>

            {/* Meeting Point */}
            <div>
              <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Meeting Point</label>
              <input
                type="text"
                placeholder="e.g. Sapa Station Gate, Lao Cai"
                value={form.meetingPoint}
                onChange={(e) => setForm({ ...form, meetingPoint: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d]"
              />
            </div>

            {/* Tour Guides Selection */}
            <div>
              <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">
                Tour Guides
              </label>
              {!form.startDate || !form.endDate ? (
                <div className="text-gray-400 italic bg-gray-50 border border-dashed rounded-lg p-3 text-center">
                  Please select the cycle date range first
                </div>
              ) : loadingGuides ? (
                <div className="text-gray-500 text-center py-2 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-transparent border-[#012d1d] rounded-full animate-spin"></div>
                  Finding available tour guides...
                </div>
              ) : availableGuides.length === 0 ? (
                <div className="text-amber-600 bg-amber-50 rounded-lg p-3 text-center">
                  No tour guides are available in this date range
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg max-h-32 overflow-y-auto p-2 bg-gray-50">
                  {availableGuides.map((guide) => {
                    const isChecked = form.guideIds.includes(guide.guideId);
                    return (
                      <label
                        key={guide.guideId}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-200 cursor-pointer transition-all duration-150"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setForm({
                                  ...form,
                                  guideIds: form.guideIds.filter(id => id !== guide.guideId)
                                });
                              } else {
                                setForm({
                                  ...form,
                                  guideIds: [...form.guideIds, guide.guideId]
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-[#012d1d] focus:ring-[#012d1d]"
                          />
                          <div>
                            <span className="font-semibold text-gray-800">{guide.displayName}</span>
                            {guide.experienceYears > 0 && (
                              <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                                {guide.experienceYears} years of experience
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-500 font-mono text-[10px]">{guide.phone || 'N/A'}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Notes</label>
              <textarea
                rows="2"
                placeholder="Notes apply to all departures generated..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4 border-t rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#fea619] hover:bg-[#d98b10] text-[#012d1d] rounded-lg font-bold disabled:opacity-50"
            >
              {saving ? 'Generating...' : 'Auto Generate Departures'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
