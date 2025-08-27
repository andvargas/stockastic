import React from "react";

const PerformanceTable = ({ data, onDelete }) => {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-cyan-800 text-gray-300">
          <tr>
            <th className="px-3 py-2 text-left">Week #</th>
            <th className="px-3 py-2 text-left">Date Range</th>
            <th className="px-3 py-2 text-right">Realised P/L</th>
            <th className="px-3 py-2 text-right">Unrealised P/L</th>
            <th className="px-3 py-2 text-right">Paper Realised</th>
            <th className="px-3 py-2 text-right">Paper Unrealised</th>
            <th className="px-3 py-2 text-right">Delete Row</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr
                key={idx}
                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <td className="px-3 py-2">{row.interval === "weekly" ? row.weekNumber : ""}</td>
                <td className="px-3 py-2">{row.dateRange}</td>
                <td className="px-3 py-2 text-right">
                  {row.realised?.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  {row.unrealised?.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  {row.paperRealised?.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  {row.paperUnrealised?.toFixed(2)}
                </td>
                <td className="px-2 py-1 text-center">
                <button
                  onClick={() => onDelete(row._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  X
                </button>
              </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="px-3 py-3 text-center text-gray-500 italic"
              >
                No performance data added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PerformanceTable;