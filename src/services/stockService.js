import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const addTrade = (tradeData) => {
  return axios.post(`${API_URL}/trades`, tradeData);
};

export const getTrades = () => {
  return axios.get(`${API_URL}/trades`);
};