import React, { useState } from 'react';

export default function ReviewPhotoGrid({ photos }) {
  const [lightboxImg, setLightboxImg] = useState(null);

  if (!photos || photos.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {photos.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Review attachment ${idx + 1}`}
            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover cursor-pointer hover:scale-105 transition-all duration-300 border border-gray-100 shadow-sm"
            onClick={() => setLightboxImg(url)}
          />
        ))}
      </div>

      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Fullscreen Preview"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-fade-in"
          />
        </div>
      )}
    </>
  );
}
