import React, { useEffect, useState } from "react";
import api from "../services/api";
import dayjs from "dayjs";

const TradeSummary = ({ trade }) => {
  const [adjustments, setAdjustments] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);

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
      setCurrentPrice(position?.currentPrice || trade.exitPrice);
    } catch (error) {
      console.error("Error fetching current price:", error);
    }
  };

  const refreshData = () => {
    fetchAdjustments();
    if (trade.status === "Open") {
      fetchCurrentPrice();
    } else {
      // Set to exitPrice for closed trades immediately
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

  // 📌 Only gross profit needs conversion from GBX if applicable
  const convertGrossProfitToGBP = (value, currency) => {
    return currency === "GBX" ? value / 100 : value;
  };

  const totalAdjustments = adjustments.reduce((sum, adj) => sum + adj.amount, 0); // in GBP
  const daysPassed = dayjs().diff(dayjs(trade.date), "day");

  const grossProfitRaw = (currentPrice - trade.entryPrice) * trade.quantity;
  const grossProfit = convertGrossProfitToGBP(grossProfitRaw, trade.currency); // now in GBP

  const overnightInterestTotal = trade.overnightInterest * daysPassed; // already in GBP

  const netProfit = grossProfit + totalAdjustments + overnightInterestTotal;

  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Trade Summary</h2>
      <p>
        Current Price: {trade.currency}
        {currentPrice}
      </p>
      <p>Days Open: {daysPassed}</p>
      <p className="font-medium">Gross Profit: £{grossProfit.toFixed(2)}</p>
      <p>Adjustments Total: £{totalAdjustments.toFixed(2)}</p>
      <p>Overnight Interest Total: £{overnightInterestTotal.toFixed(2)}</p>
      <p className={`font-bold text-lg mt-4 ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>Net Profit: £{netProfit.toFixed(2)}</p>
    </div>
  );
};

export default TradeSummary;
