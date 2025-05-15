import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TradeDetails from "./pages/TradeDetails";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trade/:id" element={<TradeDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
