import React from "react";
import { Navigate } from "react-router-dom";

const Contact = () => {
  return <Navigate to="/" state={{ scrollTo: "contact-section" }} replace />;
};

export default Contact;