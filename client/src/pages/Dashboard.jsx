import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import CurrentDayCard from "../components/dashboard/CurrentDayCard";
import DashboardSummary from "../components/dashboard/DashboardSummary";
import StockOverview from "../components/dashboard/StockOverview";

import { getCurrentDay } from "../services/daysApi";

function Dashboard() {
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setErrorCode("");

      const response = await getCurrentDay();

      setDay(response.data);
    } catch (error) {
      setDay(null);
      setError(error.message || "Failed to load dashboard.");
      setErrorCode(error.code || "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <AppLayout
      title="Dashboard"
      description="Overview of today's business"
      activePath="/"
    >
      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      )}

      {/* Today's business day has not been started */}
      {!loading && errorCode === "NO_OPEN_DAY" && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Business Day Not Started
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Start today's business day before managing stock and sales.
          </p>

          <Link
            to="/daily"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Start Business Day
          </Link>
        </div>
      )}

      {/* Today's business day has already been closed */}
      {!loading && errorCode === "DAY_ALREADY_CLOSED" && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
            ✓
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Business Day Closed
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Today's business day has already been completed. You can review the
            complete record in History.
          </p>

          <Link
            to="/history"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            View History
          </Link>
        </div>
      )}

      {/* Unexpected error */}
      {!loading &&
        error &&
        errorCode !== "NO_OPEN_DAY" &&
        errorCode !== "DAY_ALREADY_CLOSED" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to Load Dashboard
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        )}

      {/* Open business day */}
      {!loading && !error && day && (
        <div className="space-y-6">
          {/* Current business day */}
          <CurrentDayCard day={day} />

          {/* Financial and sales summary */}
          <DashboardSummary day={day} />

          {/* Stock */}
          <StockOverview day={day} />

          {/* Quick actions */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Quick Actions
            </h2>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/daily"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Manage Today's Record
              </Link>

              <Link
                to="/history"
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                View History
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Dashboard;
