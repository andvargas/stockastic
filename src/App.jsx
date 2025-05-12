import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TradeDetails from "./pages/TradeDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trade/:id" element={<TradeDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
