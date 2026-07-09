import React, { useState, useEffect } from 'react';
import * as bookingApi from '../../services/bookingApi';
import * as reviewApi from '../../services/reviewApi';
import ReviewFormStars from './components/ReviewFormStars';
import ReviewFormSubRatings from './components/ReviewFormSubRatings';
import ReviewFormPhotoUrls from './components/ReviewFormPhotoUrls';

export default function ReviewForm({ tourSlug, onClose, onSuccess }) {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [subRatings, setSubRatings] = useState({
    guideRating: 5, sceneryRating: 5, safetyRating: 5,
    valueRating: 5, difficultyRating: 3, equipmentRating: 5,
  });
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photoUrls, setPhotoUrls] = useState(['']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingBookings(true);
        const res = await bookingApi.fetchMyBookings({ page: 0, size: 100 });
        if (res?.data?.content) {
          const eligible = res.data.content.filter(
            (b) => b.tourSlug === tourSlug && b.status === 'COMPLETED'
          );
          setBookings(eligible);
          if (eligible.length > 0) setSelectedBookingId(eligible[0].id.toString());
        }
      } catch (err) {
        console.error('Lỗi khi tải booking:', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    load();
  }, [tourSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setErrorMsg('Bạn chưa chọn chuyến đi đã hoàn thành để đánh giá.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await reviewApi.createReview({
        bookingId: parseInt(selectedBookingId),
        overallRating,
        ...subRatings,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        photos: photoUrls.filter((u) => u.trim() !== ''),
        isAnonymous,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const backendMsg = err.response?.data?.message;
      if (backendMsg === 'REVIEW_ALREADY_EXISTS' || err.response?.data?.code === 409) {
        setErrorMsg('Bạn đã gửi đánh giá cho chuyến đi này rồi.');
      } else {
        setErrorMsg(backendMsg || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-fade-in border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-montserrat font-bold text-gray-800 text-base md:text-lg">Viết Đánh Giá Chuyến Đi</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors text-lg font-bold">
            &times;
          </button>
        </div>

        {loadingBookings ? (
          <div className="p-10 text-center text-xs font-semibold text-gray-400 animate-pulse">Đang tải dữ liệu chuyến đi...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <span className="text-4xl mb-3">🏔️</span>
            <p className="font-bold text-gray-700 mb-1 text-sm md:text-base">Không có chuyến đi hoàn thành</p>
            <p className="text-xs text-gray-400 max-w-xs mb-6">
              Bạn chỉ có thể đánh giá tour sau khi chuyến đi được xác nhận hoàn thành bởi TrekMate.
            </p>
            <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs font-bold transition-all">
              Quay lại
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 text-left">
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-2xl text-xs font-bold">⚠️ {errorMsg}</div>
            )}

            {/* Select Booking */}
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
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    Mã: {b.bookingCode} (Khởi hành: {new Date(b.departureDate).toLocaleDateString('vi-VN')})
                  </option>
                ))}
              </select>
            </div>

            <ReviewFormStars value={overallRating} onChange={setOverallRating} />
            <ReviewFormSubRatings
              subRatings={subRatings}
              onChange={(key, val) => setSubRatings((prev) => ({ ...prev, [key]: val }))}
            />

            {/* Title */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tiêu đề đánh giá</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
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
                value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập cảm nhận chi tiết của bạn về cung đường, cảnh quan..."
                className="w-full border border-gray-200 focus:border-[#fea619] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all resize-none min-h-[100px]"
                required
              />
            </div>

            <ReviewFormPhotoUrls
              photoUrls={photoUrls}
              onAdd={() => setPhotoUrls([...photoUrls, ''])}
              onRemove={(idx) => {
                const u = photoUrls.filter((_, i) => i !== idx);
                setPhotoUrls(u.length === 0 ? [''] : u);
              }}
              onChange={(idx, val) => {
                const u = [...photoUrls];
                u[idx] = val;
                setPhotoUrls(u);
              }}
            />

            {/* Anonymous toggle */}
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-2xl cursor-pointer select-none">
              <label className="flex items-center gap-3 cursor-pointer w-full">
                <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#012d1d] relative"></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">Viết đánh giá ẩn danh</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Tên của bạn sẽ hiển thị dưới dạng "Ẩn danh"</span>
                </div>
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} disabled={submitting} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full text-xs font-bold transition-all">
                Hủy bỏ
              </button>
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-[#fea619] hover:bg-[#012d1d] text-[#012d1d] hover:text-white rounded-full text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-[#fea619]/10 disabled:opacity-50">
                {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
