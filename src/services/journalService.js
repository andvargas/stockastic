import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

export const addNote = async (entry) => {
  const res = await axios.post(`${API_URL}/journal`, entry);
  return res.data;
};