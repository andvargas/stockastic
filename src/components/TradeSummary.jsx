import React, { useEffect, useState } from "react";
import api from "../services/api";
import dayjs from "dayjs";
import currencyRates from "../utils/currencyRates";
import { formatCurrency } from "../utils/formatCurrency";

const TradeSummary = ({ trade }) => {
  const [adjustments, setAdjustments] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [manualPrice, setManualPrice] = useState(null);
  const [highestClosePrice, setHighestClosePrice] = useState(trade.highestClosePrice || null);

  const fetchAdjustments = async () => {
    try {
      const res = await api.get(`/trades/${trade._id}/adjustments`);
      setAdjustments(res.data);
    } catch (error) {
      console.error("Error fetching adjustments:", error);
    }
  };

  const fetchCurrentPrice = async () => {
    try {
      const res = await api.get(`/open-positions`);
      const position = res.data.find((p) => p.symbol === trade.symbol);
      setCurrentPrice(position?.currentPrice || trade.closePrice || null);
    } catch (error) {
      console.error("Error fetching current price:", error);
    }
  };

  const fetchManualPrice = async () => {
    try {
      const res = await api.get(`/trades/${trade._id}`);
      setManualPrice(res.data.manualCurrentPrice || null);
    } catch (err) {
      console.error("Error fetching manual price:", err);
    }
  };

  const refreshData = () => {
    fetchAdjustments();
    if (trade.status === "Open") {
      fetchCurrentPrice();
      fetchManualPrice();
    } else {
      setCurrentPrice(trade.closePrice);
    }
  };

  useEffect(() => {
    if (trade._id) {
      refreshData();
      const dailyInterval = setInterval(() => {
        refreshData();
      }, 3600000);
      return () => clearInterval(dailyInterval);
    }
  }, [trade]);

  const endDate = trade.status === "Open" ? dayjs() : dayjs(trade.closeDate);
  const daysPassed = endDate.diff(dayjs(trade.date), "day");

  const tradeRate = currencyRates[trade.currency] || 1;
  const totalAdjustments = trade.status === "Open" ? adjustments.reduce((sum, adj) => sum + adj.amount, 0) : trade.adjustmentsTotal || 0;
  const overnightInterestTotal = trade.status === "Open" ? trade.overnightInterest * daysPassed : trade.overnightInterestTotal || 0;

  const effectivePrice = manualPrice !== null ? manualPrice : currentPrice;

  const grossProfit =
    trade.status === "Open" ? (effectivePrice !== null ? (effectivePrice - trade.entryPrice) * trade.quantity * tradeRate : 0) : trade.pnl ?? 0;

  const netProfit = trade.status === "Open" ? grossProfit + totalAdjustments - overnightInterestTotal : trade.netProfit || 0;

  const handleSetManualPrice = async () => {
    const input = prompt("Enter current price:");
    if (input && !isNaN(input)) {
      const parsedPrice = parseFloat(input);
      setManualPrice(parsedPrice);
      await api.post(`/trades/${trade._id}/set-manual-price`, { price: parsedPrice });
    }
  };

  const handleSetHighestClosePrice = async () => {
    const input = prompt("Enter highest close price (on 15 min. timeframe):");
    if (input && !isNaN(input)) {
      const parsedPrice = parseFloat(input);
      await api.post(`/trades/${trade._id}/set-highest-close-price`, { highestPrice: parsedPrice });
      setHighestClosePrice(parsedPrice);
    }
  };

  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Trade Summary</h2>

      <div className="gap-3">
        <p>
          {trade.status === "Open" ? "Current Price: " : "Closed Price: "}
          {effectivePrice !== null ? formatCurrency(effectivePrice, trade.currency) : "Not available"}
        </p>
        {trade.status === "Open" && (
          <button onClick={handleSetManualPrice} className="px-2 py-0.5 border rounded text-sm hover:bg-gray-200">
            Set Price
          </button>
        )}
      </div>
      <p>Highest Close Price: {highestClosePrice ? formatCurrency(highestClosePrice, trade.currency) : "Not set"}</p>
      {trade.status === "Open" && (
        <button onClick={handleSetHighestClosePrice} className="px-2 py-0.5 border rounded text-sm hover:bg-gray-200">
          Set Highest Close Price
        </button>
      )}

      <p>Days Open: {daysPassed}</p>
      <p className="font-medium">Gross Profit: £{typeof grossProfit === "number" ? grossProfit.toFixed(2) : "0.00"}</p>
      <p>Adjustments Total: £{totalAdjustments.toFixed(2)}</p>
      <p>Overnight Interest Total: £{overnightInterestTotal.toFixed(2)}</p>
      <p className={`font-bold text-lg mt-4 ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
        Net Profit: £{typeof netProfit === "number" ? netProfit.toFixed(2) : "0.00"}
      </p>
    </div>
  );
};

export default TradeSummary;