import React, { useEffect, useState, useMemo } from "react";
import Card from "../components/Card";
import CardContent from "../components/CardContent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as TooltipRecharts, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { getTrades, getUnrealisedPL } from "../services/stockService";
import { formatCurrency } from "../utils/formatCurrency";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import toast from "react-hot-toast";
import AssetTypeSwitch from "@/components/AssetTypeSwitch";
import { PackagePlus } from "lucide-react";
import Tooltip from "@/components/Tooltip";

dayjs.extend(isoWeek);

const ProgressTracker = () => {
  const [trades, setTrades] = useState([]);
  const [unrealisedData, setUnrealisedData] = useState([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState(["Real Money", "CFD"]);

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

  // Memoized calculations so they re-run only when dependencies change
  const { weeklyRealised, monthlyRealised, weeklyUnrealised, monthlyUnrealised } = useMemo(() => {
    if (trades.length === 0 && unrealisedData.length === 0) {
      return { weeklyRealised: 0, monthlyRealised: 0, weeklyUnrealised: 0, monthlyUnrealised: 0 };
    }

    const now = dayjs();
    const startOfWeek = now.startOf("isoWeek");
    const startOfMonth = now.startOf("month");

    const isSameOrAfter = (dateStr, ref) => {
      return dayjs(dateStr).isSame(ref) || dayjs(dateStr).isAfter(ref);
    };

    // Filter trades by asset type
    const filteredTrades = trades.filter((t) => selectedAssetTypes.includes(t.assetType));

    const realisedThisWeek = filteredTrades
      .filter((t) => t.status === "Closed" && isSameOrAfter(t.closeDate, startOfWeek))
      .reduce((sum, t) => sum + (t.netProfit || 0), 0);

    const realisedThisMonth = filteredTrades
      .filter((t) => t.status === "Closed" && isSameOrAfter(t.closeDate, startOfMonth))
      .reduce((sum, t) => sum + (t.netProfit || 0), 0);

    // Filter unrealised data by asset type
    const filteredUnrealised = unrealisedData.filter((t) => selectedAssetTypes.includes(t.assetType));

    const weeklySum = filteredUnrealised.reduce((acc, trade) => acc + (trade.weeklyUnrealisedGBP || 0), 0);
    const monthlySum = filteredUnrealised.reduce((acc, trade) => acc + (trade.monthlyUnrealisedGBP || 0), 0);

    return {
      weeklyRealised: realisedThisWeek,
      monthlyRealised: realisedThisMonth,
      weeklyUnrealised: weeklySum,
      monthlyUnrealised: monthlySum,
    };
  }, [trades, unrealisedData, selectedAssetTypes]);

  const handleRecordPerformance = async () => {
    try {
      const response = await axios.post("http://localhost:5002/api/performance-history/record", {
        package: "PackagePlus", // Example data
        trades: [
          { tradeId: "12345", result: "win", profit: 150 },
          { tradeId: "12346", result: "loss", profit: -50 },
        ],
      });

      console.log("Performance recorded:", response.data);
      alert("Performance history saved successfully!");
    } catch (error) {
      console.error("Error recording performance:", error);
      alert("Failed to record performance.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-6">Progress Tracker</h1>

          <Tooltip tooltipText="Add Performance snapshot">
            <PackagePlus className="h-5 w-5 text-gray-500" onClick={handleRecordPerformance} />
          </Tooltip>

          <AssetTypeSwitch onChange={setSelectedAssetTypes} />
        </div>

        {/* Summary Cards */}
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

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Overall Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[] /* Wire up later */}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <TooltipRecharts />
              <Line type="monotone" dataKey="realised" stroke="#34D399" name="Realised" strokeWidth={2} />
              <Line type="monotone" dataKey="unrealised" stroke="#60A5FA" name="Unrealised" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Back link */}
        <div className="mt-6">
          <Link to="/" className="px-4 py-2 rounded-lg mt-8 transition-colors duration-300  bg-cyan-700 text-white hover:bg-cyan-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
