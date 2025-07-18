import React from "react";
import dayjs from "dayjs";
import Tooltip from "./Tooltip";

const DateCard = ({ date }) => {
  const d = dayjs(date);
  const day = d.format("DD");
  const month = d.format("MMM").toUpperCase(); // e.g., "JUN"
  const year = d.format("YYYY");

  return (
    <div className="relative group w-10 h-9 bg-slate-500 rounded-md shadow-sm flex flex-col items-center justify-center text-center leading-none">
      <Tooltip tooltipText={year} position="left">
        <div className="text-sm font-bold text-gray-100">{day}</div>
        <div className="text-[10px] text-gray-200 uppercase">{month}</div>
      </Tooltip>
    </div>
  );
};

export default DateCard;