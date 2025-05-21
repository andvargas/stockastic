import React, { useEffect, useState } from "react";
import api from "../services/api";
import RoundIconButton from "./RoundIconButton";
import { X, PencilIcon } from "lucide-react";

const JournalEntries = ({ tradeId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await api.get(`/journal/trade/${tradeId}`);
        console.log("Entries fetched:", res.data);
        setEntries(res.data);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tradeId) {
      fetchEntries();
    }
  }, [tradeId]);

  const handleAddEntry = async () => {
    if (!note.trim()) return;

    try {
      const newEntry = {
        tradeId,
        note,
      };

      const res = await api.post("/journal", newEntry);
      setEntries([res.data, ...entries]);
      setNote("");
    } catch (error) {
      console.error("Error adding journal entry:", error);
    }
  };

  if (loading) return <p>Loading journal entries...</p>;

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setNote(entry.note);
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await api.put(`/journal/entries/${id}`, { note });
      const updated = entries.map((e) => (e._id === id ? res.data : e));
      setEntries(updated);
      setEditingEntry(null);
      setNote("");
    } catch (error) {
      console.error("Error updating journal entry:", error);
    }
  };
  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this entry?")) return;

  try {
    await api.delete(`/journal/entries/${id}`);
    const filtered = entries.filter((e) => e._id !== id);
    setEntries(filtered);
  } catch (error) {
    console.error("Error deleting journal entry:", error);
  }
};

  return (
    <div className="bg-white">
      <h2 className="text-xl font-semibold mb-4">Journal Entries</h2>

      {entries.length === 0 ? (
        <p className="text-gray-500">No entries yet.</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {entries.map((entry) => (
            <li key={entry._id} className="border p-3 rounded bg-gray-50">
              <div className="flex justify-between text-sm text-gray-600 text-left mb-1">
                {new Date(entry.date).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <div>
                  <RoundIconButton
                    onClick={() => handleEdit(entry)}
                    icon={PencilIcon}
                    color="bg-gray-300 hover:bg-blue-300"
                    iconClassName="w-2 h-2 text-blue-600"
                  />
                  <RoundIconButton
                    onClick={() => handleDelete(entry._id)}
                    icon={X}
                    color="bg-gray-300 hover:bg-red-300 ml-2"
                    iconClassName="w-2 h-2 text-red-600"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 text-left">{entry.note}</div>

              <div className="flex space-x-2"></div>
            </li>
          ))}
        </ul>
      )}

      {/* Add New Entry */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Add New Entry</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your note here..."
          className="w-full text-sm p-2 border rounded mb-2"
          rows="3"
        />
        <button onClick={handleAddEntry} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add Entry
        </button>
      </div>
      {/* Modal for editing entries */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Journal Entry</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 border rounded mb-4" rows="3" />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setEditingEntry(null)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={() => handleSaveEdit(editingEntry._id)} className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntries;
