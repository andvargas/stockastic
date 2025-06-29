import { useEffect, useState } from "react";

const Tooltip = ({ children, tooltipText, position = "top", showOnLoadDuration = 0 }) => {
  const [showOnLoad, setShowOnLoad] = useState(false);

  const positionClasses = {
    top: "bottom-full mb-1 left-1/2 transform -translate-x-1/2",
    bottom: "top-full mt-1 left-1/2 transform -translate-x-1/2",
    left: "right-full mr-1 top-1/2 transform -translate-y-1/2",
    right: "left-full ml-1 top-1/2 transform -translate-y-1/2",
  };

  useEffect(() => {
    if (typeof showOnLoadDuration === "number" && showOnLoadDuration > 0) {
      setShowOnLoad(true);
      const timer = setTimeout(() => {
        setShowOnLoad(false);
      }, showOnLoadDuration);
      return () => clearTimeout(timer);
    } else {
      setShowOnLoad(false);
    }
  }, [showOnLoadDuration]);

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`absolute
        ${showOnLoad || "group-hover:opacity-100 group-hover:scale-100"}
        opacity-${showOnLoad ? "100" : "0"}
        transition-opacity transition-transform duration-200 ease-out
        bg-neutral-500 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 pointer-events-none scale-${showOnLoad ? "100" : "95"}
        ${positionClasses[position]}`}
      >
        {tooltipText}
      </div>
    </div>
  );
};

export default Tooltip;