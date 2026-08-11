import { useState } from "react";
import { recordMobileMoney, recordActualCash } from "../../services/daysApi";
import { formatCurrency } from "../../utils/formatCurrency";

function PaymentSection({ day, onSuccess }) {
  const [mobileMoney, setMobileMoney] = useState(
    day.payments?.mobileMoney ?? "",
  );

  const [actualCash, setActualCash] = useState(day.payments?.actualCash ?? "");

  const [loadingMobileMoney, setLoadingMobileMoney] = useState(false);

  const [loadingCash, setLoadingCash] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const expectedSales = day.totals?.expectedSales ?? null;

  const expectedCash = day.totals?.expectedCash ?? null;

  const difference = day.difference ?? null;

  async function handleMobileMoneySubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (mobileMoney === "") {
      setError("Enter Mobile Money amount or use 0.");
      return;
    }

    const amount = Number(mobileMoney);

    if (!Number.isFinite(amount) || amount < 0) {
      setError("Mobile Money must be a valid non-negative amount.");
      return;
    }

    try {
      setLoadingMobileMoney(true);

      await recordMobileMoney(amount);

      setSuccess("Mobile Money recorded successfully.");

      onSuccess?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingMobileMoney(false);
    }
  }

  async function handleActualCashSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (actualCash === "") {
      setError("Enter the actual cash amount.");
      return;
    }

    const amount = Number(actualCash);

    if (!Number.isFinite(amount) || amount < 0) {
      setError("Actual cash must be a valid non-negative amount.");
      return;
    }

    try {
      setLoadingCash(true);

      await recordActualCash(amount);

      setSuccess("Actual cash recorded successfully.");

      onSuccess?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingCash(false);
    }
  }

  const statusClasses = {
    balanced: "bg-green-100 text-green-700",
    shortage: "bg-red-100 text-red-700",
    surplus: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Payment Reconciliation</h2>

        <p className="mt-1 text-sm text-slate-500">
          Reconcile today's sales with Mobile Money and physical cash.
        </p>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-3">
        {/* Expected sales */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Expected Sales</p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatCurrency(expectedSales)}
          </p>
        </div>

        {/* Mobile Money */}
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700">Mobile Money</p>

          <p className="mt-1 text-xs text-slate-500">
            Optional. Enter 0 if none was received.
          </p>

          <form onSubmit={handleMobileMoneySubmit} className="mt-4">
            <input
              type="number"
              min="0"
              step="1"
              value={mobileMoney}
              onChange={(event) => setMobileMoney(event.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

            <button
              type="submit"
              disabled={loadingMobileMoney}
              className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMobileMoney ? "Saving..." : "Save Mobile Money"}
            </button>
          </form>
        </div>

        {/* Expected cash */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Expected Cash</p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatCurrency(expectedCash)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Expected Sales − Mobile Money
          </p>
        </div>
      </div>

      {/* Actual cash */}
      <div className="border-t border-slate-200 p-5">
        <div className="max-w-md">
          <p className="text-sm font-medium text-slate-700">Actual Cash</p>

          <p className="mt-1 text-xs text-slate-500">
            Count the physical cash and enter the actual amount.
          </p>

          <form onSubmit={handleActualCashSubmit} className="mt-4 flex gap-3">
            <input
              type="number"
              min="0"
              step="1"
              value={actualCash}
              onChange={(event) => setActualCash(event.target.value)}
              placeholder="0"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

            <button
              type="submit"
              disabled={loadingCash}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingCash ? "Saving..." : "Save Cash"}
            </button>
          </form>
        </div>
      </div>

      {/* Result */}
      {difference !== null && (
        <div className="border-t border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Difference</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(difference)}
              </p>
            </div>

            {day.status && (
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                  statusClasses[day.status] || "bg-slate-100 text-slate-700"
                }`}
              >
                {day.status}
              </span>
            )}
          </div>
        </div>
      )}

      {(error || success) && (
        <div className="border-t border-slate-200 p-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PaymentSection;
