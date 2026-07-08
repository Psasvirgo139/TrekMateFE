import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calendar, User, Plus, Minus, Info, AlertCircle, Check, Shield, FileText, ChevronRight, HelpCircle } from "lucide-react";
import Header from "../../components/layout/Header";
import api from "../../services/api";

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

  useEffect(() => {
    const loadTourData = async () => {
      try {
        setStatus("loading");
        
        // Fetch Tour Details
        const tourRes = await api.get(`/tours/${idOrSlug}`);
        if (!tourRes || tourRes.status !== 200 || !tourRes.data) {
          throw new Error("Không tìm thấy dữ liệu tour.");
        }
        setTour(tourRes.data);

        // Fetch Departures
        const depRes = await api.get(`/tours/${idOrSlug}/departures`);
        const deps = depRes?.data?.data || [];
        
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
        const equipRes = await api.get("/v1/equipments");
        const equips = equipRes?.data?.data || [];
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
          copy[key] = "Họ và tên là bắt buộc";
        }
      }

      if (field === "dob") {
        const todayStr = new Date().toISOString().split("T")[0];
        if (!value) {
          copy[key] = "Ngày sinh là bắt buộc";
        } else if (value > todayStr) {
          copy[key] = "Ngày sinh không được ở tương lai";
        } else {
          delete copy[key];
        }
      }

      if (field === "phone") {
        const cleaned = value.replace(/\D/g, "");
        if (!cleaned) {
          copy[key] = "Số điện thoại là bắt buộc";
        } else if (cleaned.length !== 10) {
          copy[key] = "Số điện thoại phải có đúng 10 chữ số";
        } else {
          delete copy[key];
        }
      }

      if (field === "emergency_contact") {
        const cleaned = value.replace(/\D/g, "");
        if (!cleaned) {
          copy[key] = "Liên hệ khẩn cấp là bắt buộc";
        } else if (cleaned.length !== 10) {
          copy[key] = "Liên hệ khẩn cấp phải là số điện thoại 10 chữ số";
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
        return "Rất tiếc, đợt khởi hành này đã hết chỗ trống. Vui lòng chọn ngày khởi hành khác.";
      case 4024:
      case "EQUIPMENT_OUT_OF_STOCK":
        return "Một số trang thiết bị thuê kèm đã hết hàng trong kho. Vui lòng giảm số lượng thuê hoặc bỏ chọn.";
      case 4025:
      case "DEPARTURE_PAST_CUTOFF":
        return "Đợt khởi hành này đã quá hạn đăng ký hoặc đã xuất phát.";
      case 4001:
      case "UNAUTHORIZED":
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      case 4044:
      case "BOOKING_NOT_FOUND":
        return "Đơn đặt tour không tồn tại.";
      default:
        return backendMsg || "Đã xảy ra lỗi trong quá trình tạo booking. Vui lòng kiểm tra lại.";
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedDeparture) {
      alert("Vui lòng chọn ngày khởi hành!");
      return;
    }

    // Validate participants fields
    const todayStr = new Date().toISOString().split("T")[0];
    const newErrors = {};
    let hasError = false;

    for (let i = 0; i < participantsInfo.length; i++) {
      const p = participantsInfo[i];
      if (!p.name.trim()) {
        newErrors[`name-${i}`] = "Họ và tên là bắt buộc";
        hasError = true;
      }
      if (!p.dob) {
        newErrors[`dob-${i}`] = "Ngày sinh là bắt buộc";
        hasError = true;
      } else if (p.dob > todayStr) {
        newErrors[`dob-${i}`] = "Ngày sinh không được ở tương lai";
        hasError = true;
      }
      if (!p.phone.trim()) {
        newErrors[`phone-${i}`] = "Số điện thoại là bắt buộc";
        hasError = true;
      } else if (p.phone.trim().length !== 10 || !/^[0-9]+$/.test(p.phone.trim())) {
        newErrors[`phone-${i}`] = "Số điện thoại phải có đúng 10 chữ số";
        hasError = true;
      }
      if (!p.emergency_contact.trim()) {
        newErrors[`emergency_contact-${i}`] = "Liên hệ khẩn cấp là bắt buộc";
        hasError = true;
      } else if (p.emergency_contact.trim().length !== 10 || !/^[0-9]+$/.test(p.emergency_contact.trim())) {
        newErrors[`emergency_contact-${i}`] = "Liên hệ khẩn cấp phải có đúng 10 chữ số";
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
      const bookingRes = await api.post("/v1/bookings", bookingPayload);
      if (!bookingRes || bookingRes.status > 299 || !bookingRes.data) {
        throw new Error("Không nhận được phản hồi từ máy chủ khi tạo đơn đặt tour.");
      }

      const bookingData = bookingRes.data.data;
      const createdBookingId = bookingData.id;
      const createdTotalPrice = bookingData.totalPrice;

      // 2. Create PayOS Payment Url
      const paymentRes = await api.post("/v1/payments/payos/create", {
        bookingId: createdBookingId,
        amount: createdTotalPrice
      });

      if (!paymentRes || paymentRes.status !== 200 || !paymentRes.data?.data) {
        throw new Error("Tạo cổng thanh toán PayOS thất bại. Bạn có thể thanh toán lại từ lịch sử đặt tour.");
      }

      const paymentData = paymentRes.data.data;

      if (paymentData.checkoutUrl) {
        // Redirect to PayOS checkout page
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error("Không lấy được đường dẫn thanh toán từ cổng PayOS.");
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
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80";

  return (
    <div className="min-h-screen bg-[#fcfbf9] font-sans pb-16">
      <Header
        bgImage={coverImage}
        subheading="Đặt Chuyến Đi Cùng TrekMate"
        mainHeading={tour?.title || "Đặt Chuyến Đi"}
        description="Điền thông tin và thanh toán an toàn qua cổng PayOS VietQR."
        showDescription={Boolean(tour)}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Breadcrumbs */}
        <div className="mb-8">
          <Link
            to={`/tours/${idOrSlug}`}
            className="inline-flex items-center gap-2 font-bold text-[#012d1d] hover:text-[#fea619] transition-colors"
          >
            <span>←</span> Quay lại chi tiết tour
          </Link>
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#012d1d] mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải thông tin đặt tour...</p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-sm max-w-2xl mx-auto">
            <span className="text-5xl block mb-4">⚠️</span>
            <h3 className="text-rose-600 text-2xl font-bold mb-2">Không thể tải trang đặt tour</h3>
            <p className="text-gray-500 mb-6">{errorMsg}</p>
            <Link
              to="/locations"
              className="px-6 py-2.5 bg-[#012d1d] text-white hover:bg-[#fea619] hover:text-[#012d1d] font-bold rounded-full transition-colors shadow"
            >
              Về danh sách tour
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
                  <h2 className="font-montserrat font-bold text-xl text-gray-800 m-0">Bước 1: Chọn ngày khởi hành</h2>
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
                              {new Date(dep.departureDate).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                              isSelected ? "bg-[#012d1d] text-white" : "bg-gray-100 text-gray-600"
                            }`}>
                              Còn {dep.availableSlots} chỗ
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 mb-4 font-semibold">
                            Kết thúc: {new Date(dep.returnDate).toLocaleDateString("vi-VN")}
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase">Giá 1 khách</div>
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
                      Không có ngày khởi hành khả dụng sắp tới cho tour này. Vui lòng quay lại sau hoặc liên hệ bộ phận hỗ trợ của TrekMate để được tư vấn thêm.
                    </div>
                  </div>
                )}
              </section>

              {/* Step 2: Participants input */}
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                    <h2 className="font-montserrat font-bold text-xl text-gray-800 m-0">Bước 2: Thông tin hành khách</h2>
                  </div>

                  {/* Counter */}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200 self-start sm:self-auto">
                    <span className="text-xs font-bold text-gray-500 mr-2">Số lượng khách:</span>
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
                        Hành khách #{index + 1} {index === 0 && <span className="text-xs bg-[#fea619]/10 text-[#fea619] border border-[#fea619]/20 px-2 py-0.5 rounded font-extrabold">(Liên hệ chính)</span>}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Họ và tên *</label>
                          <input
                            type="text"
                            required
                            id={`name-${index}`}
                            placeholder="Ví dụ: Nguyễn Văn A"
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
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày sinh *</label>
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
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Số điện thoại *</label>
                          <input
                            type="tel"
                            required
                            id={`phone-${index}`}
                            maxLength={10}
                            placeholder="Nhập 10 chữ số (ví dụ: 0912345678)"
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
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Liên hệ khẩn cấp *</label>
                          <input
                            type="tel"
                            required
                            id={`emergency_contact-${index}`}
                            maxLength={10}
                            placeholder="Nhập 10 chữ số (ví dụ: 0987654321)"
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
                      <span className="text-sm font-bold text-gray-700 group-hover:text-[#012d1d] transition-colors">Tôi đồng ý ghép đoàn cùng các khách hàng khác</span>
                      <p className="text-xs text-gray-400 mt-0.5">Giúp bạn tiết kiệm chi phí và giao lưu cùng những người bạn đồng hành trekking mới.</p>
                    </div>
                  </label>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Yêu cầu đặc biệt (Ăn chay, dị ứng thực phẩm, y tế...)</label>
                    <textarea
                      placeholder="Ghi chú các yêu cầu đặc biệt của đoàn tại đây để TrekMate chuẩn bị chu đáo..."
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
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                  <h2 className="font-montserrat font-bold text-xl text-gray-800 m-0">Bước 3: Thuê trang thiết bị đi kèm (Tùy chọn)</h2>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  * Tiền thuê tính theo số ngày đi tour ({tourDurationDays} ngày). Số lượng tối đa có thể chọn bị giới hạn bởi số lượng còn lại trong kho.
                </p>

                <div className="flex flex-col divide-y divide-gray-100">
                  {equipments.map((eq) => {
                    const isSelected = Boolean(rentals[eq.id]);
                    const currentQty = rentals[eq.id] || 1;

                    return (
                      <div key={eq.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                        
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
                            <h4 className="font-bold text-[#012d1d] text-sm leading-snug">{eq.name}</h4>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{eq.description}</p>
                            <span className="inline-block text-[11px] text-[#fea619] font-bold mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(eq.pricePerDay)}/ngày
                            </span>
                            <span className="inline-block text-[11px] text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/50 ml-2">
                              Còn lại: {eq.availableStock} sản phẩm
                            </span>
                          </div>
                        </div>

                        {/* Qty Selector */}
                        {isSelected && (
                          <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200 self-end sm:self-auto shrink-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">SL:</span>
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
                            <span className="text-[10px] text-gray-400 block font-semibold">Tạm tính:</span>
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
                  Tóm tắt đơn hàng
                </h3>

                {/* Tour Info */}
                <div className="mb-6">
                  <h4 className="font-extrabold text-gray-800 text-sm mb-1">{tour.title}</h4>
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#fea619]" />
                    {selectedDeparture ? (
                      `${new Date(selectedDeparture.departureDate).toLocaleDateString("vi-VN")} (Khởi hành)`
                    ) : (
                      "Chưa chọn ngày khởi hành"
                    )}
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pb-6 border-b border-gray-100 text-xs md:text-sm">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-400">Giá tour x {numParticipants} khách</span>
                    <span className="font-bold text-gray-800">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(tourSubtotal)}</span>
                  </div>

                  {rentalSubtotal > 0 && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-gray-400">Thuê thiết bị leo núi</span>
                      <span className="font-bold text-gray-800">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(rentalSubtotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-400">Thời gian hành trình</span>
                    <span className="font-bold text-gray-800">{tour.durationDays} Ngày {tour.durationNights} Đêm</span>
                  </div>
                </div>

                {/* Total price */}
                <div className="my-6 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider mb-1">
                    Tổng chi phí thanh toán
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-800">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(totalPrice)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1">
                    Giá đã bao gồm dịch vụ HDV, hỗ trợ viên, ăn uống & các điểm trại.
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
                      Đang xử lý đặt chỗ...
                    </>
                  ) : (
                    "Xác nhận & Thanh toán ngay"
                  )}
                </button>

                {/* Payment guarantees */}
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Thanh toán bảo mật 100% qua cổng VietQR PayOS
                </div>
              </div>

              {/* Assistance support card */}
              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200/50 flex flex-col items-center text-center">
                <span className="text-2xl mb-2">📞</span>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Cần hỗ trợ đặt tour khẩn cấp?</h4>
                <p className="text-xs text-gray-500 mb-3">Hotline của chúng tôi hỗ trợ 24/7 đối với tất cả tuyến đường.</p>
                <a
                  href="tel:0901234567"
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-[#012d1d] hover:text-white hover:border-[#012d1d] rounded-full text-xs font-bold transition-all no-underline inline-block"
                >
                  Gọi 090 123 4567
                </a>
              </div>

            </div>
          </form>
        )}
      </main>
    </div>
  );
}
