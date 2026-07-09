import React, { useState, useEffect, useCallback } from 'react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import ReviewSummaryCard from './components/ReviewSummaryCard';
import ReviewFilterBar from './components/ReviewFilterBar';
import * as reviewApi from '../../services/reviewApi';
import { useAuth } from '../../context/AuthContext';

export default function ReviewSection({ tourId, tourSlug }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadReviews = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 0 : page;
      const res = await reviewApi.fetchReviewsByTour(tourId, { page: currentPage, size: 5, sortBy });
      if (res?.content) {
        setReviews((prev) => resetPage ? res.content : [...prev, ...res.content]);
        if (resetPage) setPage(0);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Lỗi khi tải review:', err);
    } finally {
      setLoading(false);
    }
  }, [tourId, page, sortBy]);

  const loadSummary = useCallback(async () => {
    try {
      const res = await reviewApi.fetchReviewSummary(tourId);
      if (res) setSummary(res);
    } catch (err) {
      console.error('Lỗi khi tải thống kê review:', err);
    }
  }, [tourId]);

  useEffect(() => {
    loadSummary();
    loadReviews(true);
  }, [tourId, sortBy]);

  useEffect(() => {
    if (page > 0) loadReviews(false);
  }, [page]);

  return (
    <div className="mt-10 font-sans space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 bg-[#fea619] rounded-full" />
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

      <ReviewSummaryCard summary={summary} />

      {reviews.length > 0 && (
        <ReviewFilterBar sortBy={sortBy} onSortChange={(e) => setSortBy(e.target.value)} />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              currentUserId={user?.userId}
              onReviewDeleted={(id) => {
                setReviews((prev) => prev.filter((r) => r.id !== id));
                loadSummary();
              }}
              onReplyAdded={(updated) =>
                setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
              }
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

      {loading && (
        <div className="text-center py-6 text-sm text-gray-400 font-semibold animate-pulse">Đang tải đánh giá...</div>
      )}

      {!loading && page + 1 < totalPages && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2.5 bg-white border border-[#012d1d] hover:bg-[#012d1d] text-[#012d1d] hover:text-white font-bold text-xs rounded-full transition-all duration-300 active:scale-95"
          >
            Xem thêm đánh giá ({totalPages - page - 1} trang còn lại)
          </button>
        </div>
      )}

      {showFormModal && (
        <ReviewForm
          tourSlug={tourSlug}
          tourId={tourId}
          onClose={() => setShowFormModal(false)}
          onSuccess={() => { loadSummary(); loadReviews(true); }}
        />
      )}
    </div>
  );
}
