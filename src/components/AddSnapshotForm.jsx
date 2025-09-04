import React, { useState } from "react";
import toast from "react-hot-toast";
import { addSnapshot } from "../services/stockService";

const AddSnapshotForm = ({ tradeId, onClose, latestPrice }) => {
  const [price, setPrice] = useState("");
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16)); // Default to now (yyyy-MM-ddTHH:mm)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSnapshot(tradeId, { price: parseFloat(price), timestamp: new Date(timestamp).toISOString() });
      toast.success("Snapshot added!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add snapshot.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          step="0.01"
          placeholder={latestPrice ? `Latest: $${latestPrice}` : "Enter price"}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Timestamp</label>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Add Snapshot
      </button>
    </form>
  );
};

export default AddSnapshotForm;