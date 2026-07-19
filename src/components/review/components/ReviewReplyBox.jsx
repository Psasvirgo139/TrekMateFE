import React from 'react';

export default function ReviewReplyBox({ guideReply, guideRepliedAt, formatDate }) {
  if (!guideReply) return null;

  return (
    <div className="bg-emerald-50/70 border-l-4 border-emerald-600 rounded-2xl p-4 mt-4 space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-emerald-800 flex items-center gap-1">
          💬 Phản hồi từ Hướng dẫn viên
        </span>
        {guideRepliedAt && (
          <span className="text-emerald-500 font-semibold">{formatDate(guideRepliedAt)}</span>
        )}
      </div>
      <p className="text-emerald-700 text-xs md:text-sm leading-relaxed">{guideReply}</p>
    </div>
  );
}
