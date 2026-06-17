import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import { fetchMyBookings } from "../Services/bookingApi";
import BookingHistoryBg from "../Images/hero-slider-3.webp";

const MOCK_ACCOUNTS = [
  { name: "Nguyễn Thị Hoa", email: "hoa@example.com", avatar: "👩‍🌾" },
  { name: "Phạm Gia Khiêm", email: "khiem@example.com", avatar: "👨‍🚀" },
];

const STATUS_CONFIG = {
  PENDING:   { text: "Chờ thanh toán", bg: "bg-amber-50",   text_color: "text-amber-700",   border: "border-amber-200"  },
  CONFIRMED: { text: "Đã xác nhận",    bg: "bg-emerald-50", text_color: "text-emerald-700", border: "border-emerald-200" },
  COMPLETED: { text: "Đã hoàn thành",  bg: "bg-blue-50",    text_color: "text-blue-700",    border: "border-blue-200"   },
  CANCELLED: { text: "Đã hủy",         bg: "bg-red-50",     text_color: "text-red-700",     border: "border-red-200"    },
};

const BookingHistory = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 5;

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const account = MOCK_ACCOUNTS.find((acc) => acc.email === savedToken) || MOCK_ACCOUNTS[0];
    setCurrentUser(account);
    localStorage.setItem("token", account.email);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchMyBookings({ page, size, sort: "bookedAt,desc" });
        if (res.code === 200 && res.data) {
          const allContent = res.data.content || [];
          const filtered = activeTab === "ALL" ? allContent : allContent.filter((b) => b.status === activeTab);
          setBookings(filtered);
          setTotalPages(res.data.totalPages || 0);
        } else {
          throw new Error(res.message || "Failed to load bookings");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Không thể kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [currentUser, page, activeTab]);

  const handleSwitchUser = (account) => {
    setCurrentUser(account);
    localStorage.setItem("token", account.email);
    setPage(0);
    setBookings([]);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const TAB_LABELS = {
    ALL: "Tất cả", PENDING: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận", COMPLETED: "Đã hoàn thành", CANCELLED: "Đã hủy",
  };

  return (
    <div className="bg-[#f7f9f6] min-h-screen">
      <Header
        bgImage={BookingHistoryBg}
        pageTitle="Lịch Sử Đặt Tour"
        subheading="HÀNH TRÌNH CỦA BẠN"
        mainHeading="Quản Lý Lịch Sử & Giao Dịch"
        description="Xem lại các tour leo núi bạn đã tham gia, kiểm tra tình trạng thanh toán hóa đơn hoặc cập nhật chi tiết hành trình sắp tới."
        showDescription={true}
      />

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* JWT Auth Simulator Panel */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#012d1d] text-white px-2.5 py-1 rounded-full">
              JWT Auth Simulator
            </span>
            <h3 className="text-sm font-semibold text-gray-600">Đang kiểm thử với tài khoản:</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOCK_ACCOUNTS.map((acc) => {
              const isActive = currentUser?.email === acc.email;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleSwitchUser(acc)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                    isActive
                      ? "border-[#012d1d] bg-emerald-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-2xl w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                    {acc.avatar}
                  </span>
                  <div>
                    <span className={`block text-sm font-bold ${isActive ? "text-[#012d1d]" : "text-gray-800"}`}>
                      {acc.name}
                    </span>
                    <span className="block text-xs text-gray-500">{acc.email}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tab Filters */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto pb-px scrollbar-thin">
          {Object.entries(TAB_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setPage(0); }}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-150 ${
                activeTab === key
                  ? "border-[#012d1d] text-[#012d1d]"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-9 h-9 border-4 border-[#012d1d] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Đang tải lịch sử đặt tour...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <span className="text-3xl">⚠️</span>
            <h4 className="font-bold text-red-700 mt-2 mb-1">Lỗi kết nối dữ liệu</h4>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-3">🗺️</div>
            <h4 className="font-bold text-gray-800 text-lg mb-1">Chưa có chuyến đi nào</h4>
            <p className="text-gray-500 text-sm mb-5">Bạn không có đơn đặt tour nào trong danh mục này.</p>
            <Link
              to="/locations"
              className="inline-block bg-[#012d1d] hover:bg-[#0c432d] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-200 shadow-md"
            >
              Khám phá tour ngay
            </Link>
          </div>
        )}

        {/* Booking Cards */}
        {!loading && !error && bookings.length > 0 && (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => {
              const s = STATUS_CONFIG[booking.status] || { text: booking.status, bg: "bg-gray-50", text_color: "text-gray-600", border: "border-gray-200" };
              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  {/* Card Top */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <span className="text-xs font-mono text-gray-500 font-semibold">
                      Mã: {booking.bookingCode}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s.bg} ${s.text_color} ${s.border}`}>
                      {s.text}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 py-4">
                    <h4 className="font-bold text-[#012d1d] text-base mb-3 hover:text-[#fea619] transition-colors">
                      <Link to={`/bookings/${booking.id}`}>{booking.tourTitle}</Link>
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        📅 Khởi hành: <strong className="text-gray-800">{formatDate(booking.departureDate)}</strong>
                        <span className="text-gray-400">({booking.durationDays} ngày)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        👥 <strong className="text-gray-800">{booking.numParticipants} người</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        🕓 Đặt lúc: {formatDate(booking.bookedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
                    <div>
                      <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Tổng thanh toán</span>
                      <span className="block text-lg font-extrabold text-[#012d1d]">{formatPrice(booking.totalPrice)}</span>
                    </div>
                    <Link
                      to={`/bookings/${booking.id}`}
                      className="bg-[#012d1d] hover:bg-[#0c432d] text-white text-sm font-bold px-5 py-2 rounded-full transition-all duration-150 shadow-sm flex items-center gap-1.5"
                    >
                      Chi tiết <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ‹ Trước
            </button>
            <span className="px-4 py-2 text-xs font-bold bg-[#012d1d] text-white rounded-lg">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Sau ›
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingHistory;
