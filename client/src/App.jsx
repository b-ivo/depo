import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DailyRecord from "./pages/DailyRecord";
import History from "./pages/History";
import DailyHistoryDetail from "./pages/DailyHistoryDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/daily" element={<DailyRecord />} />

      <Route path="/history" element={<History />} />

      <Route path="/history/:id" element={<DailyHistoryDetail />} />
    </Routes>
  );
}

export default App;
