import api from "./api";

export const addNote = async (entry) => {
  const res = await api.post("/journal", entry);
  return res.data;
};

export const getNotes = async () => {
  const res = await api.get("/journal");
  return res.data;
};
