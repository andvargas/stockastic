import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import CardContent from "../components/CardContent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { getTrades, getUnrealisedPL } from "../services/stockService";
import { formatCurrency } from "../utils/formatCurrency";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import toast from "react-hot-toast";

dayjs.extend(isoWeek);

const ProgressTracker = () => {
  const [trades, setTrades] = useState([]);
  const [weeklyRealised, setWeeklyRealised] = useState(0);
  const [monthlyRealised, setMonthlyRealised] = useState(0);
  const [weeklyUnrealised, setWeeklyUnrealised] = useState(0);
  const [monthlyUnrealised, setMonthlyUnrealised] = useState(0);
  const [unrealisedData, setUnrealisedData] = useState([]);

  console.log(trades[0]);

  // Fetch trades for realised P/L
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

  // Fetch unrealised P/L from backend
  useEffect(() => {
    const fetchUnrealised = async () => {
      try {
        const data = await getUnrealisedPL();
        console.log("Unrealised P/L data:", data);

        data.forEach((trade) => {
          if (trade.missingWeekStartSnap) {
            toast.error(`Warning: Missing week start snapshot for trade ${trade.ticker}`);
          }
          if (trade.missingMonthStartSnap) {
            toast.error(`Warning: Missing month start snapshot for trade ${trade.ticker}`);
          }
        });

        setUnrealisedData(data);
      } catch (error) {
        console.error("Failed to fetch unrealised P/L:", error);
      }
    };

    fetchUnrealised();
  }, []);

  // Calculate realised P/L locally from trades
  useEffect(() => {
    if (trades.length === 0) return;

    const now = dayjs();
    const startOfWeek = now.startOf("isoWeek");
    const startOfMonth = now.startOf("month");

    const isSameOrAfter = (dateStr, ref) => {
      return dayjs(dateStr).isSame(ref) || dayjs(dateStr).isAfter(ref);
    };

    const realisedThisWeek = trades
      .filter((t) => t.status === "Closed" && isSameOrAfter(t.closeDate, startOfWeek))
      .reduce((sum, t) => sum + (t.netProfit || 0), 0);

    const realisedThisMonth = trades
      .filter((t) => t.status === "Closed" && isSameOrAfter(t.closeDate, startOfMonth))
      .reduce((sum, t) => sum + (t.netProfit || 0), 0);

    setWeeklyRealised(realisedThisWeek);
    setMonthlyRealised(realisedThisMonth);
  }, [trades]);

  // Calculate total unrealised P/L from backend data
  useEffect(() => {
    if (unrealisedData.length === 0) return;

    const weeklySum = unrealisedData.reduce((acc, trade) => acc + (trade.weeklyUnrealisedGBP || 0), 0);
    const monthlySum = unrealisedData.reduce((acc, trade) => acc + (trade.monthlyUnrealisedGBP || 0), 0);

    setWeeklyUnrealised(weeklySum);
    setMonthlyUnrealised(monthlySum);
  }, [unrealisedData]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Progress Tracker</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="text-center">
              <h2 className="text-sm text-gray-500">Weekly Unrealised</h2>
              <p className={`text-2xl font-semibold ${weeklyUnrealised >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(weeklyUnrealised, "GBP")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <h2 className="text-sm text-gray-500">Monthly Unrealised</h2>
              <p className={`text-2xl font-semibold ${monthlyUnrealised >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(monthlyUnrealised, "GBP")}
              </p>
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
            <LineChart data={[] /* Wire up later */}>
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
          <Link to="/" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;