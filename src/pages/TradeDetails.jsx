import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilIcon, Save } from "lucide-react";
import RoundIconButton from "../components/RoundIconButton";
import { getTradeById, updateTrade } from "../services/stockService";
import toast from "react-hot-toast";

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
      const updatedField = { [editingField]: tempValue };

      await updateTrade(id, updatedField); // update backend
      setTrade((prev) => ({ ...prev, ...updatedField })); // update local state

      setEditingField(null);
      toast.success("Trade updated successfully!");
    } catch (err) {
      console.error("Failed to save trade update:", err);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(trade[field]);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const tradeFields = [
    { key: "ticker", label: "Ticker", type: "text", inputClass: "w-24", transform: (v) => v.toUpperCase() },
    { key: "market", label: "Market", type: "text", inputClass: "w-24" },
    { key: "quantity", label: "Quantity", type: "number", inputClass: "w-24" },
    { key: "entryPrice", label: "Entry Price", type: "number", inputClass: "w-24" },
    { key: "date", label: "Date", type: "date", inputClass: "w-40" },
    { key: "stopLoss", label: "Stop Loss", type: "number", inputClass: "w-24" },
    { key: "breakEven", label: "breakEven", type: "number", inputClass: "w-24" },
    { key: "takeProfit", label: "Take Profit", type: "number", inputClass: "w-24" },
    {
      key: "status",
      label: "Status",
      type: "select",
      inputClass: "w-32",
      options: ["Open", "Closed"],
    },
    { key: "type", label: "Type", type: "select", inputClass: "w-32", options: ["Long", "Short", "PaperMoney Long", "PaperMoney Short"] },
    { key: "atr", label: "ATR", type: "number", inputClass: "w-24" },
    { key: "pnl", label: "P/L", type: "number", inputClass: "w-24" },
    { key: "overnightInterest", label: "Overnight Interest", type: "number", inputClass: "w-24" },
    { key: "closeDate", label: "Close Date", type: "date", inputClass: "w-40" },
    { key: "closePrice", label: "Close Price", type: "number", inputClass: "w-24" },
    { key: "daysTraded", label: "Days Traded", type: "number", inputClass: "w-24" },
    { key: "assetValue", label: "Asset Current Value", type: "number", inputClass: "w-24" },
    { key: "wnl", label: "Won/Lost", type: "select", inputClass: "w-24", options: ["Won", "Lost", "Broke Even"] },
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

  // toDo: Make this two columns, add some style

  return (
    <div style={{ boxShadow: "var(--shadow-light-xl)" }} className="max-w-2xl mx-auto p-6 bg-white rounded-md shadow--light-xl mt-20">
      <h1 className="text-2xl font-bold mb-4">Trade Details</h1>
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
                    <select className={`border rounded p-1 ${inputClass}`} value={tempValue} onChange={(e) => setTempValue(e.target.value)}>
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
                  <RoundIconButton onClick={handleSave} icon={Save} />
                  <button onClick={handleCancel} className="text-xs text-gray-500">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>{trade[key] || "-"}</span>
                  <RoundIconButton onClick={() => handleEdit(key)} icon={PencilIcon} />
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
