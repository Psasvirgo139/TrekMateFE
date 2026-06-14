import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header";

const formatPrice = (value) => {
  if (value === null || value === undefined) return "Chua cap nhat";
  return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
};

const Locations = () => {
  const [tours, setTours] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadTours = async () => {
      try {
        setStatus("loading");
        setError("");

        const response = await fetch("/api/tours?status=ACTIVE&page=0&size=12", {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Khong tai duoc danh sach tour.");
        }

        const page = payload?.data;
        setTours(Array.isArray(page?.content) ? page.content : []);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Da xay ra loi khi tai tour.");
        setStatus("error");
      }
    };

    loadTours();
    return () => controller.abort();
  }, []);

  const heroImage =
    "https://images.unsplash.com/photo-1501554728187-ce583db33af7?auto=format&fit=crop&w=1600&q=80";

  const panelCls =
    "bg-white/80 rounded-3xl p-6 shadow-[0_20px_60px_rgba(23,35,42,.08)] mb-5";

  return (
    <>
      <Header
        bgImage={heroImage}
        subheading="TrekMate Danang"
        mainHeading="Where the next trail begins"
        description="Kham pha cac hanh trinh trekking cua TrekMate."
        showDescription={true}
      />

      <main
        className="px-5 py-6 pb-12 min-h-screen"
        style={{ background: "linear-gradient(180deg,#f7f4ee,#eef3ee)" }}
      >
        <section className="max-w-[1200px] mx-auto">

          {/* loading */}
          {status === "loading" && (
            <div className={panelCls}>Dang tai danh sach tour...</div>
          )}

          {/* error */}
          {status === "error" && (
            <div className={panelCls}>
              <h2 className="mt-0 text-[#10251b]">Khong the tai hanh trinh</h2>
              <p className="text-[#4f5e57]">{error}</p>
            </div>
          )}

          {/* empty */}
          {status === "success" && tours.length === 0 && (
            <div className={panelCls}>
              <h2 className="mt-0 text-[#10251b]">Chua co hanh trinh nao</h2>
              <p className="text-[#4f5e57]">Database hien chua co tour ACTIVE de hien thi.</p>
            </div>
          )}

          {/* tour grid */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            {tours.map((tour) => (
              <article
                key={tour.id}
                className="flex flex-col bg-white/80 rounded-3xl p-6 shadow-[0_20px_60px_rgba(23,35,42,.08)]"
              >
                {/* card header */}
                <div className="flex justify-between gap-3 flex-wrap mb-3.5">
                  <span className="inline-flex px-3 py-1.5 rounded-full bg-[#e7efe8] text-[#1d4b35] text-[.78rem] font-bold">
                    {tour.difficulty || "N/A"}
                  </span>
                  <span className="inline-flex px-3 py-1.5 rounded-full bg-[#10251b] text-white text-[.78rem] font-bold">
                    {tour.status}
                  </span>
                </div>

                <h2 className="mt-0 text-[#10251b]">{tour.title}</h2>
                <p className="text-[#4f5e57] leading-relaxed min-h-[72px]">
                  {tour.highlights?.length
                    ? tour.highlights[0]
                    : tour.startLocation || "Tour trekking trong database"}
                </p>

                {/* meta grid */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {[
                    {
                      label: "Thoi luong",
                      value: `${tour.durationDays ?? "N/A"} ngay${
                        tour.durationNights ? ` ${tour.durationNights} dem` : ""
                      }`,
                    },
                    { label: "Khoang gia", value: formatPrice(tour.priceFrom) },
                    { label: "Danh gia", value: `${tour.avgRating ?? 0}/5` },
                    { label: "Sap khoi hanh", value: tour.upcomingDeparturesCount ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="block text-[.78rem] text-[#6a776f] mb-1">{label}</span>
                      <strong className="text-[#10251b]">{value}</strong>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3 mt-5">
                  <Link
                    to={`/tours/${tour.slug || tour.id}`}
                    className="inline-flex mt-auto px-4 py-3 rounded-full no-underline bg-[#10251b] text-white font-bold"
                  >
                    Xem chi tiet
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Locations;
