import api from "./api";

export const addTrade = async (tradeData) => {
  const res = await api.post("/trades", tradeData);
  return res.data;
};

export const getTrades = async () => {
  const res = await api.get("/trades");
  return res.data;
};

export const getTradeById = async (id) => {
  const res = await api.get(`/trades/${id}`);
  return res.data;
};

export const updateTrade = async (id, updateFields) => {
  const res = await api.put(`/trades/${id}`, updateFields);
  return res.data;
};

export const deleteTrade = async (id) => {
  const res = await api.delete(`/trades/${id}`);
  return res.data;
};

export const addSnapshot = async (tradeId, snapshotData) => {
  const res = await api.post(`/trades/${tradeId}/add-snapshot`, snapshotData);
  return res.data;
};

export const getUnrealisedPL = async () => {
  const res = await api.get("/trades/unrealised-pl");
  return res.data;
};
