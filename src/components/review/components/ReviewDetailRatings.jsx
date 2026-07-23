import React, { useState } from 'react';

export default function ReviewDetailRatings({ review }) {
  const [showDetailRatings, setShowDetailRatings] = useState(false);

  const hasSubRatings = review.guideRating || review.sceneryRating || 
                        review.safetyRating || review.valueRating || 
                        review.difficultyRating || review.equipmentRating;

  if (!hasSubRatings) return null;

  return (
    <div className="mb-3">
      <button
        onClick={() => setShowDetailRatings(!showDetailRatings)}
        className="text-xs font-bold text-[#012d1d] hover:text-[#fea619] transition-colors flex items-center gap-1 focus:outline-none"
      >
        {showDetailRatings ? '▼ Ẩn điểm chi tiết' : '▶ Xem điểm chi tiết'}
      </button>

      {showDetailRatings && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 p-3 bg-gray-50 rounded-2xl text-[11px] font-semibold text-gray-500 border border-gray-100">
          {review.guideRating && (
            <span>HDV: <span className="text-[#fea619] font-bold">{review.guideRating}/5 ★</span></span>
          )}
          {review.sceneryRating && (
            <span>Cảnh quan: <span className="text-[#fea619] font-bold">{review.sceneryRating}/5 ★</span></span>
          )}
          {review.safetyRating && (
            <span>An toàn: <span className="text-[#fea619] font-bold">{review.safetyRating}/5 ★</span></span>
          )}
          {review.valueRating && (
            <span>Đáng giá: <span className="text-[#fea619] font-bold">{review.valueRating}/5 ★</span></span>
          )}
          {review.difficultyRating && (
            <span>Độ khó: <span className="text-[#fea619] font-bold">{review.difficultyRating}/5 ★</span></span>
          )}
          {review.equipmentRating && (
            <span>Thiết bị: <span className="text-[#fea619] font-bold">{review.equipmentRating}/5 ★</span></span>
          )}
        </div>
      )}
    </div>
  );
}
