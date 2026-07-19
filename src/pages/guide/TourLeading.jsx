import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Compass,
  Check,
  X,
  RefreshCw,
  Info,
  Clock,
  History
} from 'lucide-react';
import {
  getGuideDepartures,
  getDepartureParticipants,
  startTour,
  updateAttendance,
  completeTour
} from '../../services/guideOperationApi';
import Header from '../../components/layout/Header';

export default function TourLeading() {
  const [departures, setDepartures] = useState([]);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState({}); // bookingId -> boolean (true: present, false: absent)
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const filteredDepartures = departures
    .filter(dep => {
      if (showHistory) {
        return dep.status === 'COMPLETED';
      } else {
        return dep.status !== 'COMPLETED' && dep.status !== 'CANCELLED';
      }
    })
    .sort((a, b) => {
      if (showHistory) {
        // Descending: future to past (newest first)
        return b.departureDate.localeCompare(a.departureDate);
      } else {
        // Ascending: past to future (oldest/earliest first)
        return a.departureDate.localeCompare(b.departureDate);
      }
    });

  const fetchDepartures = async () => {
    setLoading(true);
    try {
      const data = await getGuideDepartures();
      setDepartures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching departures:", error);
      showFeedback("Cannot load departures list", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();
  }, []);

  const selectDeparture = async (dep) => {
    setSelectedDeparture(dep);
    setLoading(true);
    try {
      const data = await getDepartureParticipants(dep.departureId);
      const participantList = Array.isArray(data) ? data : [];
      setParticipants(participantList);

      // Initialize attendance map based on current booking status
      const initialAttendance = {};
      participantList.forEach(p => {
        // If booking status is already ONGOING or COMPLETED, default to present.
        // If MISSING, default to absent.
        // Otherwise (CONFIRMED/PENDING), default to present.
        if (p.status === 'MISSING') {
          initialAttendance[p.bookingId] = false;
        } else {
          initialAttendance[p.bookingId] = true;
        }
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error("Error fetching participants:", error);
      showFeedback("Cannot load participants list", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = (bookingId) => {
    if (selectedDeparture.status === 'COMPLETED' || selectedDeparture.status === 'CANCELLED') {
      return; // Read-only
    }
    setAttendance(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const getAttendancePayload = () => {
    const presentBookingIds = [];
    const absentBookingIds = [];

    Object.keys(attendance).forEach(idKey => {
      const bId = Number(idKey);
      if (attendance[bId]) {
        presentBookingIds.push(bId);
      } else {
        absentBookingIds.push(bId);
      }
    });

    return { presentBookingIds, absentBookingIds };
  };

  const handleStartTour = async () => {
    setActionLoading(true);
    try {
      const payload = getAttendancePayload();
      await startTour(selectedDeparture.departureId, payload);
      showFeedback("Tour started and attendance logged successfully!", "success");

      // Refresh current departure data
      const updatedDep = { ...selectedDeparture, status: 'ONGOING' };
      setSelectedDeparture(updatedDep);
      selectDeparture(updatedDep);
    } catch (error) {
      console.error("Error starting tour:", error);
      showFeedback(error.response?.data?.message || "Failed to start the tour", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    setActionLoading(true);
    try {
      const payload = getAttendancePayload();
      await updateAttendance(selectedDeparture.departureId, payload);
      showFeedback("Attendance list updated successfully!", "success");
      selectDeparture(selectedDeparture);
    } catch (error) {
      console.error("Error updating attendance:", error);
      showFeedback(error.response?.data?.message || "Failed to save attendance changes", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTour = async () => {
    setActionLoading(true);
    try {
      await completeTour(selectedDeparture.departureId);
      showFeedback("Tour has been completed! All stats are updated.", "success");

      const updatedDep = { ...selectedDeparture, status: 'COMPLETED' };
      setSelectedDeparture(updatedDep);
      selectDeparture(updatedDep);
      fetchDepartures(); // Refresh parent list
    } catch (error) {
      console.error("Error completing tour:", error);
      showFeedback(error.response?.data?.message || "Failed to complete the tour", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const showFeedback = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">Completed</span>;
      case 'ONGOING':
        return <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full animate-pulse">Ongoing</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full">Cancelled</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">Scheduled</span>;
    }
  };

  // Helper to check if "Mark Tour as Completed" button should be active
  const isReturnDatePassedOrToday = () => {
    if (!selectedDeparture) return false;
    const today = new Date();
    const returnDate = new Date(selectedDeparture.returnDate);
    today.setHours(0, 0, 0, 0);
    returnDate.setHours(0, 0, 0, 0);
    return today >= returnDate;
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 flex flex-col font-sans pb-12">
      <Header hideHero={true} />
      <div className="h-[80px] bg-[#012d1d] w-full" />

      {/* Toast Feedback */}
      {message && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white font-medium transition-all duration-300 transform scale-100 flex items-center gap-2 ${message.type === 'danger' ? 'bg-red-500' : 'bg-[#012d1d]'
          }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <main className="max-w-6xl w-full mx-auto px-4 md:px-6 pt-6 flex-grow">
        {!selectedDeparture ? (
          <>
            {/* Header section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#012d1d] font-montserrat tracking-tight">
                  {showHistory ? "Tour History" : "Tour Leading & Attendance"}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {showHistory
                    ? "View your completed tour departures."
                    : "Manage your assigned departures, log guest attendance, and complete active tours."}
                </p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">
                <button
                  onClick={() => setShowHistory(prev => !prev)}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition duration-150 flex items-center gap-2 shadow-sm ${showHistory
                      ? 'bg-[#012d1d] text-white border-[#012d1d] hover:bg-[#023f29]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <History size={14} />
                  {showHistory ? "Active Tours" : "History"}
                </button>
                <button
                  onClick={fetchDepartures}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition duration-150 flex items-center gap-2 shadow-sm font-bold text-xs"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="w-10 h-10 border-4 border-t-transparent border-[#012d1d] rounded-full animate-spin mb-4"></div>
                <span className="font-semibold text-sm">Loading your departures...</span>
              </div>
            ) : filteredDepartures.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-md max-w-lg mx-auto mt-12">
                <div className="w-16 h-16 bg-slate-50 text-[#012d1d] flex items-center justify-center rounded-2xl mx-auto mb-4 border border-slate-100">
                  <Compass size={28} />
                </div>
                <h3 className="text-lg font-bold text-[#012d1d] font-montserrat">
                  {showHistory ? "No Completed Tours" : "No Active Tours"}
                </h3>
                <p className="text-slate-500 text-sm mt-2">
                  {showHistory
                    ? "You haven't completed any tours yet."
                    : "You do not have any active tour departures assigned to you currently."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDepartures.map((dep) => (
                  <div
                    key={dep.departureId}
                    className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                    onClick={() => selectDeparture(dep)}
                  >
                    <div className="p-6 flex-grow flex flex-col gap-4">
                      <div className="flex justify-between items-start gap-2">
                        {getStatusBadge(dep.status)}
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Users size={11} />
                          {dep.participantCount} guests
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-800 font-montserrat leading-snug group-hover:text-[#012d1d] transition-colors duration-150">
                        {dep.tourTitle}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-2.5 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-[#012d1d]" />
                          <span>Start: <b>{new Date(dep.departureDate).toLocaleDateString("vi-VN")}</b></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-[#012d1d]" />
                          <span>End: <b>{new Date(dep.returnDate).toLocaleDateString("vi-VN")}</b></span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50/50 group-hover:bg-[#012d1d] group-hover:text-white transition-all duration-300 py-3 text-center text-xs font-bold text-[#012d1d] border-t border-slate-100">
                      Manage Attendance & Tour →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Detail view header */}
            <div className="mb-6">
              <button
                onClick={() => { setSelectedDeparture(null); fetchDepartures(); }}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#012d1d] font-bold transition duration-150"
              >
                <ArrowLeft size={16} />
                Back to Departures List
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 md:p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {getStatusBadge(selectedDeparture.status)}
                    <span className="text-xs text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(selectedDeparture.departureDate).toLocaleDateString("vi-VN")} - {new Date(selectedDeparture.returnDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#012d1d] font-montserrat">
                    {selectedDeparture.tourTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {selectedDeparture.status === 'ONGOING' && (
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                      <Info size={14} />
                      Tour is currently in progress
                    </div>
                  )}
                  {selectedDeparture.status === 'COMPLETED' && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 size={14} />
                      Tour Completed Successfully
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <div className="w-8 h-8 border-3 border-t-transparent border-[#012d1d] rounded-full animate-spin mb-3"></div>
                  <span>Loading attendee checklist...</span>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                  No participants booked for this departure.
                </div>
              ) : (
                <>
                  {/* Summary Box */}
                  <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-6 items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Present</span>
                        <div className="text-xl font-extrabold text-slate-800">
                          {Object.values(attendance).filter(v => v).length} / {participants.length}
                        </div>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-200"></div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Absent</span>
                        <div className="text-xl font-extrabold text-slate-800">
                          {Object.values(attendance).filter(v => !v).length} / {participants.length}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 italic max-w-sm">
                      Check each customer as Present (Tham gia) or Absent (Vắng mặt) prior to starting the tour.
                    </div>
                  </div>

                  {/* Checklist Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-100 mb-8">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          <th className="p-4">Customer Name & Contact</th>
                          <th className="p-4 text-center">Party Size</th>
                          <th className="p-4">Booking Status</th>
                          <th className="p-4 text-right min-w-[120px]">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {participants.map((p) => {
                          const isPresent = attendance[p.bookingId] ?? true;
                          return (
                            <tr key={p.bookingId} className="hover:bg-slate-50/50 transition duration-150">
                              <td className="p-4">
                                <div className="font-bold text-slate-800 text-sm">{p.customerName}</div>
                                <div className="text-slate-400 mt-0.5 flex flex-wrap gap-2 items-center">
                                  <span>{p.email}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span>{p.phone || 'No phone'}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.2 rounded font-bold text-slate-500">{p.bookingCode}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center font-bold text-slate-700">{p.numParticipants}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                    p.status === 'ONGOING' ? 'bg-blue-100 text-blue-800' :
                                      p.status === 'MISSING' ? 'bg-rose-100 text-rose-800' :
                                        'bg-slate-100 text-slate-600'
                                  }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAttendance(p.bookingId)}
                                  disabled={selectedDeparture.status === 'COMPLETED' || selectedDeparture.status === 'CANCELLED'}
                                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 justify-center shadow-sm ml-auto border transition duration-150 ${isPresent
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                    }`}
                                >
                                  {isPresent ? (
                                    <>
                                      <Check size={14} />
                                      Present
                                    </>
                                  ) : (
                                    <>
                                      <X size={14} />
                                      Absent
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-500 max-w-lg text-center md:text-left">
                      {selectedDeparture.status === 'COMPLETED' ? (
                        <p className="text-emerald-800 font-bold">This departure has been completed and participant records are finalized.</p>
                      ) : selectedDeparture.status === 'ONGOING' ? (
                        <div>
                          <p className="font-bold text-slate-700">Tour is Ongoing.</p>
                          <p className="mt-1">
                            You can edit attendance checklists mid-tour. To complete the tour and credit participant stats, click <b>Mark Tour as Completed</b>.
                            <span className="text-rose-700 font-bold"> Note: This button is only enabled on or after the return date ({new Date(selectedDeparture.returnDate).toLocaleDateString("vi-VN")}).</span>
                          </p>
                        </div>
                      ) : (
                        <p>Attendance checklists must be saved by clicking <b>Start Tour & Log Attendance</b> to mark the tour as active.</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {/* 1. Start Tour Button */}
                      {(selectedDeparture.status === 'SCHEDULED' || selectedDeparture.status === 'OPEN' || selectedDeparture.status === 'FULL') && (
                        <button
                          onClick={handleStartTour}
                          disabled={actionLoading}
                          className="bg-[#012d1d] hover:bg-[#023f29] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition duration-150 flex items-center gap-2"
                        >
                          {actionLoading && <RefreshCw size={15} className="animate-spin" />}
                          Start Tour & Log Attendance
                        </button>
                      )}

                      {/* 2. Save Attendance Changes Button (ONGOING only) */}
                      {selectedDeparture.status === 'ONGOING' && (
                        <>
                          <button
                            onClick={handleSaveAttendance}
                            disabled={actionLoading}
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition duration-150 flex items-center gap-2"
                          >
                            {actionLoading && <RefreshCw size={15} className="animate-spin" />}
                            Save Attendance Changes
                          </button>

                          <button
                            onClick={handleCompleteTour}
                            disabled={actionLoading || !isReturnDatePassedOrToday()}
                            title={!isReturnDatePassedOrToday() ? "Disabled until the return date" : ""}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition duration-150 flex items-center gap-2 ${isReturnDatePassedOrToday()
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              }`}
                          >
                            {actionLoading && <RefreshCw size={15} className="animate-spin" />}
                            Mark Tour as Completed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
