import React, { useEffect, useState } from "react";
import api from "../services/api";
import dayjs from "dayjs";
import { formatCurrency } from "../utils/formatCurrency";

const TradeSummary = ({ trade, highestPrice, latestPrice, currencyRates = {} }) => {
  const [adjustments, setAdjustments] = useState([]);

  // Fetch adjustments only
  const fetchAdjustments = async () => {
    try {
      const res = await api.get(`/trades/${trade._id}/adjustments`);
      setAdjustments(res.data);
    } catch (error) {
      console.error("Error fetching adjustments:", error);
    }
  };

  useEffect(() => {
    if (trade._id) {
      fetchAdjustments();

      const interval = setInterval(() => {
        fetchAdjustments();
      }, 3600000); // update every hour

      return () => clearInterval(interval);
    }
  }, [trade]);

  const endDate = trade.status === "Open" ? dayjs() : dayjs(trade.closeDate);
  const daysPassed = endDate.diff(dayjs(trade.date), "day");

  // Use passed currency rates
  const tradeRate = currencyRates[trade.currency] || 1;

  const totalAdjustments = trade.status === "Open" ? adjustments.reduce((sum, adj) => sum + adj.amount, 0) : trade.adjustmentsTotal || 0;

  const overnightInterestTotal = trade.status === "Open" ? trade.overnightInterest * daysPassed : trade.overnightInterestTotal || 0;

  const effectivePrice = latestPrice !== null ? latestPrice : trade.closePrice;

  const grossProfit =
    trade.status === "Open"
      ? effectivePrice !== null
        ? (effectivePrice / tradeRate - trade.entryPrice / tradeRate) * trade.quantity
        : 0
      : trade.pnl ?? 0;

  const netProfit = trade.status === "Open" ? grossProfit + totalAdjustments - overnightInterestTotal : trade.netProfit || 0;

  return (
    <div className="bg-gray-50 border rounded p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Trade Summary</h2>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>{trade.status === "Open" ? "Current Price:" : "Closed Price:"}</span>
          <span>{latestPrice !== null ? formatCurrency(latestPrice, trade.currency) : "Not available"}</span>
        </div>
        <div className="flex justify-between">
          <span>Highest Snapshot Price:</span>
          <span>{highestPrice !== null ? formatCurrency(highestPrice, trade.currency) : "Not set"}</span>
        </div>
        <div className="flex justify-between">
          <span>Days Open:</span>
          <span>{daysPassed}</span>
        </div>
        <div className="flex justify-between">
          <span>Gross Profit:</span>
          <span>£{typeof grossProfit === "number" ? grossProfit.toFixed(2) : "0.00"}</span>
        </div>
        <div className="flex justify-between">
          <span>Adjustments Total:</span>
          <span>£{totalAdjustments.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Overnight Interest Total:</span>
          <span>£{overnightInterestTotal.toFixed(2)}</span>
        </div>
        <div className={`flex justify-between font-bold text-lg mt-4 ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
          <span>Net Profit:</span>
          <span>£{typeof netProfit === "number" ? netProfit.toFixed(2) : "0.00"}</span>
        </div>
      </div>
    </div>
  );
};

export default TradeSummary;