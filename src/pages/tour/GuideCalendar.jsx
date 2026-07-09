import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGuideSchedules, getAvailableGuides } from '../../services/tourManagementApi';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Phone, Award, User, RefreshCw, ArrowLeft } from 'lucide-react';

export default function GuideCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default to July 2026 as per workspace data
  const [schedules, setSchedules] = useState([]);
  const [allGuides, setAllGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch schedules (occupied guides)
      const schedRes = await getGuideSchedules(firstDayStr, lastDayStr);
      let schedData = [];
      if (schedRes.data && schedRes.data.code === 200) {
        schedData = schedRes.data.data || [];
      }
      setSchedules(schedData);

      // 2. Fetch available guides (non-occupied guides)
      const availRes = await getAvailableGuides(firstDayStr, lastDayStr);
      let availData = [];
      if (availRes.data && availRes.data.code === 200) {
        availData = availRes.data.data || [];
      }

      // 3. Combine unique guides list
      const guideMap = new Map();
      
      // Add from schedules
      schedData.forEach(s => {
        if (!guideMap.has(s.guideId)) {
          guideMap.set(s.guideId, {
            guideId: s.guideId,
            displayName: s.guideName,
            phone: s.phone
          });
        }
      });

      // Add from available guides
      availData.forEach(g => {
        if (!guideMap.has(g.guideId)) {
          guideMap.set(g.guideId, {
            guideId: g.guideId,
            displayName: g.displayName,
            phone: g.phone
          });
        }
      });

      setAllGuides(Array.from(guideMap.values()));
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      showToast("Cannot load guide schedule!", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to determine if a guide has a tour on a specific day
  const getTourForDay = (guideId, day) => {
    const checkDate = new Date(year, month, day);
    // Format checkDate to local date string YYYY-MM-DD
    const checkStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return schedules.find(s => {
      if (s.guideId !== guideId) return false;
      return s.startDate <= checkStr && s.endDate >= checkStr;
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-xs">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-2.5 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${
          toast.type === 'danger' ? 'bg-red-600' : 'bg-[#012d1d]'
        }`}>
          {toast.message}
        </div>
      )}
      {/* Top Header & Navigation */}
      <div className="mb-4">
        <Link to="/" className="text-gray-500 hover:text-[#012d1d] font-semibold flex items-center gap-2 text-sm transition-all duration-150 transform hover:-translate-x-1 d-inline-flex">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider mb-1">
            <CalendarIcon size={14} className="text-[#012d1d]" />
            <span>Resource Allocation</span>
          </div>
          <h1 className="font-montserrat font-extrabold text-xl text-gray-900">
            Guide Schedule
          </h1>
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrevMonth} 
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="font-montserrat font-bold text-sm text-gray-800 min-w-[120px] text-center">
            {monthNames[month]} - {year}
          </span>

          <button 
            onClick={handleNextMonth} 
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <ChevronRight size={16} />
          </button>

          <button 
            onClick={fetchData} 
            disabled={loading}
            className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors ml-2"
            title="Làm mới"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Scheduler Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && allGuides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-8 h-8 border-4 border-t-transparent border-[#012d1d] rounded-full animate-spin mb-3"></div>
            <span>Loading guide schedule information...</span>
          </div>
        ) : allGuides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
            No guide information found in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Table Head: Day Numbers */}
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="sticky left-0 z-20 bg-gray-100 p-4 text-left font-montserrat font-bold text-gray-700 min-w-[200px] border-r border-gray-200">
                    Guide
                  </th>
                  {dayList.map(day => {
                    const dateObj = new Date(year, month, day);
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    const dayName = dateObj.getDay() === 0 ? 'Sun' : `T${dateObj.getDay() + 1}`;
                    return (
                      <th 
                        key={day} 
                        className={`p-2 text-center font-semibold text-[10px] min-w-[36px] border-r border-gray-200 ${
                          isWeekend ? 'bg-amber-50/75 text-amber-800' : 'text-gray-500'
                        }`}
                      >
                        <div>{dayName}</div>
                        <div className="text-xs font-bold mt-0.5">{day}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body: Scheduler Rows */}
              <tbody>
                {allGuides.map(guide => (
                  <tr key={guide.guideId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    {/* Sticky Guide Profile Cell */}
                    <td className="sticky left-0 z-10 bg-white p-3 border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {guide.displayName ? guide.displayName.charAt(0) : <User size={14} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-gray-900 truncate" title={guide.displayName}>
                            {guide.displayName}
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone size={10} className="text-[#012d1d]/70" />
                            {guide.phone || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {dayList.map(day => {
                      const assignment = getTourForDay(guide.guideId, day);
                      const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;
                      
                      if (assignment) {
                        // Check if this is the start day of the assignment block to render the block details
                        const assignStart = new Date(assignment.startDate).getDate();
                        const checkStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isStartCell = assignment.startDate === checkStr;

                        return (
                          <td 
                            key={day} 
                            className="p-1 border-r border-gray-200 align-middle relative bg-emerald-50/20"
                          >
                            <div 
                              className={`h-7 rounded flex items-center px-1.5 shadow-sm text-[9px] font-semibold overflow-hidden whitespace-nowrap cursor-default border transition-all ${
                                assignment.status === 'CANCELLED' 
                                  ? 'bg-red-50 border-red-200 text-red-700 line-through' 
                                  : 'bg-emerald-600 border-emerald-700 text-white'
                              }`}
                              title={`${assignment.tourTitle} (${assignment.startDate} - ${assignment.endDate})`}
                            >
                              {isStartCell && (
                                <span className="truncate w-full">
                                  🏕️ {assignment.tourTitle}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={day} 
                          className={`p-2 border-r border-gray-200 text-center ${
                            isWeekend ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-200 inline-block"></span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend & Instructions */}
      <div className="mt-6 bg-white p-5 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-gray-700">Status Legend:</span>
          
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-emerald-600 border border-emerald-700 inline-block shadow-sm"></span>
            <span className="text-gray-600 font-medium">Busy leading tour</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-gray-200 inline-block"></span>
            <span className="text-gray-600 font-medium">Day Off (Available)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-50 border border-amber-200 inline-block"></span>
            <span className="text-gray-600 font-medium">Weekend</span>
          </div>
        </div>
        
        <div className="text-gray-400 italic">
          💡 Hover over a busy tour cell to see the detailed travel date range.
        </div>
      </div>
    </div>
  );
}
