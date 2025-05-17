import React from "react";

const Tooltip = ({ children, tooltipText }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out bg-neutral-500 text-white text-xs rounded py-1 px-2 bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10 pointer-events-none scale-95 group-hover:scale-100 transition-transform">
        {tooltipText}
      </div>
    </div>
  );
};

export default Tooltip;