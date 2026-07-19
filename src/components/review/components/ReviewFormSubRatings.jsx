import React from 'react';

const RATING_FIELDS = [
  { key: 'guideRating', label: 'Hướng dẫn viên' },
  { key: 'sceneryRating', label: 'Cảnh quan thiên nhiên' },
  { key: 'safetyRating', label: 'Mức độ an toàn' },
  { key: 'valueRating', label: 'Đáng giá tiền' },
  { key: 'difficultyRating', label: 'Độ khó tour' },
  { key: 'equipmentRating', label: 'Thiết bị & Đồ thuê' },
];

export default function ReviewFormSubRatings({ subRatings, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        Đánh giá chi tiết từng phần
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RATING_FIELDS.map((f) => (
          <div key={f.key} className="flex justify-between items-center bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl">
            <span className="text-xs font-semibold text-gray-600">{f.label}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onChange(f.key, star)}
                  className={`text-base focus:outline-none ${
                    star <= subRatings[f.key] ? 'text-[#fea619]' : 'text-gray-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
