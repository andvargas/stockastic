const Tooltip = ({ children, tooltipText, position = "top" }) => {
  // Map positions to Tailwind classes
  const positionClasses = {
    top: "bottom-full mb-1 left-1/2 transform -translate-x-1/2",
    bottom: "top-full mt-1 left-1/2 transform -translate-x-1/2",
    left: "right-full mr-1 top-1/2 transform -translate-y-1/2",
    right: "left-full ml-1 top-1/2 transform -translate-y-1/2",
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out bg-neutral-500 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 pointer-events-none scale-95 group-hover:scale-100 transition-transform ${positionClasses[position]}`}
      >
        {tooltipText}
      </div>
    </div>
  );
};

export default Tooltip;
