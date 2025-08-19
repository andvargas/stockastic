// src/services/snapshotService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchSnapshotsByTrade = async (tradeId) => {
  try {
    const res = await axios.get(`${API_URL}/trades/${tradeId}/snapshots`);
    return res.data;
  } catch (err) {
    console.error("Error fetching snapshots:", err);
    return [];
  }
};

/**
 * Get the most recent snapshot price for a trade
 * @param {string} tradeId
 * @returns {Promise<number|null>}
 */
export const getLatestSnapshotPrice = async (tradeId) => {
  const snapshots = await fetchSnapshotsByTrade(tradeId);
  if (!snapshots.length) return null;

  // Sort by timestamp
  snapshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return snapshots[0].price ?? null;
};

/**
 * Get the highest snapshot price since entry
 * @param {string} tradeId
 * @returns {Promise<number|null>}
 */
export const getHighestSnapshotPrice = async (tradeId) => {
  const snapshots = await fetchSnapshotsByTrade(tradeId);
  if (!snapshots.length) return null;

  const highest = snapshots.reduce(
    (max, snap) => (snap.price > max ? snap.price : max),
    snapshots[0].price
  );

  return highest ?? null;
};