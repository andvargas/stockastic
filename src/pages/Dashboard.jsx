import React, { useState, useEffect } from "react";
import { getTrades } from "../services/stockService";
import TradeForm from "../components/TradeForm";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { addTrade } from "../services/stockService";

const Dashboard = () => {
  const [trades, setTrades] = useState([]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await getTrades();
        setTrades(res.data);
      } catch (err) {
        console.error("Error fetching trades", err);
      }
    };

    fetchTrades();
  }, []);

  const handleAddTrade = async (newTrade) => {
    try {
      const res = await addTrade(newTrade);
      setTrades((prevTrades) => [...prevTrades, res.data]);
      return true;
    } catch (err) {
      console.error("Error adding trade", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Stockastic Trading Dashboard</h1>

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
                <tr key={trade._id}>
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
                  <td className="border-b p-2">{new Date(trade.date).toLocaleDateString()}</td>
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
          <TradeForm onAddTrade={handleAddTrade} onClose={() => setIsTradeModalOpen(false)} />
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;

// todo: onClose is not working
