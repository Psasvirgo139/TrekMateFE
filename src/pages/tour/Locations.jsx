import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import api from "../../services/api";
import TourCard from "../../components/tour/TourCard";
import TourSkeleton from "../../components/tour/TourSkeleton";
import Pagination from "../../../src/components/common/Pagination";

// Import local images for page header
import LocationsHeroBg from "../../images/hero-slider-3.webp";

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
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>

            {/* Reusable Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              locale="vi"
              totalElements={totalElements}
              variant="round"
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Locations;
