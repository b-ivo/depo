import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import HistoryTable from "../components/history/HistoryTable";
import { getDailyHistory } from "../services/daysApi";
import { useNavigate } from "react-router-dom";

function History() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await getDailyHistory();

      setDays(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <AppLayout
      title="History"
      description="Review completed business days"
      activePath="/history"
    >
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">Loading history...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={loadHistory}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <HistoryTable
          days={days}
          onSelect={(day) => navigate(`/history/${day._id}`)}
        />
      )}
    </AppLayout>
  );
}

export default History;
