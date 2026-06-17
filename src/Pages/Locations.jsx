import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import { Link } from "react-router-dom";
import api from "../services/api";

// Import local images for page header & tour cards
import LocationsHeroBg from "../Images/hero-slider-3.webp";
import dest1 from "../Images/destination-1.webp";
import dest2 from "../Images/destination-2.webp";
import dest3 from "../Images/destination-3.webp";

const TourSkeleton = () => {
  return (
    <div className="animate-pulse bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="h-56 bg-slate-200 relative"></div>
      <div className="flex-grow p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-4 w-12 bg-slate-200 rounded ml-auto"></div>
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
        <div className="flex flex-wrap gap-2 my-2">
          <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
          <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
          <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 w-full">
          <div className="h-4 w-28 bg-slate-200 rounded"></div>
          <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const Locations = () => {
  // Query parameters state
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [durationRange, setDurationRange] = useState("");
  const [sort, setSort] = useState("avgRating,desc");
  const [page, setPage] = useState(0);
  const [size] = useState(6);

  // API response state
  const [tours, setTours] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal detail view state
  const [selectedTour, setSelectedTour] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch tours from backend using Axios
  const fetchTours = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build API query parameters object
      const queryParams = {
        page: page,
        size: size,
        status: "ACTIVE", // Default to ACTIVE tours for public view
      };

      if (search.trim()) queryParams.search = search;
      if (difficulty) queryParams.difficulty = difficulty;
      if (sort) queryParams.sort = sort;

      // Map duration range to minDuration & maxDuration
      if (durationRange === "short") {
        queryParams.maxDuration = 2;
      } else if (durationRange === "medium") {
        queryParams.minDuration = 3;
        queryParams.maxDuration = 5;
      } else if (durationRange === "long") {
        queryParams.minDuration = 6;
      }

      // Axios call
      const response = await api.get("/tours", { params: queryParams });
      
      if (response && response.status === 200 && response.data) {
        const json = response.data;
        // Handle standard API response layout from backend (code: 200 & data)
        if (json.code === 200 && json.data) {
          setTours(json.data.content || []);
          setTotalPages(json.data.totalPages || 0);
          setTotalElements(json.data.totalElements || 0);
        // Fallbacks for legacy/alternative formats
        } else if ((json.status === 200 || json.status === "200" || json.statusCode === 200) && json.data) {
          setTours(json.data.content || []);
          setTotalPages(json.data.totalPages || 0);
          setTotalElements(json.data.totalElements || 0);
        } else if (json.content !== undefined) {
          setTours(json.content || []);
          setTotalPages(json.totalPages || 0);
          setTotalElements(json.totalElements || 0);
        } else if (Array.isArray(json)) {
          setTours(json);
          setTotalPages(1);
          setTotalElements(json.length);
        } else {
          throw new Error(json.message || "Invalid API response structure");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to fetch tours.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on parameters change
  useEffect(() => {
    fetchTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, difficulty, durationRange, sort]);

  // Handle Search submit/enter
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      setPage(0);
      fetchTours();
    }
  };

  const handleSearchBlur = () => {
    setPage(0);
    fetchTours();
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setDifficulty("");
    setDurationRange("");
    setSort("avgRating,desc");
    setPage(0);
  };

  // Helper to map tour slug to imported local webp image
  const getTourImage = (slug) => {
    if (slug === "fansipan-summit") return dest3;
    if (slug === "ta-nang-phan-dung") return dest2;
    if (slug === "ma-pi-leng-trek") return dest1;
    return dest1; // fallback
  };

  // Helper to format currency
  const formatPrice = (price) => {
    if (!price) return "Contact Us";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper to render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const rounded = Math.round(parseFloat(rating || 0));
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rounded ? "text-brand-orange text-lg" : "text-gray-300 text-lg"}>
          {i <= rounded ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  // Difficulty badge background styling mapping
  const getDifficultyColor = (diff) => {
    if (!diff) return "bg-gray-500";
    switch (diff.toUpperCase()) {
      case "EASY": return "bg-emerald-700 text-white";
      case "MODERATE": return "bg-amber-600 text-white";
      case "HARD": return "bg-rose-700 text-white";
      case "EXTREME": return "bg-red-950 text-white border border-red-800";
      default: return "bg-gray-500 text-white";
    }
  };

  // Handle Tour click for detail modal
  const handleOpenDetail = (tour) => {
    setSelectedTour(tour);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTour(null);
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans">
      {/* Shared Header Component */}
      <Header
        bgImage={LocationsHeroBg}
        pageTitle="TrekMate Tours"
        subheading="CHINH PHỤC THỬ THÁCH — AN TOÀN TUYỆT ĐỐI"
        mainHeading="Danh Sách Các Tuyến Đường Trekking"
        description="Khám phá bộ sưu tập các cung đường trekking được thiết kế tỉ mỉ, đầy đủ lộ trình, dự báo thời tiết và hướng dẫn viên bản địa giàu kinh nghiệm."
        showDescription={true}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Controls Card: Search, Filter, Sort (Glassmorphism layout) */}
        <section className="backdrop-blur-md bg-white/75 rounded-3xl shadow-xl shadow-[#012d1d]/5 border border-white/40 p-6 md:p-8 mb-8 transition-all duration-300">
          <div className="flex flex-col gap-6">
            
            {/* Search Input */}
            <div className="relative w-full">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm tour theo tên, điểm xuất phát hoặc điểm kết thúc... (Nhấn Enter)"
                className="w-full pl-12 pr-5 py-4 rounded-full border border-gray-200/80 bg-white/50 focus:bg-white text-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-300 placeholder:text-gray-400 shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                onBlur={handleSearchBlur}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Difficulty Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#855300] ml-1">Mức Độ Khó</label>
                <select
                  className="px-4 py-3.5 rounded-xl border border-gray-200/80 bg-white/50 focus:bg-white text-brand-dark cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-300"
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">Tất cả độ khó</option>
                  <option value="EASY">Easy (Dễ)</option>
                  <option value="MODERATE">Moderate (Vừa phải)</option>
                  <option value="HARD">Hard (Khó)</option>
                  <option value="EXTREME">Extreme (Mạo hiểm)</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#855300] ml-1">Thời Gian Đi</label>
                <select
                  className="px-4 py-3.5 rounded-xl border border-gray-200/80 bg-white/50 focus:bg-white text-brand-dark cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-300"
                  value={durationRange}
                  onChange={(e) => {
                    setDurationRange(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">Tất cả thời gian</option>
                  <option value="short">Dưới 3 ngày</option>
                  <option value="medium">Từ 3 đến 5 ngày</option>
                  <option value="long">Trên 5 ngày</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#855300] ml-1">Sắp Xếp Theo</label>
                <select
                  className="px-4 py-3.5 rounded-xl border border-gray-200/80 bg-white/50 focus:bg-white text-brand-dark cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-300"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="avgRating,desc">Đánh giá cao nhất</option>
                  <option value="durationDays,asc">Thời gian ngắn nhất</option>
                  <option value="durationDays,desc">Thời gian dài nhất</option>
                </select>
              </div>
            </div>

            {/* Reset Filter Button */}
            {(search || difficulty || durationRange || sort !== "avgRating,desc") && (
              <div className="flex justify-end mt-2">
                <button
                  className="px-5 py-2.5 border-2 border-rose-500/20 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-50 hover:border-rose-500 hover:text-rose-700 transition-all duration-200 shadow-sm"
                  onClick={handleResetFilters}
                >
                  🔄 Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Active Badges */}
        {(difficulty || durationRange || search) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-50 text-sky-900 border border-sky-200 text-xs font-semibold">
                Từ khóa: "{search}"
                <button className="text-sky-600 hover:text-sky-800 font-bold" onClick={() => { setSearch(""); setPage(0); setTimeout(fetchTours, 50); }}>×</button>
              </span>
            )}
            {difficulty && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
                Độ khó: {difficulty}
                <button className="hover:text-red-200 font-bold" onClick={() => { setDifficulty(""); setPage(0); }}>×</button>
              </span>
            )}
            {durationRange && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
                Thời gian: {durationRange === "short" ? "< 3 ngày" : durationRange === "medium" ? "3 - 5 ngày" : "> 5 ngày"}
                <button className="text-slate-600 hover:text-slate-900 font-bold" onClick={() => { setDurationRange(""); setPage(0); }}>×</button>
              </span>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-red-600 text-2xl font-bold mb-2">Không thể kết nối máy chủ</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              className="px-6 py-2.5 bg-brand-orange text-brand-dark font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={fetchTours}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, idx) => (
              <TourSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tours.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-gray-800 text-2xl font-bold mb-2">Không tìm thấy tour phù hợp</h3>
            <p className="text-gray-500 mb-6">Hãy thử thay đổi từ khóa tìm kiếm hoặc các cài đặt lọc hiện tại của bạn.</p>
            <button
              className="px-6 py-2.5 bg-[#fea619] text-[#012d1d] font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={handleResetFilters}
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* Tour Grid */}
        {!loading && !error && tours.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <article key={tour.id} className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-gray-100/70 transition-all duration-300 relative">
                  
                  {/* Tour Image Header with Gradient Overlay */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={getTourImage(tour.slug)}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-90"></div>
                    <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-sm bg-opacity-95 ${getDifficultyColor(tour.difficulty)}`}>
                      {tour.difficulty}
                    </span>
                    <span className="absolute bottom-4 right-4 bg-[#fea619] hover:bg-[#ffb638] text-[#012d1d] px-4 py-1.5 rounded-xl font-extrabold text-sm shadow-lg transform group-hover:scale-105 transition-all duration-300">
                      {tour.priceFrom ? formatPrice(tour.priceFrom) : "Liên hệ"}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-grow p-6">
                    {/* Rating Row */}
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex gap-0.5">{renderStars(tour.avgRating)}</div>
                      <span className="font-extrabold text-gray-800 text-xs ml-1">{tour.avgRating ? parseFloat(tour.avgRating).toFixed(1) : "0.0"}</span>
                      <span className="text-gray-400 text-xs">({tour.totalReviews || 0} đánh giá)</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-montserrat font-bold text-gray-800 text-lg leading-snug h-[3.4rem] overflow-hidden line-clamp-2 mb-4 transition-colors">
                      {tour.title}
                    </h3>

                    {/* Quick Details Pills (Premium Badges) */}
                    <div className="flex flex-wrap gap-2 mb-5 border-b border-gray-100 pb-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-gray-100 text-gray-600 text-xs font-semibold">
                        ⏱️ {tour.durationDays}N {tour.durationNights}Đ
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-gray-100 text-gray-600 text-xs font-semibold">
                        🏃 {tour.distanceKm} km
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-gray-100 text-gray-600 text-xs font-semibold">
                        🏔️ {tour.maxElevationM}m
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-gray-100 text-gray-600 text-xs font-semibold">
                        📍 {tour.startLocation?.split(",")[0]}
                      </span>
                    </div>

                    {/* Highlights */}
                    {tour.highlights && tour.highlights.length > 0 && (
                      <div className="mb-5">
                        <div className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider mb-2">Điểm Nổi Bật</div>
                        <ul className="flex flex-col gap-1.5">
                          {tour.highlights.slice(0, 2).map((hl, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                              <span className="text-[#fea619]">✓</span>
                              <span className="line-clamp-1">{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 w-full">
                      {/* Availability */}
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          {tour.upcomingDeparturesCount > 0 ? (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </>
                          ) : (
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
                          )}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {tour.upcomingDeparturesCount > 0
                            ? `${tour.upcomingDeparturesCount} chuyến sắp đi`
                            : "Chưa có lịch"}
                        </span>
                      </div>

                      {/* Detail CTA Button */}
                      <button
                        onClick={() => handleOpenDetail(tour)}
                        className="px-5 py-2 text-xs font-extrabold bg-[#012d1d] hover:bg-[#fea619] text-white hover:text-[#012d1d] rounded-full transition-all duration-300 shadow hover:shadow-lg active:scale-95"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className="w-11 h-11 border border-brand-dark/15 text-brand-dark rounded-full flex items-center justify-center hover:bg-brand-dark hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-dark cursor-pointer disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <span className="text-gray-600 font-bold text-sm">
                  Trang {page + 1} / {totalPages} (Tổng số: {totalElements} tour)
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page === totalPages - 1}
                  className="w-11 h-11 border border-brand-dark/15 text-brand-dark rounded-full flex items-center justify-center hover:bg-brand-dark hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-dark cursor-pointer disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Immersive Tour Detail Modal popup (Tailwind CSS custom modal) */}
      {selectedTour && showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h4 className="font-montserrat font-bold text-lg text-brand-dark">{selectedTour.title}</h4>
              <button 
                onClick={handleCloseModal} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors text-lg"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* Banner Image */}
              <div className="rounded-xl overflow-hidden mb-6 shadow-sm">
                <img
                  src={getTourImage(selectedTour.slug)}
                  alt={selectedTour.title}
                  className="w-full object-cover"
                  style={{ height: '300px' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Tour Key Statistics (Left side) */}
                <div className="md:col-span-7">
                  <h5 className="font-bold text-gray-800 mb-4 border-b pb-2 text-sm uppercase tracking-wider">Thông Tin Hành Trình</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400 text-xs">Thời Gian</div>
                      <div className="font-bold text-gray-800 text-sm">{selectedTour.durationDays} Ngày {selectedTour.durationNights} Đêm</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Độ Khó</div>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider ${getDifficultyColor(selectedTour.difficulty)}`}>
                          {selectedTour.difficulty}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Quãng Đường</div>
                      <div className="font-bold text-gray-800 text-sm">{selectedTour.distanceKm} Kilometres</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Độ Cao Cực Đại</div>
                      <div className="font-bold text-gray-800 text-sm">{selectedTour.maxElevationM} Mét</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Điểm Xuất Phát</div>
                      <div className="font-bold text-gray-800 text-sm">{selectedTour.startLocation}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Điểm Kết Thúc</div>
                      <div className="font-bold text-gray-800 text-sm">{selectedTour.endLocation}</div>
                    </div>
                  </div>

                  {/* Rating summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                    <div className="text-4xl font-bold text-gray-800">{selectedTour.avgRating ? parseFloat(selectedTour.avgRating).toFixed(1) : "0.0"}</div>
                    <div>
                      <div className="flex gap-0.5">{renderStars(selectedTour.avgRating)}</div>
                      <div className="text-xs text-gray-400 mt-1">{selectedTour.totalReviews || 0} lượt đánh giá từ khách hàng</div>
                    </div>
                  </div>
                </div>

                {/* Highlights & Quick booking (Right side) */}
                <div className="md:col-span-5 flex flex-col">
                  <h5 className="font-bold text-gray-800 mb-4 border-b pb-2 text-sm uppercase tracking-wider">Điểm Nổi Bật</h5>
                  {selectedTour.highlights && selectedTour.highlights.length > 0 ? (
                    <ul className="flex flex-col gap-2.5 list-disc pl-4 mb-6 text-gray-700 text-xs">
                      {selectedTour.highlights.map((hl, index) => (
                        <li key={index} className="leading-relaxed">
                          {hl}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-xs mb-6">Đang cập nhật các điểm nổi bật...</p>
                  )}

                  {/* Price and Action Card */}
                  <div className="mt-auto bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                    <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Giá Tour Khởi Điểm</div>
                    <div className="text-2xl font-bold text-emerald-800 mb-2">
                      {selectedTour.priceFrom ? formatPrice(selectedTour.priceFrom) : "Liên Hệ Trực Tiếp"}
                    </div>
                    <div className="text-[11px] text-gray-500 mb-4">
                      {selectedTour.upcomingDeparturesCount > 0
                        ? `Hiện có ${selectedTour.upcomingDeparturesCount} lịch khởi hành đang mở đăng ký.`
                        : "Chưa có lịch khởi hành sắp tới."}
                    </div>
                    <button 
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-full shadow transition-colors"
                      onClick={handleCloseModal}
                    >
                      Yêu Cầu Đặt Chuyến
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                className="px-5 py-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-full font-bold text-xs transition-colors"
                onClick={handleCloseModal}
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

    const loadTours = async () => {
      try {
        setStatus("loading");
        setError("");

        const response = await fetch("/api/tours?status=ACTIVE&page=0&size=12", {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Khong tai duoc danh sach tour.");
        }

        const page = payload?.data;
        setTours(Array.isArray(page?.content) ? page.content : []);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Da xay ra loi khi tai tour.");
        setStatus("error");
      }
    };

    loadTours();
    return () => controller.abort();
  }, []);

  const heroImage =
    "https://images.unsplash.com/photo-1501554728187-ce583db33af7?auto=format&fit=crop&w=1600&q=80";

  const panelCls =
    "bg-white/80 rounded-3xl p-6 shadow-[0_20px_60px_rgba(23,35,42,.08)] mb-5";

  return (
    <>
      <Header
        bgImage={heroImage}
        subheading="TrekMate Danang"
        mainHeading="Where the next trail begins"
        description="Kham pha cac hanh trinh trekking cua TrekMate."
        showDescription={true}
      />

      <main
        className="px-5 py-6 pb-12 min-h-screen"
        style={{ background: "linear-gradient(180deg,#f7f4ee,#eef3ee)" }}
      >
        <section className="max-w-[1200px] mx-auto">

          {/* loading */}
          {status === "loading" && (
            <div className={panelCls}>Dang tai danh sach tour...</div>
          )}

          {/* error */}
          {status === "error" && (
            <div className={panelCls}>
              <h2 className="mt-0 text-[#10251b]">Khong the tai hanh trinh</h2>
              <p className="text-[#4f5e57]">{error}</p>
            </div>
          )}

          {/* empty */}
          {status === "success" && tours.length === 0 && (
            <div className={panelCls}>
              <h2 className="mt-0 text-[#10251b]">Chua co hanh trinh nao</h2>
              <p className="text-[#4f5e57]">Database hien chua co tour ACTIVE de hien thi.</p>
            </div>
          )}

          {/* tour grid */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            {tours.map((tour) => (
              <article
                key={tour.id}
                className="flex flex-col bg-white/80 rounded-3xl p-6 shadow-[0_20px_60px_rgba(23,35,42,.08)]"
              >
                {/* card header */}
                <div className="flex justify-between gap-3 flex-wrap mb-3.5">
                  <span className="inline-flex px-3 py-1.5 rounded-full bg-[#e7efe8] text-[#1d4b35] text-[.78rem] font-bold">
                    {tour.difficulty || "N/A"}
                  </span>
                  <span className="inline-flex px-3 py-1.5 rounded-full bg-[#10251b] text-white text-[.78rem] font-bold">
                    {tour.status}
                  </span>
                </div>

                <h2 className="mt-0 text-[#10251b]">{tour.title}</h2>
                <p className="text-[#4f5e57] leading-relaxed min-h-[72px]">
                  {tour.highlights?.length
                    ? tour.highlights[0]
                    : tour.startLocation || "Tour trekking trong database"}
                </p>

                {/* meta grid */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {[
                    {
                      label: "Thoi luong",
                      value: `${tour.durationDays ?? "N/A"} ngay${
                        tour.durationNights ? ` ${tour.durationNights} dem` : ""
                      }`,
                    },
                    { label: "Khoang gia", value: formatPrice(tour.priceFrom) },
                    { label: "Danh gia", value: `${tour.avgRating ?? 0}/5` },
                    { label: "Sap khoi hanh", value: tour.upcomingDeparturesCount ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="block text-[.78rem] text-[#6a776f] mb-1">{label}</span>
                      <strong className="text-[#10251b]">{value}</strong>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3 mt-5">
                  <Link
                    to={`/tours/${tour.slug || tour.id}`}
                    className="inline-flex mt-auto px-4 py-3 rounded-full no-underline bg-[#10251b] text-white font-bold"
                  >
                    Xem chi tiet
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Locations;
