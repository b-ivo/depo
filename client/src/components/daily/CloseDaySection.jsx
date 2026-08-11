import { useState } from "react";
import { closeBusinessDay } from "../../services/daysApi";
import { formatCurrency } from "../../utils/formatCurrency";

function CloseDaySection({ day, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canClose =
    day.totals?.expectedSales !== null && day.payments?.actualCash !== null;

  async function handleClose() {
    setError("");

    try {
      setLoading(true);

      const response = await closeBusinessDay();

      onSuccess?.(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">End Business Day</h2>

        <p className="mt-1 text-sm text-slate-500">
          Review the day's reconciliation before closing it.
        </p>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <p className="text-sm text-slate-500">Expected Sales</p>

          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(day.totals?.expectedSales)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Expected Cash</p>

          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(day.totals?.expectedCash)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Actual Cash</p>

          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(day.payments?.actualCash)}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 p-5">
        {!canClose && (
          <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Record evening stock and actual cash before closing the business
            day.
          </div>
        )}

        <button
          type="button"
          onClick={handleClose}
          disabled={!canClose || loading}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Closing..." : "End Business Day"}
        </button>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default CloseDaySection;
