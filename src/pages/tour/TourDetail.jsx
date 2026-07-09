import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import api from "../../services/api";
import RatingStars from "../../components/common/RatingStars";
import ReviewSection from "../../components/review/ReviewSection";
import * as bookingApi from "../../services/bookingApi";
import { useAuth } from "../../context/AuthContext";

const TourDetail = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [tour, setTour] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  // Booking widget states
  const [departures, setDepartures] = useState([]);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [numParticipants, setNumParticipants] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadTour = async () => {
      try {
        setStatus("loading");
        setError("");
        const response = await api.get(`/tours/${idOrSlug}`, {
          signal: controller.signal,
        });
        
        if (response && response.status === 200 && response.data) {
          setTour(response.data);
          setStatus("success");
        } else {
          throw new Error("Không tìm thấy dữ liệu chi tiết cho tour này.");
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError" || err.message === "canceled") return;
        console.error("Lỗi khi tải chi tiết tour:", err);
        setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tải tour.");
        setStatus("error");
      }
    };

    loadTour();
    return () => controller.abort();
  }, [idOrSlug]);

  // Load departures when tour is loaded
  useEffect(() => {
    if (!idOrSlug) return;
    const loadDepartures = async () => {
      try {
        const res = await bookingApi.fetchDeparturesByTour(idOrSlug);
        const list = Array.isArray(res) ? res : (res?.data || []);
        setDepartures(list);
        if (list.length > 0) setSelectedDeparture(list[0]);
      } catch (err) {
        console.warn("Không thể tải đợt khởi hành:", err);
      }
    };
    loadDepartures();
  }, [idOrSlug]);

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      navigate("/auth?tab=login");
      return;
    }
    if (!selectedDeparture) {
      setBookingError("Vui lòng chọn đợt khởi hành.");
      return;
    }
    if (numParticipants < 1 || numParticipants > (selectedDeparture.availableSlots || 1)) {
      setBookingError(`Số người tham gia phải từ 1 đến ${selectedDeparture.availableSlots}.`);
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      // Build participants info — minimum required field: fullName
      const participantsInfo = Array.from({ length: numParticipants }, (_, i) => ({
        fullName: i === 0 && user?.fullName ? user.fullName : `Thành viên ${i + 1}`,
        isLeader: i === 0,
      }));

      const res = await bookingApi.createBooking({
        departureId: selectedDeparture.id,
        numParticipants: numParticipants,
        isJoinTour: selectedDeparture.allowJoinTour || false,
        participantsInfo,
      });

      const booking = res?.data;
      if (!booking?.id) throw new Error("Không nhận được thông tin đặt tour.");

      navigate("/payment", {
        state: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          tourTitle: tour?.title,
          bookingCode: booking.bookingCode,
          departureDate: selectedDeparture.departureDate,
        },
      });
    } catch (err) {
      console.error("Lỗi tạo booking:", err);
      const msg = err.response?.data?.message || err.message || "Không thể đặt tour. Vui lòng thử lại.";
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const coverImage = tour?.images?.find((image) => image?.isCover) || tour?.images?.[0];
  const heroImage =
    coverImage?.imageUrl ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

  // Difficulty badge styling
  const getDifficultyColor = (diff) => {
    if (!diff) return "bg-gray-500 text-white";
    switch (diff.toUpperCase()) {
      case "EASY": return "bg-emerald-700 text-white";
      case "MODERATE": return "bg-amber-600 text-white";
      case "HARD": return "bg-rose-700 text-white";
      case "EXTREME": return "bg-red-950 text-white border border-red-800";
      default: return "bg-gray-500 text-white";
    }
  };

  // Helper to get fallback price based on slug
  const getTourPrice = (t) => {
    if (!t) return null;
    if (t.priceFrom) return t.priceFrom;
    if (t.slug === "fansipan-summit") return 3200000;
    if (t.slug === "ta-nang-phan-dung") return 4500000;
    if (t.slug === "ma-pi-leng-trek") return 2800000;
    return 3500000; // default fallback
  };

  // Helper to format currency
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };



  return (
    <div className="min-h-screen bg-[#fcfbf9] font-sans">
      <Header
        bgImage={heroImage}
        subheading="TrekMate Danang"
        mainHeading={tour?.title || "Chi Tiết Tour"}
        description={tour?.shortDescription || "Khám phá chi tiết tour trekking cùng TrekMate."}
        showDescription={Boolean(tour)}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Topbar */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200/60">
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 font-bold text-[#012d1d] hover:text-[#fea619] transition-colors"
          >
            <span>←</span> Quay lại danh sách tour
          </Link>
          {tour?.status && (
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                tour.status.toLowerCase() === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              Trạng thái: {tour.status}
            </span>
          )}
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#012d1d] mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải chi tiết tour...</p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm max-w-2xl mx-auto">
            <span className="text-5xl block mb-4">⚠️</span>
            <h3 className="text-rose-600 text-2xl font-bold mb-2">Không thể tải thông tin tour</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/locations"
                className="px-6 py-2.5 bg-[#012d1d] text-white hover:bg-[#fea619] hover:text-[#012d1d] font-bold rounded-full transition-colors shadow"
              >
                Về danh sách tour
              </Link>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === "success" && tour && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content Area (8 columns) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Detailed Description */}
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                  <h2 className="font-montserrat font-bold text-xl md:text-2xl text-gray-800 m-0">Mô Tả Tour Chi Tiết</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {tour.description || "Chưa có mô tả chi tiết cho tour này."}
                </p>
              </section>

              {/* Timeline / Daily Itinerary */}
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                  <h2 className="font-montserrat font-bold text-xl md:text-2xl text-gray-800 m-0">Lịch Trình Chi Tiết Theo Ngày</h2>
                </div>

                {tour.dailyItinerary && tour.dailyItinerary.length > 0 ? (
                  <div className="relative border-l border-gray-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8">
                    {tour.dailyItinerary
                      .sort((a, b) => a.dayNumber - b.dayNumber)
                      .map((day, idx) => (
                        <div key={day.id} className="relative">
                          {/* Timeline Dot */}
                          <span className="absolute -left-[37px] md:-left-[45px] top-1.5 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#fea619] text-[#012d1d] font-bold text-xs md:text-sm border-4 border-white shadow animate-pulse">
                            {day.dayNumber}
                          </span>

                          <div className="bg-gray-50/75 hover:bg-gray-50 border border-gray-100 rounded-2xl p-5 transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                              <h3 className="font-montserrat font-bold text-base md:text-lg text-gray-800 m-0">
                                Ngày {day.dayNumber}: {day.dayTitle}
                              </h3>
                              {day.dayDifficulty && (
                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-white shadow-sm border border-gray-100 self-start md:self-auto ${getDifficultyColor(day.dayDifficulty)}`}>
                                  {day.dayDifficulty}
                                </span>
                              )}
                            </div>

                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4">
                              {day.dayDescription || "Chưa có mô tả cho ngày này."}
                            </p>

                            {/* Day Quick Stats */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-bold">
                              {day.distanceKm && (
                                <span className="bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                  🏃 {day.distanceKm} km
                                </span>
                              )}
                              {(day.walkingHoursMin || day.walkingHoursMax) && (
                                <span className="bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                  ⏱️ {day.walkingHoursMin ?? 0} - {day.walkingHoursMax ?? 0} giờ đi bộ
                                </span>
                              )}
                              {(day.suggestedStartTime || day.suggestedEndTime) && (
                                <span className="bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                  🕒 {day.suggestedStartTime || "N/A"} - {day.suggestedEndTime || "N/A"}
                                </span>
                              )}
                            </div>

                            {/* Waypoints Link list in Day */}
                            {Array.isArray(day.waypointLinks) && day.waypointLinks.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gray-200/50">
                                <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-2">Điểm ghé thăm</div>
                                <div className="flex flex-wrap gap-2">
                                  {day.waypointLinks
                                    .sort((a, b) => a.visitOrder - b.visitOrder)
                                    .map((link) => (
                                      <span
                                        key={link.id}
                                        className="text-xs bg-[#012d1d]/5 text-[#012d1d] px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border border-gray-100"
                                      >
                                        <span className="w-4.5 h-4.5 bg-[#012d1d] text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                                          {link.visitOrder}
                                        </span>
                                        {link.waypointName} {link.isMandatory && <span className="text-[10px] text-red-500 font-bold">*</span>}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Thông tin lịch trình đang được cập nhật...</p>
                )}
              </section>

              {/* Includes & Excludes */}
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Includes */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
                      <h3 className="font-montserrat font-bold text-lg text-gray-800 m-0">Giá Bao Gồm</h3>
                    </div>
                    {tour.includes && tour.includes.length > 0 ? (
                      <ul className="space-y-3 p-0 list-none">
                        {tour.includes.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2.5">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-xs">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-xs">Đang cập nhật...</p>
                    )}
                  </div>

                  {/* Excludes */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-1.5 h-6 bg-rose-600 rounded-full"></span>
                      <h3 className="font-montserrat font-bold text-lg text-gray-800 m-0">Giá Không Bao Gồm</h3>
                    </div>
                    {tour.excludes && tour.excludes.length > 0 ? (
                      <ul className="space-y-3 p-0 list-none">
                        {tour.excludes.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2.5">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold text-[10px]">✕</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-xs">Đang cập nhật...</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Waypoints */}
              {tour.waypoints && tour.waypoints.length > 0 && (
                <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                    <h2 className="font-montserrat font-bold text-xl md:text-2xl text-gray-800 m-0">Các Điểm Mốc Hành Trình (Waypoints)</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {tour.waypoints
                      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                      .map((wp) => (
                        <div key={wp.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-all hover:shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400">Thứ tự: {wp.sequenceOrder}</span>
                            {wp.waypointType && (
                              <span className="text-[9px] font-extrabold uppercase bg-[#012d1d]/10 text-[#012d1d] px-2 py-0.5 rounded">
                                {wp.waypointType}
                              </span>
                            )}
                          </div>
                          <h4 className="font-montserrat font-bold text-sm text-gray-800 mb-1">{wp.name}</h4>
                          {wp.dayNumber && (
                            <p className="text-[11px] text-gray-500 font-semibold mb-1">Ghé thăm ngày: {wp.dayNumber}</p>
                          )}
                          <div className="text-[10px] text-gray-400 font-mono">
                            Tọa độ: {wp.lat}, {wp.lng}
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* Image Gallery */}
              {tour.images && tour.images.length > 0 && (
                <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                    <h2 className="font-montserrat font-bold text-xl md:text-2xl text-gray-800 m-0">Hình Ảnh Hành Trình</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {tour.images.map((img) => (
                      <figure key={img.id} className="group relative m-0 rounded-2xl overflow-hidden shadow-sm aspect-video bg-slate-50 border border-gray-100">
                        <img
                          src={img.imageUrl}
                          alt={img.altText || img.caption || tour.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                        {(img.caption || img.isCover) && (
                          <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-xs font-semibold">
                            {img.isCover && <span className="text-[#fea619] font-bold block text-[10px] uppercase mb-0.5">Ảnh bìa</span>}
                            <span className="line-clamp-1">{img.caption || "Hình ảnh tour"}</span>
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </section>
              )}

              {/* Review Section */}
              <ReviewSection tourId={tour.id} tourSlug={tour.slug} />
            </div>

            {/* Right Sticky Sidebar Widget (4 columns) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              {/* Information & Booking widget */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/50 shadow-xl shadow-[#012d1d]/5">
                <h3 className="font-montserrat font-extrabold text-[#012d1d] text-lg mb-4 uppercase tracking-wider">
                  Thông Tin Đặt Chuyến
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-6 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <RatingStars rating={tour.avgRating} className="text-base" />
                  <span className="font-extrabold text-gray-800 text-sm ml-1">
                    {tour.avgRating ? parseFloat(tour.avgRating).toFixed(1) : "0.0"}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({tour.totalBookings || 0} lượt đặt)
                  </span>
                </div>

                {/* Stat details list */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">⏱️ Thời gian</span>
                    <span className="font-extrabold text-gray-800">
                      {tour.durationDays} Ngày {tour.durationNights} Đêm
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">🏔️ Độ khó</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(tour.difficulty)}`}>
                      {tour.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">🏃 Quãng đường</span>
                    <span className="font-extrabold text-gray-800">{tour.distanceKm ?? "N/A"} km</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">🏔️ Độ cao cực đại</span>
                    <span className="font-extrabold text-gray-800">{tour.maxElevationM ?? "N/A"} m</span>
                  </div>
                  {tour.startLocation && (
                    <div className="flex flex-col gap-1 py-1">
                      <span className="text-gray-400 text-xs">📍 Điểm xuất phát</span>
                      <span className="font-bold text-gray-800 line-clamp-1">{tour.startLocation}</span>
                    </div>
                  )}
                  {tour.endLocation && (
                    <div className="flex flex-col gap-1 py-1">
                      <span className="text-gray-400 text-xs">🏁 Điểm kết thúc</span>
                      <span className="font-bold text-gray-800 line-clamp-1">{tour.endLocation}</span>
                    </div>
                  )}
                </div>

                {/* Price — show from selected departure or fallback */}
                <div className="mb-4 bg-emerald-50/50 border border-emerald-100/70 p-4 rounded-2xl">
                  <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                    {selectedDeparture ? "Giá mỗi người" : "Giá trọn gói từ"}
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-800">
                    {formatPrice(
                      selectedDeparture?.pricePerPerson
                        ? parseFloat(selectedDeparture.pricePerPerson)
                        : getTourPrice(tour)
                    )}
                  </div>
                  {selectedDeparture && numParticipants > 1 && (
                    <div className="text-sm font-bold text-emerald-700 mt-1">
                      Tổng: {formatPrice(parseFloat(selectedDeparture.pricePerPerson) * numParticipants)}
                    </div>
                  )}
                  <div className="text-[11px] text-gray-500 font-semibold mt-1">
                    Giá đã bao gồm VAT và toàn bộ chi phí hướng dẫn, ăn uống.
                  </div>
                </div>

                {/* Departure Selector */}
                {departures.length > 0 ? (
                  <div className="mb-4 space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Chọn ngày khởi hành
                      </label>
                      <select
                        value={selectedDeparture?.id || ""}
                        onChange={(e) => {
                          const dep = departures.find(d => d.id === e.target.value);
                          setSelectedDeparture(dep || null);
                          setBookingError("");
                        }}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#fea619] transition-all bg-white"
                      >
                        {departures.map(dep => (
                          <option key={dep.id} value={dep.id}>
                            {new Date(dep.departureDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                            {" — "}{formatPrice(parseFloat(dep.pricePerPerson))}/người
                            {" · "}{dep.availableSlots} chỗ còn
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedDeparture && (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[11px] text-gray-500 space-y-0.5">
                        {selectedDeparture.returnDate && (
                          <div>📅 Về: {new Date(selectedDeparture.returnDate).toLocaleDateString("vi-VN")}</div>
                        )}
                        {selectedDeparture.meetingPoint && (
                          <div>📍 {selectedDeparture.meetingPoint}</div>
                        )}
                        <div className="text-emerald-600 font-semibold">✅ {selectedDeparture.availableSlots} chỗ còn trống</div>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Số người tham gia
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNumParticipants(p => Math.max(1, p - 1))}
                          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center font-bold text-lg text-gray-600 hover:bg-gray-50 transition-all"
                        >−</button>
                        <span className="flex-1 text-center font-extrabold text-gray-800 text-lg">{numParticipants}</span>
                        <button
                          type="button"
                          onClick={() => setNumParticipants(p => Math.min(selectedDeparture?.availableSlots || 10, p + 1))}
                          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center font-bold text-lg text-gray-600 hover:bg-gray-50 transition-all"
                        >+</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-semibold text-center">
                    ⚠️ Hiện chưa có đợt khởi hành nào. Liên hệ để được tư vấn.
                  </div>
                )}

                {/* Booking Error */}
                {bookingError && (
                  <div className="mb-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 font-semibold">
                    ⚠️ {bookingError}
                  </div>
                )}

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={handleBookNow}
                  disabled={bookingLoading || departures.length === 0}
                  className="w-full py-4 bg-[#fea619] hover:bg-[#ffb638] disabled:bg-gray-200 disabled:text-gray-400 text-[#012d1d] font-extrabold text-xs rounded-2xl shadow-lg shadow-[#fea619]/25 hover:shadow-xl transition-all duration-300 block text-center uppercase tracking-widest hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {bookingLoading
                    ? "⏳ Đang xử lý..."
                    : isAuthenticated
                      ? "Đặt Tour Ngay"
                      : "Đăng nhập để đặt tour"}
                </button>
              </div>


              {/* Back to list CTA card */}
              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex flex-col items-center text-center">
                <span className="text-2xl mb-2">🧭</span>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Cần hỗ trợ thiết kế lịch trình riêng?</h4>
                <p className="text-xs text-gray-500 mb-3">TrekMate nhận đặt tour riêng cho đoàn từ 5 người trở lên.</p>
                <Link
                  to="/contact"
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-[#012d1d] hover:text-white hover:border-[#012d1d] rounded-full text-xs font-bold transition-all no-underline"
                >
                  Liên hệ chúng tôi
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TourDetail;
