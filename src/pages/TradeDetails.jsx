import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilIcon, Save } from "lucide-react";
import RoundIconButton from "../components/RoundIconButton";

const TradeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trade, setTrade] = useState({
    id,
    ticker: "AAPL",
    entryPrice: 150,
    quantity: 10,
    date: "2025-04-29",
    stopLoss: 145,
    takeProfit: 165,
    status: "Open",
    market: "LON",
    type: "Long",
    atr: 10,
    pnl: 250,
    overnightInterest: 0,
    closeDate: "",
    closePrice: 0,
    daysTraded: 0,
    assetValue: 0,
    wnl: "",
    strategy: "",
    note: "",
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleSave = () => {
    setTrade({ ...trade, [editingField]: tempValue });
    setEditingField(null);
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(trade[field]);
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
                  ) : (
                    <input
                      type={type}
                      className={`border rounded p-1 ${inputClass}`}
                      value={tempValue}
                      onChange={(e) => setTempValue(transform ? transform(e.target.value) : e.target.value)}
                    />
                  )}
                  <RoundIconButton onClick={handleSave} icon={Save} />
                </>
              ) : (
                <>
                  <span>{trade[key]}</span>
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