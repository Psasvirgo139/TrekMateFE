import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import footerImg from "../Images/footer.webp";

const Sidebar = ({ open, setOpen }) => {
  const variants = {
    hidden: { x: "-100%" },   
  visible: { x: "0%" }, 
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

        <p className="back-btn" onClick={() => setOpen(false)}>‹ Back</p>

        <h2 className="sidebar-title">IndiVoyage</h2>

        <ul className="sidebar-links">
          <Link to='/'><li>Home</li></Link>
          <Link to='/about'><li>About us</li></Link>
          <Link to='/locations'><li>Locations</li></Link>
          <Link to='/adventures'><li>Adventures</li></Link>
          <Link to='/contact'><li>Contact us</li></Link>
          <Link to='/faq'><li>FAQ</li></Link>
        </ul>

        <img
          src={footerImg}
          alt="IndiVoyage"
          className="sidebar-footer-img"
        />
      </div>
    </motion.div>
  );
};

export default Sidebar;
