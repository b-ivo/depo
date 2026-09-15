import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DailyRecord from "./pages/DailyRecord";
import History from "./pages/History";
import DailyHistoryDetail from "./pages/DailyHistoryDetail";
import BeerManagement from "./pages/BeerManagement";
import InventoryManagement from "./pages/InventoryManagement";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/daily" element={<DailyRecord />} />
        <Route path="/history" element={<History />} />
        <Route
          path="/history/:id"
          element={<DailyHistoryDetail />}
        />
        <Route path="/beers" element={<BeerManagement />} />
        <Route
          path="/inventory"
          element={<InventoryManagement />}
        />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;