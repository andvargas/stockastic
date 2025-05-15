import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const addTrade = (tradeData) => {
  return axios.post(`${API_URL}`, tradeData);
};

export const getTrades = () => {
  return axios.get(`${API_URL}`);
};

export const getTradeById = (id) => axios.get(`${API_URL}/trades/${id}`);
export const updateTrade = (id, data) => axios.put(`${API_URL}/trades/${id}`, data);