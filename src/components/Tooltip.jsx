import { useEffect, useState } from "react";
import clsx from "clsx";

const Tooltip = ({ children, tooltipText, position = "top", showOnLoadDuration = 0 }) => {
  const [showOnLoad, setShowOnLoad] = useState(false);

  const positionClasses = {
    top: "bottom-full mb-1 left-1/2 transform -translate-x-1/2",
    bottom: "top-full mt-1 left-1/2 transform -translate-x-1/2",
    left: "right-full mr-1 top-1/2 transform -translate-y-1/2",
    right: "left-full ml-1 top-1/2 transform -translate-y-1/2",
  };

  useEffect(() => {
    console.log("Tooltip loaded — showOnLoadDuration:", showOnLoadDuration);

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

  const tooltipClasses = clsx(
    "absolute transition-opacity transition-transform duration-200 ease-out bg-neutral-500 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 pointer-events-none",
    positionClasses[position],
    {
      "opacity-100 scale-100": showOnLoad,
      "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100": !showOnLoad,
    }
  );

  return (
    <div className="relative group inline-block">
      {children}
      <div className={tooltipClasses}>{tooltipText}</div>
    </div>
  );
};

export default Tooltip;