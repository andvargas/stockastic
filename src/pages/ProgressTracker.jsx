import React, { useEffect, useState, useMemo } from "react";
import Card from "../components/Card";
import CardContent from "../components/CardContent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as TooltipRecharts, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { getTrades, getUnrealisedPL } from "../services/stockService";
import { formatCurrency } from "../utils/formatCurrency";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import utc from "dayjs/plugin/utc";
import toast from "react-hot-toast";
import AssetTypeSwitch from "@/components/AssetTypeSwitch";
import { PackagePlus } from "lucide-react";
import Tooltip from "@/components/Tooltip";
import { createPerformanceSnapshot, getAllPerformanceHistory, deletePerformanceHistory } from "../services/performanceService";
import PerformanceTable from "../components/PerformanceTable";
import TopNavBar from "@/components/TopNavBar";
import RoundIconButton from "@/components/RoundIconButton";

dayjs.extend(isoWeek);
dayjs.extend(utc);

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
  const [performanceData, setPerformanceData] = useState([]);

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

  // fetch performance snapshots
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const snapshots = await getAllPerformanceHistory();

        const mapped = snapshots.map((item) => {
          const weekNumber = item.interval === "weekly" ? dayjs(item.periodStart).isoWeek() : null;
          const dateRange =
            item.interval === "monthly"
              ? dayjs(item.periodStart).utc().format("MMM YYYY")
              : `${dayjs(item.periodStart).utc().format("DD MMM")} - ${dayjs(item.periodEnd).utc().format("DD MMM")}`;

          return {
            _id: item._id,
            interval: item.interval,
            weekNumber,
            dateRange,
            realised: item.realisedPL,
            unrealised: item.unrealisedPL,
            paperRealised: item.paperRealisedPL,
            paperUnrealised: item.paperUnRealisedPL,
          };
        });
        setPerformanceData(mapped);
      } catch (err) {
        console.error("Failed to fetch performance history:", err);
        toast.error("Failed to load performance history.");
      }
    };

    fetchPerformance();
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
      // Just use offset from formData, default 0
      const offset = Number(formData.offset);

      const payload = { ...formData, offset };

      const data = await createPerformanceSnapshot(payload);
      toast.success("Performance snapshot saved!");
      setShowForm(false);

      // Add the new snapshot to performanceData
      const weekNumber = data.interval === "weekly" ? dayjs(data.periodStart).isoWeek() : null;
      const dateRange =
        data.interval === "monthly"
          ? dayjs(data.periodStart).format("MMM YYYY")
          : `${dayjs(data.periodStart).format("DD MMM")} - ${dayjs(data.periodEnd).format("DD MMM")}`;
      setPerformanceData((prev) => [
        ...prev,
        {
          _id: data._id,
          interval: data.interval,
          weekNumber,
          dateRange,
          realised: data.realisedPL,
          unrealised: data.unrealisedPL,
          paperRealised: data.paperRealisedPL,
          paperUnrealised: data.paperUnRealisedPL,
        },
      ]);
    } catch (err) {
      const apiMessage = err?.response?.data?.message || err?.message || "Failed to save snapshot.";
      toast.error(apiMessage);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this performance snapshot?")) return;

    try {
      await deletePerformanceHistory(id);

      // Remove from state
      setPerformanceData((prev) => prev.filter((row) => row._id !== id));

      toast.success("Performance snapshot deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete snapshot.");
    }
  };

  // Chart data (monthly realised by default)
  const monthlyChartData = useMemo(() => {
    return performanceData
      .filter((d) => d.interval === "monthly")
      .map((d) => ({
        date: d.dateRange,
        realised: d.realised,
        unrealised: d.unrealised, // keep in case want to show later
      }))
      .reverse();
  }, [performanceData]);

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Progress Tracker</h1>
            <div className="flex items-center gap-4">
              <Tooltip tooltipText="Add Performance snapshot">
                <RoundIconButton icon={PackagePlus} onClick={() => setShowForm((prev) => !prev)} iconClassName="text-green-600" color="bg-white" />
              </Tooltip>
              <AssetTypeSwitch onChange={setSelectedAssetTypes} />
            </div>
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
                  <label className="block text-sm font-medium text-gray-700">Offset (this week = 1)</label>
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
            <h2 className="text-xl font-bold mb-4">Overall Progress - Monthly Realised P/L</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <TooltipRecharts formatter={(value) => formatCurrency(value, "GBP")} />
                <Line type="monotone" dataKey="realised" stroke="#34D399" name="Realised" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Back link */}
          <div className="mt-6">
            <Link to="/" className="px-4 py-2 rounded-lg mt-8 transition-colors duration-300 bg-cyan-700 text-white hover:bg-cyan-400">
              Back to Dashboard
            </Link>
          </div>
          <PerformanceTable data={performanceData} onDelete={handleDelete} />
        </div>
      </div>
    </>
  );
};

export default ProgressTracker;