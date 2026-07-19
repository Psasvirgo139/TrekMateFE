import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import { fetchPublicTours } from "../../services/tourApi";
import TourCard from "../../components/tour/TourCard";
import TourSkeleton from "../../components/tour/TourSkeleton";
import Pagination from "../../components/common/Pagination";

const LOCATIONS_HERO = "https://i.pinimg.com/1200x/16/05/3e/16053eb88478eadf2042ed560fccf86b.jpg";

const Locations = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query parameters state initialized directly from URL
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(() => searchParams.get("difficulty") || "");
  const [durationRange, setDurationRange] = useState(() => searchParams.get("durationRange") || "");
  const [sort, setSort] = useState("avgRating,desc");
  const [page, setPage] = useState(0);
  const [size] = useState(6);

  // Sync URL query params to state
  useEffect(() => {
    const qSearch = searchParams.get("search") || "";
    const qDifficulty = searchParams.get("difficulty") || "";
    const qDuration = searchParams.get("durationRange") || "";

    setSearch(qSearch);
    setDifficulty(qDifficulty);
    setDurationRange(qDuration);
    setPage(0);
  }, [searchParams]);

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
      const queryParams = {
        page: page,
        size: size,
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
      const json = await fetchPublicTours(queryParams);

      if (json) {
        if (json.content !== undefined) {
          setTours(json.content || []);

          // Spring Boot 3: pagination metadata is in nested `page` object
          // Spring Boot 2: pagination metadata is at top-level
          const pageInfo = json.page ?? json;
          setTotalPages(pageInfo.totalPages || 0);
          setTotalElements(pageInfo.totalElements || 0);
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
  }, [page, size, search, difficulty, durationRange, sort]);

  // Handle Search submit/enter
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      const newParams = new URLSearchParams(searchParams);
      if (search.trim()) {
        newParams.set("search", search.trim());
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams);
    }
  };

  const handleSearchBlur = () => {
    const newParams = new URLSearchParams(searchParams);
    if (search.trim()) {
      newParams.set("search", search.trim());
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchParams({});
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
        bgImage={LOCATIONS_HERO}
        pageTitle="TrekMate Tours"
        subheading="CONQUER CHALLENGES — ABSOLUTE SAFETY"
        mainHeading="Explore Trekking Routes"
        description="Discover our collection of meticulously crafted trekking routes, complete with detailed itineraries, weather forecasts, and experienced local guides."
        showDescription={true}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Controls Card: Filter, Sort (Glassmorphism layout) */}
        <section className="backdrop-blur-md bg-white/75 rounded-3xl shadow-xl shadow-[#012d1d]/5 border border-white/40 p-6 md:p-8 mb-8 transition-all duration-300">
          <div className="flex flex-col gap-6">

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Difficulty Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#855300] ml-1">Difficulty Level</label>
                <select
                  className="px-4 py-3.5 rounded-xl border border-gray-200/80 bg-white/50 focus:bg-white text-brand-dark cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-300"
                  value={difficulty}
                  onChange={(e) => {
                    const newParams = new URLSearchParams(searchParams);
                    if (e.target.value) {
                      newParams.set("difficulty", e.target.value);
                    } else {
                      newParams.delete("difficulty");
                    }
                    setSearchParams(newParams);
                  }}
                >
                  <option value="">All difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HARD">Hard</option>
                  <option value="EXTREME">Extreme</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#855300] ml-1">Duration</label>
                <select
                  className="px-4 py-3.5 rounded-xl border border-gray-200/80 bg-white/50 focus:bg-white text-brand-dark cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-300"
                  value={durationRange}
                  onChange={(e) => {
                    const newParams = new URLSearchParams(searchParams);
                    if (e.target.value) {
                      newParams.set("durationRange", e.target.value);
                    } else {
                      newParams.delete("durationRange");
                    }
                    setSearchParams(newParams);
                  }}
                >
                  <option value="">All durations</option>
                  <option value="short">Under 3 days</option>
                  <option value="medium">3 to 5 days</option>
                  <option value="long">Over 5 days</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#855300] ml-1">Sort By</label>
                <select
                  className="px-4 py-3.5 rounded-xl border border-gray-200/80 bg-white/50 focus:bg-white text-brand-dark cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-300"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="avgRating,desc">Highest Rated</option>
                  <option value="durationDays,asc">Shortest Duration</option>
                  <option value="durationDays,desc">Longest Duration</option>
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
                  🔄 Clear filters
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
                Keyword: "{search}"
                <button 
                  className="text-sky-600 hover:text-sky-800 font-bold" 
                  onClick={() => { 
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete("search");
                    setSearchParams(newParams);
                  }}
                >
                  ×
                </button>
              </span>
            )}
            {difficulty && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
                Difficulty: {difficulty}
                <button 
                  className="hover:text-red-200 font-bold" 
                  onClick={() => { 
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete("difficulty");
                    setSearchParams(newParams);
                  }}
                >
                  ×
                </button>
              </span>
            )}
            {durationRange && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
                Duration: {durationRange === "short" ? "< 3 days" : durationRange === "medium" ? "3 - 5 days" : "> 5 days"}
                <button 
                  className="text-slate-600 hover:text-slate-900 font-bold" 
                  onClick={() => { 
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete("durationRange");
                    setSearchParams(newParams);
                  }}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-red-600 text-2xl font-bold mb-2">Failed to connect to server</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              className="px-6 py-2.5 bg-brand-orange text-brand-dark font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={fetchTours}
            >
              Retry
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
            <h3 className="text-gray-800 text-2xl font-bold mb-2">No matching tours found</h3>
            <p className="text-gray-500 mb-6">Please try changing your search query or adjusting your filters.</p>
            <button
              className="px-6 py-2.5 bg-[#fea619] text-[#012d1d] font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={handleResetFilters}
            >
              Clear all filters
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

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              locale="en"
              showSummary={true}
              totalElements={totalElements}
              pageSize={size}
              itemsCount={tours.length}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Locations;
