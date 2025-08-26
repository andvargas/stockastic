import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const getPerformanceHistory = async (offsetWeeks = 0) => {
  const response = await axios.get(`${API_URL}/performance/history`, {
    params: { offsetWeeks },
  });
  return response.data;
};