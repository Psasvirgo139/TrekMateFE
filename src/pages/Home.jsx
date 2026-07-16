import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthNav from "../components/layout/AuthNav";
import TourCard from "../components/tour/TourCard";
import api from "../services/api";
import "./Home.css";

const HERO_BG = "https://i.pinimg.com/1200x/16/05/3e/16053eb88478eadf2042ed560fccf86b.jpg";
const ABOUT_IMG = "https://i.pinimg.com/1200x/5e/a5/da/5ea5da76c4d2b0ff9b59033c5d2623b1.jpg";

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Hero search state
  const [search, setSearch] = useState("");

  // Tours state
  const [featuredTours, setFeaturedTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Scroll listener for header transparency
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch featured tours from backend
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/tours", { params: { page: 0, size: 3, sort: "avgRating,desc" } });
        if (res?.data?.content) setFeaturedTours(res.data.content);
      } catch { /* silently fallback */ }
      finally { setLoadingTours(false); }
    };
    load();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/locations?search=${encodeURIComponent(search.trim())}`);
    else navigate("/locations");
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmittingForm(true);
    setTimeout(() => {
      setSubmittingForm(false);
      setFormSubmitted(true);
      setContactName(""); setContactEmail(""); setContactMessage("");
    }, 900);
  };

  // Static fallback tours
  const fallbackTours = [
    { id: "f1", slug: "fansipan-summit", title: "Chinh phục Fansipan — Nóc nhà Đông Dương", difficulty: "HARD", durationDays: 3, durationNights: 2, distanceKm: 19, maxElevationM: 3147, startLocation: "Sa Pa", avgRating: 4.9, totalReviews: 185, priceFrom: 2800000, upcomingDeparturesCount: 1, highlights: ["Đỉnh cao nhất Đông Dương 3147m", "Rừng nguyên sinh Hoàng Liên"] },
    { id: "f2", slug: "ta-nang-phan-dung", title: "Trekking Tà Năng – Phan Dũng", difficulty: "MODERATE", durationDays: 2, durationNights: 1, distanceKm: 45, maxElevationM: 1920, startLocation: "Đà Lạt", avgRating: 4.7, totalReviews: 142, priceFrom: 1950000, upcomingDeparturesCount: 1, highlights: ["Thảo nguyên Tà Năng rộng lớn", "Rừng thông cổ thụ"] },
    { id: "f3", slug: "ma-pi-leng-trek", title: "Mã Pí Lèng — Đèo huyền thoại miền đá xám", difficulty: "HARD", durationDays: 4, durationNights: 3, distanceKm: 28, maxElevationM: 1300, startLocation: "Hà Giang", avgRating: 4.8, totalReviews: 168, priceFrom: 1500000, upcomingDeparturesCount: 1, highlights: ["Đèo Mã Pí Lèng hùng vĩ", "Sông Nho Quế xanh biếc"] },
  ];

  const tours = featuredTours.length > 0 ? featuredTours : fallbackTours;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-page">

      {/* ──────────── HERO + HEADER ──────────── */}
      <section className="home-hero-section" style={{ backgroundImage: `url(${HERO_BG})` }}>
        {/* Dark Overlay */}
        <div className="home-hero-overlay" />

        {/* HEADER — same pattern as site-header */}
        <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
          <div className="header-inner">
            <Link to="/" style={{ textDecoration: "none" }}>
              <h1 className="logo">TrekMate Danang</h1>
            </Link>

            <nav className="home-nav">
              <Link to="/" className="home-nav-link active">Home</Link>
              <Link to="/locations" className="home-nav-link">Tours</Link>
              <a
                href="#about-section"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("about-section");
                }}
                className="home-nav-link"
              >
                About Us
              </a>
              <a
                href="#contact-section"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact-section");
                }}
                className="home-nav-link"
              >
                Contact
              </a>
              <Link to="/payment" className="home-nav-link">Payment</Link>
              <Link to="/admin/tours" className="home-nav-link">Tour Management</Link>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <AuthNav />
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="home-hero-content">
          <motion.span
            className="home-hero-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Vietnam's Premier Adventure Outfitter
          </motion.span>

          <motion.h1
            className="home-hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Explore the<br />Unseen Trails
          </motion.h1>

          <motion.p
            className="home-hero-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Professional logistics for rugged exploration. We handle certified guides,
            high-altitude gear, and real-time safety so you can focus on the ascent.
          </motion.p>

          {/* Inline hero search bar */}
          <motion.form
            onSubmit={handleHeroSearch}
            className="home-hero-search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="hero-search-icon">🔍</span>
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search trails, locations, or destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">
              Find Your Trek
            </button>
          </motion.form>

          {/* Quick-filter difficulty chips */}
          <motion.div
            className="hero-chips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <span className="hero-chips-label">Popular:</span>
            {[
              { label: "🌿 Easy Trails", q: "?difficulty=EASY" },
              { label: "⚡ Moderate", q: "?difficulty=MODERATE" },
              { label: "🏔️ Hard Peaks", q: "?difficulty=HARD" },
              { label: "📅 Under 3 Days", q: "?durationRange=short" },
            ].map((chip) => (
              <button
                key={chip.label}
                className="hero-chip"
                onClick={() => navigate(`/locations${chip.q}`)}
                type="button"
              >
                {chip.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────── STATS BAR ──────────── */}
      <section className="stats-bar-section">
        <div className="stats-container">
          {[
            { icon: "🌲", number: "100+", label: "Active Trails" },
            { icon: "🏃", number: "10k+", label: "Happy Trekkers" },
            { icon: "🧗", number: "25+", label: "Certified Guides" },
            { icon: "🛡️", number: "99.8%", label: "Safety Rating" },
          ].map((stat) => (
            <div className="stat-card" key={stat.label}>
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── FEATURED TOURS ──────────── */}
      <section className="featured-tours-section">
        <div className="section-header">
          <h2>Featured Trekking Tours</h2>
          <p>Hand-picked routes designed by native explorers to bring you closer to Vietnam's wilderness.</p>
        </div>
        <div className="tours-grid">
          {loadingTours ? (
            <div className="featured-loading">
              <p style={{ color: "#4b5563", fontWeight: 600 }}>Loading featured tours...</p>
            </div>
          ) : (
            tours.map((tour) => <TourCard key={tour.id} tour={tour} />)
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link to="/locations" className="about-btn">
            View All Tours →
          </Link>
        </div>
      </section>

      {/* ──────────── ABOUT US ──────────── */}
      <section className="about-section" id="about-section">
        <div className="about-container">
          <div className="about-image-wrapper">
            <img src={ABOUT_IMG} alt="Trekking through beautiful Vietnamese valleys" />
          </div>
          <div className="about-content">
            <span className="about-badge">Who We Are</span>
            <h2>Central Vietnam's Premier Wilderness Partner</h2>
            <p>
              TrekMate was founded by passionate explorers to connect adventurous travelers with rugged
              paths safely. We use vetted topological mapping, real-time weather alerts, and premium
              gear rentals to deliver flawless high-altitude excursions.
            </p>
            <ul className="about-bullets">
              {[
                "Certified guides with CPR training and deep trail knowledge.",
                "Full equipment rental — Tents, Sleep Bags, Trekking Poles.",
                "All itineraries optimized for environmental sustainability.",
              ].map((item) => (
                <li key={item}>
                  <span className="bullet-check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/about" className="about-btn">Discover More About Us</Link>
          </div>
        </div>
      </section>

      {/* ──────────── CONTACT ──────────── */}
      <section className="contact-section" id="contact-section">
        <div className="contact-container">
          <div className="section-header">
            <h2>Get In Touch</h2>
            <p>Questions about gear, trail conditions, or private bookings? Drop us a line.</p>
          </div>

          <div className="contact-info-cards">
            {[
              { icon: "📞", title: "Phone Hotline", detail: "+84 (0) 123 456 789" },
              { icon: "✉️", title: "Email Address", detail: "hello@trekmate.vn" },
              { icon: "📍", title: "Base Office", detail: "Ngu Hanh Son, Da Nang, Vietnam" },
            ].map((c) => (
              <div className="contact-info-card" key={c.title}>
                <div className="contact-icon-wrapper">{c.icon}</div>
                <h4>{c.title}</h4>
                <p>{c.detail}</p>
              </div>
            ))}
          </div>

          <div className="contact-form-wrapper">
            <h3>Send A Message</h3>
            {formSubmitted ? (
              <div className="contact-success-msg">
                ✨ Thank you! Your message has been sent. We'll get back to you shortly.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="form-name">Your Name</label>
                    <input id="form-name" type="text" required placeholder="John Doe"
                      value={contactName} onChange={(e) => setContactName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="form-email">Your Email</label>
                    <input id="form-email" type="email" required placeholder="john@example.com"
                      value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="form-msg">Your Message</label>
                  <textarea id="form-msg" rows={5} required placeholder="What would you like to ask us?"
                    value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
                </div>
                <button type="submit" disabled={submittingForm} className="contact-submit-btn">
                  {submittingForm ? "Sending..." : "Submit Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}