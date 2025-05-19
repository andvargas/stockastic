import { useState } from "react";
import { addNote } from "../services/journalService";
import toast from "react-hot-toast";

const AddJournalEntryForm = ({ tradeId, onClose, onSaved }) => {
  const [note, setNote] = useState("");
  const [sentiment, setSentiment] = useState("Neutral");
  const [tag, setTag] = useState("papermoney");
  const [attachment, setAttachment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    try {
      await addNote({
        tradeId,
        note,
        attachments: attachment ? [attachment] : [],
        tags: [tag],
        sentiment, // assuming your schema will soon have this too
      });
      toast.success("Journal entry added!");
      onSaved && onSaved();
      onClose();
    } catch (error) {
      toast.error("Failed to add journal entry");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="w-full border p-2 rounded"
        rows="4"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add your note..."
      />

      <div className="flex gap-4">
        <div className="flex-1">
          {/* Sentiment */}
          <div>
            <label className="block mb-1 text-sm font-medium">Sentiment</label>
            <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="w-full border p-2 rounded">
              <option value="Bullish">Bullish</option>
              <option value="Neutral">Neutral</option>
              <option value="Bearish">Bearish</option>
            </select>
          </div>
        </div>
        <div className="flex-1">
          <div>
            <label className="block mb-1 text-sm font-medium">Tag</label>
            <select value={tag} onChange={(e) => setTag(e.target.value)} className="w-full border p-2 rounded">
              <option value="papermoney">Paper Money</option>
              <option value="realmoney">Real Money</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Screenshot / Chart Link</label>
        <input
          type="text"
          value={attachment}
          onChange={(e) => setAttachment(e.target.value)}
          placeholder="https://www.tradingview.com/..."
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          Save Note
        </button>
      </div>
    </form>
  );
};

export default AddJournalEntryForm;