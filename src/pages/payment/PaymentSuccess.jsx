import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PaymentStatusCard from "./components/PaymentStatusCard";
import ReceiptBox from "./components/ReceiptBox";

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
    <>
      {status === "verifying" && (
        <PaymentStatusCard
          type="verifying"
          title="Đang xác thực giao dịch..."
          description="Vui lòng không đóng trình duyệt hoặc tải lại trang."
        />
      )}

      {status === "success" && (
        <PaymentStatusCard
          type="success"
          title="Thanh toán thành công!"
          description="Giao dịch của bạn đã được xác nhận và xử lý thành công."
          actions={
            <Link
              to="/"
              className="p-3.5 rounded-xl text-sm sm:text-base font-bold transition-all text-center bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(2,132,199,0.2)] hover:shadow-[0_8px_25px_rgba(2,132,199,0.35)] filter hover:brightness-110"
            >
              Quay lại trang chủ
            </Link>
          }
        >
          <ReceiptBox
            orderCode={orderCode}
            bookingId={paymentDetails?.bookingId}
            paymentMethod={paymentDetails?.paymentMethod}
            amount={paymentDetails?.amount}
          />
        </PaymentStatusCard>
      )}

      {status === "error" && (
        <PaymentStatusCard
          type="error"
          title="Xác thực giao dịch thất bại"
          description={errorMsg || "Đã xảy ra sự cố trong quá trình xác thực."}
          actions={
            <>
              <Link
                to="/payment"
                className="p-3.5 rounded-xl text-sm sm:text-base font-bold transition-all text-center bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(2,132,199,0.2)] hover:shadow-[0_8px_25px_rgba(2,132,199,0.35)] filter hover:brightness-110"
              >
                Thử lại thanh toán
              </Link>
              <Link
                to="/"
                className="p-3.5 rounded-xl text-sm sm:text-base font-bold transition-all text-center text-slate-400 hover:text-sky-400 hover:underline bg-transparent border-none"
              >
                Quay lại trang chủ
              </Link>
            </>
          }
        />
      )}
    </>
  );
};

export default PaymentSuccess;
