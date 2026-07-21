import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";
import { useToast } from "../context/ToastContext";

const Payment = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [bookingId, setBookingId] = useState("1");
  const [amount, setAmount] = useState("250000");
  const [method, setMethod] = useState("PAYOS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = method === "PAYOS"
        ? "http://localhost:8080/api/v1/payments/payos/create"
        : "http://localhost:8080/api/v1/payments";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: parseInt(bookingId),
          amount: parseFloat(amount),
          paymentMethod: method,
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.code !== 200) {
        throw new Error(resData.message || "An error occurred while creating the payment");
      }

      const data = resData.data;

      if (method === "PAYOS" && data.checkoutUrl) {
        // Redirect to PayOS checkout page
        window.location.href = data.checkoutUrl;
      } else {
        // Manual payment success redirect
        showToast("Payment request submitted successfully!", "success");
        setTimeout(() => navigate('/bookings'), 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to connect to the server. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-left">
          <h2>Chọn phương thức thanh toán</h2>
          <p className="payment-subtitle">Hoàn tất thủ tục đặt chỗ của bạn một cách an toàn.</p>

          {error && <div className="payment-error-alert">{error}</div>}

          <form onSubmit={handlePayment} className="payment-form">
            <div className="form-group">
              <label htmlFor="bookingId">Mã đặt chỗ (Booking ID)</label>
              <input
                id="bookingId"
                type="number"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Số tiền thanh toán (VND)</label>
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
              />
            </div>

            <div className="payment-methods-grid">
              <div
                className={`method-option-card ${method === "PAYOS" ? "selected" : ""}`}
                onClick={() => setMethod("PAYOS")}
              >
                <div className="method-radio">
                  <div className="radio-inner" />
                </div>
                <div className="method-details">
                  <span className="method-title">PayOS (Chuyển khoản VietQR)</span>
                  <span className="method-desc">Quét mã QR Code bằng ứng dụng ngân hàng của bạn. Nhanh chóng & bảo mật.</span>
                </div>
              </div>

              <div
                className={`method-option-card ${method === "PAY_AT_COUNTER" ? "selected" : ""}`}
                onClick={() => setMethod("PAY_AT_COUNTER")}
              >
                <div className="method-radio">
                  <div className="radio-inner" />
                </div>
                <div className="method-details">
                  <span className="method-title">Thanh toán tại quầy</span>
                  <span className="method-desc">Thanh toán trực tiếp bằng tiền mặt hoặc thẻ tại quầy lễ tân.</span>
                </div>
              </div>

              <div
                className={`method-option-card ${method === "BANK_TRANSFER" ? "selected" : ""}`}
                onClick={() => setMethod("BANK_TRANSFER")}
              >
                <div className="method-radio">
                  <div className="radio-inner" />
                </div>
                <div className="method-details">
                  {/* <span className="method-title">Chuyển khoản thủ công</span> */}
                  <span className="method-desc">Chuyển tiền vào tài khoản chỉ định và liên hệ Admin duyệt hóa đơn.</span>
                </div>
              </div>
            </div>

            <button type="submit" className="payment-submit-btn" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                `Thanh toán ${parseInt(amount || 0).toLocaleString("vi-VN")} VND`
              )}
            </button>
          </form>
        </div>

        <div className="payment-right">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="divider" />

          <div className="summary-item">
            <span className="label">Dịch vụ</span>
            <span className="value font-semibold">Tour Leo Núi Bạch Mã</span>
          </div>
          <div className="summary-item">
            <span className="label">Thời lượng</span>
            <span className="value">2 ngày 1 đêm</span>
          </div>
          <div className="summary-item">
            <span className="label">Mã đặt chỗ</span>
            <span className="value">#{bookingId}</span>
          </div>

          <div className="divider" />

          <div className="summary-item total-row">
            <span className="label">Tổng cộng</span>
            <span className="value total-price">{parseInt(amount || 0).toLocaleString("vi-VN")} VND</span>
          </div>

          <div className="payment-trust-badge">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span>Thanh toán của bạn được bảo mật tuyệt đối bởi SSL mã hóa.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
