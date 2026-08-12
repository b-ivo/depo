import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DailyRecord from "./pages/DailyRecord";
import History from "./pages/History";
import DailyHistoryDetail from "./pages/DailyHistoryDetail";
import BeerManagement from "./pages/BeerManagement";
import InventoryManagement from "./pages/InventoryManagement";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/daily" element={<DailyRecord />} />
      <Route path="/history" element={<History />} />
      <Route path="/history/:id" element={<DailyHistoryDetail />} />
      <Route path="/beers" element={<BeerManagement />} />
      <Route path="/inventory" element={<InventoryManagement />} />
    </Routes>
  );
}

export default App;
