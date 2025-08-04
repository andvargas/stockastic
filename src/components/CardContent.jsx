import React from "react";

const CardContent = ({ children, className = "" }) => {
  return (
    <div className={`px-2 py-1 ${className}`}>
      {children}
    </div>
  );
};

export default CardContent;