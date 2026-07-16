import React from 'react';
import RatingStars from '../../common/RatingStars';

export default function ReviewHeader({ review, formatDate }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
      <div className="flex items-center gap-3">
        {review.userAvatar ? (
          <img 
            src={review.userAvatar} 
            alt={review.userName} 
            className="w-12 h-12 rounded-full object-cover border-2 border-white ring-2 ring-[#fea619]" 
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-lg border-2 border-white ring-2 ring-[#fea619]">
            {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 text-sm md:text-base">{review.userName}</span>
          {review.departureDate && (
            <span className="text-[10px] md:text-xs text-gray-400 font-semibold mt-0.5">
              Chuyến đi: {formatDate(review.departureDate)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <RatingStars rating={review.overallRating} className="text-xs text-[#fea619]" />
        <span className="text-[10px] text-gray-400 font-medium">{formatDate(review.createdAt)}</span>
      </div>
    </div>
  );
}
