import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const addTrade = async (tradeData) => {
  const res = await axios.post(`${API_URL}/trades`, tradeData);
  return res.data;
};

export const getTrades = async () => {
  const res = await axios.get(`${API_URL}/trades`);
  return res.data;
};

export const getTradeById = async (id) => {
  const res = await axios.get(`${API_URL}/trades/${id}`);
  return res.data;
};

export const updateTrade = async (id, updateFields) => {
  const res = await axios.put(`${API_URL}/trades/${id}`, updateFields);
  return res.data;
};

export const deleteTrade = async (id) => {
  const res = await axios.delete(`${API_URL}/trades/${id}`);
  return res.data;
};

export const addSnapshot = async (tradeId, snapshotData) => {
  const res = await axios.post(`${API_URL}/trades/${tradeId}/add-snapshot`, snapshotData);
  return res.data;
};

export const getUnrealisedPL = async () => {
  const res = await axios.get(`${API_URL}/trades/unrealised-pl`);
  return res.data;
};