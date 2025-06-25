import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api"; // or wherever your API wrapper lives
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser({ email: res.data.email, token: res.data.token });
    localStorage.setItem("user", JSON.stringify({ email: res.data.email, token: res.data.token }));
  };

  const register = async (email, password) => {
    await api.post("/auth/register", { email, password });
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};