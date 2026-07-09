import React, { useState, useEffect, useCallback } from 'react';
import RatingStars from '../../components/common/RatingStars';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import * as reviewApi from '../../services/reviewApi';
import { useAuth } from '../../context/AuthContext';

export default function ReviewSection({ tourId, tourSlug }) {
  const { user } = useAuth();
  
  // State
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Load reviews list
  const loadReviews = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 0 : page;
      const res = await reviewApi.fetchReviewsByTour(tourId, {
        page: currentPage,
        size: 5,
        sortBy
      });

      if (res && res.content) {
        if (resetPage) {
          setReviews(res.content);
          setPage(0);
        } else {
          setReviews(prev => [...prev, ...res.content]);
        }
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách review:', err);
    } finally {
      setLoading(false);
    }
  }, [tourId, page, sortBy]);

  // Load summary statistics
  const loadSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const res = await reviewApi.fetchReviewSummary(tourId);
      if (res) {
        setSummary(res);
      }
    } catch (err) {
      console.error('Lỗi khi tải thống kê review:', err);
    } finally {
      setLoadingSummary(false);
    }
  }, [tourId]);

  // Initial load
  useEffect(() => {
    loadSummary();
    loadReviews(true);
  }, [tourId, sortBy]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleLoadMore = () => {
    if (page + 1 < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  // Triggers loadReviews with page counter updated
  useEffect(() => {
    if (page > 0) {
      loadReviews(false);
    }
  }, [page]);

  const handleReviewDeleted = (deletedId) => {
    setReviews(prev => prev.filter(r => r.id !== deletedId));
    loadSummary();
  };

  const handleReplyAdded = (updatedReview) => {
    setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
  };

  const handleReviewSuccess = () => {
    loadSummary();
    loadReviews(true);
  };

  // Calculations for progress bars
  const getRatingPercentage = (count) => {
    if (!summary || !summary.totalReviews) return 0;
    return Math.round((count / summary.totalReviews) * 100);
  };

  return (
    <div className="mt-10 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 bg-[#fea619] rounded-full"></span>
          <h2 className="font-montserrat font-bold text-xl md:text-2xl text-gray-800 m-0">Đánh Giá Từ Khách Hàng</h2>
        </div>

        {user && (
          <button
            onClick={() => setShowFormModal(true)}
            className="px-6 py-3 bg-[#fea619] hover:bg-[#012d1d] text-[#012d1d] hover:text-white font-extrabold text-xs rounded-full uppercase tracking-wider transition-all duration-300 shadow-md shadow-[#fea619]/20 active:scale-95 self-start sm:self-auto"
          >
            Viết Đánh Giá
          </button>
        )}
      </div>

      {/* Summary Statistics Card */}
      {summary && summary.totalReviews > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left: Overall score */}
          <div className="flex flex-col items-center justify-center text-center md:border-r md:border-gray-100 md:pr-8 md:min-w-[180px]">
            <span className="text-5xl font-extrabold text-[#012d1d] mb-2">
              {summary.avgOverallRating ? summary.avgOverallRating.toFixed(1) : '0.0'}
            </span>
            <div className="mb-2">
              <RatingStars rating={Math.round(summary.avgOverallRating || 0)} className="text-lg text-[#fea619]" />
            </div>
            <span className="text-xs text-gray-400 font-semibold">
              Dựa trên {summary.totalReviews} đánh giá
            </span>
          </div>

          {/* Center: Histogram distribution */}
          <div className="flex-grow flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary.ratingDistribution?.[stars] || 0;
              const percent = getRatingPercentage(count);
              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                  <span className="w-12 text-right flex items-center justify-end gap-1">
                    {stars} <span className="text-[#fea619]">★</span>
                  </span>
                  <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#fea619] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="w-10 text-left text-gray-400">{percent}%</span>
                </div>
              );
            })}
          </div>

          {/* Sub-ratings Breakdown grid */}
          <div className="w-full md:w-auto md:max-w-xs grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
            {[
              { label: 'HDV', val: summary.avgGuideRating },
              { label: 'Cảnh quan', val: summary.avgSceneryRating },
              { label: 'An toàn', val: summary.avgSafetyRating },
              { label: 'Đáng giá', val: summary.avgValueRating },
              { label: 'Độ khó', val: summary.avgDifficultyRating },
              { label: 'Đồ thuê', val: summary.avgEquipmentRating }
            ].map(item => item.val !== null && item.val !== undefined && (
              <div key={item.label} className="flex flex-col justify-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</span>
                <span className="text-sm font-extrabold text-gray-700 flex items-center gap-1">
                  <span className="text-[#fea619]">★</span> {item.val.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Sort bar */}
      {reviews.length > 0 && (
        <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-semibold text-gray-500">
          <span>Đánh giá từ du khách</span>
          <div className="flex items-center gap-2">
            <span>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-transparent border-none outline-none font-bold text-[#012d1d] cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="highest">Điểm cao nhất</option>
              <option value="lowest">Điểm thấp nhất</option>
              <option value="helpful">Hữu ích nhất</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              currentUserId={user?.userId}
              onReviewDeleted={handleReviewDeleted}
              onReplyAdded={handleReplyAdded}
            />
          ))
        ) : !loading ? (
          <div className="text-center py-12 px-6 bg-white border border-dashed border-gray-200 rounded-3xl">
            <span className="text-4xl block mb-2">💬</span>
            <h4 className="font-montserrat font-bold text-gray-700 mb-1">Chưa có đánh giá nào</h4>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Chưa có phản hồi nào cho tour này. Hãy đi tour và trở thành người đầu tiên chia sẻ cảm nhận!
            </p>
          </div>
        ) : null}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-6 text-sm text-gray-400 font-semibold animate-pulse">
          Đang tải đánh giá...
        </div>
      )}

      {/* Load More Button */}
      {!loading && page + 1 < totalPages && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2.5 bg-white border border-[#012d1d] hover:bg-[#012d1d] text-[#012d1d] hover:text-white font-bold text-xs rounded-full transition-all duration-300 active:scale-95"
          >
            Xem thêm đánh giá ({totalPages - page - 1} trang còn lại)
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <ReviewForm
          tourSlug={tourSlug}
          tourId={tourId}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
