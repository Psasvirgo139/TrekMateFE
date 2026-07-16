import React from 'react';
import RatingStars from '../../common/RatingStars';

export default function ReviewSummaryCard({ summary }) {
  if (!summary || !summary.totalReviews) return null;

  const getRatingPercentage = (count) => {
    if (!summary.totalReviews) return 0;
    return Math.round((count / summary.totalReviews) * 100);
  };

  const subRatingItems = [
    { label: 'HDV', val: summary.avgGuideRating },
    { label: 'Cảnh quan', val: summary.avgSceneryRating },
    { label: 'An toàn', val: summary.avgSafetyRating },
    { label: 'Đáng giá', val: summary.avgValueRating },
    { label: 'Độ khó', val: summary.avgDifficultyRating },
    { label: 'Đồ thuê', val: summary.avgEquipmentRating },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Left: Overall score */}
      <div className="flex flex-col items-center justify-center text-center md:border-r md:border-gray-100 md:pr-8 md:min-w-[180px]">
        <span className="text-5xl font-extrabold text-[#012d1d] mb-2">
          {summary.avgOverallRating ? summary.avgOverallRating.toFixed(1) : '0.0'}
        </span>
        <div className="mb-2">
          <RatingStars rating={Math.round(summary.avgOverallRating || 0)} className="text-lg text-[#fea619]" />
        </div>
        <span className="text-xs text-gray-400 font-semibold">Dựa trên {summary.totalReviews} đánh giá</span>
      </div>

      {/* Center: Star distribution histogram */}
      <div className="flex-grow flex flex-col justify-center gap-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = summary.ratingDistribution?.[stars] || 0;
          const percent = getRatingPercentage(count);
          return (
            <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-gray-500">
              <span className="w-12 text-right flex items-center justify-end gap-1">
                {stars} <span className="text-[#fea619]">★</span>
              </span>
              <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#fea619] rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
              </div>
              <span className="w-10 text-left text-gray-400">{percent}%</span>
            </div>
          );
        })}
      </div>

      {/* Right: Sub-ratings breakdown */}
      <div className="w-full md:w-auto md:max-w-xs grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
        {subRatingItems.map(
          (item) =>
            item.val != null && (
              <div key={item.label} className="flex flex-col justify-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</span>
                <span className="text-sm font-extrabold text-gray-700 flex items-center gap-1">
                  <span className="text-[#fea619]">★</span> {item.val.toFixed(1)}
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
}
