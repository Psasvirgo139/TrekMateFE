import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PaymentMethodOption from "./components/PaymentMethodOption";
import OrderSummary from "./components/OrderSummary";
import api from "../../services/api";

const Payment = () => {
  const location = useLocation();
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("PAYOS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.bookingId) {
      setBookingId(location.state.bookingId.toString());
    }
    if (location.state?.amount) {
      setAmount(location.state.amount.toString());
    }
  }, [location]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = method === "PAYOS"
        ? "/v1/payments/payos/create"
        : "/v1/payments";

      const response = await api.post(endpoint, {
        bookingId: parseInt(bookingId),
        amount: parseFloat(amount),
        paymentMethod: method,
      });

      const resData = response.data;

      if (response.status !== 200 || resData.code !== 200) {
        throw new Error(resData.message || "Đã xảy ra lỗi khi tạo thanh toán");
      }

      const data = resData.data;

      if (method === "PAYOS" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Yêu cầu thanh toán thủ công đã được gửi thành công!");
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại!";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] px-4 py-10 bg-[radial-gradient(circle_at_10%_20%,_rgb(18,28,36)_0%,_rgb(9,14,18)_100%)] text-slate-100 font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Form side */}
        <div className="flex-[1.3] p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/5">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent">
            Chọn phương thức thanh toán
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Hoàn tất thủ tục đặt chỗ của bạn một cách an toàn.
          </p>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handlePayment} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="bookingId" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mã đặt chỗ (Booking ID)
              </label>
              <input
                id="bookingId"
                type="number"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                required
                min="1"
                className="p-3.5 bg-slate-950/60 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="amount" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Số tiền thanh toán (VND)
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1000"
                disabled
                readOnly
                title="Giá tour được tính tự động, không thể chỉnh sửa"
                className="p-3.5 bg-slate-950/60 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <PaymentMethodOption
                methodId="PAYOS"
                title="PayOS (Chuyển khoản VietQR)"
                description="Quét mã QR Code bằng ứng dụng ngân hàng của bạn. Nhanh chóng & bảo mật."
                selected={method === "PAYOS"}
                onClick={() => setMethod("PAYOS")}
              />

              <PaymentMethodOption
                methodId="PAY_AT_COUNTER"
                title="Thanh toán tại quầy"
                description="Thanh toán trực tiếp bằng tiền mặt hoặc thẻ tại quầy lễ tân."
                selected={method === "PAY_AT_COUNTER"}
                onClick={() => setMethod("PAY_AT_COUNTER")}
              />

              <PaymentMethodOption
                methodId="BANK_TRANSFER"
                title="Chuyển khoản thủ công"
                description="Chuyển tiền vào tài khoản chỉ định và liên hệ Admin duyệt hóa đơn."
                selected={method === "BANK_TRANSFER"}
                onClick={() => setMethod("BANK_TRANSFER")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 p-4 bg-gradient-to-r from-sky-600 to-purple-600 border-none rounded-xl text-white text-base font-bold cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all hover:shadow-[0_8px_25px_rgba(2,132,199,0.35)] shadow-[0_4px_15px_rgba(2,132,199,0.2)] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <span className="w-5.5 h-5.5 border-3 border-white/30 rounded-full border-t-white animate-spin"></span>
              ) : (
                `Thanh toán ${parseInt(amount || 0).toLocaleString("vi-VN")} VND`
              )}
            </button>
          </form>
        </div>

        {/* Right Order Summary side */}
        <OrderSummary
          bookingId={bookingId}
          amount={amount}
          serviceName={location.state?.tourTitle}
          departureDate={location.state?.departureDate}
          bookingCode={location.state?.bookingCode}
        />
      </div>
    </div>
  );
};

export default Payment;
