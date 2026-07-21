import React, { useState } from 'react';
import * as reviewApi from '../../services/reviewApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ReviewHeader from './components/ReviewHeader';
import ReviewDetailRatings from './components/ReviewDetailRatings';
import ReviewPhotoGrid from './components/ReviewPhotoGrid';
import ReviewReplyBox from './components/ReviewReplyBox';
import ReviewActionFooter from './components/ReviewActionFooter';

// Shared date formatter utility
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

export default function ReviewCard({ review, currentUserId, onReviewDeleted, onReplyAdded }) {
  const { user } = useAuth();
  const { showToast, showConfirm, showAuthModal } = useToast();
  const [isHelpful, setIsHelpful] = useState(review.isHelpfulByCurrentUser || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const isGuideOrAdmin = user?.roles?.includes('GUIDE') || user?.roles?.includes('ADMIN');
  const isOwner = user && currentUserId && currentUserId === review.userId;
  const isAdmin = user?.roles?.includes('ADMIN');

  const handleHelpfulClick = async () => {
    if (!currentUserId) {
      showAuthModal({
        title: 'Authentication Required',
        message: 'Please log in to your TrekMate account to mark this review as helpful!',
      });
      return;
    }
    try {
      await reviewApi.toggleHelpful(review.id);
      const nextState = !isHelpful;
      setIsHelpful(nextState);
      setHelpfulCount(nextState ? helpfulCount + 1 : helpfulCount - 1);
      showToast(nextState ? 'Thank you for your helpful feedback!' : 'Removed helpful mark.', 'success');
    } catch (err) {
      console.error('Error voting helpful:', err);
      showToast('Failed to update helpful feedback.', 'error');
    }
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      confirmText: 'Delete Now',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await reviewApi.deleteReview(review.id);
          showToast('Review deleted successfully!', 'success');
          if (onReviewDeleted) onReviewDeleted(review.id);
        } catch (err) {
          console.error('Error deleting review:', err);
          showToast(err.response?.data?.message || 'Failed to delete this review.', 'error');
        }
      },
    });
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      const updatedReview = await reviewApi.replyToReview(review.id, { guideReply: replyText });
      setIsReplying(false);
      setReplyText('');
      showToast('Reply submitted successfully!', 'success');
      if (onReplyAdded) onReplyAdded(updatedReview);
    } catch (err) {
      console.error('Error replying to review:', err);
      showToast(err.response?.data?.message || 'Failed to submit reply.', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <ReviewHeader review={review} formatDate={formatDate} />

      <ReviewDetailRatings review={review} />

      <div className="space-y-1 mb-4">
        {review.title && <h4 className="font-montserrat font-bold text-gray-800 text-sm md:text-base">{review.title}</h4>}
        <p className="text-gray-600 text-xs md:text-sm leading-relaxed whitespace-pre-line">
          {review.comment || 'Không có bình luận chi tiết.'}
        </p>
      </div>

      <ReviewPhotoGrid photos={review.photos} />

      <ReviewReplyBox
        guideReply={review.guideReply}
        guideRepliedAt={review.guideRepliedAt}
        formatDate={formatDate}
      />

      <ReviewActionFooter
        isHelpful={isHelpful}
        helpfulCount={helpfulCount}
        onHelpfulClick={handleHelpfulClick}
        isReplying={isReplying}
        setIsReplying={setIsReplying}
        replyText={replyText}
        setReplyText={setReplyText}
        submittingReply={submittingReply}
        onReplySubmit={handleReplySubmit}
        canReply={isGuideOrAdmin && !review.guideReply}
        canDelete={isOwner || isAdmin}
        onDelete={handleDelete}
      />
    </div>
  );
}
