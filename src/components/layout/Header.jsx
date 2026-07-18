import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth, useHasRole } from "../../context/AuthContext";
import AuthNav from "./AuthNav";
import Sidebar from "./Sidebar";

const Header = ({
  bgImage,
  pageTitle,
  subheading,
  mainHeading,
  description,
  showDescription = true,
  hideMenuButton = false
}) => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isGuide = useHasRole('GUIDE');
  const isAdmin = useHasRole('ADMIN');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smart navigation: scroll on homepage, navigate with state from other pages
  const handleScrollNavigation = (sectionId) => {
    if (location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { state: { scrollTo: sectionId } });
    }
  };

  return (
    <>
      <section className="hero-section" style={{ backgroundImage: `url(${bgImage})` }}>
        {/* NAVBAR BUTTON */}
        <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
          <div className="header-inner">
            <Link to='/'><h1 className="logo">TrekMate Danang</h1></Link>

            <nav className="home-nav">
              <Link to="/" className="home-nav-link">
                Home
              </Link>
              <Link to="/locations" className="home-nav-link">
                Tours
              </Link>
              <a
                href="#about-section"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollNavigation("about-section");
                }}
                className="home-nav-link"
              >
                About Us
              </a>
              <a
                href="#contact-section"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollNavigation("contact-section");
                }}
                className="home-nav-link"
              >
                Contact
              </a>
            </nav>

            <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AuthNav />
              {user && (
                <div className="menu-btn" onClick={() => setOpenSidebar((previous) => !previous)}>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DARK OVERLAY */}
        <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-[#012d1d]/60 to-[#012d1d]/85"></div>

        {/* HERO WRAPPER FOR VERTICAL LAYOUT */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full gap-6 px-4">
          {/* CENTER HEADING ON IMAGE */}
          {pageTitle && (
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {pageTitle}
            </motion.h1>
          )}

          {/* HERO COPY (No white box, modern typography) */}
          {showDescription && (
            <motion.div
              className="text-center max-w-4xl mx-auto text-white flex flex-col items-center gap-4 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {subheading && (
                <span className="text-[#fea619] tracking-widest text-[11px] md:text-xs font-extrabold uppercase bg-[#012d1d]/50 px-4 py-1.5 rounded-full border border-white/10">
                  {subheading}
                </span>
              )}

              {mainHeading && (
                <h1 className="font-montserrat font-extrabold text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight mt-2 text-white">
                  {mainHeading}
                </h1>
              )}

              {description && (
                <p className="text-gray-200 text-sm md:text-base max-w-2xl leading-relaxed mt-2">
                  {description}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {openSidebar && (
        <div className="sidebar-backdrop" onClick={() => setOpenSidebar(false)} />
      )}
      <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
    </>
  );
};

export default Header;

