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
import { createPerformanceSnapshot } from "../services/performanceService";

dayjs.extend(isoWeek);

const ProgressTracker = () => {
  const [trades, setTrades] = useState([]);
  const [unrealisedData, setUnrealisedData] = useState([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState(["Real Money", "CFD"]);
  const [formData, setFormData] = useState({
    interval: "weekly",
    offset: 0,
    realisedPL: 0,
    paperRealisedPL: 0,
    unrealisedPL: 0,
    paperUnRealisedPL: 0,
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setTrades(await getTrades());
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrades();
  }, []);

  useEffect(() => {
    const fetchUnrealised = async () => {
      try {
        const data = await getUnrealisedPL();
        data.forEach((trade) => {
          if (trade.missingWeekStartSnap) toast.error(`Missing week start snapshot: ${trade.ticker}`);
          if (trade.missingMonthStartSnap) toast.error(`Missing month start snapshot: ${trade.ticker}`);
        });
        setUnrealisedData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnrealised();
  }, []);

  const { weeklyRealised, monthlyRealised, weeklyUnrealised, monthlyUnrealised } = useMemo(() => {
    const isSameOrAfter = (dateStr, ref) => dayjs(dateStr).isSame(ref) || dayjs(dateStr).isAfter(ref);

    const filteredTrades = trades.filter((t) => selectedAssetTypes.includes(t.assetType));
    const filteredUnrealised = unrealisedData.filter((t) => selectedAssetTypes.includes(t.assetType));

    const startOfWeek = dayjs().startOf("isoWeek");
    const startOfMonth = dayjs().startOf("month");

    return {
      weeklyRealised: filteredTrades
        .filter((t) => t.status === "Closed" && isSameOrAfter(t.closeDate, startOfWeek))
        .reduce((sum, t) => sum + (t.netProfit || 0), 0),
      monthlyRealised: filteredTrades
        .filter((t) => t.status === "Closed" && isSameOrAfter(t.closeDate, startOfMonth))
        .reduce((sum, t) => sum + (t.netProfit || 0), 0),
      weeklyUnrealised: filteredUnrealised.reduce((sum, t) => sum + (t.weeklyUnrealisedGBP || 0), 0),
      monthlyUnrealised: filteredUnrealised.reduce((sum, t) => sum + (t.monthlyUnrealisedGBP || 0), 0),
    };
  }, [trades, unrealisedData, selectedAssetTypes]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitSnapshot = async () => {
    try {
      const payload = { ...formData, offset: Number(formData.offset) };
      const data = await createPerformanceSnapshot(payload);
      toast.success("Performance snapshot saved!");
      console.log("Saved:", data);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save snapshot.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-6">Progress Tracker</h1>
          <Tooltip tooltipText="Add Performance snapshot">
            <PackagePlus className="h-5 w-5 text-gray-500 cursor-pointer" onClick={() => setShowForm((prev) => !prev)} />
          </Tooltip>
          <AssetTypeSwitch onChange={setSelectedAssetTypes} />
        </div>

        {/* Form for manual snapshot */}
        {showForm && (
          <div className="bg-white p-4 rounded-xl mb-6 shadow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Interval</label>
                <select name="interval" value={formData.interval} onChange={handleFormChange} className="border p-2 rounded">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Realised P/L</label>
                <input
                  type="number"
                  name="realisedPL"
                  value={formData.realisedPL}
                  onChange={handleFormChange}
                  onWheel={(e) => e.target.blur()}
                  placeholder="Realised PL"
                  className="border p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Unrealised P/L</label>
                <input
                  type="number"
                  name="unrealisedPL"
                  value={formData.unrealisedPL}
                  onChange={handleFormChange}
                  placeholder="Paper Realised PL"
                  className="border p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Offset</label>
                <input
                  type="number"
                  name="offset"
                  value={formData.offset}
                  onChange={handleFormChange}
                  style={{ width: "100px" }}
                  placeholder="Offset"
                  className="border p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Paper Realised P/L</label>
                <input
                  type="number"
                  name="paperRealisedPL"
                  value={formData.paperRealisedPL}
                  onChange={handleFormChange}
                  placeholder="Paper Realised PL"
                  className="border p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Paper Unrealised P/L</label>
                <input
                  type="number"
                  name="paperUnRealisedPL"
                  value={formData.paperUnRealisedPL}
                  onChange={handleFormChange}
                  placeholder="Paper Unrealised PL"
                  className="border p-2 rounded"
                />
              </div>
            </div>
            <button onClick={handleSubmitSnapshot} className="mt-4 px-4 py-2 bg-cyan-700 text-white rounded hover:bg-cyan-500">
              Save Snapshot
            </button>
          </div>
        )}

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
          <Link to="/" className="px-4 py-2 rounded-lg mt-8 transition-colors duration-300 bg-cyan-700 text-white hover:bg-cyan-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;