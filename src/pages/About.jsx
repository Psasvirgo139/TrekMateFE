import React from "react";
import { Navigate } from "react-router-dom";

const About = () => {
  return <Navigate to="/" state={{ scrollTo: "about-section" }} replace />;
};

export default About;