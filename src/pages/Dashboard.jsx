import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">📊 My Trading Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <h2 className="text-sm text-gray-500">Total Trades</h2>
            <p className="text-2xl font-semibold">12</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <h2 className="text-sm text-gray-500">Open Positions</h2>
            <p className="text-2xl font-semibold">3</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <h2 className="text-sm text-gray-500">Total P/L</h2>
            <p className="text-2xl font-semibold text-green-500">+£1,250</p>
          </div>
        </div>

{/* Trade List */}
<div className="bg-white rounded-xl p-6 shadow">
  <h2 className="text-xl font-bold mb-4">Trades</h2>
  <table className="w-full text-left border-collapse">
    <thead>
      <tr>
        <th className="border-b p-2">Ticker</th>
        <th className="border-b p-2">Entry</th>
        <th className="border-b p-2">Date</th>
        <th className="border-b p-2">Stop Loss</th>
        <th className="border-b p-2">Take Profit</th>
        <th className="border-b p-2">Status</th>
      </tr>
    </thead>
    <tbody>
      {/* Example Row */}
      <tr>
        <td className="border-b p-2">AAPL</td>
        <td className="border-b p-2 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-green-500">Long</span>
          <span>10 @ £150</span>
        </td>
        <td className="border-b p-2">2025-04-29</td>
        <td className="border-b p-2">£145</td>
        <td className="border-b p-2">£165</td>
        <td className="border-b p-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-blue-500">Open</span>
        </td>
      </tr>

      <tr>
        <td className="border-b p-2">TSLA</td>
        <td className="border-b p-2 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-red-500">Short</span>
          <span>5 @ £720</span>
        </td>
        <td className="border-b p-2">2025-04-25</td>
        <td className="border-b p-2">£750</td>
        <td className="border-b p-2">£690</td>
        <td className="border-b p-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gray-500">Closed</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>

        {/* Add Trade Button */}
        <div className="text-center mt-8">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
            ➕ Add New Trade
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;