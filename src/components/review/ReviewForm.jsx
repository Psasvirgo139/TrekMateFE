import React, { useState, useEffect } from 'react';
import * as bookingApi from '../../services/bookingApi';
import * as reviewApi from '../../services/reviewApi';

const RATING_FIELDS = [
  { key: 'guideRating', label: 'Hướng dẫn viên' },
  { key: 'sceneryRating', label: 'Cảnh quan thiên nhiên' },
  { key: 'safetyRating', label: 'Mức độ an toàn' },
  { key: 'valueRating', label: 'Đáng giá tiền' },
  { key: 'difficultyRating', label: 'Độ khó tour' },
  { key: 'equipmentRating', label: 'Thiết bị & Đồ thuê' }
];

export default function ReviewForm({ tourSlug, onClose, onSuccess }) {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  
  // Rating states
  const [overallRating, setOverallRating] = useState(5);
  const [subRatings, setSubRatings] = useState({
    guideRating: 5,
    sceneryRating: 5,
    safetyRating: 5,
    valueRating: 5,
    difficultyRating: 3,
    equipmentRating: 5
  });

  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photoUrls, setPhotoUrls] = useState(['']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadEligibleBookings = async () => {
      try {
        setLoadingBookings(true);
        const res = await bookingApi.fetchMyBookings({ page: 0, size: 100 });
        if (res && res.data && res.data.content) {
          const eligible = res.data.content.filter(
            b => b.tourSlug === tourSlug && b.status === 'COMPLETED'
          );
          setBookings(eligible);
          if (eligible.length > 0) {
            setSelectedBookingId(eligible[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách booking:', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    loadEligibleBookings();
  }, [tourSlug]);

  const handleSubRatingChange = (field, val) => {
    setSubRatings(prev => ({ ...prev, [field]: val }));
  };

  const handleAddPhotoUrl = () => {
    setPhotoUrls([...photoUrls, '']);
  };

  const handleRemovePhotoUrl = (index) => {
    const updated = photoUrls.filter((_, idx) => idx !== index);
    setPhotoUrls(updated.length === 0 ? [''] : updated);
  };

  const handlePhotoUrlChange = (index, val) => {
    const updated = [...photoUrls];
    updated[index] = val;
    setPhotoUrls(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setErrorMsg('Bạn chưa chọn chuyến đi đã hoàn thành để đánh giá.');
      return;
    }
    
    setErrorMsg('');
    setSubmitting(true);

    const payload = {
      bookingId: parseInt(selectedBookingId),
      overallRating,
      ...subRatings,
      title: title.trim() || undefined,
      comment: comment.trim() || undefined,
      photos: photoUrls.filter(url => url.trim() !== ''),
      isAnonymous
    };

    try {
      await reviewApi.createReview(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu đánh giá:', err);
      const backendMsg = err.response?.data?.message;
      if (backendMsg === 'REVIEW_ALREADY_EXISTS' || err.response?.data?.code === 409) {
        setErrorMsg('Bạn đã gửi đánh giá cho chuyến đi này rồi.');
      } else {
        setErrorMsg(backendMsg || 'Đã có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-fade-in border border-gray-100">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-montserrat font-bold text-gray-800 text-base md:text-lg">Viết Đánh Giá Chuyến Đi</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors text-lg font-bold">
            &times;
          </button>
        </div>

        {loadingBookings ? (
          <div className="p-10 text-center text-xs font-semibold text-gray-400 animate-pulse">
            Đang tải dữ liệu chuyến đi...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <span className="text-4xl mb-3">🏔️</span>
            <p className="font-bold text-gray-700 mb-1 text-sm md:text-base">Không có chuyến đi hoàn thành</p>
            <p className="text-xs text-gray-400 max-w-xs mb-6">
              Bạn chỉ có thể đánh giá tour sau khi chuyến đi của bạn được xác nhận hoàn thành (Completed) bởi TrekMate.
            </p>
            <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs font-bold transition-all">
              Quay lại
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 text-left">
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-2xl text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Select booking */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Chọn chuyến đi của bạn <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#fea619] transition-all bg-white"
                required
              >
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    Mã: {b.bookingCode} (Khởi hành: {new Date(b.departureDate).toLocaleDateString('vi-VN')})
                  </option>
                ))}
              </select>
            </div>

            {/* Overall Rating */}
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
                        onClick={() => setOverallRating(star)}
                        className={`text-xl transition-all duration-100 focus:outline-none ${
                          star <= overallRating ? 'text-[#fea619] scale-110' : 'text-gray-200 hover:text-[#fea619]'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-extrabold text-gray-700 ml-1">
                    {overallRating}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-ratings Breakdown grid */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Đánh giá chi tiết từng phần
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RATING_FIELDS.map(f => (
                  <div key={f.key} className="flex justify-between items-center bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl">
                    <span className="text-xs font-semibold text-gray-600">{f.label}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleSubRatingChange(f.key, star)}
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

            {/* Title */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tiêu đề đánh giá</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Tour rất thú vị, HDV nhiệt tình!"
                className="w-full border border-gray-200 focus:border-[#fea619] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                maxLength={200}
              />
            </div>

            {/* Comment */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Nội dung bình luận <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập cảm nhận chi tiết của bạn về cung đường, cảnh quan, đồ ăn..."
                className="w-full border border-gray-200 focus:border-[#fea619] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all resize-none min-h-[100px]"
                required
              />
            </div>

            {/* Photo URLs List */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Liên kết hình ảnh (Tùy chọn)</label>
              <div className="space-y-2">
                {photoUrls.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handlePhotoUrlChange(idx, e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-grow border border-gray-200 focus:border-[#fea619] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                    {photoUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhotoUrl(idx)}
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
                onClick={handleAddPhotoUrl}
                className="self-start text-[11px] font-bold text-[#012d1d] hover:text-[#fea619] transition-all bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl"
              >
                + Thêm liên kết ảnh
              </button>
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-2xl cursor-pointer select-none">
              <label className="flex items-center gap-3 cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#012d1d] relative"></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">Viết đánh giá ẩn danh</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Tên của bạn sẽ hiển thị dưới dạng "Ẩn danh"</span>
                </div>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full text-xs font-bold transition-all"
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#fea619] hover:bg-[#012d1d] text-[#012d1d] hover:text-white rounded-full text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-[#fea619]/10 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
