import { formatCurrency } from "../../utils/formatCurrency";

function CurrentDayCard({ day }) {
  if (!day) {
    return null;
  }

  const status = day.status;

  const statusClasses = {
    balanced: "bg-green-100 text-green-700",
    shortage: "bg-red-100 text-red-700",
    surplus: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Business Day</p>

          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {new Date(day.date).toLocaleDateString("en-GB")}
          </h3>
        </div>

        {status && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              statusClasses[status] || "bg-slate-100 text-slate-700"
            }`}
          >
            {status}
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">Sold</p>

          <p className="mt-1 text-lg font-semibold">
            {day.totals?.sold ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Expected Sales</p>

          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(day.totals?.expectedSales)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Expected Cash</p>

          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(day.totals?.expectedCash)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Difference</p>

          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(day.difference)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CurrentDayCard;
