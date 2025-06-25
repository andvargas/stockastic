import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate("/");
    } catch (err) {
      alert("Invalid login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cyan-600">
      <div className="bg-white m-10 p-10 rounded-full"><img src="/icons/icon-512.png" alt="Stockastic Logo" className="w-32 h-32 mb-2" /></div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-2xl font-bold">Register</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <button type="submit" className="w-full bg-cyan-700 text-white p-2 rounded">
          Register
        </button>
      </form>
      <div className="mt-4 text-white">Already registered with Stockastic? <a href="/login" className="text-white hover:underline">Login</a></div>
    </div>
  );
};

export default Register;