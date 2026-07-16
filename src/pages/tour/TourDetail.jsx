import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import api from "../../services/api";
import RatingStars from "../../components/common/RatingStars";

// Same destination images as TourCard
const TOUR_IMAGES = {
  "fansipan-summit":   "https://th.bing.com/th/id/R.61592cdb830787d2db63d89a47975093?rik=t7vTn9hWFnmKQg&riu=http%3a%2f%2fhanoitouristvietnam.com%2fsites%2fdefault%2ffiles%2f2025%2f01%2f1-cam-nang-du-lich-sapa_0.png&ehk=yKPmTZ5amKrvH%2b1fncZ4EUCJYXk7nhZ9jpCWvVHgMi8%3d&risl=&pid=ImgRaw&r=0",
  "ta-nang-phan-dung": "https://toongadventure.vn/wp-content/uploads/2023/03/Ta-nang-phan-dung-5.jpg",
  "ma-pi-leng-trek":   "https://tse4.mm.bing.net/th/id/OIP.dI0u5MdxoC__CM1XUSwm0AHaFL?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
};

const TourDetail = () => {
  const { idOrSlug } = useParams();
  const [tour, setTour] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

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
          throw new Error("Tour details not found.");
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError" || err.message === "canceled") return;
        console.error("Lỗi khi tải chi tiết tour:", err);
        setError(err.response?.data?.message || err.message || "An error occurred while loading tour details.");
        setStatus("error");
      }
    };

    loadTour();
    return () => controller.abort();
  }, [idOrSlug]);

  const coverImage = tour?.images?.find((image) => image?.isCover) || tour?.images?.[0];
  const heroImage =
    coverImage?.imageUrl ||
    TOUR_IMAGES[tour?.slug] ||
    TOUR_IMAGES["fansipan-summit"];

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
    if (!price) return "Contact us";
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
        mainHeading={tour?.title || "Tour Details"}
        description={tour?.shortDescription || "Discover trekking tour details with TrekMate."}
        showDescription={Boolean(tour)}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Topbar */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200/60">
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 font-bold text-[#012d1d] hover:text-[#fea619] transition-colors"
          >
            <span>←</span> Back to tours list
          </Link>
          {tour?.status && (
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                tour.status.toLowerCase() === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              Status: {tour.status}
            </span>
          )}
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#012d1d] mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading tour details...</p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm max-w-2xl mx-auto">
            <span className="text-5xl block mb-4">⚠️</span>
            <h3 className="text-rose-600 text-2xl font-bold mb-2">Unable to load tour details</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/locations"
                className="px-6 py-2.5 bg-[#012d1d] text-white hover:bg-[#fea619] hover:text-[#012d1d] font-bold rounded-full transition-colors shadow"
              >
                Back to tours list
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
                  <h2 className="font-montserrat font-bold text-xl md:text-2xl text-gray-800 m-0">Detailed Tour Description</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {tour.description || "No detailed description available for this tour."}
                </p>
              </section>

              {/* Timeline / Daily Itinerary */}
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                  <h2 className="font-montserrat font-bold text-xl md:text-2xl text-gray-800 m-0">Detailed Daily Itinerary</h2>
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
                                Day {day.dayNumber}: {day.dayTitle}
                              </h3>
                              {day.dayDifficulty && (
                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-white shadow-sm border border-gray-100 self-start md:self-auto ${getDifficultyColor(day.dayDifficulty)}`}>
                                  {day.dayDifficulty}
                                </span>
                              )}
                            </div>

                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4">
                              {day.dayDescription || "No description available for this day."}
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
                                  ⏱️ {day.walkingHoursMin ?? 0} - {day.walkingHoursMax ?? 0} hours hiking
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
                                <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-2">Waypoints</div>
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
                  <p className="text-gray-400 text-sm">Itinerary details are being updated...</p>
                )}
              </section>

              {/* Includes & Excludes */}
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Includes */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
                      <h3 className="font-montserrat font-bold text-lg text-gray-800 m-0">Price Includes</h3>
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
                      <p className="text-gray-400 text-xs">Updating...</p>
                    )}
                  </div>

                  {/* Excludes */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-1.5 h-6 bg-rose-600 rounded-full"></span>
                      <h3 className="font-montserrat font-bold text-lg text-gray-800 m-0">Price Excludes</h3>
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
                      <p className="text-gray-400 text-xs">Updating...</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Waypoints */}
              {tour.waypoints && tour.waypoints.length > 0 && (
                <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
                    <h2 className="font-montserrat font-bold text-xl md:text-2xl text-gray-800 m-0">Trek Milestones (Waypoints)</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {tour.waypoints
                      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                      .map((wp) => (
                        <div key={wp.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-all hover:shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400">Order: {wp.sequenceOrder}</span>
                            {wp.waypointType && (
                              <span className="text-[9px] font-extrabold uppercase bg-[#012d1d]/10 text-[#012d1d] px-2 py-0.5 rounded">
                                {wp.waypointType}
                              </span>
                            )}
                          </div>
                          <h4 className="font-montserrat font-bold text-sm text-gray-800 mb-1">{wp.name}</h4>
                          {wp.dayNumber && (
                            <p className="text-[11px] text-gray-500 font-semibold mb-1">Visit day: {wp.dayNumber}</p>
                          )}
                          <div className="text-[10px] text-gray-400 font-mono">
                            Coordinates: {wp.lat}, {wp.lng}
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
                    <h2 className="font-montserrat font-bold text-xl md:text-2xl text-gray-800 m-0">Trek Gallery</h2>
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
                            {img.isCover && <span className="text-[#fea619] font-bold block text-[10px] uppercase mb-0.5">Cover Image</span>}
                            <span className="line-clamp-1">{img.caption || "Tour image"}</span>
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sticky Sidebar Widget (4 columns) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              {/* Information & Booking widget */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/50 shadow-xl shadow-[#012d1d]/5">
                <h3 className="font-montserrat font-extrabold text-[#012d1d] text-lg mb-4 uppercase tracking-wider">
                  Booking Details
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-6 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <RatingStars rating={tour.avgRating} className="text-base" />
                  <span className="font-extrabold text-gray-800 text-sm ml-1">
                    {tour.avgRating ? parseFloat(tour.avgRating).toFixed(1) : "0.0"}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({tour.totalBookings || 0} bookings)
                  </span>
                </div>

                {/* Stat details list */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">⏱️ Duration</span>
                    <span className="font-extrabold text-gray-800">
                      {tour.durationDays} Days {tour.durationNights} Nights
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">🏔️ Difficulty</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(tour.difficulty)}`}>
                      {tour.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">🏃 Distance</span>
                    <span className="font-extrabold text-gray-800">{tour.distanceKm ?? "N/A"} km</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">🏔️ Max Elevation</span>
                    <span className="font-extrabold text-gray-800">{tour.maxElevationM ?? "N/A"} m</span>
                  </div>
                  {tour.startLocation && (
                    <div className="flex flex-col gap-1 py-1">
                      <span className="text-gray-400 text-xs">📍 Starting Point</span>
                      <span className="font-bold text-gray-800 line-clamp-1">{tour.startLocation}</span>
                    </div>
                  )}
                  {tour.endLocation && (
                    <div className="flex flex-col gap-1 py-1">
                      <span className="text-gray-400 text-xs">🏁 Ending Point</span>
                      <span className="font-bold text-gray-800 line-clamp-1">{tour.endLocation}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6 bg-emerald-50/50 border border-emerald-100/70 p-4 rounded-2xl">
                  <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                    All-inclusive from
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-800">
                    {formatPrice(getTourPrice(tour))}
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold mt-1">
                    Includes VAT, guide fees, and all meals during the trek.
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  to={`/tours/${tour.slug}/book`}
                  className="w-full py-4 bg-[#fea619] hover:bg-[#ffb638] text-[#012d1d] font-extrabold text-xs rounded-2xl shadow-lg shadow-[#fea619]/25 hover:shadow-xl transition-all duration-300 block text-center uppercase tracking-widest hover:-translate-y-0.5 active:scale-95"
                >
                  Book Tour Now
                </Link>
              </div>

              {/* Back to list CTA card */}
              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex flex-col items-center text-center">
                <span className="text-2xl mb-2">🧭</span>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Need a custom itinerary?</h4>
                <p className="text-xs text-gray-500 mb-3">TrekMate designs custom private treks for groups of 5+ hikers.</p>
                <Link
                  to="/contact"
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-[#012d1d] hover:text-white hover:border-[#012d1d] rounded-full text-xs font-bold transition-all no-underline"
                >
                  Contact Us
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
