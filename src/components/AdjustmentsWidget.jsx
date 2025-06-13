import React, { useEffect, useState } from "react";
import api from "../services/api";
import RoundIconButton from "./RoundIconButton";
import { X } from "lucide-react";

const AdjustmentsWidget = ({ tradeId }) => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAdjustment, setNewAdjustment] = useState({
    amount: "",
    type: "Expense",
    description: "",
  });

  useEffect(() => {
    const fetchAdjustments = async () => {
      try {
        const res = await api.get(`/trades/${tradeId}/adjustments`);
        setAdjustments(res.data);
      } catch (error) {
        console.error("Error fetching adjustments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tradeId) fetchAdjustments();
  }, [tradeId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this adjustment?")) return;

    try {
      await api.delete(`/adjustments/${id}`);
      setAdjustments(adjustments.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting adjustment:", error);
    }
  };

  const handleAddAdjustment = async () => {
    if (!newAdjustment.amount) return;

    const finalAmount = newAdjustment.type === "Expense" ? -Math.abs(parseFloat(newAdjustment.amount)) : Math.abs(parseFloat(newAdjustment.amount));

    try {
      const res = await api.post(`/trades/${tradeId}/adjustments`, {
        ...newAdjustment,
        amount: finalAmount,
      });
      setAdjustments([res.data, ...adjustments]);
      setNewAdjustment({ amount: "", type: "Dividend", description: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding adjustment:", error);
    }
  };

  if (loading) return <p>Loading adjustments...</p>;

  return (
    <div className="bg-gray-50 border rounded px-3 py-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Expenses & Dividends</h2>

      {adjustments.length === 0 ? (
        <p className="text-gray-500">No adjustments yet.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {adjustments.map((adj) => (
            <li key={adj._id} className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">{adj.type}</span> |
                <span className={`font-semibold ml-1 ${adj.type === "Expense" ? "text-red-600" : "text-green-600"}`}>£{adj.amount}</span>—{" "}
                {adj.description}
              </div>
              <RoundIconButton
                onClick={() => handleDelete(adj._id)}
                icon={X}
                color="bg-gray-300 hover:bg-red-300"
                iconClassName="w-2 h-2 text-red-600"
              />
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => setShowForm(!showForm)} className="w-full mb-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {showForm ? "Cancel" : "Add Adjustment"}
      </button>

      {showForm && (
        <div className="space-y-2">
          <input
            type="number"
            value={newAdjustment.amount}
            onChange={(e) => setNewAdjustment({ ...newAdjustment, amount: e.target.value })}
            placeholder="Amount"
            className="w-full p-2 border rounded"
          />
          <select
            value={newAdjustment.type}
            onChange={(e) => setNewAdjustment({ ...newAdjustment, type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="Expense">Expense</option>
            <option value="Dividend">Dividend</option>
          </select>
          <input
            type="text"
            value={newAdjustment.description}
            onChange={(e) => setNewAdjustment({ ...newAdjustment, description: e.target.value })}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
          <button onClick={handleAddAdjustment} className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Save Adjustment
          </button>
        </div>
      )}
    </div>
  );
};

export default AdjustmentsWidget;