import React from 'react';

const OrderSummary = ({ bookingId, amount, serviceName = "Tour Leo Núi Bạch Mã", duration = "2 ngày 1 đêm" }) => {
  return (
    <div className="flex-[0.8] p-6 sm:p-10 bg-slate-950/40 flex flex-col">
      <h3 className="text-lg sm:text-xl font-bold mb-5 text-slate-100">Tóm tắt đơn hàng</h3>
      <div className="h-px bg-white/10 my-4" />

      <div className="flex justify-between text-sm mb-3">
        <span className="text-slate-400">Dịch vụ</span>
        <span className="text-slate-200 font-semibold">{serviceName}</span>
      </div>
      <div className="flex justify-between text-sm mb-3">
        <span className="text-slate-400">Thời lượng</span>
        <span className="text-slate-200">{duration}</span>
      </div>
      <div className="flex justify-between text-sm mb-3">
        <span className="text-slate-400">Mã đặt chỗ</span>
        <span className="text-slate-200">#{bookingId}</span>
      </div>

      <div className="h-px bg-white/10 my-4" />

      <div className="flex justify-between text-sm mb-3 mt-2 items-center">
        <span className="text-slate-400">Tổng cộng</span>
        <span className="text-xl sm:text-2xl font-bold text-sky-400">
          {parseInt(amount || 0).toLocaleString("vi-VN")} VND
        </span>
      </div>

      <div className="mt-8 lg:mt-auto flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-400 text-[11px] sm:text-xs leading-relaxed">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="shrink-0 text-sky-400">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
        <span>Thanh toán của bạn được bảo mật tuyệt đối bởi SSL mã hóa.</span>
      </div>
    </div>
  );
};

export default OrderSummary;
