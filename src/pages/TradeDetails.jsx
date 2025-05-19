import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilIcon, Save, Trash, LayoutList } from "lucide-react";
import RoundIconButton from "../components/RoundIconButton";
import { getTradeById, updateTrade, deleteTrade } from "../services/stockService";
import toast from "react-hot-toast";
import Tooltip from "../components/Tooltip";

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
    { key: "assetValue", label: "Asset Current Value", type: "number", inputClass: "w-24" },
    { key: "wnl", label: "Won/Lost", type: "select", inputClass: "w-24", options: ["Won", "Lost", "Broke Even", "Pending"] },
    { key: "strategy", label: "Strategy", type: "select", inputClass: "w-24", options: ["none", "1.0", "2.0", "2.1", "2.2", "3.0", "3.1", "3.2"] },
    { key: "note", label: "Note", type: "textarea", inputClass: "w-full" },
  ];

  const tickerNames = {
    AAPL: "Apple Inc.",
    TSLA: "Tesla Inc.",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
  };

  if (!trade) return <div className="mt-20 text-center">Loading trade details...</div>;

  const companyName = tickerNames[trade.ticker] || "Unknown Company";

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
  {
    {
      console.log(trade);
    }
  }

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
    <div style={{ boxShadow: "var(--shadow-light-xl)" }} className="max-w-2xl mx-auto p-6 bg-white rounded-md shadow--light-xl mt-20">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6 shadow-xs pb-3">
        <h1 className="text-2xl font-bold">Trade Details</h1>
        <div className="flex items-center gap-3">
          <Tooltip tooltipText="Back to Dashboard" position="bottom">
            <RoundIconButton
              onClick={() => navigate(-1)}
              icon={LayoutList}
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

      <div className="space-y-4">
        {tradeFields.map(({ key, label, type, inputClass, transform, options }) => (
          <div key={key} className="flex items-center justify-between">
            <p className="font-semibold">{label}:</p>
            <div className="flex items-center gap-2">
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
                  ) : type === "textarea" ? (
                    <textarea className={`border rounded p-1 ${inputClass}`} value={tempValue} onChange={(e) => setTempValue(e.target.value)} />
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
        ))}
      </div>

      <button onClick={() => navigate(-1)} className="mt-8 bg-gray-300 hover:bg-gray-400 text-sm px-4 py-2 rounded">
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default TradeDetails;
