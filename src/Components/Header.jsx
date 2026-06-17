import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
  
  useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 18);
      };

      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

  return (
    <>
    <section>
      {/* NAVBAR BUTTON */}
       <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
  <div className="header-inner">
    <Link to='/'><h1 className="logo">IndiVoyage</h1></Link>

    {!hideMenuButton && (
      <div className="menu-btn" onClick={() => setOpenSidebar((previous) => !previous)}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    )}
  </div>
</header>

            <nav className="home-nav">
              <Link to="/" className="home-nav-link">
                Home
              </Link>
              <Link to="/locations" className="home-nav-link active">
                Tours
              </Link>
              <Link to="/about" className="home-nav-link">
                About Us
              </Link>
              <Link to="/contact" className="home-nav-link">
                Contact
              </Link>
              <Link to="/payment" className="home-nav-link">
                Payment
              </Link>
              <Link to="/admin/tours" className="home-nav-link">
                Tour Management
              </Link>
            </nav>

      {/* CENTER HEADING ON IMAGE */}
      {/* WHITE CONTENT BOX */}
      {showDescription && <motion.div
        className="hero-content-box"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >

        {showDescription &&<motion.h3
          className="hero-small-title"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {subheading}
        </motion.h3>}

        {showDescription && <motion.h2
          className="hero-bold-title"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          {/* DARK OVERLAY */}
          <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-[#012d1d]/60 to-[#012d1d]/85"></div>

          {/* HERO COPY (No white box, modern typography) */}
          {showDescription && (
            <motion.div
              className="relative z-10 text-center max-w-4xl mx-auto text-white flex flex-col items-center gap-4 px-4"
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

      {openSidebar && (
        <div className="sidebar-backdrop" onClick={() => setOpenSidebar(false)} />
      )}
    <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
      </section>
    </>
  );
};

export default Header;
