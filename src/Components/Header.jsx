import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";


const Header = ({
   bgImage,
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

      {/* HERO SECTION */}
      <section className="hero-section" style={{ backgroundImage: `url(${bgImage})` }}>
      {/* DARK OVERLAY */}
      <div className="hero-overlay"></div>

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
          {mainHeading}
        </motion.h2>}

        {showDescription && <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {description}
        </motion.p>}
      </motion.div>}
    </section>

      {openSidebar && (
        <div className="sidebar-backdrop" onClick={() => setOpenSidebar(false)} />
      )}
    <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
      </section>
    </>
  );
};

export default Header;
