import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import CardContent from "../components/CardContent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { getTrades } from "../services/stockService";
import { formatCurrency } from "../utils/formatCurrency";

const ProgressTracker = () => {
  const [trades, setTrades] = useState([]);
  const [weeklyRealised, setWeeklyRealised] = useState(0);
  const [monthlyRealised, setMonthlyRealised] = useState(0);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const data = await getTrades();
        setTrades(data);
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      }
    };

    fetchTrades();
  }, []);

  useEffect(() => {
    if (trades.length === 0) return;

    const now = new Date();

    // Calculate Weekly Realised
    const startOfWeek = new Date(now);
    const day = now.getDay(); // Sunday = 0, Monday = 1
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyRealisedSum = trades
      .filter((trade) => trade.status === "Closed" && new Date(trade.date) >= startOfWeek)
      .reduce((sum, trade) => sum + (trade.netProfit || 0), 0);

    setWeeklyRealised(weeklyRealisedSum);

    // Calculate Monthly Realised
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRealisedSum = trades
      .filter((trade) => trade.status === "Closed" && new Date(trade.date) >= startOfMonth)
      .reduce((sum, trade) => sum + (trade.netProfit || 0), 0);

    setMonthlyRealised(monthlyRealisedSum);
  }, [trades]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Progress Tracker</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="text-center">
              <h2 className="text-sm text-gray-500">Weekly Unrealised</h2>
              <p className="text-2xl font-semibold">£0.00</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <h2 className="text-sm text-gray-500">Weekly Realised</h2>
              <p className={`text-2xl font-semibold ${weeklyRealised >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(weeklyRealised, "GBP")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <h2 className="text-sm text-gray-500">Monthly Unrealised</h2>
              <p className="text-2xl font-semibold">£0.00</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <h2 className="text-sm text-gray-500">Monthly Realised</h2>
              <p className={`text-2xl font-semibold ${monthlyRealised >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(monthlyRealised, "GBP")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Overall Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[] /* We'll wire this up later */}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="realised" stroke="#34D399" name="Realised" strokeWidth={2} />
              <Line type="monotone" dataKey="unrealised" stroke="#60A5FA" name="Unrealised" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;