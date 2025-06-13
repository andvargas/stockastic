import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilIcon, Save, Trash, CircleArrowLeft } from "lucide-react";
import RoundIconButton from "../components/RoundIconButton";
import { getTradeById, updateTrade, deleteTrade } from "../services/stockService";
import toast from "react-hot-toast";
import Tooltip from "../components/Tooltip";
import JournalEntries from "../components/JournalEntries";
import tickerNames from "../assets/tickerNames";
import TradeSummary from "../components/TradeSummary";
import AdjustmentsWidget from "../components/AdjustmentsWidget";

// todo: add a button to recalculate P/L

const TradeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trade, setTrade] = useState(null);

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  useEffect(() => {
    const fetchTrade = async () => {
      try {
        const data = await getTradeById(id);
        setTrade(data);
      } catch (err) {
        console.error("Error fetching trade:", err);
        toast.error("Failed to fetch trade details.");
      }
    };

    fetchTrade();
  }, [id]);

  const handleSave = async () => {
    try {
      const valueToSave = tempValue !== "" ? tempValue : trade[editingField];
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
      options: ["Open", "Closed"],
    },
    { key: "type", label: "Transaction Type", type: "select", inputClass: "w-32", options: ["Long", "Short", "PaperMoney Long", "PaperMoney Short"] },
    { key: "assetType", label: "Asset Type", type: "select", inputClass: "w-32", options: ["Real Money", "Paper Money", "CFD", "Paper CFD"] },
    { key: "atr", label: "ATR", type: "number", inputClass: "w-24" },
    { key: "pnl", label: "P/L", type: "number", inputClass: "w-24" },
    { key: "overnightInterest", label: "Overnight Interest", type: "number", inputClass: "w-24" },
    { key: "closeDate", label: "Close Date", type: "date", inputClass: "w-40" },
    { key: "closePrice", label: "Close Price", type: "number", inputClass: "w-24" },
    { key: "daysTraded", label: "Days Traded", type: "daysTraded" },
    { key: "wnl", label: "Won/Lost", type: "select", inputClass: "w-24", options: ["Won", "Lost", "Broke Even", "Pending"] },
    { key: "strategy", label: "Strategy", type: "select", inputClass: "w-24", options: ["none", "1.0", "2.0", "2.1", "2.2", "3.0", "3.1", "3.2"] },
    { key: "note", label: "Note", type: "textarea", inputClass: "w-full" },
  ];

  if (!trade) return <div className="mt-20 text-center">Loading trade details...</div>;

  const companyName = (tickerNames[trade.market] && tickerNames[trade.market][trade.ticker]) || "Unknown Company";

  const formatValue = (value, type) => {
    if (type === "daysTraded") {
      const start = new Date(trade.date);
      const end = trade.closedDate ? new Date(trade.closedDate) : new Date();
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    }

    if (!value) return "-";
    if (type === "date") return new Date(value).toLocaleDateString();
    return value;
  };

  // toDo: Make this two columns, add some style

  const handleDelete = async () => {
    try {
      await deleteTrade(id);
      toast.success("Trade deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error("Failed to delete trade");
    }
  };

  return (
    <div style={{ boxShadow: "var(--shadow-light-xl)" }} className="max-w-5xl mx-auto p-6 bg-white rounded-md shadow--light-xl my-20">
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
                <p className="font-semibold text-left">{label}:</p>
                <div className="col-span-2 flex items-center gap-2">
                  {editingField === key ? (
                    <>
                      {type === "select" ? (
                        <select className={`border rounded p-1 ${inputClass}`} value={tempValue} onChange={(e) => setTempValue(e.target.value || "")}>
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

      <button onClick={() => navigate(-1)} className="mt-8 bg-gray-300 hover:bg-gray-400 text-sm px-4 py-2 rounded">
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default TradeDetails;
