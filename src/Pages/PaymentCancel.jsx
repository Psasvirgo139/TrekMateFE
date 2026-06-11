import React from "react";
import { Link } from "react-router-dom";
import "./PaymentStatus.css";

const PaymentCancel = () => {
  return (
    <div className="status-container">
      <div className="status-card error-theme">
        <div className="status-icon-badge">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 className="error-title">Giao dịch đã bị hủy</h2>
        <p className="status-msg">
          Bạn đã hủy yêu cầu thanh toán trên cổng PayOS. Đặt chỗ của bạn vẫn đang ở trạng thái chờ.
        </p>

        <div className="status-actions">
          <Link to="/payment" className="btn btn-primary">Thanh toán lại</Link>
          <Link to="/" className="btn btn-secondary">Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
