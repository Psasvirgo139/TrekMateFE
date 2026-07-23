import React, { useState, useEffect } from 'react';

export default function TourGallerySection({
  images,
  newImgData,
  onChangeNewImgData,
  onAddImage,
  onDeleteImage
}) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!newImgData.imageUrl) {
      setErrors({});
    }
  }, [newImgData.imageUrl]);

  const handleUrlChange = (e) => {
    onChangeNewImgData({ ...newImgData, imageUrl: e.target.value });
    if (errors.imageUrl) {
      setErrors({ ...errors, imageUrl: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newImgData.imageUrl || !newImgData.imageUrl.trim()) {
      newErrors.imageUrl = "Image URL is required";
    } else {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
      if (!urlPattern.test(newImgData.imageUrl.trim())) {
        newErrors.imageUrl = "Please enter a valid URL";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onAddImage(e);
  };
  return (
    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Image list grid */}
        <div className="lg:col-span-8 lg:border-r border-gray-200 lg:pr-6">
          <h3 className="font-montserrat font-bold text-lg text-[#012d1d] mb-4">Image Collection</h3>
          
          {images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-2">🖼️</span>
              <p className="text-sm">No images stored for this tour yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((img) => (
                <div key={img.id} className={`bg-white rounded-xl border overflow-hidden flex flex-col shadow-sm transition-all ${img.isCover ? 'border-[#fea619] ring-2 ring-[#fea619]/10' : 'border-gray-200'}`}>
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <img 
                      src={img.imageUrl} 
                      alt={img.caption || 'Tour media'} 
                      className="w-full h-full object-cover" 
                    />
                    {img.isCover && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold bg-[#fea619] text-white rounded uppercase tracking-wider">
                        Main Cover
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-grow">
                    <p className="font-semibold text-xs text-gray-800 line-clamp-1 mb-3">{img.caption || 'No caption'}</p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                      <span className="px-2 py-0.5 bg-gray-100 border text-gray-500 rounded text-[10px] font-semibold">Order: {img.sortOrder}</span>
                      <button 
                        type="button" 
                        onClick={() => onDeleteImage(img.id)}
                        className="text-red-600 hover:text-red-700 font-bold transition-all text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add image form */}
        <div className="lg:col-span-4 lg:pl-4 space-y-4">
          <h3 className="font-montserrat font-bold text-lg text-[#012d1d]">Add New Image</h3>
          <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image URL *</label>
              <input 
                type="text" 
                placeholder="https://example.com/trekking-photo.webp"
                value={newImgData.imageUrl}
                onChange={handleUrlChange}
                className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all bg-white ${
                  errors.imageUrl 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#012d1d]'
                }`}
              />
              {errors.imageUrl && (
                <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.imageUrl}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Caption</label>
              <input 
                type="text" 
                placeholder="Sunset view from the ridge..."
                value={newImgData.caption}
                onChange={(e) => onChangeNewImgData({...newImgData, caption: e.target.value})}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Alt Text</label>
              <input 
                type="text" 
                placeholder="Descriptive alt text for SEO..."
                value={newImgData.altText}
                onChange={(e) => onChangeNewImgData({...newImgData, altText: e.target.value})}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Display Order</label>
                <input 
                  type="number" 
                  min="1" 
                  value={newImgData.sortOrder}
                  onChange={(e) => onChangeNewImgData({...newImgData, sortOrder: parseInt(e.target.value) || 1})}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/20 transition-all bg-white"
                />
              </div>
              <div className="flex items-end pb-2.5">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-800 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={newImgData.isCover}
                    onChange={(e) => onChangeNewImgData({...newImgData, isCover: e.target.checked})}
                    className="w-4 h-4 text-[#012d1d] border-gray-300 rounded focus:ring-[#012d1d]"
                  />
                  <span>Cover Image</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#012d1d] hover:bg-[#0c432d] text-white font-bold py-2.5 rounded-lg text-sm transition-all mt-4 shadow-sm"
            >
              Add to Gallery
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
