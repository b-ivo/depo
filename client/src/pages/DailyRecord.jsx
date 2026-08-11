import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";

import StockTable from "../components/daily/StockTable";
import FulfillmentForm from "../components/daily/FulfillmentForm";
import EveningStockForm from "../components/daily/EveningStockForm";
import PaymentSection from "../components/daily/PaymentSection";
import CloseDaySection from "../components/daily/CloseDaySection";

import { startBusinessDay } from "../services/daysApi";
import { useCurrentDay } from "../hooks/useCurrentDay";

function DailyRecord() {
  const { day, loading, error, errorCode, refresh } = useCurrentDay();

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  async function handleStartDay() {
    try {
      setStarting(true);
      setStartError("");

      await startBusinessDay();

      await refresh();
    } catch (error) {
      setStartError(error.message || "Failed to start business day.");
    } finally {
      setStarting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout
        title="Daily Record"
        description="Manage today's stock and sales"
        activePath="/daily"
      >
        <div className="flex min-h-64 items-center justify-center">
          <p className="text-sm text-slate-500">Loading today's record...</p>
        </div>
      </AppLayout>
    );
  }

  // Today's business day has already been closed
  if (!day && errorCode === "DAY_ALREADY_CLOSED") {
    return (
      <AppLayout
        title="Daily Record"
        description="Manage today's stock and sales"
        activePath="/daily"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <span className="text-xl">✓</span>
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Business Day Already Closed
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Today's business day has already been completed. You can review the
            complete record from History.
          </p>

          <a
            href="/history"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            View History
          </a>
        </div>
      </AppLayout>
    );
  }

  // Today's business day has not been started
  if (!day && errorCode === "NO_OPEN_DAY") {
    return (
      <AppLayout
        title="Daily Record"
        description="Manage today's stock and sales"
        activePath="/daily"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <span className="text-xl">+</span>
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Business Day Not Started
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Start today's business day before recording stock and sales.
          </p>

          {startError && (
            <div className="mx-auto mt-4 max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-left">
              <p className="text-sm text-red-600">{startError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartDay}
            disabled={starting}
            className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting ? "Starting Business Day..." : "Start Business Day"}
          </button>
        </div>
      </AppLayout>
    );
  }

  // Any unexpected API error
  if (error) {
    return (
      <AppLayout
        title="Daily Record"
        description="Manage today's stock and sales"
        activePath="/daily"
      >
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">
            Unable to load today's record
          </h2>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={refresh}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  // Safety fallback
  if (!day) {
    return (
      <AppLayout
        title="Daily Record"
        description="Manage today's stock and sales"
        activePath="/daily"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No Business Day
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            No business day is currently available.
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Refresh
          </button>
        </div>
      </AppLayout>
    );
  }

  // Open business day
  return (
    <AppLayout
      title="Daily Record"
      description="Manage today's stock and sales"
      activePath="/daily"
    >
      <div className="space-y-6">
        <StockTable stock={day.stock} />

        <FulfillmentForm stock={day.stock} onSuccess={refresh} />

        <EveningStockForm stock={day.stock} onSuccess={refresh} />

        <PaymentSection day={day} onSuccess={refresh} />

        <CloseDaySection day={day} onSuccess={refresh} />
      </div>
    </AppLayout>
  );
}

export default DailyRecord;
