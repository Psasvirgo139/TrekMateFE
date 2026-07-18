import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useHasRole } from "../../context/AuthContext";
import footerImg from "../../images/footer.webp";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isGuide = useHasRole('GUIDE');
  const isAdmin = useHasRole('ADMIN');

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
          <Link to='/locations' onClick={() => setOpen(false)}><li>Locations</li></Link>
          <Link to='/adventures' onClick={() => setOpen(false)}><li>Adventures</li></Link>
          <Link to='/bookings' onClick={() => setOpen(false)}><li>My Bookings</li></Link>
          <a href="#contact-section" onClick={(e) => { e.preventDefault(); handleScrollNavigation("contact-section"); }}>
            <li>Contact us</li>
          </a>
          <Link to='/faq' onClick={() => setOpen(false)}><li>FAQ</li></Link>

          {/* Operations Dashboard for Admin */}
          {isAdmin && (
            <Link to='/guide' onClick={() => setOpen(false)}><li>Operations Dashboard</li></Link>
          )}

          {/* Guide Menu Links */}
          {(isGuide || isAdmin) && (
            <>
              <Link to='/admin/tours' onClick={() => setOpen(false)}><li>Tour Management</li></Link>
              <Link to='/admin/guide-calendar' onClick={() => setOpen(false)}><li>Guide Calendar</li></Link>
            </>
          )}
        </ul>

        <img src={footerImg} alt="TrekMate" className="sidebar-footer-img" />
      </div>
    </motion.div>
  );
};

export default Sidebar;
