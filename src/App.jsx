import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TradeDetails from "./pages/TradeDetails";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import Footer from "./components/Footer"; // <-- make sure this is imported

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Toaster position="top-right" />
          <div className="flex-grow">
            <Routes>
              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trade/:id"
                element={
                  <PrivateRoute>
                    <TradeDetails />
                  </PrivateRoute>
                }
              />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;