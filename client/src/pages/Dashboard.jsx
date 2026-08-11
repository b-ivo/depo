import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import DashboardSummary from "../components/dashboard/DashboardSummary";
import StockOverview from "../components/dashboard/StockOverview";
import { getCurrentDay } from "../services/daysApi";

function Dashboard() {
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await getCurrentDay();

      setDay(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <AppLayout
      title="Dashboard"
      description="Overview of today's business"
      activePath="/"
    >
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">No Open Business Day</h2>

          <p className="mt-1 text-sm text-amber-700">{error}</p>

          <Link
            to="/daily"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Go to Daily Record
          </Link>
        </div>
      )}

      {!loading && !error && day && (
        <div className="space-y-6">
          {/* Day status */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Business Day</p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {new Date(day.date).toLocaleDateString("en-RW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              {day.closed ? "Closed" : "Open"}
            </span>
          </div>

          {/* Summary */}
          <DashboardSummary day={day} />

          {/* Stock */}
          <StockOverview day={day} />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/daily"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Manage Today's Record
            </Link>

            <Link
              to="/history"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View History
            </Link>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Dashboard;
