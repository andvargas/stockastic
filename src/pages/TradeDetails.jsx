import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilIcon, Save, Trash, CircleArrowLeft, CircleX, RefreshCw, CopyPlusIcon } from "lucide-react";
import Modal from "../components/Modal";
import AddSnapshotForm from "../components/AddSnapshotForm";
import RoundIconButton from "../components/RoundIconButton";
import { getTradeById, updateTrade, deleteTrade } from "../services/stockService";
import { fetchSnapshotsByTrade } from "../services/snapshotService";
import toast from "react-hot-toast";
import Tooltip from "../components/Tooltip";
import JournalEntries from "../components/JournalEntries";
import tickerNames from "../assets/tickerNames";
import TradeSummary from "../components/TradeSummary";
import AdjustmentsWidget from "../components/AdjustmentsWidget";
import CloseTradeForm from "../components/CloseTradeForm";
import dayjs from "dayjs";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../utils/roleUtils";
import { calculateTradeLevels } from "../utils/tradeCalculations";
import TopNavBar from "../components/TopNavBar";

const TradeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trade, setTrade] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [showCloseTradeModal, setShowCloseTradeModal] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);

  const handleCloseTrade = () => {
    if (!hasPermission(user, ["admin", "trader"])) {
      toast.error("You don't have permission to close trades.");
      return;
    }
    setShowCloseTradeModal(true);
  };

  const fetchTrade = async () => {
    try {
      const data = await getTradeById(id);
      setTrade(data);
    } catch (err) {
      console.error("Error fetching trade:", err);
      toast.error("Failed to fetch trade details.");
    }
  };

  useEffect(() => {
    fetchTrade();
    console.log("Fetching trade details for ID:", id);
  }, [id]);

  useEffect(() => {
    if (!trade?._id) return;
    const fetchSnapshots = async () => {
      try {
        const snapshots = await fetchSnapshotsByTrade(trade._id);
        // to log the latest snapshot:
        if (snapshots.length > 0) {
          // Sort by timestamp descending
          const sorted = [...snapshots].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          const latest = sorted[0];
          console.log("Latest snapshot:", latest.timestamp, "Price:", latest.price);
        }
      } catch (err) {
        console.error("Failed to fetch snapshots:", err);
      }
    };
    fetchSnapshots();
  }, [trade]);

  const handleSave = async () => {
    if (!hasPermission(user, ["admin", "trader"])) {
      toast.error("You don't have permission to edit trades.");
      return;
    }
    try {
      let valueToSave = tempValue !== "" ? tempValue : trade[editingField];

      // Find the definition for the field being edited
      const fieldDefinition = tradeFields.find((f) => f.key === editingField);
      // In number, parse back to number
      if (fieldDefinition && fieldDefinition.type === "number") {
        // Use parseFloat to handle decimals. Default to 0 if parsing fails (e.g., empty string)
        valueToSave = parseFloat(valueToSave) || 0;
      }

      if (editingField === "closeDate" || editingField === "date") {
        valueToSave = new Date(valueToSave).toISOString();
      }
      const updatedField = { [editingField]: valueToSave };

      await updateTrade(id, updatedField);

      setTrade((prev) => ({ ...prev, ...updatedField }));

      setEditingField(null);
      toast.success("Trade updated successfully!");
    } catch (err) {
      console.error("Failed to save trade update:", err);
    }
  };

  const handleEdit = (field) => {
    const defaultValues = {
      wnl: "Won",
      status: "Open",
      type: "Long",
      strategy: "none",
    };

    setEditingField(field);
    setTempValue(trade[field] !== undefined ? trade[field] : defaultValues[field] || "");
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const tradeFields = [
    { key: "ticker", label: "Ticker", type: "text", inputClass: "w-24", transform: (v) => v.toUpperCase() },
    { key: "market", label: "Market", type: "text", inputClass: "w-24" },
    { key: "quantity", label: "Quantity", type: "number", inputClass: "w-24" },
    { key: "currency", label: "Currency", type: "select", inputClass: "w-24", options: ["GBP", "GBX", "USD", "EUR"] },
    { key: "entryPrice", label: "Entry Price", type: "number", inputClass: "w-24" },
    { key: "date", label: "Entry Date", type: "date", inputClass: "w-40" },
    { key: "stopLoss", label: "Stop Loss", type: "number", inputClass: "w-24" },
    { key: "takeProfit", label: "Take Profit", type: "number", inputClass: "w-24" },
    {
      key: "status",
      label: "Status",
      type: "select",
      inputClass: "w-32",
      options: ["Open", "Closed", "Considering"],
    },
    { key: "type", label: "Transaction Type", type: "select", inputClass: "w-32", options: ["Long", "Short", "PaperMoney Long", "PaperMoney Short"] },
    { key: "assetType", label: "Asset Type", type: "select", inputClass: "w-32", options: ["Real Money", "Paper Money", "CFD", "Paper CFD"] },
    { key: "atr", label: "ATR", type: "number", inputClass: "w-24" },
    { key: "pnl", label: "P/L", type: "number", inputClass: "w-24" },
    { key: "netProfit", label: "Net P/L", type: "number", inputClass: "w-24" },
    { key: "overnightInterest", label: "Overnight Interest", type: "number", inputClass: "w-24" },
    { key: "closeDate", label: "Close Date", type: "date", inputClass: "w-40" },
    { key: "closePrice", label: "Close Price", type: "number", inputClass: "w-24" },
    { key: "daysTraded", label: "Days Traded", type: "daysTraded" },
    { key: "wnl", label: "Won/Lost", type: "select", inputClass: "w-24", options: ["Won", "Lost", "Broke Even", "Pending"] },
    {
      key: "strategy",
      label: "Strategy",
      type: "select",
      inputClass: "w-24",
      options: ["none", "1.0", "2.0", "2.1", "2.2", "2.3", "3.0", "3.1", "3.2", "4.0"],
    },
    { key: "note", label: "Note", type: "textarea", inputClass: "w-full" },
  ];

  if (!trade) return <div className="mt-20 text-center">Loading trade details...</div>;

  const companyName = (tickerNames[trade.market] && tickerNames[trade.market][trade.ticker]) || "Unknown Company";

  const formatValue = (value, type) => {
    // Use dayjs for the "daysTraded" calculation
    if (type === "daysTraded") {
      // Ensure the dates are valid before processing
      if (!trade.date) return "-";

      const startDate = dayjs(trade.date);
      // Use the current date if the trade is still open
      const endDate = trade.closeDate ? dayjs(trade.closeDate) : dayjs();

      // dayjs' .diff() method is perfect for this
      const diffDays = endDate.diff(startDate, "day");

      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    }

    // Use dayjs for date formatting
    if (type === "date") {
      if (!value) return "-";
      // Use the .format() method for consistent, readable dates
      return dayjs(value).format("DD MMM YYYY"); // e.g., "14 Jun 2025"
    }

    if (!value) return "-";
    return value;
  };

  // toDo: Make this two columns, add some style

  const handleDelete = async () => {
    if (!hasPermission(user, ["admin", "trader"])) {
      toast.error("You don't have permission to delete trades.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this trade? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteTrade(id);
      toast.success("Trade deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error("Failed to delete trade");
    }
  };

  const handleReRun = async () => {
    if (!hasPermission(user, ["admin", "trader"])) {
      toast.error("You don't have permission to recalculate trades.");
      return;
    }

    const { entryPrice, atr, currency } = trade;
    if (!entryPrice || !atr || !currency) {
      toast.error("Missing values for calculation.");
      return;
    }

    const { stopLoss, takeProfit, quantity } = calculateTradeLevels(parseFloat(entryPrice), parseFloat(atr), currency);

    const confirmUpdate = window.confirm(
      `New values:\nStop Loss: ${stopLoss}\nTake Profit: ${takeProfit}\nQuantity: ${quantity}\n\nUpdate trade with these values?`
    );

    if (!confirmUpdate) return;

    try {
      await updateTrade(id, { stopLoss, takeProfit, quantity });
      toast.success("Trade updated with new calculated values.");
      fetchTrade(); // Refresh trade data
    } catch (err) {
      console.error("Failed to update trade:", err);
      toast.error("Failed to update trade.");
    }
  };

  return (
    <>
      <TopNavBar />
      <div style={{ boxShadow: "var(--shadow-light-xl)" }} className="max-w-5xl mx-auto p-6 bg-white rounded-md shadow--light-xl my-5">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6 shadow-xs pb-3">
          <h1 className="text-2xl font-bold">Trade Details</h1>
          <div className="flex items-center gap-3">
            <Tooltip tooltipText="Back to Dashboard" position="bottom">
              <RoundIconButton
                onClick={() => navigate(-1)}
                icon={CircleArrowLeft}
                color="bg-gray-100 hover:bg-gray-300"
                iconClassName="w-8 h-8 text-blue-700"
              />
            </Tooltip>
            <Tooltip tooltipText="Add Snapshot" position="bottom">
              <RoundIconButton
                onClick={() => setIsSnapshotModalOpen(true)}
                icon={CopyPlusIcon}
                color="bg-gray-100 hover:bg-gray-300"
                iconClassName="w-8 h-8 text-black"
              />
            </Tooltip>
            <Tooltip tooltipText="Recalculate StopLoss/TP/Size" position="bottom">
              <RoundIconButton onClick={handleReRun} icon={RefreshCw} color="bg-gray-100 hover:bg-gray-300" iconClassName="w-8 h-8 text-black" />
            </Tooltip>
            <Tooltip tooltipText="Close this trade" position="bottom">
              <RoundIconButton onClick={handleCloseTrade} icon={CircleX} color="bg-gray-100 hover:bg-gray-300" iconClassName="w-8 h-8 text-black" />
            </Tooltip>
            <Tooltip tooltipText="Delete share..." position="bottom">
              <RoundIconButton onClick={handleDelete} icon={Trash} color="bg-gray-100 hover:bg-gray-300" iconClassName="w-8 h-8 text-red-700" />
            </Tooltip>
          </div>
        </div>
        <h2 className="text-xl font-bold">
          {trade.ticker} - {companyName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Left side — 2/3 */}
          <div className="md:col-span-2 space-y-4">
            {tradeFields.map(({ key, label, type, inputClass, transform, options }) => {
              if (key === "note") {
                // Special rendering for the Note field
                return (
                  <div key={key} className="flex flex-col gap-1 text-left">
                    <label className="font-semibold text-left">{label}:</label>
                    {editingField === key ? (
                      <>
                        <textarea
                          className={`border rounded p-2 ${inputClass} w-full`}
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                        />
                        <div className="mt-1 flex gap-2 items-center">
                          <RoundIconButton onClick={handleSave} icon={Save} iconClassName="w-4 h-4" />
                          <button onClick={handleCancel} className="text-xs text-gray-500">
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-start gap-2">
                        <p className="whitespace-pre-wrap">{formatValue(trade[key], type, trade)}</p>
                        <RoundIconButton onClick={() => handleEdit(key)} icon={PencilIcon} iconClassName="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              }

              // Default rendering for all other fields
              return (
                <div key={key} className="grid grid-cols-3 gap-4 items-center">
                  <CloseTradeForm
                    isOpen={showCloseTradeModal}
                    onClose={() => setShowCloseTradeModal(false)}
                    trade={trade}
                    onSuccess={() => {
                      fetchTrade();
                    }}
                  />
                  <p className="font-semibold text-left">{label}:</p>
                  <div className="col-span-2 flex items-center gap-2">
                    {editingField === key ? (
                      <>
                        {type === "select" ? (
                          <select
                            className={`border rounded p-1 ${inputClass}`}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value || "")}
                          >
                            {options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={type}
                            className={`border rounded p-1 ${inputClass}`}
                            value={tempValue}
                            onChange={(e) => setTempValue(transform ? transform(e.target.value) : e.target.value)}
                          />
                        )}
                        <RoundIconButton onClick={handleSave} icon={Save} iconClassName="w-4 h-4" />
                        <button onClick={handleCancel} className="text-xs text-gray-500">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{formatValue(trade[key], type, trade)}</span>
                        <RoundIconButton onClick={() => handleEdit(key)} icon={PencilIcon} iconClassName="w-3 h-3" />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right side — 1/3 */}

          <div className="space-y-4">
            <TradeSummary trade={trade} />
            {/* <h3 className="text-lg font-semibold">Extras - Sample widget</h3> 
          <div className="p-4 border rounded bg-gray-50 shadow-sm">
            <p className="text-sm text-gray-600">Add new widgets or components here — e.g. JournalEntries, trade notes, analytics, charts etc.</p>
          </div> */}

            <JournalEntries tradeId={trade._id} />
            <AdjustmentsWidget tradeId={trade._id} />
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg mt-8 transition-colors duration-300 bg-cyan-700 text-white hover:bg-cyan-400"
        >
          ← Back to Dashboard
        </button>
        <Modal isOpen={isSnapshotModalOpen} onClose={() => setIsSnapshotModalOpen(false)} title="Add Snapshot">
          <AddSnapshotForm tradeId={trade._id} onClose={() => setIsSnapshotModalOpen(false)} />
        </Modal>
      </div>
    </>
  );
};

export default TradeDetails;
