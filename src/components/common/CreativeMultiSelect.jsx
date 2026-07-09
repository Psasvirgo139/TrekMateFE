import React, { useState, useEffect, useRef } from 'react';
import { getTourAttributes, createTourAttribute } from '../../services/tourAttributeApi';
import { X, Plus, Loader, Check } from 'lucide-react';

export default function CreativeMultiSelect({
  type,
  value = [],
  onChange,
  placeholder = 'Add items...',
  error = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const dropdownRef = useRef(null);

  // Safe selected values list
  const selectedValues = Array.isArray(value) ? value : [];

  // Fetch suggestions with 300ms debounce when search or type changes
  useEffect(() => {
    if (!isOpen) return;

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getTourAttributes(type, search);
        if (response?.data?.data) {
          setSuggestions(response.data.data);
        } else if (Array.isArray(response?.data)) {
          setSuggestions(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, type, isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (itemContent) => {
    if (selectedValues.includes(itemContent)) {
      // Remove if already selected
      onChange(selectedValues.filter((v) => v !== itemContent));
    } else {
      // Add if not selected
      onChange([...selectedValues, itemContent]);
    }
    setSearch('');
  };

  const handleAddNew = async () => {
    if (!search || search.trim() === '') return;
    const contentToCreate = search.trim();
    
    // Check if already selected
    if (selectedValues.some(v => v.toLowerCase() === contentToCreate.toLowerCase())) {
      setSearch('');
      return;
    }

    setCreating(true);
    try {
      const response = await createTourAttribute({
        content: contentToCreate,
        type: type,
      });
      const createdItem = response?.data;
      const finalContent = createdItem?.content || contentToCreate;
      
      onChange([...selectedValues, finalContent]);
      setSearch('');
    } catch (err) {
      console.error('Failed to create tour attribute:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (search.trim().length > 0) {
        // If there's an exact match in suggestions, select it.
        const exactMatch = suggestions.find(
          (s) => s.content.toLowerCase() === search.trim().toLowerCase()
        );
        if (exactMatch) {
          handleSelect(exactMatch.content);
        } else {
          // Otherwise trigger add new
          handleAddNew();
        }
      }
    } else if (e.key === 'Backspace' && search === '' && selectedValues.length > 0) {
      // Remove last tag when Backspace is pressed in empty input
      onChange(selectedValues.slice(0, -1));
    }
  };

  const handleRemove = (itemContent) => {
    onChange(selectedValues.filter((v) => v !== itemContent));
  };

  // Check if search exists exactly in suggestions
  const hasExactMatch = suggestions.some(
    (s) => s.content.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Box containing selected tags and input */}
      <div
        className={`w-full min-h-[42px] px-3 py-1.5 border rounded-lg bg-white flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-[#012d1d]/20 transition-all cursor-text ${
          error
            ? 'border-red-500 focus-within:border-red-500'
            : 'border-gray-300 focus-within:border-[#012d1d]'
        }`}
        onClick={() => setIsOpen(true)}
      >
        {/* Chips */}
        {selectedValues.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-[#012d1d] bg-[#012d1d]/5 border border-[#012d1d]/10 rounded-full select-none"
          >
            <span>{val}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(val);
              }}
              className="text-[#012d1d]/50 hover:text-red-600 rounded-full p-0.5 hover:bg-red-50 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          type="text"
          value={search}
          placeholder={selectedValues.length === 0 ? placeholder : ''}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="flex-grow min-w-[80px] bg-transparent text-sm outline-none border-none py-0.5"
        />

        {/* Status indicator */}
        {(loading || creating) && (
          <div className="text-gray-400 self-center pr-1.5 flex items-center justify-center">
            <Loader size={14} className="animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto transform origin-top transition-all scale-100 opacity-100">
          <div className="p-1">
            {suggestions.length > 0 ? (
              suggestions.map((item) => {
                const isSelected = selectedValues.includes(item.content);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.content)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-[#012d1d]/5 rounded-md transition-all text-left"
                  >
                    <span className={isSelected ? 'font-semibold text-[#012d1d]' : ''}>
                      {item.content}
                    </span>
                    {isSelected && <Check size={14} className="text-[#012d1d]" />}
                  </button>
                );
              })
            ) : (
              !loading && (
                <div className="px-3 py-2 text-xs text-gray-400 italic text-center">
                  No suggestions available.
                </div>
              )
            )}

            {/* Quick Add Option */}
            {search.trim().length > 0 && !hasExactMatch && !creating && (
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#012d1d] font-bold hover:bg-[#012d1d]/5 rounded-md transition-all text-left"
                >
                  <Plus size={14} className="text-[#012d1d]" />
                  <span className="text-[#012d1d]">Add new: "{search.trim()}"</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
