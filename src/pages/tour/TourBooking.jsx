import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calendar, User, Plus, Minus, Info, AlertCircle, Check, Shield, FileText, ChevronRight, HelpCircle, Sparkles } from "lucide-react";
import Header from "../../components/layout/Header";
import { fetchAvailableEquipments } from "../../services/equipmentApi";
import { fetchPublicTourDetail, fetchDeparturesByTour } from "../../services/tourApi";
import { createBooking, fetchDepartureWeather, fetchAiGearRecommendation } from "../../services/bookingApi";
import { createPayOSPayment } from "../../services/paymentApi";
import WeatherForecast from "../../components/booking/WeatherForecast";

// Same destination images as TourCard & TourDetail
const TOUR_IMAGES = {
  "fansipan-summit":   "https://th.bing.com/th/id/R.61592cdb830787d2db63d89a47975093?rik=t7vTn9hWFnmKQg&riu=http%3a%2f%2fhanoitouristvietnam.com%2fsites%2fdefault%2ffiles%2f2025%2f01%2f1-cam-nang-du-lich-sapa_0.png&ehk=yKPmTZ5amKrvH%2b1fncZ4EUCJYXk7nhZ9jpCWvVHgMi8%3d&risl=&pid=ImgRaw&r=0",
  "ta-nang-phan-dung": "https://toongadventure.vn/wp-content/uploads/2023/03/Ta-nang-phan-dung-5.jpg",
  "ma-pi-leng-trek":   "https://tse4.mm.bing.net/th/id/OIP.dI0u5MdxoC__CM1XUSwm0AHaFL?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
};

const getEquipmentIcon = (iconName) => {
  switch (iconName) {
    case "tent": return "⛺";
    case "sleep": return "😴";
    case "stick": return "🦯";
    case "backpack": return "🎒";
    case "jacket": return "🧥";
    case "helmet": return "🪖";
    case "torch": return "🔦";
    default: return "🎒";
  }
};

export default function TourBooking() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [equipments, setEquipments] = useState([]);

  const [status, setStatus] = useState("loading");
  const [bookingStatus, setBookingStatus] = useState("idle"); // idle, submitting, error
  const [errorMsg, setErrorMsg] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Booking states
  const [numParticipants, setNumParticipants] = useState(1);
  const [isJoinTour, setIsJoinTour] = useState(true);
  const [specialRequests, setSpecialRequests] = useState("");
  const [participantsInfo, setParticipantsInfo] = useState([
    { name: "", dob: "", phone: "", emergency_contact: "" }
  ]);
  
  // Selected rental quantities: { [equipmentId]: quantity }
  const [rentals, setRentals] = useState({});

  // Weather forecast for selected departure
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // AI recommended equipment IDs to highlight
  const [aiHighlightedIds, setAiHighlightedIds] = useState(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRan, setAiRan] = useState(false);

  useEffect(() => {
    const loadTourData = async () => {
      try {
        setStatus("loading");
        
        // Fetch Tour Details
        const tourData = await fetchPublicTourDetail(idOrSlug);
        if (!tourData) throw new Error("Điều kiện tour không hợp lệ.");
        setTour(tourData);

        // Fetch Departures
        const deps = await fetchDeparturesByTour(idOrSlug);
        
        // Filter OPEN/SCHEDULED departures that have slots and aren't past cutoff date
        const now = new Date();
        const activeDeps = deps.filter(d => {
          const cutoff = new Date(d.cutoffDate);
          return (d.status === "OPEN" || d.status === "SCHEDULED") && 
                 d.availableSlots > 0 && 
                 cutoff > now;
        });

        setDepartures(activeDeps);
        
        if (activeDeps.length > 0) {
          setSelectedDeparture(activeDeps[0]);
        }

        // Fetch Equipments
        const equipRes = await fetchAvailableEquipments();
        const equips = equipRes?.content || [];
        setEquipments(equips);
        
        setStatus("success");
      } catch (err) {
        console.error("Lỗi khi tải thông tin trang đặt tour:", err);
        setErrorMsg(err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tải thông tin.");
        setStatus("error");
      }
    };

    loadTourData();
  }, [idOrSlug]);

  // Fetch weather whenever selectedDeparture changes
  useEffect(() => {
    if (!selectedDeparture?.departureId) {
      setWeatherForecast([]);
      return;
    }
    setWeatherLoading(true);
    fetchDepartureWeather(selectedDeparture.departureId)
      .then((res) => {
        // Axios interceptor tự động bóc tách trả về resData.data trực tiếp (là Array)
        // Nếu không đi qua interceptor, fallback lấy res.data.data hoặc res.data
        const forecast = Array.isArray(res) 
          ? res 
          : (res?.data?.data || res?.data || []);
        setWeatherForecast(forecast);
      })
      .catch(() => setWeatherForecast([]))
      .finally(() => setWeatherLoading(false));
  }, [selectedDeparture?.departureId]);

  // Auto-fetch AI recommendation once per departure (silent background)
  const fetchAiHighlights = useCallback(async (departureId) => {
    if (!departureId || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetchAiGearRecommendation(departureId);
      // Axios interceptor tự động bóc tách trả về resData.data trực tiếp (là Object gợi ý)
      const recommendation = (res && typeof res === 'object' && ('essentials' in res || 'recommended' in res))
        ? res
        : (res?.data?.data || res?.data || {});
      const ids = new Set();
      [...(recommendation?.essentials || []), ...(recommendation?.recommended || [])]
        .filter((item) => item.isAvailableForRent && item.equipmentId)
        .forEach((item) => ids.add(item.equipmentId));
      setAiHighlightedIds(ids);
      setAiRan(true);
    } catch {
      // Silently fail — AI highlight is non-critical
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading]);



  useEffect(() => {
    if (selectedDeparture?.departureId && !aiRan) {
      fetchAiHighlights(selectedDeparture.departureId);
    }
    // Reset AI highlights when departure changes
    setAiHighlightedIds(new Set());
    setAiRan(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeparture?.departureId]);

  // Adjust participant details list when count changes
  const handleParticipantsCountChange = (count) => {
    if (count < 1) return;
    setNumParticipants(count);
    
    setParticipantsInfo(prev => {
      const copy = [...prev];
      if (count > prev.length) {
        // Add new participant template
        for (let i = prev.length; i < count; i++) {
          copy.push({ name: "", dob: "", phone: "", emergency_contact: "" });
        }
      } else if (count < prev.length) {
        // Shrink
        return copy.slice(0, count);
      }
      return copy;
    });



    // Clean up formErrors for deleted indices
    setFormErrors(prev => {
      const nextErrors = { ...prev };
      Object.keys(nextErrors).forEach(key => {
        const parts = key.split("-");
        const idx = parseInt(parts[parts.length - 1]);
        if (idx >= count) {
          delete nextErrors[key];
        }
      });
      return nextErrors;
    });
  };

  const handleParticipantFieldChange = (index, field, value) => {
    setParticipantsInfo(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

    // Validate field dynamically to remove/hide error immediately when input is valid
    setFormErrors(prev => {
      const copy = { ...prev };
      const key = `${field}-${index}`;

      if (field === "name") {
        if (value.trim()) {
          delete copy[key];
        } else {
          copy[key] = "Full name is required";
        }
      }

      if (field === "dob") {
        const todayStr = new Date().toISOString().split("T")[0];
        if (!value) {
          copy[key] = "Birthdate is required";
        } else if (value > todayStr) {
          copy[key] = "Birthdate cannot be in the future";
        } else {
          delete copy[key];
        }
      }

      if (field === "phone") {
        const cleaned = value.replace(/\D/g, "");
        if (!cleaned) {
          copy[key] = "Phone number is required";
        } else if (cleaned.length !== 10) {
          copy[key] = "Phone number must be exactly 10 digits";
        } else {
          delete copy[key];
        }
      }

      if (field === "emergency_contact") {
        const cleaned = value.replace(/\D/g, "");
        if (!cleaned) {
          copy[key] = "Emergency contact is required";
        } else if (cleaned.length !== 10) {
          copy[key] = "Emergency contact must be a 10-digit phone number";
        } else {
          delete copy[key];
        }
      }

      return copy;
    });
  };

  const handleRentalToggle = (eqId) => {
    setRentals(prev => {
      const copy = { ...prev };
      if (copy[eqId]) {
        delete copy[eqId];
      } else {
        copy[eqId] = 1; // Default quantity 1
      }
      return copy;
    });
  };

  const handleRentalQtyChange = (eqId, qty, maxStock) => {
    if (qty < 1 || qty > maxStock) return;
    setRentals(prev => ({
      ...prev,
      [eqId]: qty
    }));
  };

  // Pricing calculations
  const tourDurationDays = tour?.durationDays || 1;
  const pricePerPerson = selectedDeparture?.pricePerPerson || 0;
  const tourSubtotal = numParticipants * pricePerPerson;
  
  const rentalSubtotal = Object.keys(rentals).reduce((sum, eqId) => {
    const eq = equipments.find(e => e.id === parseInt(eqId));
    if (!eq) return sum;
    const qty = rentals[eqId];
    return sum + (eq.pricePerDay * qty * tourDurationDays);
  }, 0);

  const totalPrice = tourSubtotal + rentalSubtotal;

  const mapErrorCodeToMessage = (code, backendMsg) => {
    switch (code) {
      case 4022:
      case "TOUR_FULLY_BOOKED":
        return "Sorry, this departure is fully booked. Please select another date.";
      case 4024:
      case "EQUIPMENT_OUT_OF_STOCK":
        return "Some rental equipment items are out of stock. Please reduce quantity or deselect them.";
      case 4025:
      case "DEPARTURE_PAST_CUTOFF":
        return "This departure has passed registration cutoff date or already started.";
      case 4001:
      case "UNAUTHORIZED":
        return "Session expired. Please log in again.";
      case 4044:
      case "BOOKING_NOT_FOUND":
        return "Booking not found.";
      default:
        return backendMsg || "An error occurred while creating booking. Please try again.";
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedDeparture) {
      alert("Please select a departure date!");
      return;
    }

    // Validate participants fields
    const todayStr = new Date().toISOString().split("T")[0];
    const newErrors = {};
    let hasError = false;

    for (let i = 0; i < participantsInfo.length; i++) {
      const p = participantsInfo[i];
      if (!p.name.trim()) {
        newErrors[`name-${i}`] = "Full name is required";
        hasError = true;
      }
      if (!p.dob) {
        newErrors[`dob-${i}`] = "Birthdate is required";
        hasError = true;
      } else if (p.dob > todayStr) {
        newErrors[`dob-${i}`] = "Birthdate cannot be in the future";
        hasError = true;
      }
      if (!p.phone.trim()) {
        newErrors[`phone-${i}`] = "Phone number is required";
        hasError = true;
      } else if (p.phone.trim().length !== 10 || !/^[0-9]+$/.test(p.phone.trim())) {
        newErrors[`phone-${i}`] = "Phone number must be exactly 10 digits";
        hasError = true;
      }
      if (!p.emergency_contact.trim()) {
        newErrors[`emergency_contact-${i}`] = "Emergency contact is required";
        hasError = true;
      } else if (p.emergency_contact.trim().length !== 10 || !/^[0-9]+$/.test(p.emergency_contact.trim())) {
        newErrors[`emergency_contact-${i}`] = "Emergency contact must be a 10-digit phone number";
        hasError = true;
      }
    }

    if (hasError) {
      setFormErrors(newErrors);
      // Scroll to the first error input
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    setBookingStatus("submitting");
    setErrorMsg("");

    try {
      // Build rentals array for request
      const rentalsPayload = Object.keys(rentals).map(eqId => ({
        equipmentId: parseInt(eqId),
        quantity: rentals[eqId]
      }));

      const bookingPayload = {
        departureId: selectedDeparture.departureId,
        numParticipants: numParticipants,
        isJoinTour: isJoinTour,
        specialRequests: specialRequests,
        participantsInfo: participantsInfo,
        rentals: rentalsPayload
      };

      // 1. Create Booking (PENDING)
      const bookingData = await createBooking(bookingPayload);
      if (!bookingData) {
        throw new Error("No response from server while creating booking.");
      }

      const createdBookingId = bookingData.id;
      const createdTotalPrice = bookingData.totalPrice;

      // 2. Create PayOS Payment Url
      const paymentData = await createPayOSPayment({
        bookingId: createdBookingId,
        amount: createdTotalPrice
      });

      if (!paymentData) {
        throw new Error("PayOS payment creation failed. You can retry payment from booking history.");
      }

      if (paymentData.checkoutUrl) {
        // Redirect to PayOS checkout page
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error("Failed to retrieve payment link from PayOS gateway.");
      }

    } catch (err) {
      console.error("Lỗi khi thực hiện đặt tour:", err);
      const errCode = err.response?.data?.code || err.response?.data?.message || "";
      const rawMsg = err.response?.data?.message || err.message || "";
      setErrorMsg(mapErrorCodeToMessage(errCode, rawMsg));
      setBookingStatus("error");
      
      // Auto redirect to login on 401/4001
      if (err.response?.status === 401 || errCode === 4001 || errCode === "UNAUTHORIZED") {
        navigate("/auth?tab=login");
      }
    }
  };

  const coverImage = tour?.images?.find(i => i.isCover)?.imageUrl ||
    TOUR_IMAGES[tour?.slug] ||
    TOUR_IMAGES["fansipan-summit"];

  return (
    <div className="min-h-screen bg-[#fcfbf9] font-sans pb-16">
      <Header
        bgImage={coverImage}
        subheading="Book Your Trek with TrekMate"
        mainHeading={tour?.title || "Book Your Trek"}
        description="Enter details and pay securely via PayOS VietQR."
        showDescription={Boolean(tour)}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Breadcrumbs */}
        <div className="mb-8">
          <Link
            to={`/tours/${idOrSlug}`}
            className="inline-flex items-center gap-2 font-bold text-[#012d1d] hover:text-[#fea619] transition-colors"
          >
            <span>←</span> Back to tour details
          </Link>
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#012d1d] mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading booking details...</p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-sm max-w-2xl mx-auto">
            <span className="text-5xl block mb-4">⚠️</span>
            <h3 className="text-rose-600 text-2xl font-bold mb-2">Unable to load booking page</h3>
            <p className="text-gray-500 mb-6">{errorMsg}</p>
            <Link
              to="/locations"
              className="px-6 py-2.5 bg-[#012d1d] text-white hover:bg-[#fea619] hover:text-[#012d1d] font-bold rounded-full transition-colors shadow"
            >
              Back to tours list
            </Link>
          </div>
        )}

        {/* Success / Loaded form layout */}
        {status === "success" && tour && (
          <form onSubmit={handleSubmitBooking} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content Column (Booking details) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Step 1: Selection departure dates */}
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                  <h2 className="font-montserrat font-bold text-xl text-gray-800 m-0">Step 1: Choose your departure date</h2>
                </div>

                {departures.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {departures.map((dep) => {
                      const isSelected = selectedDeparture?.departureId === dep.departureId;
                      return (
                        <div
                          key={dep.departureId}
                          type="button"
                          onClick={() => setSelectedDeparture(dep)}
                          className={`cursor-pointer rounded-2xl p-5 border text-left transition-all duration-300 ${
                            isSelected
                              ? "border-[#012d1d] bg-[#012d1d]/5 ring-2 ring-[#012d1d]"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#fea619]" />
                              {new Date(dep.departureDate).toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                              isSelected ? "bg-[#012d1d] text-white" : "bg-gray-100 text-gray-600"
                            }`}>
                              {dep.availableSlots} slots left
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 mb-4 font-semibold">
                            Ends: {new Date(dep.returnDate).toLocaleDateString("en-US")}
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase">Price per person</div>
                              <div className="font-extrabold text-[#012d1d] text-lg">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(dep.pricePerPerson)}
                              </div>
                            </div>
                            {isSelected && (
                              <span className="w-6 h-6 bg-[#012d1d] text-white rounded-full flex items-center justify-center text-xs">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50/50 border border-amber-200/50 rounded-2xl text-amber-800 text-sm font-semibold flex items-start gap-2.5">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      No upcoming departure dates available for this tour. Please check back later or contact TrekMate support.
                    </div>
                  </div>
                )}
              </section>

              {/* Weather forecast card — updates with selected departure */}
              {selectedDeparture && (
                <WeatherForecast
                  weatherForecast={weatherForecast}
                  departureDate={selectedDeparture?.departureDate}
                  returnDate={selectedDeparture?.returnDate}
                  loading={weatherLoading}
                />
              )}

              {/* Step 2: Participants input */}
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                    <h2 className="font-montserrat font-bold text-xl text-gray-800 m-0">Step 2: Traveler details</h2>
                  </div>

                  {/* Counter */}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200 self-start sm:self-auto">
                    <span className="text-xs font-bold text-gray-500 mr-2">Number of travelers:</span>
                    <button
                      type="button"
                      disabled={numParticipants <= 1}
                      onClick={() => handleParticipantsCountChange(numParticipants - 1)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-[#012d1d] text-base px-2">{numParticipants}</span>
                    <button
                      type="button"
                      disabled={selectedDeparture && numParticipants >= selectedDeparture.availableSlots}
                      onClick={() => handleParticipantsCountChange(numParticipants + 1)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form fields loop */}
                <div className="space-y-6">
                  {participantsInfo.map((participant, index) => (
                    <div key={index} className="bg-gray-50/75 p-5 sm:p-6 rounded-2xl border border-gray-100">
                      <h4 className="font-bold text-[#012d1d] text-sm mb-4 flex items-center gap-2">
                        <User className="w-4.5 h-4.5 text-[#fea619]" />
                        Traveler #{index + 1} {index === 0 && <span className="text-xs bg-[#fea619]/10 text-[#fea619] border border-[#fea619]/20 px-2 py-0.5 rounded font-extrabold">(Primary Contact)</span>}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full name *</label>
                          <input
                            type="text"
                            required
                            id={`name-${index}`}
                            placeholder="Example: John Doe"
                            value={participant.name}
                            onChange={(e) => handleParticipantFieldChange(index, "name", e.target.value)}
                            className={`p-3 bg-white border rounded-xl text-gray-800 text-sm focus:outline-none transition-all ${
                              formErrors[`name-${index}`]
                                ? "border-rose-500 focus:border-rose-500 animate-shake"
                                : "border-gray-200 focus:border-[#012d1d]"
                            }`}
                          />
                          {formErrors[`name-${index}`] && (
                            <span className="text-rose-500 text-xs mt-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {formErrors[`name-${index}`]}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date of birth *</label>
                          <input
                            type="date"
                            required
                            id={`dob-${index}`}
                            max={new Date().toISOString().split("T")[0]}
                            value={participant.dob}
                            onChange={(e) => handleParticipantFieldChange(index, "dob", e.target.value)}
                            className={`p-3 bg-white border rounded-xl text-gray-800 text-sm focus:outline-none transition-all ${
                              formErrors[`dob-${index}`]
                                ? "border-rose-500 focus:border-rose-500"
                                : "border-gray-200 focus:border-[#012d1d]"
                            }`}
                          />
                          {formErrors[`dob-${index}`] && (
                            <span className="text-rose-500 text-xs mt-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {formErrors[`dob-${index}`]}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone number *</label>
                          <input
                            type="tel"
                            required
                            id={`phone-${index}`}
                            maxLength={10}
                            placeholder="Enter 10 digits (e.g. 0912345678)"
                            value={participant.phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              handleParticipantFieldChange(index, "phone", value);
                            }}
                            className={`p-3 bg-white border rounded-xl text-gray-800 text-sm focus:outline-none transition-all ${
                              formErrors[`phone-${index}`]
                                ? "border-rose-500 focus:border-rose-500"
                                : "border-gray-200 focus:border-[#012d1d]"
                            }`}
                          />
                          {formErrors[`phone-${index}`] && (
                            <span className="text-rose-500 text-xs mt-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {formErrors[`phone-${index}`]}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emergency contact *</label>
                          <input
                            type="tel"
                            required
                            id={`emergency_contact-${index}`}
                            maxLength={10}
                            placeholder="Enter 10 digits (e.g. 0987654321)"
                            value={participant.emergency_contact}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              handleParticipantFieldChange(index, "emergency_contact", value);
                            }}
                            className={`p-3 bg-white border rounded-xl text-gray-800 text-sm focus:outline-none transition-all ${
                              formErrors[`emergency_contact-${index}`]
                                ? "border-rose-500 focus:border-rose-500"
                                : "border-gray-200 focus:border-[#012d1d]"
                            }`}
                          />
                          {formErrors[`emergency_contact-${index}`] && (
                            <span className="text-rose-500 text-xs mt-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {formErrors[`emergency_contact-${index}`]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional settings */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isJoinTour}
                      onChange={(e) => setIsJoinTour(e.target.checked)}
                      className="mt-1 w-4.5 h-4.5 accent-[#012d1d]"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-[#012d1d] transition-colors">I agree to join a group tour with other travelers</span>
                      <p className="text-xs text-gray-400 mt-0.5">Helps you save costs and connect with fellow trekkers.</p>
                    </div>
                  </label>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Special requests (Dietary, allergies, medical notes...)</label>
                    <textarea
                      placeholder="Enter special requests for your group here..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#012d1d] transition-all resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Step 3: Rental equipment selection */}
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                    <h2 className="font-montserrat font-bold text-xl text-gray-800 m-0">Step 3: Rent optional trekking equipment</h2>
                  </div>
                  {aiLoading && (
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" /> AI đang phân tích...
                    </span>
                  )}
                  {!aiLoading && aiHighlightedIds.size > 0 && (
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      <Sparkles className="w-3.5 h-3.5" /> AI gợi ý {aiHighlightedIds.size} món
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  * Rental price is calculated based on tour duration ({tourDurationDays} days). Max quantity is limited by remaining stock.
                </p>

                <div className="flex flex-col divide-y divide-gray-100">
                  {equipments.map((eq) => {
                    const isSelected = Boolean(rentals[eq.id]);
                    const currentQty = rentals[eq.id] || 1;
                    const isAiHighlighted = aiHighlightedIds.has(eq.id);

                    return (
                      <div
                        key={eq.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 rounded-xl px-2 transition-all ${
                          isAiHighlighted
                            ? "bg-emerald-50/60 border border-emerald-200/70 -mx-2 px-4"
                            : ""
                        }`}
                      >
                        {/* Checkbox and info */}
                        <div className="flex items-start gap-4 flex-grow min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRentalToggle(eq.id)}
                            className="mt-1 w-4.5 h-4.5 accent-[#012d1d] cursor-pointer"
                          />
                          <div className="text-2xl shrink-0">{getEquipmentIcon(eq.categoryIcon)}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-[#012d1d] text-sm leading-snug">{eq.name}</h4>
                              {isAiHighlighted && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                                  <Sparkles className="w-2.5 h-2.5" /> AI recommend
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{eq.description}</p>
                            <span className="inline-block text-[11px] text-[#fea619] font-bold mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(eq.pricePerDay)}/day
                            </span>
                            <span className="inline-block text-[11px] text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/50 ml-2">
                              Stock left: {eq.availableStock}
                            </span>
                          </div>
                        </div>

                        {/* Qty Selector */}
                        {isSelected && (
                          <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200 self-end sm:self-auto shrink-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Qty:</span>
                            <button
                              type="button"
                              disabled={currentQty <= 1}
                              onClick={() => handleRentalQtyChange(eq.id, currentQty - 1, eq.availableStock)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-600 disabled:opacity-50 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-extrabold text-[#012d1d] text-xs px-1.5">{currentQty}</span>
                            <button
                              type="button"
                              disabled={currentQty >= eq.availableStock}
                              onClick={() => handleRentalQtyChange(eq.id, currentQty + 1, eq.availableStock)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-600 disabled:opacity-50 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        
                        {/* Price calculate */}
                        {isSelected && (
                          <div className="text-right shrink-0 self-end sm:self-auto">
                            <span className="text-[10px] text-gray-400 block font-semibold">Subtotal:</span>
                            <span className="font-bold text-[#012d1d] text-sm">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(eq.pricePerDay * currentQty * tourDurationDays)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Sticky Sidebar Widget (4 columns) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              
              {/* Summary checkout detail */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                <h3 className="font-montserrat font-extrabold text-[#012d1d] text-base mb-4 uppercase tracking-wider pb-3 border-b border-gray-100">
                  Booking Summary
                </h3>

                {/* Tour Info */}
                <div className="mb-6">
                  <h4 className="font-extrabold text-gray-800 text-sm mb-1">{tour.title}</h4>
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#fea619]" />
                    {selectedDeparture ? (
                      `${new Date(selectedDeparture.departureDate).toLocaleDateString("en-US")} (Departure)`
                    ) : (
                      "No departure date selected"
                    )}
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pb-6 border-b border-gray-100 text-xs md:text-sm">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-400">Tour price x {numParticipants} travelers</span>
                    <span className="font-bold text-gray-800">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(tourSubtotal)}</span>
                  </div>

                  {rentalSubtotal > 0 && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-gray-400">Mountain equipment rental</span>
                      <span className="font-bold text-gray-800">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(rentalSubtotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-400">Tour duration</span>
                    <span className="font-bold text-gray-800">{tour.durationDays} Days {tour.durationNights} Nights</span>
                  </div>
                </div>

                {/* Total price */}
                <div className="my-6 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider mb-1">
                    Total payment
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-800">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(totalPrice)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1">
                    Includes guides, supporters, meals & campsite fees.
                  </span>
                </div>

                {/* Submit error */}
                {bookingStatus === "error" && errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 px-4 py-3 rounded-xl text-xs mb-6 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* Submit action */}
                <button
                  type="submit"
                  disabled={bookingStatus === "submitting" || !selectedDeparture}
                  className="w-full py-4 bg-[#fea619] hover:bg-[#ffb638] text-[#012d1d] font-extrabold text-xs rounded-2xl shadow-lg shadow-[#fea619]/25 hover:shadow-xl transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center"
                >
                  {bookingStatus === "submitting" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#012d1d]/30 border-t-[#012d1d] rounded-full animate-spin mr-2"></span>
                      Processing booking...
                    </>
                  ) : (
                    "Confirm & Pay Now"
                  )}
                </button>

                {/* Payment guarantees */}
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  100% secure payment via PayOS VietQR
                </div>
              </div>

              {/* Assistance support card */}
              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200/50 flex flex-col items-center text-center">
                <span className="text-2xl mb-2">📞</span>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Need urgent booking assistance?</h4>
                <p className="text-xs text-gray-500 mb-3">Our hotline is available 24/7 for all trekking routes.</p>
                <a
                  href="tel:0901234567"
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-[#012d1d] hover:text-white hover:border-[#012d1d] rounded-full text-xs font-bold transition-all no-underline inline-block"
                >
                  Call 090 123 4567
                </a>
              </div>

            </div>
          </form>
        )}
      </main>
    </div>
  );
}
