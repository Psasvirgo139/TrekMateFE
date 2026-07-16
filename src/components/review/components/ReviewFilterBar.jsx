import React from 'react';

export default function ReviewFilterBar({ sortBy, onSortChange }) {
  return (
    <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-semibold text-gray-500">
      <span>Đánh giá từ du khách</span>
      <div className="flex items-center gap-2">
        <span>Sắp xếp:</span>
        <select
          value={sortBy}
          onChange={onSortChange}
          className="bg-transparent border-none outline-none font-bold text-[#012d1d] cursor-pointer"
        >
          <option value="newest">Mới nhất</option>
          <option value="highest">Điểm cao nhất</option>
          <option value="lowest">Điểm thấp nhất</option>
          <option value="helpful">Hữu ích nhất</option>
        </select>
      </div>
    </div>
  );
}
