import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Header = ({
  bgImage,
  pageTitle,
  subheading,
  mainHeading,
  description,
  showDescription = true
}) => {
  return (
    <>
      <section className="relative">
        {/* HORIZONTAL NAVIGATION BAR (Matching Home.jsx style) */}
        <header className="home-header">
          <div className="home-header-inner">
            <Link to="/" className="home-brand">
              TrekMate Danang
            </Link>

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

            <Link to="/payment" className="home-button primary-button">
              Book Now
            </Link>
          </div>
        </header>

        {/* HERO SECTION */}
        <section 
          className="hero-section flex items-center justify-center relative px-6 py-24 md:py-32" 
          style={{ 
            backgroundImage: `url(${bgImage})`,
            minHeight: "45vh",
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "100px 0"
          }}
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

              {description && (
                <p className="text-white/85 font-sans text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mt-2">
                  {description}
                </p>
              )}
            </motion.div>
          )}
        </section>
      </section>
    </>
  );
};

export default Header;
