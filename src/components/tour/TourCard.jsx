import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../common/RatingStars';

// Local images fallbacks
import dest1 from "../../images/destination-1.webp";
import dest2 from "../../images/destination-2.webp";
import dest3 from "../../images/destination-3.webp";

const getTourImage = (slug) => {
  if (slug === "fansipan-summit") return dest3;
  if (slug === "ta-nang-phan-dung") return dest2;
  if (slug === "ma-pi-leng-trek") return dest1;
  return dest1;
};

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

const formatPrice = (price) => {
  if (!price) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function TourCard({ tour }) {
  return (
    <article className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-gray-100/70 transition-all duration-300 relative">
      
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
          <RatingStars rating={tour.avgRating} className="text-lg" />
          <span className="font-extrabold text-gray-800 text-xs ml-1">
            {tour.avgRating ? parseFloat(tour.avgRating).toFixed(1) : "0.0"}
          </span>
          <span className="text-gray-400 text-xs">({tour.totalReviews || 0} đánh giá)</span>
        </div>

        {/* Title */}
        <h3 className="font-montserrat font-bold text-gray-800 text-lg leading-snug h-[3.4rem] overflow-hidden line-clamp-2 mb-4 transition-colors">
          {tour.title}
        </h3>

        {/* Quick Details Pills */}
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
            <ul className="flex flex-col gap-1.5 p-0 list-none">
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
          <Link
            to={`/tours/${tour.slug || tour.id}`}
            className="px-5 py-2 text-xs font-extrabold bg-[#012d1d] hover:bg-[#fea619] text-white hover:text-[#012d1d] rounded-full transition-all duration-300 shadow hover:shadow-lg active:scale-95 inline-block text-center"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
