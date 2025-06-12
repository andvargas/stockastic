import React, { useEffect, useState } from "react";
import api from "../services/api";
import RoundIconButton from "./RoundIconButton";
import { X } from "lucide-react";



const AdjustmentsWidget = ({ tradeId }) => {
  console.log("AdjustmentsWidget mounted with tradeId:", tradeId);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdjustments = async () => {
      try {
        const res = await api.get(`/trades/${tradeId}/adjustments`);
        console.log("Adjustments fetched:", res.data);
        setAdjustments(res.data);
      } catch (error) {
        console.error("Error fetching adjustments:", error.response || error);
      } finally {
        setLoading(false);
      }
    };

    if (tradeId) {
      fetchAdjustments();
    }
  }, [tradeId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this adjustment?")) return;

    try {
      await api.delete(`/adjustments/${id}`);
      const filtered = adjustments.filter((adj) => adj._id !== id);
      setAdjustments(filtered);
    } catch (error) {
      console.error("Error deleting adjustment:", error);
    }
  };

  if (loading) return <p>Loading adjustments...</p>;

  return (
    <div className="bg-white">
      <h2 className="text-xl font-semibold mb-4">Adjustments</h2>

      {adjustments.length === 0 ? (
        <p className="text-gray-500">No adjustments recorded.</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {adjustments.map((adj) => (
            <li key={adj._id} className="border p-3 rounded bg-gray-50">
              <div className="flex justify-between text-sm text-gray-600 text-left mb-1">
                <div>
                  {new Date(adj.createdAt).toLocaleDateString()} • {adj.type} • {adj.amount > 0 ? "+" : ""}
                  {adj.amount.toFixed(2)}  
                </div>
                <div>
                  <RoundIconButton
                    onClick={() => handleDelete(adj._id)}
                    icon={X}
                    color="bg-gray-300 hover:bg-red-300"
                    iconClassName="w-2 h-2 text-red-600"
                  />
                </div>
              </div>
              {adj.description && (
                <div className="text-sm text-gray-600 text-left">{adj.description}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdjustmentsWidget;