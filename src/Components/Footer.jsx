import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const footerColumns = [
    {
      title: "Quick Links",
      items: [
        { label: "Home", path: "/" },
        { label: "About us", path: "/about" },
        { label: "Adventures", path: "/adventures" },
        { label: "Contact us", path: "/contact" },
        { label: "FAQ", path: "/faq" }
      ]
    },
    {
      title: "Recommended Travel",
      items: [
        { label: "Hampi", path: "/locationDetail" },
        { label: "Coorg", path: "/locationDetail" },
        { label: "Munnar", path: "/locationDetail" },
        { label: "Rishikesh", path: "/locationDetail" },
        { label: "Pondicherry", path: "/locationDetail" }
      ]
    },
    {
      title: "Adventures",
      items: [
        { label: "Hot Air Ballooning", path: "/adventureDetail" },
        { label: "Wildlife Safari", path: "/adventureDetail" },
        { label: "Scuba Diving", path: "/adventureDetail" },
        { label: "Backwater Cruise", path: "/adventureDetail" },
        { label: "Wildlife", path: "/adventureDetail" }
      ]
    }
  ];
  return (
    <footer className="footer-section">
      <div className="footer-top">
        <motion.div
          className="footer-col brand"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="footer-logo">IndiVoyage</h2>
          <p>
            Heritage and adventures, curated for your journey. Discover India
            through an immersive gateway designed to connect you with the nation's
            most iconic landscapes, cultures, and experiences.
          </p>
        </motion.div>

        {footerColumns.map((col, i) => (
          <motion.div
            className="footer-col"
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <h4>{col.title}</h4>
            <ul>
              {col.items.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <a href={item.path} className="hover:underline">
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="footer-bottom-img"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      ></motion.div>
    </footer>
  );
};

export default Footer;
