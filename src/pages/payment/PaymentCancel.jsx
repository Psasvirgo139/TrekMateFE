import React from "react";
import { Link } from "react-router-dom";
import PaymentStatusCard from "./components/PaymentStatusCard";

const PaymentCancel = () => {
  return (
    <PaymentStatusCard
      type="cancel"
      title="Giao dịch đã bị hủy"
      description="Bạn đã hủy yêu cầu thanh toán trên cổng PayOS. Đặt chỗ của bạn vẫn đang ở trạng thái chờ."
      actions={
        <>
          <Link
            to="/payment"
            className="p-3.5 rounded-xl text-sm sm:text-base font-bold transition-all text-center bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(2,132,199,0.2)] hover:shadow-[0_8px_25px_rgba(2,132,199,0.35)] filter hover:brightness-110"
          >
            Thanh toán lại
          </Link>
          <Link
            to="/"
            className="p-3.5 rounded-xl text-sm sm:text-base font-bold transition-all text-center bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:text-white"
          >
            Quay lại trang chủ
          </Link>
        </>
      }
    />
  );
};

export default PaymentCancel;
