import React from 'react';

export default function RatingStars({ rating = 0, className = "text-base" }) {
  const stars = [];
  const rounded = Math.round(parseFloat(rating || 0));
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i} 
        className={i <= rounded ? `text-[#fea619] ${className}` : `text-gray-300 ${className}`}
      >
        {i <= rounded ? "★" : "☆"}
      </span>
    );
  }

  return <div className="flex gap-0.5">{stars}</div>;
}
