import React from 'react';

export default function ReviewActionFooter({
  isHelpful,
  helpfulCount,
  onHelpfulClick,
  isReplying,
  setIsReplying,
  replyText,
  setReplyText,
  submittingReply,
  onReplySubmit,
  canReply,
  canDelete,
  onDelete,
}) {
  return (
    <>
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
        <button
          onClick={onHelpfulClick}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 focus:outline-none ${
            isHelpful
              ? 'bg-[#fea619] border-[#fea619] text-white shadow-sm shadow-[#fea619]/25'
              : 'border-gray-200 text-gray-500 hover:border-[#fea619] hover:text-[#fea619]'
          }`}
        >
          👍 Hữu ích ({helpfulCount})
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          {canReply && !isReplying && (
            <button
              onClick={() => setIsReplying(true)}
              className="text-[#012d1d] hover:underline"
            >
              Phản hồi
            </button>
          )}
          {canDelete && (
            <button onClick={onDelete} className="text-red-500 hover:underline">
              Xóa đánh giá
            </button>
          )}
        </div>
      </div>

      {isReplying && (
        <form onSubmit={onReplySubmit} className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            className="w-full border border-gray-200 rounded-2xl p-3 text-xs md:text-sm focus:outline-none focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] transition-all resize-none min-h-[80px]"
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
    </>
  );
}
