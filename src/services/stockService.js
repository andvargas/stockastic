import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const addTrade = (tradeData) => {
  return axios.post(`${API_URL}/trades`, tradeData);
};

export const getTrades = () => {
  return axios.get(`${API_URL}/trades`);
};