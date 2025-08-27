import api from "./api";

// Fetch performance history
export const getPerformanceHistory = async (offsetWeeks = 0) => {
  const response = await api.get("/performance", {
    params: { offsetWeeks },
  });
  return response.data;
};

// Create a new performance snapshot
export const createPerformanceSnapshot = async (payload) => {
  const response = await api.post("/performance", payload);
  return response.data;
};

// Update performance by ID
export const updatePerformanceHistory = async (id, payload) => {
  const response = await api.put(`/performance/${id}`, payload);
  return response.data;
};

// Delete performance by ID
export const deletePerformanceHistory = async (id) => {
  const response = await api.delete(`/performance/${id}`);
  return response.data;
};
