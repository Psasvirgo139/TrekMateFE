import React, { useState } from 'react';
import RatingStars from '../../components/common/RatingStars';
import * as reviewApi from '../../services/reviewApi';
import { useAuth } from '../../context/AuthContext';

export default function ReviewCard({ review, currentUserId, onReviewDeleted, onReplyAdded }) {
  const { user } = useAuth();
  const [isHelpful, setIsHelpful] = useState(review.isHelpfulByCurrentUser || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showDetailRatings, setShowDetailRatings] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleHelpfulClick = async () => {
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để đánh giá tính hữu ích!');
      return;
    }
    try {
      await reviewApi.toggleHelpful(review.id);
      setIsHelpful(!isHelpful);
      setHelpfulCount(isHelpful ? helpfulCount - 1 : helpfulCount + 1);
    } catch (err) {
      console.error('Lỗi khi vote hữu ích:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return;
    try {
      await reviewApi.deleteReview(review.id);
      if (onReviewDeleted) onReviewDeleted(review.id);
    } catch (err) {
      console.error('Lỗi khi xóa đánh giá:', err);
      alert('Không thể xóa đánh giá này.');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const updatedReview = await reviewApi.replyToReview(review.id, {
        guideReply: replyText,
      });
      setIsReplying(false);
      setReplyText('');
      if (onReplyAdded) onReplyAdded(updatedReview);
    } catch (err) {
      console.error('Lỗi khi phản hồi đánh giá:', err);
      alert('Không thể gửi phản hồi.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Auth checking
  const isGuideOrAdmin = user && user.roles && (user.roles.includes('GUIDE') || user.roles.includes('ADMIN'));
  const isOwner = user && currentUserId && currentUserId === review.userId;
  const isAdmin = user && user.roles && user.roles.includes('ADMIN');

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          {review.userAvatar ? (
            <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-full object-cover border-2 border-white ring-2 ring-[#fea619]" />
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

      {/* Collapsible Sub-ratings */}
      {(review.guideRating || review.sceneryRating || review.safetyRating || review.valueRating || review.difficultyRating || review.equipmentRating) && (
        <div className="mb-3">
          <button
            onClick={() => setShowDetailRatings(!showDetailRatings)}
            className="text-xs font-bold text-[#012d1d] hover:text-[#fea619] transition-colors flex items-center gap-1 focus:outline-none"
          >
            {showDetailRatings ? '▼ Ẩn điểm chi tiết' : '▶ Xem điểm chi tiết'}
          </button>

          {showDetailRatings && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 p-3 bg-gray-50 rounded-2xl text-[11px] font-semibold text-gray-500 border border-gray-100">
              {review.guideRating && (
                <span>HDV: <span className="text-[#fea619] font-bold">{review.guideRating}/5 ★</span></span>
              )}
              {review.sceneryRating && (
                <span>Cảnh quan: <span className="text-[#fea619] font-bold">{review.sceneryRating}/5 ★</span></span>
              )}
              {review.safetyRating && (
                <span>An toàn: <span className="text-[#fea619] font-bold">{review.safetyRating}/5 ★</span></span>
              )}
              {review.valueRating && (
                <span>Đáng giá: <span className="text-[#fea619] font-bold">{review.valueRating}/5 ★</span></span>
              )}
              {review.difficultyRating && (
                <span>Độ khó: <span className="text-[#fea619] font-bold">{review.difficultyRating}/5 ★</span></span>
              )}
              {review.equipmentRating && (
                <span>Thiết bị: <span className="text-[#fea619] font-bold">{review.equipmentRating}/5 ★</span></span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Review Content */}
      <div className="space-y-1 mb-4">
        {review.title && <h4 className="font-montserrat font-bold text-gray-800 text-sm md:text-base">{review.title}</h4>}
        <p className="text-gray-600 text-xs md:text-sm leading-relaxed whitespace-pre-line">
          {review.comment || 'Không có bình luận chi tiết.'}
        </p>
      </div>

      {/* Photo Grid */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.photos.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Review attachment ${idx + 1}`}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover cursor-pointer hover:scale-105 transition-all duration-300 border border-gray-100 shadow-sm"
              onClick={() => setLightboxImg(url)}
            />
          ))}
        </div>
      )}

      {/* Guide Reply Display */}
      {review.guideReply && (
        <div className="bg-emerald-50/70 border-l-4 border-emerald-600 rounded-2xl p-4 mt-4 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              💬 Phản hồi từ Hướng dẫn viên
            </span>
            {review.guideRepliedAt && (
              <span className="text-emerald-500 font-semibold">{formatDate(review.guideRepliedAt)}</span>
            )}
          </div>
          <p className="text-emerald-700 text-xs md:text-sm leading-relaxed">{review.guideReply}</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
        <button
          onClick={handleHelpfulClick}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 focus:outline-none ${
            isHelpful
              ? 'bg-[#fea619] border-[#fea619] text-white shadow-sm shadow-[#fea619]/25'
              : 'border-gray-200 text-gray-500 hover:border-[#fea619] hover:text-[#fea619]'
          }`}
        >
          👍 Hữu ích ({helpfulCount})
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          {isGuideOrAdmin && !review.guideReply && !isReplying && (
            <button
              onClick={() => setIsReplying(true)}
              className="text-[#012d1d] hover:underline"
            >
              Phản hồi
            </button>
          )}

          {(isOwner || isAdmin) && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:underline"
            >
              Xóa đánh giá
            </button>
          )}
        </div>
      </div>

      {/* Guide Reply Input Form */}
      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            className="w-full border border-gray-200 rounded-2xl p-3 text-xs md:text-sm focus:outline-none focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] transition-all resize-none min-height-[80px]"
            maxLength={2000}
            required
          />
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsReplying(false)}
              className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submittingReply}
              className="px-4 py-1.5 bg-[#012d1d] text-white rounded-xl hover:bg-[#083e29] font-bold disabled:opacity-50"
            >
              {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
          </div>
        </form>
      )}

      {/* Photo Lightbox */}
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
    </div>
  );
}
