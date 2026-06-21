import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../Components/Header";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const TourDetail = () => {
  const { idOrSlug } = useParams();
  const [tour, setTour] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadTour = async () => {
      try {
        setStatus("loading");
        setError("");
        const response = await fetch(`/api/tours/${idOrSlug}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          let errorMsg = "Khong tai duoc chi tiet tour.";
          try {
            const errData = await response.json();
            errorMsg = errData?.message || errorMsg;
          } catch {
            const txt = await response.text();
            if (txt) errorMsg = txt;
          }
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setTour(data);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Da xay ra loi khi tai tour.");
        setStatus("error");
      }
    };

    loadTour();
    return () => controller.abort();
  }, [idOrSlug]);

  const coverImage = tour?.images?.find((image) => image?.isCover) || tour?.images?.[0];
  const heroImage =
    coverImage?.imageUrl ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

  /* ── status badge colour map ── */
  const badgeVariants = {
    active:   "bg-green-100 text-green-900",
    draft:    "bg-slate-100 text-slate-700",
    archived: "bg-red-100 text-red-800",
  };

  return (
    <>
      <Header
        bgImage={heroImage}
        subheading="TrekMate Danang"
        mainHeading={tour?.title || "Tour Detail"}
        description={tour?.shortDescription || "Kham pha chi tiet tour trekking tu database."}
        showDescription={Boolean(tour)}
      />

      {/* ── page wrapper ── */}
      <div className="min-h-screen px-5 py-10 pb-20"
        style={{
          background:
            "radial-gradient(circle at top left,rgba(46,107,85,.18),transparent 28%)," +
            "radial-gradient(circle at top right,rgba(20,36,74,.14),transparent 22%)," +
            "linear-gradient(180deg,#f7f4ee 0%,#eef3ee 100%)",
        }}
      >
        <div className="max-w-[1180px] mx-auto">

          {/* ── topbar ── */}
          <div className="grid grid-cols-[auto_1fr] items-center gap-5 mb-5">
            <Link
              to="/locations"
              className="font-bold text-[#163b2d] no-underline inline-flex items-center"
            >
              ← Quay lai danh sach tour
            </Link>
            {tour?.status && (
              <span
                className={`justify-self-start px-3.5 py-2 rounded-full text-[0.82rem] font-bold tracking-wide ${
                  badgeVariants[tour.status.toLowerCase()] || "bg-gray-100 text-gray-700"
                }`}
              >
                {tour.status}
              </span>
            )}
          </div>

          {/* ── loading ── */}
          {status === "loading" && (
            <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-8 text-center text-[#27343c]">
              Dang tai chi tiet tour...
            </div>
          )}

          {/* ── error ── */}
          {status === "error" && (
            <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-8 text-center border border-[rgba(161,60,44,.15)]">
              <h2 className="text-[#10251b]">Khong the tai tour</h2>
              <p className="text-[#4f5e57]">{error}</p>
              <div className="flex flex-wrap gap-3 justify-center mt-5">
                <Link
                  to="/locations"
                  className="inline-flex items-center justify-center rounded-full bg-[#10251b] text-white px-5 py-3.5 font-bold no-underline"
                >
                  Xem tour khac
                </Link>
              </div>
            </div>
          )}

          {/* ── success ── */}
          {status === "success" && tour && (
            <>
              {/* hero */}
              <section className="grid grid-cols-[1.2fr_0.95fr] gap-5 items-stretch">
                {/* copy */}
                <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-7">
                  <p className="text-[#4f5e57] text-sm">
                    {tour.difficulty} · {tour.durationDays} ngay
                    {tour.durationNights ? ` ${tour.durationNights} dem` : ""}
                  </p>
                  <h1 className="my-2 mb-3.5 text-[clamp(2.4rem,5vw,4.7rem)] leading-none text-[#10251b]">
                    {tour.title}
                  </h1>
                  <p className="text-[#4f5e57] text-[1.05rem] leading-relaxed max-w-[64ch]">
                    {tour.shortDescription}
                  </p>

                  {/* metrics */}
                  <div className="grid grid-cols-2 gap-3 my-6">
                    {[
                      { label: "Do dai", value: `${tour.distanceKm ?? "N/A"} km` },
                      { label: "Do cao toi da", value: `${tour.maxElevationM ?? "N/A"} m` },
                      { label: "Danh gia", value: `${tour.avgRating ?? 0}/5` },
                      { label: "Dat cho", value: tour.totalBookings ?? 0 },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="grid gap-1.5 px-4 py-3.5 rounded-[18px] bg-black/[.04]"
                      >
                        <span className="text-[#4f5e57] text-sm">{label}</span>
                        <strong className="text-[#10251b] text-[1.05rem]">{value}</strong>
                      </div>
                    ))}
                  </div>

                  {/* actions */}
                  <div className="flex flex-wrap gap-3.5 items-center">
                    <Link
                      to="/payment"
                      className="inline-flex items-center justify-center rounded-full bg-[#10251b] text-white px-5 py-3.5 font-bold no-underline"
                    >
                      Dat tour
                    </Link>
                    {tour.slug && (
                      <span className="text-[#4f5e57] text-sm">
                        Slug: <code>{tour.slug}</code>
                      </span>
                    )}
                  </div>
                </div>

                {/* media */}
                <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] overflow-hidden min-h-[360px]">
                  {coverImage ? (
                    <img
                      src={coverImage.imageUrl}
                      alt={coverImage.altText || tour.title}
                      className="w-full h-full object-cover block"
                    />
                  ) : (
                    <div className="min-h-full grid place-items-center font-bold text-[#6e7a73] bg-gradient-to-br from-[#d9e6db] to-[#f5f0e7]">
                      No image available
                    </div>
                  )}
                </div>
              </section>

              {/* info grid */}
              <section className="grid grid-cols-2 gap-5 mt-5">
                {/* description */}
                <article className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-7">
                  <h2 className="mt-0 mb-2.5 text-[#10251b]">Mo ta</h2>
                  <p className="text-[#4f5e57]">{tour.description || "Chua co mo ta chi tiet."}</p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[
                      { label: "Diem bat dau", value: tour.startLocation || "N/A" },
                      { label: "Diem ket thuc", value: tour.endLocation || "N/A" },
                      { label: "Tao luc", value: formatDateTime(tour.createdAt) },
                      { label: "Cap nhat", value: formatDateTime(tour.updatedAt) },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="grid gap-1.5 px-4 py-3.5 rounded-[18px] bg-black/[.04]"
                      >
                        <span className="text-[#4f5e57] text-sm">{label}</span>
                        <strong className="text-[#10251b] text-[1.05rem]">{value}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                {/* highlights */}
                <article className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-7">
                  <h2 className="mt-0 mb-2.5 text-[#10251b]">Diem noi bat</h2>
                  <ul className="pl-4 m-0 grid gap-2.5 text-[#4f5e57]">
                    {(tour.highlights || []).map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </article>

                {/* includes */}
                <article className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-7">
                  <h2 className="mt-0 mb-2.5 text-[#10251b]">Bao gom</h2>
                  <ul className="pl-4 m-0 grid gap-2.5 text-[#4f5e57]">
                    {(tour.includes || []).map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </article>

                {/* excludes */}
                <article className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-7">
                  <h2 className="mt-0 mb-2.5 text-[#10251b]">Khong bao gom</h2>
                  <ul className="pl-4 m-0 grid gap-2.5 text-[#4f5e57]">
                    {(tour.excludes || []).map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </article>
              </section>

              {/* gallery */}
              <section className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-7 mt-5">
                <h2 className="mt-0 mb-2.5 text-[#10251b]">Hinh anh</h2>
                <div className="grid grid-cols-3 gap-5">
                  {(tour.images || []).map((image) => (
                    <figure
                      key={image.id}
                      className={`m-0 overflow-hidden rounded-[20px] bg-[#e9ece7] ${
                        image.isCover ? "col-span-2 row-span-2" : ""
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.altText || image.caption || tour.title}
                        className="w-full h-full object-cover block"
                      />
                      {(image.caption || image.isCover) && (
                        <figcaption className="px-3 py-2.5 text-[0.88rem] text-[#4f5e57]">
                          {image.caption || "Anh bia"}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>

              {/* waypoints */}
              <section className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-7 mt-5">
                <h2 className="mt-0 mb-2.5 text-[#10251b]">Waypoints</h2>
                <div className="grid grid-cols-3 gap-5">
                  {(tour.waypoints || []).map((waypoint) => (
                    <div
                      key={waypoint.id}
                      className="p-4 rounded-[18px] bg-black/[.04] text-[#4f5e57]"
                    >
                      <strong className="text-[#10251b]">
                        {waypoint.sequenceOrder}. {waypoint.name}
                      </strong>
                      <p className="mt-1 mb-1 text-sm">
                        {waypoint.waypointType || "N/A"} ·{" "}
                        {waypoint.dayNumber ? `Ngay ${waypoint.dayNumber}` : "Khong gan ngay"}
                      </p>
                      <span className="text-xs">
                        {waypoint.lat}, {waypoint.lng}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* itinerary */}
              <section className="rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(23,35,42,.08)] p-7 mt-5">
                <h2 className="mt-0 mb-2.5 text-[#10251b]">Lich trinh theo ngay</h2>
                <div className="grid grid-cols-1 gap-5">
                  {(tour.dailyItinerary || []).map((day) => (
                    <article
                      key={day.id}
                      className="p-4 rounded-[18px] bg-black/[.04]"
                    >
                      <div className="flex flex-wrap gap-2.5 justify-between items-center mb-2">
                        <h3 className="m-0 text-[#10251b]">
                          Ngay {day.dayNumber}: {day.dayTitle}
                        </h3>
                        <span className="text-sm text-[#4f5e57]">{day.dayDifficulty || "N/A"}</span>
                      </div>
                      <p className="text-[#4f5e57] mb-2">{day.dayDescription || "Chua co mo ta."}</p>
                      <div className="flex flex-wrap gap-2.5 text-sm text-[#4f5e57]">
                        <span>{day.distanceKm ?? "N/A"} km</span>
                        <span>
                          {day.walkingHoursMin ?? "N/A"} - {day.walkingHoursMax ?? "N/A"} gio
                        </span>
                        <span>
                          {day.suggestedStartTime || "N/A"} - {day.suggestedEndTime || "N/A"}
                        </span>
                      </div>
                      {Array.isArray(day.waypointLinks) && day.waypointLinks.length > 0 && (
                        <ul className="pl-4 mt-2 grid gap-1.5 text-[#4f5e57] text-sm">
                          {day.waypointLinks.map((link) => (
                            <li key={link.id}>
                              {link.visitOrder}. {link.waypointName}{" "}
                              {link.isMandatory ? "(bat buoc)" : "(tuy chon)"}
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TourDetail;
