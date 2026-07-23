import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { fetchBookingDetail, cancelBooking } from "../services/bookingApi";
import BookingDetailBg from "../images/hero-slider-3.webp";

// Import subcomponents
import ParticipantsTable from "../components/booking/ParticipantsTable";
import RentalsList from "../components/booking/RentalsList";
import PaymentsList from "../components/booking/PaymentsList";
import CancelBookingModal from "../components/booking/CancelBookingModal";
import WeatherForecast from "../components/booking/WeatherForecast";

const STATUS_CONFIG = {
  PENDING:   { text: "Waiting for payment", bg: "bg-amber-50",   text_color: "text-amber-700",   border: "border-amber-200",  step: 1 },
  CONFIRMED: { text: "Confirmed",    bg: "bg-emerald-50", text_color: "text-emerald-700", border: "border-emerald-200", step: 2 },
  COMPLETED: { text: "Completed",  bg: "bg-blue-50",    text_color: "text-blue-700",    border: "border-blue-200",    step: 3 },
  CANCELLED: { text: "Cancelled",         bg: "bg-red-50",     text_color: "text-red-700",     border: "border-red-200",     step: 0 },
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
      if (res) {
        setBooking(res);
      } else {
        throw new Error("Failed to load booking details");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookingDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setCancelling(true);
    setCancelError("");
    try {
      const res = await cancelBooking(id, cancelReason);
      if (res) {
        setBooking(res);
        setShowCancelModal(false);
        setCancelReason("");
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (err) {
      setCancelError(err.response?.data?.message || err.message || "Failed to cancel booking");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f6] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#012d1d] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f7f9f6] flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-5xl">⚠️</span>
        <h4 className="font-bold text-gray-800 text-lg">Error loading booking details</h4>
        <p className="text-gray-500 text-sm">{error || "Failed to load booking details."}</p>
        <button
          onClick={() => navigate("/bookings")}
          className="bg-[#012d1d] text-white font-bold px-7 py-2.5 rounded-full hover:bg-[#0c432d] transition-all"
        >
          Back to History
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[booking.status] || { text: booking.status, bg: "bg-gray-50", text_color: "text-gray-600", border: "border-gray-200", step: 1 };

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
        pageTitle="Booking Details"
        subheading={`BOOKING CODE: ${booking.bookingCode}`}
        mainHeading={booking.tourTitle}
        showDescription={false}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 pb-20">
        {/* Back Link */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#012d1d] transition-colors mb-6"
        >
          ‹ Back to booking history
        </Link>

        {/* Status Timeline */}
        <Card>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-[#012d1d] text-base">Journey Status</h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.text_color} ${statusInfo.border}`}>
              {statusInfo.text}
            </span>
          </div>

          {booking.status === "CANCELLED" ? (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex justify-between items-start flex-wrap gap-2 text-red-700 font-semibold text-sm">
                <span>🚫 This booking has been cancelled</span>
                <span className="text-xs font-normal text-red-500">Cancellation date: {formatDate(booking.cancelledAt, true)}</span>
              </div>
              <p className="mt-3 text-red-900 text-sm bg-white border border-red-200 rounded-lg px-3 py-2">
                <strong>Cancellation reason:</strong> "{booking.cancellationReason || "No specific reason"}"
              </p>
            </div>
          ) : (
            <div className="flex justify-between items-center relative px-4">
              {/* connector lines */}
              <div className={`absolute left-[calc(14.5%+18px)] right-[calc(14.5%+18px)] top-[17px] h-0.5 z-0 ${statusInfo.step >= 2 ? "bg-[#012d1d]" : "bg-emerald-100"}`} />
              <StepNode num="1" label="Booked"  date={formatDate(booking.bookedAt)}     active={statusInfo.step >= 1} />
              <StepNode num="2" label="Paid" date={booking.paidAt ? formatDate(booking.paidAt) : "Waiting..."} active={statusInfo.step >= 2} />
              <StepNode num="3" label="Completed"   date={`Departure: ${formatDate(booking.departureDate)}`} active={statusInfo.step >= 3} />
            </div>
          )}
        </Card>

        {/* Two-column grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Journey Info */}
            <Card title="Journey Info & Meeting Point">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Tour Name", val: <span className="font-bold text-[#012d1d]">{booking.tourTitle}</span> },
                  { label: "Duration",       val: `${booking.durationDays} days ${booking.durationNights} nights` },
                  { label: "Departure → Return",  val: `${formatDate(booking.departureDate)} → ${formatDate(booking.returnDate)}` },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">{label}</span>
                    <span className="text-sm text-gray-700">{val}</span>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">📍 Meeting Point</span>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#012d1d]">
                    {booking.meetingPoint || "Updating..."}
                  </div>
                </div>
              </div>
            </Card>

            {/* Weather Forecast */}
            <WeatherForecast
              weatherForecast={booking.weatherForecast}
              departureDate={booking.departureDate}
              returnDate={booking.returnDate}
              loading={false}
            />

            {/* Travelers list component */}
            <ParticipantsTable
              participantsInfo={booking.participantsInfo}
              numParticipants={booking.numParticipants}
              formatDate={formatDate}
            />

            {/* Rental list component */}
            <RentalsList
              rentals={booking.rentals}
              formatPrice={formatPrice}
            />

            {/* Payments list component */}
            <PaymentsList
              payments={booking.payments}
              formatPrice={formatPrice}
              formatDate={formatDate}
            />
          </div>

          {/* Right sticky sidebar */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-[#012d1d] text-base mb-4">Summary of Costs</h3>
              <div className="h-px bg-gray-100 mb-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tour price</span>
                  <span className="font-semibold text-gray-800">{formatPrice(booking.subtotalTour)}</span>
                </div>
                {booking.subtotalEquipment > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Equipment rental</span>
                    <span className="font-semibold text-gray-800">{formatPrice(booking.subtotalEquipment)}</span>
                  </div>
                )}
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(booking.discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100 my-4" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">Total Cost</span>
                <span className="font-extrabold text-[#012d1d] text-lg">{formatPrice(booking.totalPrice)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-6">
                {booking.status === "PENDING" && (
                  <button
                    onClick={() => navigate("/payment", { state: { bookingId: booking.id, amount: booking.totalPrice } })}
                    className="w-full bg-[#012d1d] hover:bg-[#0c432d] text-white text-sm font-bold py-3 rounded-full transition-all duration-150 shadow-md"
                  >
                    Pay Now 💳
                  </button>
                )}
                {isCancellable() && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-bold py-2.5 rounded-full transition-all duration-150"
                  >
                    Cancel Booking ⚠️
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Booking Modal component */}
      <CancelBookingModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSubmit={handleCancelSubmit}
        cancelReason={cancelReason}
        onChangeReason={setCancelReason}
        cancelling={cancelling}
        cancelError={cancelError}
      />
    </div>
  );
};

export default BookingDetail;
