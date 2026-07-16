import React, { useState, useEffect } from 'react';
import {
  createDeparture,
  updateDeparture,
  getAvailableGuides
} from '../../services/tourManagementApi';

export default function SingleDepartureModal({
  isOpen,
  onClose,
  tourId,
  durationDays = 1,
  showToast,
  editingDeparture,
  onSaveSuccess
}) {
  const [form, setForm] = useState({
    departureDate: '',
    returnDate: '',
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

  const calculateReturnDate = (depDate) => {
    if (!depDate) return '';
    const date = new Date(depDate);
    date.setDate(date.getDate() + (durationDays || 1) - 1);
    return date.toISOString().split('T')[0];
  };

  // Populate data when editingDeparture changes or modal opens for creation
  useEffect(() => {
    if (!isOpen) return;

    if (editingDeparture) {
      const loadEditingData = async () => {
        setSaving(false);
        let currentAvailable = [];
        try {
          const res = await getAvailableGuides(
            editingDeparture.departureDate,
            editingDeparture.returnDate,
            editingDeparture.departureId
          );
          if (res.data && res.data.code === 200) {
            currentAvailable = res.data.data || [];
            setAvailableGuides(currentAvailable);
          }
        } catch (e) {
          console.error("Error loading guides during edit init:", e);
        }

        const preselectedIds = currentAvailable
          .filter(g => editingDeparture.guideNames && editingDeparture.guideNames.includes(g.displayName))
          .map(g => g.guideId);

        setForm({
          departureDate: editingDeparture.departureDate,
          returnDate: editingDeparture.returnDate || '',
          pricePerPerson: editingDeparture.pricePerPerson.toString(),
          maxGroupSize: editingDeparture.maxGroupSize,
          minGroupSize: editingDeparture.minGroupSize || 2,
          meetingPoint: editingDeparture.meetingPoint || '',
          allowJoinTour: editingDeparture.allowJoinTour ?? true,
          notes: editingDeparture.notes || '',
          guideIds: preselectedIds
        });
      };

      loadEditingData();
    } else {
      // Clear form for creation
      setForm({
        departureDate: '',
        returnDate: '',
        pricePerPerson: '',
        maxGroupSize: 10,
        minGroupSize: 2,
        meetingPoint: '',
        allowJoinTour: true,
        notes: '',
        guideIds: []
      });
      setAvailableGuides([]);
    }
  }, [isOpen, editingDeparture, tourId]);

  // Fetch available guides when dates change in creation mode
  useEffect(() => {
    if (!isOpen || editingDeparture) return; // Only run automatically for creation

    const depDate = form.departureDate;
    const retDate = form.returnDate || calculateReturnDate(depDate);

    if (depDate && retDate) {
      const fetchAvailableGuidesData = async () => {
        setLoadingGuides(true);
        try {
          const res = await getAvailableGuides(depDate, retDate);
          if (res.data && res.data.code === 200) {
            setAvailableGuides(res.data.data || []);
          } else {
            setAvailableGuides([]);
          }
        } catch (error) {
          console.error("Error fetching available guides:", error);
          showToast("Unable to load the list of available guides!", "danger");
        } finally {
          setLoadingGuides(false);
        }
      };
      fetchAvailableGuidesData();
    } else {
      setAvailableGuides([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, form.departureDate, form.returnDate, durationDays, editingDeparture]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.departureDate || !form.pricePerPerson || !form.maxGroupSize) {
      showToast("Please fill in all required fields!", "danger");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerPerson: parseFloat(form.pricePerPerson),
        maxGroupSize: parseInt(form.maxGroupSize),
        minGroupSize: parseInt(form.minGroupSize),
        returnDate: form.returnDate || null
      };

      if (editingDeparture) {
        await updateDeparture(tourId, editingDeparture.departureId, payload);
        showToast("Updated departure schedule successfully!");
      } else {
        await createDeparture(tourId, payload);
        showToast("Created departure schedule successfully!");
      }
      onSaveSuccess();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || (editingDeparture ? "Failed to update departure schedule!" : "Failed to create departure schedule!");
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
          <h3 className="font-montserrat font-bold text-base">
            {editingDeparture ? 'Edit departure schedule' : 'Create a single departure schedule'}
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
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Departure Date *</label>
                <input
                  type="date"
                  required
                  value={form.departureDate}
                  onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d]"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Return Date</label>
                <input
                  type="date"
                  placeholder="Auto-calculate"
                  value={form.returnDate}
                  onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d]"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Leave empty to auto-calculate based on tour duration.</p>
              </div>
            </div>

            {/* Price & Limits */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Price / Person (VND) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 1500000"
                  value={form.pricePerPerson}
                  onChange={(e) => setForm({ ...form, pricePerPerson: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d]"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Max Group Size *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.maxGroupSize}
                  onChange={(e) => setForm({ ...form, maxGroupSize: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-gray-500 font-semibold uppercase tracking-wider mb-1">Min Group Size</label>
                <input
                  type="number"
                  min="1"
                  value={form.minGroupSize}
                  onChange={(e) => setForm({ ...form, minGroupSize: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d]"
                />
              </div>
              <div className="pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.allowJoinTour}
                    onChange={(e) => setForm({ ...form, allowJoinTour: e.target.checked })}
                    className="rounded border-gray-300 text-[#012d1d] focus:ring-[#012d1d]"
                  />
                  <span className="font-semibold text-gray-700">Allow join group</span>
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
                Tour Guide
              </label>
              {!form.departureDate ? (
                <div className="text-gray-400 italic bg-gray-50 border border-dashed rounded-lg p-3 text-center">
                  Please select departure date first
                </div>
              ) : loadingGuides ? (
                <div className="text-gray-500 text-center py-2 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-transparent border-[#012d1d] rounded-full animate-spin"></div>
                  Searching for available tour guides...
                </div>
              ) : availableGuides.length === 0 ? (
                <div className="text-amber-600 bg-amber-50 rounded-lg p-3 text-center">
                  No tour guides available for this period
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
                placeholder="Special notes for this departure..."
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
              className="px-4 py-2 bg-[#012d1d] hover:bg-[#0c432d] text-white rounded-lg font-bold disabled:opacity-50"
            >
              {saving ? 'Saving...' : (editingDeparture ? 'Save Changes' : 'Create Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
