import React from 'react';

export default function ReviewFormStars({ value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        Đánh giá chung <span className="text-red-500">*</span>
      </label>
      <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-3.5 rounded-2xl">
        <span className="text-xs font-bold text-gray-500">Mức độ hài lòng</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                className={`text-xl transition-all duration-100 focus:outline-none ${
                  star <= value ? 'text-[#fea619] scale-110' : 'text-gray-200 hover:text-[#fea619]'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <span className="text-sm font-extrabold text-gray-700 ml-1">{value}/5</span>
        </div>
      </div>
    </div>
  );
}
