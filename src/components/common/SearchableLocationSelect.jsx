import React, { useState, useEffect, useRef } from 'react';
import { getLocations, createLocation } from '../../services/locationApi';
import { MapPin, Plus, Loader, Check } from 'lucide-react';

export default function SearchableLocationSelect({
  value = '',
  onChange,
  placeholder = 'Select location...',
  className = '',
  error = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const dropdownRef = useRef(null);

  // Sync with value prop changes
  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  // Fetch locations from backend when search input changes, with 300ms debounce
  useEffect(() => {
    if (!isOpen) return;

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getLocations(search);
        if (response?.data?.data) {
          setLocations(response.data.data);
        } else if (Array.isArray(response?.data)) {
          setLocations(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset search field to selected value if user exits without choosing
        setSearch(value || '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleSelect = (locationName) => {
    onChange(locationName);
    setSearch(locationName);
    setIsOpen(false);
  };

  const handleAddNew = async () => {
    if (!search || search.trim() === '') return;
    const nameToCreate = search.trim();
    setCreating(true);
    try {
      const response = await createLocation({ name: nameToCreate });
      // The API returns the location entity (201 Created or 200 OK if existing)
      const createdLoc = response?.data;
      const selectedName = createdLoc?.name || nameToCreate;
      handleSelect(selectedName);
    } catch (err) {
      console.error('Failed to create location:', err);
    } finally {
      setCreating(false);
    }
  };

  // Determine if search term is already in the options (exact match case-insensitive)
  const hasExactMatch = locations.some(
    (loc) => loc.name.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={search}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          className={`w-full pl-10 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-[#012d1d]'
          } ${className}`}
        />
        <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <MapPin size={16} />
        </div>
        {(loading || creating) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Loader size={16} className="animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto transform origin-top transition-all scale-100 opacity-100">
          <div className="p-1">
            {locations.length > 0 ? (
              locations.map((loc) => {
                const isSelected = loc.name.toLowerCase() === (value || '').toLowerCase();
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelect(loc.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-[#012d1d]/5 rounded-md transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{loc.name}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-[#012d1d]" />}
                  </button>
                );
              })
            ) : (
              !loading && (
                <div className="px-3 py-2.5 text-xs text-gray-500 italic text-center">
                  No location found
                </div>
              )
            )}

            {/* Quick Add Button */}
            {search.trim().length > 0 && !hasExactMatch && !creating && (
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#012d1d] font-bold hover:bg-[#012d1d]/5 rounded-md transition-all text-left"
                >
                  <Plus size={14} className="text-[#012d1d]" />
                  <span className="text-[#012d1d]">Add new location: "{search.trim()}"</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
