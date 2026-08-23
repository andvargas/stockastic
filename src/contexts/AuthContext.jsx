import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api"; // or wherever your API wrapper lives
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      navigate("/login");
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [navigate]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const userData = { ...res.data.user, token: res.data.token };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
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
