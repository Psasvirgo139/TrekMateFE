import React from 'react';

export default function ReviewFormPhotoUrls({ photoUrls, onAdd, onRemove, onChange }) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
        Liên kết hình ảnh (Tùy chọn)
      </label>
      <div className="space-y-2">
        {photoUrls.map((url, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => onChange(idx, e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-grow border border-gray-200 focus:border-[#fea619] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
            />
            {photoUrls.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-lg font-bold transition-all focus:outline-none"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="self-start text-[11px] font-bold text-[#012d1d] hover:text-[#fea619] transition-all bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl"
      >
        + Thêm liên kết ảnh
      </button>
    </div>
  );
}
