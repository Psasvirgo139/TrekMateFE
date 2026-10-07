import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import footerImg from "../../images/footer.webp";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const variants = {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
  };

  const handleScrollNavigation = (sectionId) => {
    setOpen(false);
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
    <motion.div
      className="sidebar"
      initial="hidden"
      animate={open ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="sidebar-content">
        <button type="button" className="sidebar-close-btn" onClick={() => setOpen(false)}>
          ×
        </button>

        <h2 className="sidebar-title">TrekMate</h2>

        <ul className="sidebar-links">
          <Link to='/' onClick={() => setOpen(false)}><li>Home</li></Link>
          <a href="#about-section" onClick={(e) => { e.preventDefault(); handleScrollNavigation("about-section"); }}>
            <li>About us</li>
          </a>
          <Link to='/locations' onClick={() => setOpen(false)}><li>Tours</li></Link>
          <a href="#contact-section" onClick={(e) => { e.preventDefault(); handleScrollNavigation("contact-section"); }}>
            <li>Contact us</li>
          </a>
          <a href="https://github.com/Psasvirgo139/EXETrekMate/releases/tag/v1.0.0" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <li>Download</li>
          </a>
          <Link to='/faq' onClick={() => setOpen(false)}><li>FAQ</li></Link>
        </ul>

        <img src={footerImg} alt="TrekMate" className="sidebar-footer-img" />
      </div>
    </motion.div>
  );
};

export default Sidebar;
