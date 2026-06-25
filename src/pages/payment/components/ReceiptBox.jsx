import React from 'react';

const ReceiptBox = ({ orderCode, bookingId, paymentMethod, amount }) => {
  return (
    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 mb-8 text-left">
      <h3 className="text-base font-bold mb-4 text-slate-100 border-b border-white/10 pb-2.5">
        Chi tiết giao dịch
      </h3>
      <div className="flex justify-between text-sm mb-3">
        <span className="text-slate-400">Mã giao dịch</span>
        <span className="text-slate-200 font-semibold">#{orderCode}</span>
      </div>
      <div className="flex justify-between text-sm mb-3">
        <span className="text-slate-400">Mã đặt chỗ (Booking)</span>
        <span className="text-slate-200">#{bookingId}</span>
      </div>
      <div className="flex justify-between text-sm mb-3">
        <span className="text-slate-400">Phương thức</span>
        <span className="text-slate-200">{paymentMethod}</span>
      </div>
      <div className="flex justify-between text-sm mb-3 last:mb-0">
        <span className="text-slate-400">Số tiền</span>
        <span className="text-sky-400 font-bold">
          {parseFloat(amount || 0).toLocaleString("vi-VN")} VND
        </span>
      </div>
    </div>
  );
};

export default ReceiptBox;
