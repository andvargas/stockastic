import React, { useEffect, useState } from "react";
import api from "../services/api";
import dayjs from "dayjs";
import currencyRates from "../utils/currencyRates";

const TradeSummary = ({ trade }) => {
  const [adjustments, setAdjustments] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [manualPrice, setManualPrice] = useState(null);

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

  const refreshData = () => {
    fetchAdjustments();
    if (trade.status === "Open") {
      fetchCurrentPrice();
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

  const handleSetManualPrice = () => {
    const input = prompt("Enter current price:");
    if (input && !isNaN(input)) {
      setManualPrice(parseFloat(input));
    }
  };

  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Trade Summary</h2>

      <div className="flex items-center gap-3">
        <p>
          {trade.status === "Open" ? "Current Price: " : "Closed Price: "}
          {trade.currency} {effectivePrice !== null ? effectivePrice : "Not available"}
        </p>
        {trade.status === "Open" && (
          <button onClick={handleSetManualPrice} className="px-2 py-0.5 border rounded text-sm hover:bg-gray-200">
            Set Price
          </button>
        )}
      </div>

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