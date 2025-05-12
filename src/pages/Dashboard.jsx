import React, { useState } from "react";
import TradeForm from "../components/TradeForm";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";

const Dashboard = () => {
  const [trades, setTrades] = useState([
    {
      id: 1,
      ticker: "AAPL",
      type: "Long",
      entryPrice: 150,
      quantity: 10,
      date: "2025-04-29",
      stopLoss: 145,
      takeProfit: 165,
      status: "Open",
    },
    {
      id: 2,
      ticker: "TSLA",
      type: "Short",
      entryPrice: 720,
      quantity: 5,
      date: "2025-04-25",
      stopLoss: 750,
      takeProfit: 690,
      status: "Closed",
    },
  ]);

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const handleAddTrade = (newTrade) => {
    const tradeWithId = { ...newTrade, id: Date.now() };
    setTrades((prevTrades) => [...prevTrades, tradeWithId]);
  };

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
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td className="border-b p-2">
                    <Link to={`/trade/${trade.id}`}>{trade.ticker}</Link>
                  </td>
                  <td className="border-b p-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${trade.type === "Long" ? "bg-green-500" : "bg-red-500"}`}
                    >
                      {trade.type}
                    </span>
                    <span>
                      {trade.quantity} @ £{trade.entryPrice}
                    </span>
                  </td>
                  <td className="border-b p-2">{trade.date}</td>
                  <td className="border-b p-2">£{trade.stopLoss}</td>
                  <td className="border-b p-2">£{trade.takeProfit}</td>
                  <td className="border-b p-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${trade.status === "Open" ? "bg-blue-500" : "bg-gray-500"}`}
                    >
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Trade Button */}
        <button
          onClick={() => setIsTradeModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-8 hover:bg-blue-700 transition-colors duration-300"
        >
          Add Trade
        </button>

        <Modal isOpen={isTradeModalOpen} onClose={() => setIsTradeModalOpen(false)} title="Add New Trade">
          <TradeForm onAddTrade={handleAddTrade} />
        </Modal>

        {/* <div className="flex justify-center mt-8">
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Add New Trade
          </button>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-2 right-2 text-2xl text-red-800 hover:rotate-90 transition-transform duration-200"
                >
                  ✖
                </button>

                <h2 className="text-xl font-bold mb-4">Add New Trade</h2>
                <TradeForm
                  onAddTrade={(values) => {
                    console.log(values);
                    setShowModal(false); // close modal after submit
                  }}
                />
              </div>
            </div>
          )}
        </div> */}

        {/* <div className="mt-8">
          <TradeForm onAddTrade={handleAddTrade} />
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
