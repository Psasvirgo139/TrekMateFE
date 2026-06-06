import React from 'react';

const GuidePlaceholder = ({ title, description }) => {
  return (
    <div className="gd-placeholder">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default GuidePlaceholder;
