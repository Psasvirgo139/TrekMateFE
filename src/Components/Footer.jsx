import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const footerLinks = [
    {
      title: "Platform",
      links: [
        { label: "Tours", path: "/locations" },
        { label: "Safety Protocols", path: "/" },
        { label: "Guide Registry", path: "/" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", path: "/" },
        { label: "Privacy Policy", path: "/" }
      ]
    }
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2>TrekMate</h2>
          <p>
            Professional logistics for trekking enthusiasts in the Central Vietnam
            region. Bridging the gap between wilderness and coordination.
          </p>
          <p className="footer-copy">© 2024 TrekMate. Professional Trekking Logistics.</p>
        </motion.div>

        {footerLinks.map((group, index) => (
          <motion.div
            className="footer-group"
            key={group.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <h4>{group.title}</h4>
            <ul>
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        <motion.div
          className="footer-group footer-contact"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h4>Contact Us</h4>
          <div className="footer-contact-list">
            <a href="mailto:hello@trekmate.com" className="footer-contact-link">
              <span aria-hidden="true">✉️</span> hello@trekmate.com
            </a>
            <a href="tel:+840123456789" className="footer-contact-link">
              <span aria-hidden="true">📞</span> +84 012 345 6789
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
