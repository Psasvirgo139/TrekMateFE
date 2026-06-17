import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import { fetchBookingDetail, cancelBooking } from "../Services/bookingApi";
import BookingDetailBg from "../Images/hero-slider-3.webp";

const STATUS_CONFIG = {
  PENDING:   { text: "Chờ thanh toán", bg: "bg-amber-50",   text_color: "text-amber-700",   border: "border-amber-200",  step: 1 },
  CONFIRMED: { text: "Đã xác nhận",    bg: "bg-emerald-50", text_color: "text-emerald-700", border: "border-emerald-200", step: 2 },
  COMPLETED: { text: "Đã hoàn thành",  bg: "bg-blue-50",    text_color: "text-blue-700",    border: "border-blue-200",    step: 3 },
  CANCELLED: { text: "Đã hủy",         bg: "bg-red-50",     text_color: "text-red-700",     border: "border-red-200",     step: 0 },
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const loadBookingDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBookingDetail(id);
      if (res.code === 200 && res.data) {
        setBooking(res.data);
      } else {
        throw new Error(res.message || "Failed to load booking details");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể tải thông tin đặt tour.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookingDetail(); }, [id]);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setCancelling(true);
    setCancelError("");
    try {
      const res = await cancelBooking(id, cancelReason);
      if (res.code === 200 && res.data) {
        setBooking(res.data);
        setShowCancelModal(false);
        setCancelReason("");
      } else {
        throw new Error(res.message || "Hủy đặt tour thất bại");
      }
    } catch (err) {
      setCancelError(err.response?.data?.message || err.message || "Lỗi khi hủy tour.");
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return "";
    const options = includeTime
      ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const isCancellable = () => {
    if (!booking) return false;
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") return false;
    if (booking.status === "CONFIRMED") {
      const cutoff = booking.departureDate ? new Date(booking.departureDate) : null;
      if (cutoff) {
        cutoff.setDate(cutoff.getDate() - 2);
        return new Date() < cutoff;
      }
    }
    return true;
  };

  // ─── Loading / Error States ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f6] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#012d1d] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Đang tải chi tiết đặt tour...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f7f9f6] flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-5xl">⚠️</span>
        <h4 className="font-bold text-gray-800 text-lg">Lỗi hiển thị chi tiết</h4>
        <p className="text-gray-500 text-sm">{error || "Không tìm thấy dữ liệu đặt tour."}</p>
        <button
          onClick={() => navigate("/bookings")}
          className="bg-[#012d1d] text-white font-bold px-7 py-2.5 rounded-full hover:bg-[#0c432d] transition-all"
        >
          Quay lại Lịch sử
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[booking.status] || { text: booking.status, bg: "bg-gray-50", text_color: "text-gray-600", border: "border-gray-200", step: 1 };

  // ─── Timeline step node ──────────────────────────────────────────────────────
  const StepNode = ({ num, label, date, active }) => (
    <div className="flex flex-col items-center z-10 w-28">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
        active
          ? "bg-[#012d1d] border-[#012d1d] text-white shadow-lg shadow-[#012d1d]/20"
          : "bg-emerald-50 border-emerald-200 text-[#556e62]"
      }`}>
        {num}
      </div>
      <span className={`mt-2 text-xs font-bold text-center leading-tight ${active ? "text-[#012d1d]" : "text-gray-400"}`}>
        {label}
      </span>
      <span className="mt-0.5 text-[10px] text-gray-400 text-center">{date}</span>
    </div>
  );

  // ─── Card wrapper ─────────────────────────────────────────────────────────────
  const Card = ({ title, children }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      {title && (
        <h4 className="font-extrabold text-[#012d1d] text-base mb-4 pb-3 border-b border-gray-100">{title}</h4>
      )}
      {children}
    </div>
  );

  return (
    <div className="bg-[#f7f9f6] min-h-screen">
      <Header
        bgImage={BookingDetailBg}
        pageTitle="Chi Tiết Đơn Đặt Tour"
        subheading={`MÃ ĐẶT CHỖ: ${booking.bookingCode}`}
        mainHeading={booking.tourTitle}
        showDescription={false}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 pb-20">

        {/* Back Link */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#012d1d] transition-colors mb-6"
        >
          ‹ Quay lại danh sách đặt tour
        </Link>

        {/* ─── Status Timeline ─────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-[#012d1d] text-base">Trạng thái hành trình</h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.text_color} ${statusInfo.border}`}>
              {statusInfo.text}
            </span>
          </div>

          {booking.status === "CANCELLED" ? (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex justify-between items-start flex-wrap gap-2 text-red-700 font-semibold text-sm">
                <span>🚫 Đơn hàng này đã bị hủy</span>
                <span className="text-xs font-normal text-red-500">Ngày hủy: {formatDate(booking.cancelledAt, true)}</span>
              </div>
              <p className="mt-3 text-red-900 text-sm bg-white border border-red-200 rounded-lg px-3 py-2">
                <strong>Lý do hủy:</strong> "{booking.cancellationReason || "Không có lý do cụ thể"}"
              </p>
            </div>
          ) : (
            <div className="flex justify-between items-center relative px-4">
              {/* connector lines */}
              <div className={`absolute left-[calc(14.5%+18px)] right-[calc(14.5%+18px)] top-[17px] h-0.5 z-0 ${statusInfo.step >= 2 ? "bg-[#012d1d]" : "bg-emerald-100"}`} />
              <StepNode num="1" label="Đã đặt tour"  date={formatDate(booking.bookedAt)}     active={statusInfo.step >= 1} />
              <StepNode num="2" label="Đã thanh toán" date={booking.paidAt ? formatDate(booking.paidAt) : "Chờ..."} active={statusInfo.step >= 2} />
              <StepNode num="3" label="Hoàn thành"   date={`Khởi hành: ${formatDate(booking.departureDate)}`} active={statusInfo.step >= 3} />
            </div>
          )}
        </Card>

        {/* ─── Two-column grid ─────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Journey Info */}
            <Card title="Hành trình & Địa điểm tập trung">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Tên tuyến trekking", val: <span className="font-bold text-[#012d1d]">{booking.tourTitle}</span> },
                  { label: "Thời gian đi",       val: `${booking.durationDays} ngày ${booking.durationNights} đêm` },
                  { label: "Ngày đi - Ngày về",  val: `${formatDate(booking.departureDate)} → ${formatDate(booking.returnDate)}` },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">{label}</span>
                    <span className="text-sm text-gray-700">{val}</span>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">📍 Điểm tập trung đoàn</span>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#012d1d]">
                    {booking.meetingPoint || "Đang cập nhật..."}
                  </div>
                </div>
              </div>
            </Card>

            {/* Travelers */}
            <Card title={`Thành viên tham gia (${booking.numParticipants} người)`}>
              {booking.participantsInfo && booking.participantsInfo.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        {["Họ và tên", "Ngày sinh", "Quốc tịch", "Thể lực"].map((h) => (
                          <th key={h} className="pb-2 pr-4 text-[10px] uppercase tracking-wider font-bold text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {booking.participantsInfo.map((p, idx) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 pr-4 font-semibold text-gray-800">{p.fullName || p.name}</td>
                          <td className="py-3 pr-4 text-gray-600">{formatDate(p.dateOfBirth || p.dob)}</td>
                          <td className="py-3 pr-4 text-gray-600">{p.nationality || "Việt Nam"}</td>
                          <td className="py-3">
                            <span className="bg-emerald-50 text-[#012d1d] text-xs font-bold px-3 py-1 rounded-full">
                              {p.fitnessLevel || "Bình thường"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Người đặt tour là người tham gia duy nhất.</p>
              )}
            </Card>

            {/* Rentals */}
            <Card title="Thiết bị leo núi đã thuê">
              {booking.rentals && booking.rentals.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-50">
                  {booking.rentals.map((rental) => (
                    <div key={rental.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                        {rental.imageUrl
                          ? <img src={rental.imageUrl} alt={rental.equipmentName} className="w-full h-full object-cover" />
                          : <span className="text-2xl">🎒</span>
                        }
                      </div>
                      <div className="flex-grow min-w-0">
                        <h5 className="font-bold text-[#012d1d] text-sm">{rental.equipmentName}</h5>
                        <p className="text-xs text-gray-500 mt-0.5">{rental.brand} {rental.model}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatPrice(rental.pricePerDay)}/ngày × {rental.rentalDays} ngày
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs text-gray-400">Số lượng: <strong className="text-gray-700">{rental.quantity}</strong></span>
                        <span className="block font-bold text-[#012d1d] text-sm mt-1">{formatPrice(rental.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Không thuê thiết bị leo núi nào cho chuyến đi này.</p>
              )}
            </Card>

            {/* Payments */}
            <Card title="Lịch sử giao dịch thanh toán">
              {booking.payments && booking.payments.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {booking.payments.map((payment) => {
                    const paid = payment.status === "success" || payment.status === "PAID";
                    return (
                      <div key={payment.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <div className="flex flex-col gap-1">
                          <span className="self-start bg-[#012d1d] text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                            {payment.method}
                          </span>
                          <span className="text-xs font-mono text-gray-500">Mã GD: {payment.gatewayTxnId || payment.id}</span>
                          <span className="text-[11px] text-gray-400">{formatDate(payment.paidAt || payment.createdAt, true)}</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-extrabold text-[#012d1d] text-sm">{formatPrice(payment.amount)}</span>
                          <span className={`text-xs font-bold mt-0.5 block ${paid ? "text-emerald-600" : "text-amber-600"}`}>
                            {paid ? "Thành công" : "Đang xử lý"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Chưa ghi nhận giao dịch thanh toán nào cho đơn hàng này.</p>
              )}
            </Card>
          </div>

          {/* ── Right sticky sidebar ──────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-[#012d1d] text-base mb-4">Tổng kết chi phí</h3>
              <div className="h-px bg-gray-100 mb-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Giá vé tour</span>
                  <span className="font-semibold text-gray-800">{formatPrice(booking.subtotalTour)}</span>
                </div>
                {booking.subtotalEquipment > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Thuê thiết bị</span>
                    <span className="font-semibold text-gray-800">{formatPrice(booking.subtotalEquipment)}</span>
                  </div>
                )}
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>Khuyến mại</span>
                    <span>-{formatPrice(booking.discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100 my-4" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">Tổng chi phí</span>
                <span className="font-extrabold text-[#012d1d] text-lg">{formatPrice(booking.totalPrice)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-6">
                {booking.status === "PENDING" && (
                  <button
                    onClick={() => navigate("/payment", { state: { bookingId: booking.id, amount: booking.totalPrice } })}
                    className="w-full bg-[#012d1d] hover:bg-[#0c432d] text-white text-sm font-bold py-3 rounded-full transition-all duration-150 shadow-md"
                  >
                    Thanh toán ngay 💳
                  </button>
                )}
                {isCancellable() && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-bold py-2.5 rounded-full transition-all duration-150"
                  >
                    Hủy chuyến đi ⚠️
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Cancel Modal ────────────────────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h4 className="font-extrabold text-[#012d1d] text-base">Xác nhận hủy đặt tour</h4>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCancelSubmit}>
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
                    onChange={(e) => setCancelReason(e.target.value)}
                    required
                    className="border border-gray-200 focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/10 rounded-lg px-3 py-2.5 text-sm font-[inherit] resize-y outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
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
      )}
    </div>
  );
};

export default BookingDetail;
