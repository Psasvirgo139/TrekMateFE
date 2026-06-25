import React from 'react';

export default function CancelBookingModal({
  show,
  onClose,
  onSubmit,
  cancelReason,
  onChangeReason,
  cancelling,
  cancelError
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h4 className="font-extrabold text-[#012d1d] text-base">Xác nhận hủy đặt tour</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="px-6 py-5">
            <p className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4 leading-relaxed">
              ⚠️ <strong>Lưu ý:</strong> Việc hủy tour có thể chịu phí dịch vụ hoặc không được hoàn tiền theo điều khoản hợp đồng tùy thuộc vào thời gian hủy của bạn.
            </p>

            {cancelError && (
              <div className="bg-red-50 text-red-700 text-sm font-semibold rounded-lg px-4 py-2.5 mb-4">
                {cancelError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="reason" className="text-sm font-bold text-[#012d1d]">
                Lý do hủy tour <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                rows={4}
                placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy chuyến đi này..."
                value={cancelReason}
                onChange={(e) => onChangeReason(e.target.value)}
                required
                className="border border-gray-200 focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/10 rounded-lg px-3 py-2.5 text-sm font-[inherit] resize-y outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={cancelling}
              className="text-sm font-bold px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-all"
            >
              Không, giữ lại
            </button>
            <button
              type="submit"
              disabled={cancelling || !cancelReason.trim()}
              className="text-sm font-bold px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {cancelling ? "Đang xử lý hủy..." : "Xác nhận hủy chuyến"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
