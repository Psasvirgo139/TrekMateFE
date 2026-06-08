import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./PaymentStatus.css";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderCode) {
        setStatus("error");
        setErrorMsg("Không tìm thấy mã đơn hàng (orderCode).");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/v1/payments/payos/confirm/${orderCode}`);
        const resData = await response.json();

        if (response.ok && resData.code === 200) {
          setPaymentDetails(resData.data);
          setStatus("success");
        } else {
          throw new Error(resData.message || "Xác thực giao dịch thất bại");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMsg(err.message || "Lỗi kết nối hệ thống khi kiểm tra giao dịch.");
      }
    };

    confirmPayment();
  }, [orderCode]);

  return (
    <div className="status-container">
      {status === "verifying" && (
        <div className="status-card text-center">
          <div className="status-spinner-container">
            <div className="status-spinner"></div>
          </div>
          <h2>Đang xác thực giao dịch...</h2>
          <p className="text-muted">Vui lòng không đóng trình duyệt hoặc tải lại trang.</p>
        </div>
      )}

      {status === "success" && (
        <div className="status-card success-theme">
          <div className="status-icon-badge">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="success-title">Thanh toán thành công!</h2>
          <p className="status-msg">Giao dịch của bạn đã được xác nhận và xử lý thành công.</p>

          <div className="receipt-box">
            <h3>Chi tiết giao dịch</h3>
            <div className="receipt-row">
              <span className="label">Mã giao dịch</span>
              <span className="value font-semibold">#{orderCode}</span>
            </div>
            {paymentDetails && (
              <>
                <div className="receipt-row">
                  <span className="label">Mã đặt chỗ (Booking)</span>
                  <span className="value">#{paymentDetails.bookingId}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Phương thức</span>
                  <span className="value">{paymentDetails.paymentMethod}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Số tiền</span>
                  <span className="value amount-value">
                    {parseFloat(paymentDetails.amount).toLocaleString("vi-VN")} VND
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="status-actions">
            <Link to="/" className="btn btn-primary">Quay lại trang chủ</Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="status-card error-theme">
          <div className="status-icon-badge">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <h2 className="error-title">Xác thực giao dịch thất bại</h2>
          <p className="status-msg">{errorMsg || "Đã xảy ra sự cố trong quá trình xác thực."}</p>

          <div className="status-actions">
            <Link to="/payment" className="btn btn-secondary">Thử lại thanh toán</Link>
            <Link to="/" className="btn btn-link">Quay lại trang chủ</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
